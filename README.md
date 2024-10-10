# @objectwow/join

Join object to object like Database join

## Use case

In a microservices system where each service owns its own database, querying data requires calling multiple services to retrieve the necessary information and manually joining the data. This package simplifies the process of joining data, similar to how MongoDB handles it.

## Installation

npm i @objectwow/join

## Basic usage

```typescript
import { joinData } from "@objectwow/join";

const local = [
  { id: 1, items: [101, 102] },
  { id: 2, items: [201] },
];

const from = () => [
  { id: 101, product: "Product 101" },
  { id: 102, product: "Product 102" },
  { id: 201, product: "Product 201" },
];

const result = await joinData({
  local,
  localField: "items",
  fromField: "id",
  from,
  as: "products",
});
```

LocalData will be overwritten

```typescript
local = [
  {
    id: 1,
    items: [101, 102],
    products: [
      { id: 101, product: "Product 101" },
      { id: 102, product: "Product 102" },
    ],
  },
  {
    id: 2,
    items: [201],
    products: [{ id: 201, product: "Product 201" }],
  },
];

result = {
  allSuccess: true,
  joinFailedValues: [],
};
```

```typescript
export interface JoinDataParam {
  /**
   * Local object or an array of local objects to be joined.
   */
  local: LocalParam;

  /**
   * A callback function that returns the data from the source.
   */
  from: async (...args: any[]) => Promise<any>;
  from: (...args: any[]) => any;

  /**
   * The field name in the local object(s) used for the join (source field).
   */
  localField: string;

  /**
   * The field name in the from object used for the join (destination field).
   */
  fromField: string;

  /**
   * An optional new field name to store the result of the join in the local object(s).
   */
  as?: string;

  /**
   * An optional mapping from the fromField values to the new field names in the local object(s).
   */
  asMap?: AsMap;
}

export type LocalParam = object | object[];

export type AsMap = { [key: string]: string };

export type JoinDataResult =
  | { joinFailedValues: Primitive[]; allSuccess: boolean }
  | any;
```

## Customization

With an out-of-the-box design, you can create your own function using the current structure.

```typescript
export class YourJoin extends JoinData {
  public execute(param: JoinDataParam, metadata?: any): Promise<JoinDataResult> {}
  protected generateAsValue(param: GenerateAsValueParam) {}
  // Use case: Return your custom output
  protected generateResult(joinFailedValues: Primitive[], localOverwrite: LocalParam, metadata?: any) {}
  protected getFieldValue(parent: object, path: string) {}
  protected handleLocalObj(param: HandleLocalObjParam): void {}
  // Use case: Currently, deep values are split by a dot ('.'), but you can use a different symbol if needed
  protected parseFieldPath(fieldPath: string): { path: string; newPath: string; } {}
  // Use case: Shadow clone local data without overwriting the original.
  protected standardizeLocalParam(local: LocalParam): LocalParam {}
  // Use case: Throw an error if the field is invalid
  protected validateFields(arr: { key: string; value: any; }[]): void {}
}

// --- Usage solution 1 ---
// Override the default JoinData instance
SingletonJoinData.setInstance(new YourJoin())

await joinData({...})

// --- Usage solution 2 ---
// Or you can create new singleton instances as needed
export class SingletonJoinData {
  static instance: JoinData;

  private constructor() {}

  static getInstance() {
    if (SingletonJoinData.instance) {
      return SingletonJoinData.instance;
    }

    SingletonJoinData.instance = new YourJoin();
    return SingletonJoinData.instance;
  }
}

export async function yourJoinData(
  params: JoinDataParam,
  metadata?: any
): Promise<JoinDataResult> {
  return SingletonJoinData.getInstance().execute(params, metadata);
}

await yourJoinData({...})

// --- Usage solution 3 ---
// Or, you can directly use your new class without a singleton instance.
const joinCls = new YourJoin()
await joinCls.execute({...})
```

## Benchmark

node lib/benchmark.js
JoinData Execution x 2,157,575 ops/sec ±2.30% (87 runs sampled)
