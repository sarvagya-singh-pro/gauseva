import { NextRequest, NextResponse } from 'next/server';
import * as ort from 'onnxruntime-node';
import sharp from 'sharp';
import path from 'path';

export const runtime = 'nodejs'; 
export const dynamic = 'force-dynamic';

// --- LAZY LOADERS ---
let detectorSession: ort.InferenceSession | null = null;
let classifierSession: ort.InferenceSession | null = null;

async function getDetector() {
  if (!detectorSession) {
    const modelPath = path.join(process.cwd(), 'public/yolov8n.onnx'); 
    detectorSession = await ort.InferenceSession.create(modelPath);
  }
  return detectorSession;
}

async function getClassifier() {
  if (!classifierSession) {
    const modelPath = path.join(process.cwd(), 'public/best.onnx');
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
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = (box1.width * box1.height) + (box2.width * box2.height) - intersection;
  return union === 0 ? 0 : intersection / union;
}

function nms(boxes: any[], iouThreshold: number = 0.50) {
  if (!boxes || boxes.length === 0) return [];
  // Sort by confidence so we keep the best box
  boxes.sort((a, b) => b.confidence - a.confidence);
  const keep: any[] = [];
  
  while (boxes.length > 0) {
    const current = boxes.shift();
    if (!current) continue;
    keep.push(current);
    // Remove boxes that overlap too much with the current best one
    boxes = boxes.filter(box => calculateIoU(current, box) < iouThreshold);
  }
  return keep;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');
    if (!file || !(file instanceof Blob)) return NextResponse.json({ error: "No image" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 640;
    const originalHeight = metadata.height || 640;

    // ==========================================
    // STAGE 1: DETECT (Find Cows)
    // ==========================================
    const { data: detectData } = await sharp(buffer)
      .resize(640, 640, { fit: 'fill' })
      .toColorspace('srgb')
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const floatData = new Float32Array(3 * 640 * 640);
    for (let i = 0; i < 640 * 640; i++) {
        floatData[i] = detectData[i * 3] / 255.0;
        floatData[640 * 640 + i] = detectData[i * 3 + 1] / 255.0;
        floatData[2 * 640 * 640 + i] = detectData[i * 3 + 2] / 255.0;
    }

    const detector = await getDetector();
    const tensor = new ort.Tensor('float32', floatData, [1, 3, 640, 640]);
    const results = await detector.run({ images: tensor });
    const output = results[detector.outputNames[0]].data as Float32Array;
    const dims = results[detector.outputNames[0]].dims;

    // Handle Transposed Output
    let isTransposed = dims[1] > dims[2]; 
    const numAnchors = isTransposed ? dims[1] : dims[2];
    const numFeatures = isTransposed ? dims[2] : dims[1];

    const rawDetections = [];
    for (let i = 0; i < numAnchors; i++) {
        // Class 19 (Cow) in COCO
        const classIdx = 23; // 4 coords + 19th class = index 23
        
        let score, x, y, w, h;
        if (!isTransposed) {
            score = output[classIdx * numAnchors + i];
            x = output[0 * numAnchors + i];
            y = output[1 * numAnchors + i];
            w = output[2 * numAnchors + i];
            h = output[3 * numAnchors + i];
        } else {
            score = output[i * numFeatures + classIdx];
            x = output[i * numFeatures + 0];
            y = output[i * numFeatures + 1];
            w = output[i * numFeatures + 2];
            h = output[i * numFeatures + 3];
        }

        if (score > 0.40) { // High threshold to filter noise
            rawDetections.push({
                x: (x - w / 2) * (originalWidth / 640),
                y: (y - h / 2) * (originalHeight / 640),
                width: w * (originalWidth / 640),
                height: h * (originalHeight / 640),
                confidence: score
            });
        }
    }

    // Merge overlapping boxes
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

    // Process the TOP 3 cows only (for speed)
    for (const cow of cows.slice(0, 3)) {
        
        // Define crop with safety bounds
        const left = Math.max(0, Math.floor(cow.x));
        const top = Math.max(0, Math.floor(cow.y));
        const width = Math.min(originalWidth - left, Math.floor(cow.width));
        const height = Math.min(originalHeight - top, Math.floor(cow.height));

        if (width > 10 && height > 10) { // Ignore tiny glitches
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
            const clsResults = await classifier.run({ [classifier.inputNames[0]]: cropTensor });
            const clsOutput = clsResults[classifier.outputNames[0]].data as Float32Array;

            // Find best class
            let maxScore = 0;
            let maxIdx = -1;
            for (let i = 0; i < clsOutput.length; i++) {
                if (clsOutput[i] > maxScore) { maxScore = clsOutput[i]; maxIdx = i; }
            }
            
            // Your custom labels
            const labels = ['lying', 'standing']; 
            
            finalResults.push({
                bbox: { x: cow.x, y: cow.y, width: cow.width, height: cow.height },
                class: labels[maxIdx] || "unknown",
                confidence: maxScore
            });
        }
    }

    // Pick the most confident result to display as the "Main" result
    const bestResult = finalResults.sort((a,b) => b.confidence - a.confidence)[0];

    return NextResponse.json({
      posture: bestResult ? bestResult.class.toUpperCase() : "Unknown",
      confidence: bestResult ? (bestResult.confidence * 100).toFixed(1) + "%" : "0%",
      detections: finalResults,
      imageSize: { width: originalWidth, height: originalHeight }
    });

  } catch (error: any) {
    console.error("Pipeline Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
