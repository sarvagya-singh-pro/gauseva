const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'gauseva',
  location: 'us-east1'
};
exports.connectorConfig = connectorConfig;

const createFarmRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFarm');
}
createFarmRef.operationName = 'CreateFarm';
exports.createFarmRef = createFarmRef;

exports.createFarm = function createFarm(dc) {
  return executeMutation(createFarmRef(dc));
};

const listCattleRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCattle');
}
listCattleRef.operationName = 'ListCattle';
exports.listCattleRef = listCattleRef;

exports.listCattle = function listCattle(dc) {
  return executeQuery(listCattleRef(dc));
};

const recordVaccinationRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'RecordVaccination', inputVars);
}
recordVaccinationRef.operationName = 'RecordVaccination';
exports.recordVaccinationRef = recordVaccinationRef;

exports.recordVaccination = function recordVaccination(dcOrVars, vars) {
  return executeMutation(recordVaccinationRef(dcOrVars, vars));
};

const listHealthEventsForCattleRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListHealthEventsForCattle', inputVars);
}
listHealthEventsForCattleRef.operationName = 'ListHealthEventsForCattle';
exports.listHealthEventsForCattleRef = listHealthEventsForCattleRef;

exports.listHealthEventsForCattle = function listHealthEventsForCattle(dcOrVars, vars) {
  return executeQuery(listHealthEventsForCattleRef(dcOrVars, vars));
};
