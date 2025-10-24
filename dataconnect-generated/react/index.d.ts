import { CreateFarmData, ListCattleData, RecordVaccinationData, RecordVaccinationVariables, ListHealthEventsForCattleData, ListHealthEventsForCattleVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateFarm(options?: useDataConnectMutationOptions<CreateFarmData, FirebaseError, void>): UseDataConnectMutationResult<CreateFarmData, undefined>;
export function useCreateFarm(dc: DataConnect, options?: useDataConnectMutationOptions<CreateFarmData, FirebaseError, void>): UseDataConnectMutationResult<CreateFarmData, undefined>;

export function useListCattle(options?: useDataConnectQueryOptions<ListCattleData>): UseDataConnectQueryResult<ListCattleData, undefined>;
export function useListCattle(dc: DataConnect, options?: useDataConnectQueryOptions<ListCattleData>): UseDataConnectQueryResult<ListCattleData, undefined>;

export function useRecordVaccination(options?: useDataConnectMutationOptions<RecordVaccinationData, FirebaseError, RecordVaccinationVariables>): UseDataConnectMutationResult<RecordVaccinationData, RecordVaccinationVariables>;
export function useRecordVaccination(dc: DataConnect, options?: useDataConnectMutationOptions<RecordVaccinationData, FirebaseError, RecordVaccinationVariables>): UseDataConnectMutationResult<RecordVaccinationData, RecordVaccinationVariables>;

export function useListHealthEventsForCattle(vars: ListHealthEventsForCattleVariables, options?: useDataConnectQueryOptions<ListHealthEventsForCattleData>): UseDataConnectQueryResult<ListHealthEventsForCattleData, ListHealthEventsForCattleVariables>;
export function useListHealthEventsForCattle(dc: DataConnect, vars: ListHealthEventsForCattleVariables, options?: useDataConnectQueryOptions<ListHealthEventsForCattleData>): UseDataConnectQueryResult<ListHealthEventsForCattleData, ListHealthEventsForCattleVariables>;
