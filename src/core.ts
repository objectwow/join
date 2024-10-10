import { DOT } from "./constant";
import { AsMap, JoinDataParam, LocalParam, Primitive } from "./type";
import { isNullOrUndefined, typeOf, Types, validateFields } from "./util";

export class JoinData {
  private parseFieldPath(fieldPath: string) {
    const [first, ...remain] = fieldPath.split(DOT);

    return {
      path: first,
      newPath: remain?.join("."),
    };
  }

  private getFieldValue(parent: object, path: string) {
    if (typeOf(parent) !== Types.Object) {
      return undefined;
    }

    const parsePath = this.parseFieldPath(path);
    if (!parsePath.newPath) {
      return parent[parsePath.path];
    }

    return this.getFieldValue(parent[parsePath.path], parsePath.newPath);
  }

  protected formatLocalParam(local: LocalParam) {
    return local;
  }

  protected generateJoinResult(
    joinFailedValues: Primitive[],
    localOverwrite: LocalParam
  ) {
    const allSuccess = !joinFailedValues.length;
    return {
      joinFailedValues: Array.from(new Set(joinFailedValues)),
      allSuccess,
    };
  }

  protected generateAsValue(
    localValue: Primitive,
    fromFieldMap: Map<any, object>,
    asMap: AsMap,
    joinFailedValues: Primitive[]
  ) {
    const fromValue = fromFieldMap.get(localValue);
    if (fromValue === undefined) {
      joinFailedValues.push(localValue);
      return undefined;
    }

    let result: any = {}
    if (asMap) {
      Object.keys(asMap).forEach((key: string) => {
        const fromFieldValue = this.getFieldValue(fromValue, asMap[key])
        if (fromFieldValue !== undefined) {
          result[key] = fromFieldValue
        }
      })
    } else {
      result = fromValue
    }

    return result
  }

  protected handleLocalObj(
    local: object,
    localField: string,
    from: object | object[],
    fromField: string,
    as: string,
    asMap: AsMap,
    joinFailedValues: Primitive[]
  ) {
    if (!from) {
      return;
    }

    const fromArr = typeOf(from) === Types.Array ? (from as object[]) : [from];

    const fromFieldMap = new Map(
      fromArr.map((obj) => [this.getFieldValue(obj, fromField), obj])
    );

    const localValue = this.getFieldValue(local, localField);

    if (isNullOrUndefined(localValue)) {
      return;
    }

    if (typeOf(localValue) === Types.Array) {
      if (!as) {
        throw new Error("Not found rootArrayAs when local value is array and as is object")
      }

      local[as] = []

      localValue.forEach((value: Primitive) => {
        const asValue = this.generateAsValue(value, fromFieldMap, asMap, joinFailedValues)
        if (!asValue) {
          return
        }

        local[as].push(asValue);

      });
      return
    }

    // Not array
    const asValue = this.generateAsValue(localValue, fromFieldMap, asMap, joinFailedValues)
    if (!asValue) {
      return
    }

    if (as) {
      local[as] = asValue
      return
    }

    Object.assign(local, asValue)
  }


  public async execute<FromFn extends (...args: any[]) => any>(
    param: JoinDataParam<FromFn>
  ) {
    const { from, localField, fromField, as, asMap } = param;
    let { local } = param;
    const joinFailedValues: Primitive[] = [];

    validateFields([{ key: "local", value: local }, { key: "from", value: from }, { key: "localField", value: localField }, { key: "fromField", value: fromField }])

    local = this.formatLocalParam(local);

    const result: any[] = await from();

    if (typeOf(local) === Types.Array) {
      (local as object[]).forEach((v) => {
        this.handleLocalObj(v, localField, result, fromField, as, asMap, joinFailedValues);
      });

      return this.generateJoinResult(joinFailedValues, local)
    }

    this.handleLocalObj(local, localField, result, fromField, as, asMap, joinFailedValues);

    return this.generateJoinResult(joinFailedValues, local)
  }
}
