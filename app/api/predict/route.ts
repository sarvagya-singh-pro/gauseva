import { NextRequest, NextResponse } from 'next/server';
import * as ort from 'onnxruntime-node';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Force Node.js runtime (Critical for ONNX/Sharp in Vercel)
export const runtime = 'nodejs'; 
export const dynamic = 'force-dynamic';

// --- LAZY LOADERS ---
let detectorSession: ort.InferenceSession | null = null;
let classifierSession: ort.InferenceSession | null = null;

// Helper: Smartly find model files in Vercel's shifting file system
function getModelPath(filename: string): string {
    const candidates = [
        path.join(process.cwd(), 'public', filename),       // Standard Local / Vercel with Config
        path.join(process.cwd(), filename),                 // Vercel Root Fallback
        path.join(__dirname, 'public', filename),           // Bundled Relative
        path.join(__dirname, filename)                      // Flat Bundled
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            console.log(`✅ Loaded Model: ${candidate}`);
            return candidate;
        }
    }

    // Diagnostic Log if failed
    console.error(`❌ Model ${filename} NOT FOUND. Scanned:`, candidates);
    throw new Error(`Model ${filename} could not be located.`);
}

async function getDetector() {
  if (!detectorSession) {
    const modelPath = getModelPath('yolov8n.onnx');
    detectorSession = await ort.InferenceSession.create(modelPath);
  }
  return detectorSession;
}

async function getClassifier() {
  if (!classifierSession) {
    const modelPath = getModelPath('best.onnx');
    classifierSession = await ort.InferenceSession.create(modelPath);
  }
  return classifierSession;
}

// --- HELPER: IoU for NMS ---
function calculateIoU(box1: any, box2: any) {
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
  
  if (x2 < x1 || y2 < y1) return 0; // No intersection

  const intersection = (x2 - x1) * (y2 - y1);
  const area1 = box1.width * box1.height;
  const area2 = box2.width * box2.height;
  const union = area1 + area2 - intersection;
  
  return union === 0 ? 0 : intersection / union;
}

