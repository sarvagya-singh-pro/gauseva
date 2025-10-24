import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'gauseva',
  location: 'us-east1'
};

export const createFarmRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFarm');
}
createFarmRef.operationName = 'CreateFarm';

export function createFarm(dc) {
  return executeMutation(createFarmRef(dc));
}

export const listCattleRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCattle');
}
listCattleRef.operationName = 'ListCattle';

export function listCattle(dc) {
  return executeQuery(listCattleRef(dc));
}

export const recordVaccinationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RecordVaccination', inputVars);
}
recordVaccinationRef.operationName = 'RecordVaccination';

export function recordVaccination(dcOrVars, vars) {
  return executeMutation(recordVaccinationRef(dcOrVars, vars));
}

export const listHealthEventsForCattleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListHealthEventsForCattle', inputVars);
}
listHealthEventsForCattleRef.operationName = 'ListHealthEventsForCattle';

export function listHealthEventsForCattle(dcOrVars, vars) {
  return executeQuery(listHealthEventsForCattleRef(dcOrVars, vars));
}

