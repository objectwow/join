import { DOT } from "./constant";
import {
  AsMap,
  GenerateAsValueParam,
  HandleLocalObjParam,
  JoinDataParam,
  JoinDataResult,
  LocalParam,
  Primitive,
} from "./type";
import { isNullOrUndefined, typeOf, Types } from "./util";

export class JoinData {
  protected validateFields(arr: { key: string; value: any }[]) {
    for (const item of arr) {
      if (!item.value) {
        throw new Error(`Missing ${item.key} value`);
      }
    }
  }

  protected parseFieldPath(fieldPath: string) {
    const [first, ...remain] = fieldPath.split(DOT);
    return {
      path: first,
      newPath: remain?.join("."),
    };
  }

  protected getFieldValue(parent: object, path: string) {
    if (typeOf(parent) !== Types.Object) {
      return undefined;
    }

    const parsePath = this.parseFieldPath(path);
    if (!parsePath.newPath) {
      return parent[parsePath.path];
    }

    return this.getFieldValue(parent[parsePath.path], parsePath.newPath);
  }

  protected standardizeLocalParam(local: LocalParam) {
    return local;
  }

  protected generateResult(
    joinFailedValues: Primitive[],
    localOverwrite: LocalParam,
    metadata?: any
  ): JoinDataResult {
    const allSuccess = !joinFailedValues.length;
    return {
      joinFailedValues: Array.from(new Set(joinFailedValues)),
      allSuccess,
    };
  }

  protected generateAsValue(param: GenerateAsValueParam) {
    const { localValue, fromFieldMap, asMap, joinFailedValues, metadata } =
      param;
    const fromValue = fromFieldMap.get(localValue);
    if (fromValue === undefined) {
      joinFailedValues.push(localValue);
      return undefined;
    }

    let result: any = {};
    if (asMap) {
      Object.keys(asMap).forEach((key: string) => {
        const fromFieldValue = this.getFieldValue(fromValue, asMap[key]);
        if (fromFieldValue !== undefined) {
          result[key] = fromFieldValue;
        }
      });
    } else {
      result = fromValue;
    }

    return result;
  }

  protected handleLocalObj(param: HandleLocalObjParam) {
    const {
      local,
      localField,
      from,
      fromField,
      as,
      asMap,
      joinFailedValues,
      metadata,
    } = param;
    // standardize from parameter
    const fromArr = typeOf(from) === Types.Array ? (from as object[]) : [from];

    const localValue = this.getFieldValue(local, localField);

    if (isNullOrUndefined(localValue)) {
      return;
    }

    // optimize find: O(1) at next step
    const fromFieldMap = new Map(
      fromArr.map((obj) => [this.getFieldValue(obj, fromField), obj])
    );

    if (typeOf(localValue) === Types.Array) {
      if (!as) {
        throw new Error(
          "Not found rootArrayAs when local value is array and as is object"
        );
      }

      local[as] = [];

      localValue.forEach((value: Primitive) => {
        const asValue = this.generateAsValue({
          localValue: value,
          fromFieldMap,
          asMap,
          joinFailedValues,
          metadata,
        });

        if (!asValue) {
          return;
        }

        local[as].push(asValue);
      });
      return;
    }

    // Not array
    const asValue = this.generateAsValue({
      localValue,
      fromFieldMap,
      asMap,
      joinFailedValues,
      metadata,
    });
    if (!asValue) {
      return;
    }

    if (as) {
      local[as] = asValue;
      return;
    }

    // as not defined
    Object.assign(local, asValue);
  }

  public async execute<FromFn extends (...args: any[]) => any>(
    param: JoinDataParam<FromFn>,
    metadata?: any
  ): Promise<JoinDataResult> {
    const { from, localField, fromField, as, asMap } = param;
    let { local } = param;
    const joinFailedValues: Primitive[] = [];

    this.validateFields([
      { key: "local", value: local },
      { key: "from", value: from },
      { key: "localField", value: localField },
      { key: "fromField", value: fromField },
    ]);

    local = this.standardizeLocalParam(local);

    const result: any[] = await from();

    if (typeOf(local) === Types.Array) {
      (local as object[]).forEach((v) => {
        this.handleLocalObj({
          local: v,
          localField,
          from: result,
          fromField,
          as,
          asMap,
          joinFailedValues,
          metadata,
        });
      });

      return this.generateResult(joinFailedValues, local, metadata);
    }

    this.handleLocalObj({
      local,
      localField,
      from: result,
      fromField,
      as,
      asMap,
      joinFailedValues,
      metadata,
    });

    return this.generateResult(joinFailedValues, local, metadata);
  }
}
