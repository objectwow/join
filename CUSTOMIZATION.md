# Customization

With an out-of-the-box design, you can create your own function using the current structure.

## Customized definition

```typescript
import { JoinData } from "@objectwow/join";

export class YourJoin extends JoinData {
  // Use case: Currently, deep values are split by a dot ('.'), but you can use a different symbol if needed
  protected separateSymbol: string;

  // Use case: Return your custom output
  protected generateResult(
    joinFailedValues: Primitive[],
    localOverwrite: LocalParam,
    metadata?: any
  ) {}

  // Use case:  Deep clone local data if you want to avoid overwriting the original.
  protected standardizeLocalParam(
    local: LocalParam,
    metadata?: any
  ): Promise<LocalParam> {}

  // Use case: Automatically call internal or external services to retrieve data based on the input
  protected standardizeFromParam(
    from: FromParam,
    localFieldValues: string[],
    metadata?: any
  ): Promise<any[]> {}

  // Use case: Throw an error if the field is invalid
  protected validateFields(
    arr: { key: string; value: any }[],
    metadata?: any
  ): void {}
}
```

## Customized usage

### Using solution 1: Override the default JoinData instance

```typescript
SingletonJoinData.setInstance(new YourJoin())

await joinData({...})
```

### Using solution 2: Create new singleton instances as needed

```typescript
import { SingletonJoinData } from "@objectwow/join";

export class YourSingletonJoinData extends SingletonJoinData{}

YourSingletonJoinData.setInstance(new YourJoin())

export async function yourJoinDataFunction(
  params: JoinDataParam,
  metadata?: any
): Promise<JoinDataResult> {
  return YourSingletonJoinData.getInstance().execute(params, metadata);
}

await yourJoinDataFunction({...})
```

### Using solution 3: You can directly use your new class without a singleton instance.

```typescript
const joinCls = new YourJoin()
await joinCls.execute({...})
```

Tips:

- You can call original function (parent function) with `super.
- You can pass anything to the metadata
