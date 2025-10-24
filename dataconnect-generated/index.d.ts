import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Cattle_Key {
  id: UUIDString;
  __typename?: 'Cattle_Key';
}

export interface CreateFarmData {
  farm_insert: Farm_Key;
}

export interface Farm_Key {
  id: UUIDString;
  __typename?: 'Farm_Key';
}

export interface HealthEvent_Key {
  id: UUIDString;
  __typename?: 'HealthEvent_Key';
}

export interface ListCattleData {
  cattles: ({
    id: UUIDString;
    name?: string | null;
    breed: string;
    birthDate: DateString;
  } & Cattle_Key)[];
}

export interface ListHealthEventsForCattleData {
  healthEvents: ({
    id: UUIDString;
    eventType: string;
    eventDate: DateString;
    description: string;
  } & HealthEvent_Key)[];
}

export interface ListHealthEventsForCattleVariables {
  cattleId: UUIDString;
}

export interface RecordVaccinationData {
  vaccination_insert: Vaccination_Key;
}

export interface RecordVaccinationVariables {
  cattleId: UUIDString;
  vaccineName: string;
  vaccinationDate: DateString;
  administeredBy: string;
}

export interface Treatment_Key {
  id: UUIDString;
  __typename?: 'Treatment_Key';
}

export interface Vaccination_Key {
  id: UUIDString;
  __typename?: 'Vaccination_Key';
}

interface CreateFarmRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateFarmData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateFarmData, undefined>;
  operationName: string;
}
export const createFarmRef: CreateFarmRef;

export function createFarm(): MutationPromise<CreateFarmData, undefined>;
export function createFarm(dc: DataConnect): MutationPromise<CreateFarmData, undefined>;

interface ListCattleRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCattleData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCattleData, undefined>;
  operationName: string;
}
export const listCattleRef: ListCattleRef;

export function listCattle(): QueryPromise<ListCattleData, undefined>;
export function listCattle(dc: DataConnect): QueryPromise<ListCattleData, undefined>;

interface RecordVaccinationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: RecordVaccinationVariables): MutationRef<RecordVaccinationData, RecordVaccinationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: RecordVaccinationVariables): MutationRef<RecordVaccinationData, RecordVaccinationVariables>;
  operationName: string;
}
export const recordVaccinationRef: RecordVaccinationRef;

export function recordVaccination(vars: RecordVaccinationVariables): MutationPromise<RecordVaccinationData, RecordVaccinationVariables>;
export function recordVaccination(dc: DataConnect, vars: RecordVaccinationVariables): MutationPromise<RecordVaccinationData, RecordVaccinationVariables>;

interface ListHealthEventsForCattleRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListHealthEventsForCattleVariables): QueryRef<ListHealthEventsForCattleData, ListHealthEventsForCattleVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListHealthEventsForCattleVariables): QueryRef<ListHealthEventsForCattleData, ListHealthEventsForCattleVariables>;
  operationName: string;
}
export const listHealthEventsForCattleRef: ListHealthEventsForCattleRef;

export function listHealthEventsForCattle(vars: ListHealthEventsForCattleVariables): QueryPromise<ListHealthEventsForCattleData, ListHealthEventsForCattleVariables>;
export function listHealthEventsForCattle(dc: DataConnect, vars: ListHealthEventsForCattleVariables): QueryPromise<ListHealthEventsForCattleData, ListHealthEventsForCattleVariables>;

