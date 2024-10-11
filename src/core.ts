// import { DOT } from "./constant";
import {
  FromParam,
  GenerateAsValueParam,
  HandleLocalObjParam,
  JoinDataParam,
  JoinDataResult,
  LocalParam,
  Primitive,
} from "./type";
import { isEmptyObject, isNullOrUndefined, typeOf, Types } from "./util";

export class JoinData {
  protected separateSymbol: string = ".";

  protected validateFields(arr: { key: string; value: any }[], metadata?: any) {
    for (const item of arr) {
      if (!item.value) {
        throw new Error(`Missing ${item.key} value`);
      }
    }
  }

  protected parseFieldPath(fieldPath: string) {
    const [first, ...remain] = fieldPath.split(this.separateSymbol);
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

  protected async standardizeLocalParam(
    local: LocalParam,
    metadata?: any
  ): Promise<LocalParam> {
    return local;
  }

  protected async standardizeFromParam(
    from: FromParam,
    metadata?: any
  ): Promise<any[]> {
    const result = await from();
    const fromArr =
      typeOf(result) === Types.Array ? (result as object[]) : [result];

    return fromArr;
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
      fromArr,
      fromField,
      as,
      asMap,
      joinFailedValues,
      metadata,
    } = param;
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

  public async execute(
    param: JoinDataParam,
    metadata?: any
  ): Promise<JoinDataResult> {
    const { from, localField, fromField, as, asMap } = param;
    let { local } = param;
    const joinFailedValues: Primitive[] = [];

    this.validateFields(
      [
        { key: "local", value: local },
        { key: "from", value: from },
        { key: "localField", value: localField },
        { key: "fromField", value: fromField },
      ],
      metadata
    );

    local = await this.standardizeLocalParam(local, metadata);
    if (isEmptyObject(local)) {
      return this.generateResult(joinFailedValues, local, metadata);
    }

    const result: any[] = await this.standardizeFromParam(from, metadata);
    if (isEmptyObject(result)) {
      return this.generateResult(joinFailedValues, local, metadata);
    }

    if (typeOf(local) === Types.Array) {
      (local as object[]).forEach((v) => {
        this.handleLocalObj({
          local: v,
          localField,
          fromArr: result,
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
      fromArr: result,
      fromField,
      as,
      asMap,
      joinFailedValues,
      metadata,
    });

    return this.generateResult(joinFailedValues, local, metadata);
  }
}
