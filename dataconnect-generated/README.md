# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListCattle*](#listcattle)
  - [*ListHealthEventsForCattle*](#listhealtheventsforcattle)
- [**Mutations**](#mutations)
  - [*CreateFarm*](#createfarm)
  - [*RecordVaccination*](#recordvaccination)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListCattle
You can execute the `ListCattle` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCattle(): QueryPromise<ListCattleData, undefined>;

interface ListCattleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCattleData, undefined>;
}
export const listCattleRef: ListCattleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCattle(dc: DataConnect): QueryPromise<ListCattleData, undefined>;

interface ListCattleRef {
  ...
  (dc: DataConnect): QueryRef<ListCattleData, undefined>;
}
export const listCattleRef: ListCattleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCattleRef:
```typescript
const name = listCattleRef.operationName;
console.log(name);
```

### Variables
The `ListCattle` query has no variables.
### Return Type
Recall that executing the `ListCattle` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCattleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListCattleData {
  cattles: ({
    id: UUIDString;
    name?: string | null;
    breed: string;
    birthDate: DateString;
  } & Cattle_Key)[];
}
```
### Using `ListCattle`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCattle } from '@dataconnect/generated';


// Call the `listCattle()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCattle();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCattle(dataConnect);

console.log(data.cattles);

// Or, you can use the `Promise` API.
listCattle().then((response) => {
  const data = response.data;
  console.log(data.cattles);
});
```

### Using `ListCattle`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCattleRef } from '@dataconnect/generated';


// Call the `listCattleRef()` function to get a reference to the query.
const ref = listCattleRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCattleRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.cattles);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.cattles);
});
```

## ListHealthEventsForCattle
You can execute the `ListHealthEventsForCattle` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listHealthEventsForCattle(vars: ListHealthEventsForCattleVariables): QueryPromise<ListHealthEventsForCattleData, ListHealthEventsForCattleVariables>;

interface ListHealthEventsForCattleRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListHealthEventsForCattleVariables): QueryRef<ListHealthEventsForCattleData, ListHealthEventsForCattleVariables>;
}
export const listHealthEventsForCattleRef: ListHealthEventsForCattleRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listHealthEventsForCattle(dc: DataConnect, vars: ListHealthEventsForCattleVariables): QueryPromise<ListHealthEventsForCattleData, ListHealthEventsForCattleVariables>;

interface ListHealthEventsForCattleRef {
  ...
  (dc: DataConnect, vars: ListHealthEventsForCattleVariables): QueryRef<ListHealthEventsForCattleData, ListHealthEventsForCattleVariables>;
}
export const listHealthEventsForCattleRef: ListHealthEventsForCattleRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listHealthEventsForCattleRef:
```typescript
const name = listHealthEventsForCattleRef.operationName;
console.log(name);
```

### Variables
The `ListHealthEventsForCattle` query requires an argument of type `ListHealthEventsForCattleVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListHealthEventsForCattleVariables {
  cattleId: UUIDString;
}
```
### Return Type
Recall that executing the `ListHealthEventsForCattle` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListHealthEventsForCattleData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListHealthEventsForCattleData {
  healthEvents: ({
    id: UUIDString;
    eventType: string;
    eventDate: DateString;
    description: string;
  } & HealthEvent_Key)[];
}
```
### Using `ListHealthEventsForCattle`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listHealthEventsForCattle, ListHealthEventsForCattleVariables } from '@dataconnect/generated';

// The `ListHealthEventsForCattle` query requires an argument of type `ListHealthEventsForCattleVariables`:
const listHealthEventsForCattleVars: ListHealthEventsForCattleVariables = {
  cattleId: ..., 
};

// Call the `listHealthEventsForCattle()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listHealthEventsForCattle(listHealthEventsForCattleVars);
// Variables can be defined inline as well.
const { data } = await listHealthEventsForCattle({ cattleId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listHealthEventsForCattle(dataConnect, listHealthEventsForCattleVars);

console.log(data.healthEvents);

// Or, you can use the `Promise` API.
listHealthEventsForCattle(listHealthEventsForCattleVars).then((response) => {
  const data = response.data;
  console.log(data.healthEvents);
});
```

### Using `ListHealthEventsForCattle`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listHealthEventsForCattleRef, ListHealthEventsForCattleVariables } from '@dataconnect/generated';

// The `ListHealthEventsForCattle` query requires an argument of type `ListHealthEventsForCattleVariables`:
const listHealthEventsForCattleVars: ListHealthEventsForCattleVariables = {
  cattleId: ..., 
};

// Call the `listHealthEventsForCattleRef()` function to get a reference to the query.
const ref = listHealthEventsForCattleRef(listHealthEventsForCattleVars);
// Variables can be defined inline as well.
const ref = listHealthEventsForCattleRef({ cattleId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listHealthEventsForCattleRef(dataConnect, listHealthEventsForCattleVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.healthEvents);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.healthEvents);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateFarm
You can execute the `CreateFarm` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createFarm(): MutationPromise<CreateFarmData, undefined>;

interface CreateFarmRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateFarmData, undefined>;
}
export const createFarmRef: CreateFarmRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createFarm(dc: DataConnect): MutationPromise<CreateFarmData, undefined>;

interface CreateFarmRef {
  ...
  (dc: DataConnect): MutationRef<CreateFarmData, undefined>;
}
export const createFarmRef: CreateFarmRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createFarmRef:
```typescript
const name = createFarmRef.operationName;
console.log(name);
```

### Variables
The `CreateFarm` mutation has no variables.
### Return Type
Recall that executing the `CreateFarm` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateFarmData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateFarmData {
  farm_insert: Farm_Key;
}
```
### Using `CreateFarm`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createFarm } from '@dataconnect/generated';


// Call the `createFarm()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createFarm();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createFarm(dataConnect);

console.log(data.farm_insert);

// Or, you can use the `Promise` API.
createFarm().then((response) => {
  const data = response.data;
  console.log(data.farm_insert);
});
```

### Using `CreateFarm`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createFarmRef } from '@dataconnect/generated';


// Call the `createFarmRef()` function to get a reference to the mutation.
const ref = createFarmRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createFarmRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.farm_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.farm_insert);
});
```

## RecordVaccination
You can execute the `RecordVaccination` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
recordVaccination(vars: RecordVaccinationVariables): MutationPromise<RecordVaccinationData, RecordVaccinationVariables>;

interface RecordVaccinationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: RecordVaccinationVariables): MutationRef<RecordVaccinationData, RecordVaccinationVariables>;
}
export const recordVaccinationRef: RecordVaccinationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
recordVaccination(dc: DataConnect, vars: RecordVaccinationVariables): MutationPromise<RecordVaccinationData, RecordVaccinationVariables>;

interface RecordVaccinationRef {
  ...
  (dc: DataConnect, vars: RecordVaccinationVariables): MutationRef<RecordVaccinationData, RecordVaccinationVariables>;
}
export const recordVaccinationRef: RecordVaccinationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the recordVaccinationRef:
```typescript
const name = recordVaccinationRef.operationName;
console.log(name);
```

### Variables
The `RecordVaccination` mutation requires an argument of type `RecordVaccinationVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface RecordVaccinationVariables {
  cattleId: UUIDString;
  vaccineName: string;
  vaccinationDate: DateString;
  administeredBy: string;
}
```
### Return Type
Recall that executing the `RecordVaccination` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `RecordVaccinationData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface RecordVaccinationData {
  vaccination_insert: Vaccination_Key;
}
```
### Using `RecordVaccination`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, recordVaccination, RecordVaccinationVariables } from '@dataconnect/generated';

// The `RecordVaccination` mutation requires an argument of type `RecordVaccinationVariables`:
const recordVaccinationVars: RecordVaccinationVariables = {
  cattleId: ..., 
  vaccineName: ..., 
  vaccinationDate: ..., 
  administeredBy: ..., 
};

// Call the `recordVaccination()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await recordVaccination(recordVaccinationVars);
// Variables can be defined inline as well.
const { data } = await recordVaccination({ cattleId: ..., vaccineName: ..., vaccinationDate: ..., administeredBy: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await recordVaccination(dataConnect, recordVaccinationVars);

console.log(data.vaccination_insert);

// Or, you can use the `Promise` API.
recordVaccination(recordVaccinationVars).then((response) => {
  const data = response.data;
  console.log(data.vaccination_insert);
});
```

### Using `RecordVaccination`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, recordVaccinationRef, RecordVaccinationVariables } from '@dataconnect/generated';

// The `RecordVaccination` mutation requires an argument of type `RecordVaccinationVariables`:
const recordVaccinationVars: RecordVaccinationVariables = {
  cattleId: ..., 
  vaccineName: ..., 
  vaccinationDate: ..., 
  administeredBy: ..., 
};

// Call the `recordVaccinationRef()` function to get a reference to the mutation.
const ref = recordVaccinationRef(recordVaccinationVars);
// Variables can be defined inline as well.
const ref = recordVaccinationRef({ cattleId: ..., vaccineName: ..., vaccinationDate: ..., administeredBy: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = recordVaccinationRef(dataConnect, recordVaccinationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.vaccination_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.vaccination_insert);
});
```