function nms(boxes: any[], iouThreshold: number = 0.50) {
  if (!boxes || boxes.length === 0) return [];
  boxes.sort((a, b) => b.confidence - a.confidence);
  
  const keep: any[] = [];
  const activeBoxes = [...boxes];

  while (activeBoxes.length > 0) {
    const current = activeBoxes.shift();
    if (!current) continue;
    keep.push(current);
    
    // Remove overlapping boxes
    for (let i = activeBoxes.length - 1; i >= 0; i--) {
      if (calculateIoU(current, activeBoxes[i]) > iouThreshold) {
        activeBoxes.splice(i, 1);
      }
    }
  }
  return keep;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');
    if (!file || !(file instanceof Blob)) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 640;
    const originalHeight = metadata.height || 640;

    // ==========================================
    // STAGE 1: DETECT (Find Cows with YOLOv8n)
    // ==========================================
    const { data: detectData } = await sharp(buffer)
      .resize(640, 640, { fit: 'fill' })
      .toColorspace('srgb')
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const floatData = new Float32Array(3 * 640 * 640);
    // Convert to Float32 & Normalize (0-1)
    for (let i = 0; i < 640 * 640; i++) {
        floatData[i] = detectData[i * 3] / 255.0;                   // R
        floatData[640 * 640 + i] = detectData[i * 3 + 1] / 255.0;   // G
        floatData[2 * 640 * 640 + i] = detectData[i * 3 + 2] / 255.0; // B
    }

    const detector = await getDetector();
    // Assuming standard YOLO input name 'images'
    const tensor = new ort.Tensor('float32', floatData, [1, 3, 640, 640]);
    const results = await detector.run({ [detector.inputNames[0]]: tensor }); 
    const output = results[detector.outputNames[0]].data as Float32Array;
    const dims = results[detector.outputNames[0]].dims;

    // Handle Transposed Output
    const isTransposed = dims[1] > dims[2]; 
    const numAnchors = isTransposed ? dims[1] : dims[2];
    const numFeatures = isTransposed ? dims[2] : dims[1];

    const rawDetections = [];
    const cowClassIdx = 23; // 4 box coords + 19th class (Cow) = index 23

    for (let i = 0; i < numAnchors; i++) {
        let score, x, y, w, h;
        if (!isTransposed) {
            score = output[cowClassIdx * numAnchors + i];
            x = output[0 * numAnchors + i];
            y = output[1 * numAnchors + i];
            w = output[2 * numAnchors + i];
            h = output[3 * numAnchors + i];
        } else {
            score = output[i * numFeatures + cowClassIdx];
            x = output[i * numFeatures + 0];
            y = output[i * numFeatures + 1];
            w = output[i * numFeatures + 2];
            h = output[i * numFeatures + 3];
        }

        if (score > 0.40) {
            rawDetections.push({
                x: (x - w / 2) * (originalWidth / 640),
                y: (y - h / 2) * (originalHeight / 640),
                width: w * (originalWidth / 640),
                height: h * (originalHeight / 640),
                confidence: score
            });
        }
    }

    const cows = nms(rawDetections);
    
    if (cows.length === 0) {
         return NextResponse.json({ 
             posture: "NO COWS", 
             confidence: "0%", 
             detections: [],
             imageSize: { width: originalWidth, height: originalHeight }
         });
    }

    // ==========================================
    // STAGE 2: CLASSIFY (Check Posture)
    // ==========================================
    const classifier = await getClassifier();
    const finalResults = [];

    // Process TOP 3 cows to avoid timeouts
    for (const cow of cows.slice(0, 3)) {
        const left = Math.max(0, Math.floor(cow.x));
        const top = Math.max(0, Math.floor(cow.y));
        const width = Math.min(originalWidth - left, Math.floor(cow.width));
        const height = Math.min(originalHeight - top, Math.floor(cow.height));

        if (width > 10 && height > 10) {
            const cropBuffer = await sharp(buffer)
                .extract({ left, top, width, height })
                .resize(224, 224, { fit: 'fill' })
                .toColorspace('srgb')
                .removeAlpha()
                .raw()
                .toBuffer();

            const cropFloat = new Float32Array(3 * 224 * 224);
            for (let i = 0; i < 224 * 224; i++) {
                cropFloat[i] = cropBuffer[i * 3] / 255.0;
                cropFloat[224 * 224 + i] = cropBuffer[i * 3 + 1] / 255.0;
                cropFloat[2 * 224 * 224 + i] = cropBuffer[i * 3 + 2] / 255.0;
            }

            const cropTensor = new ort.Tensor('float32', cropFloat, [1, 3, 224, 224]);
            
            // Use correct input name for classifier
            const inputName = classifier.inputNames[0];
            const clsResults = await classifier.run({ [inputName]: cropTensor });
            const clsOutput = clsResults[classifier.outputNames[0]].data as Float32Array;

            let maxScore = 0;
            let maxIdx = -1;
            for (let i = 0; i < clsOutput.length; i++) {
                if (clsOutput[i] > maxScore) { maxScore = clsOutput[i]; maxIdx = i; }
            }
            
            // Assuming classes are alphabetical: 0=lying, 1=standing
            const labels = ['lying', 'standing']; 
            
            finalResults.push({
                bbox: { x: cow.x, y: cow.y, width: cow.width, height: cow.height },
                class: labels[maxIdx] || "unknown",
                confidence: maxScore
            });
        }
    }

    const bestResult = finalResults.sort((a,b) => b.confidence - a.confidence)[0];

    return NextResponse.json({
      posture: bestResult ? bestResult.class.toUpperCase() : "Unknown",
      confidence: bestResult ? (bestResult.confidence * 100).toFixed(1) + "%" : "0%",
      detections: finalResults,
      imageSize: { width: originalWidth, height: originalHeight }
    });

  } catch (error: any) {
    console.error("Pipeline Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
