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

  private getFieldValue(parent: object | object[], path: string) {
    if (typeOf(parent) === Types.Array) {
      const arr = (parent as object[])
        .map((v) => this.getFieldValue(v, path))
        .flat(Infinity);

      return Array.from(new Set(arr));
    }

    if (typeOf(parent) === Types.Object) {
      if (!path) {
        return parent;
      }

      const parsePath = this.parseFieldPath(path);
      if (!parsePath.newPath) {
        return parent[parsePath.path];
      }

      return this.getFieldValue(parent[parsePath.path], parsePath.newPath);
    }

    return parent;
  }

  protected async standardizeLocalParam(
    local: LocalParam,
    metadata?: any
  ): Promise<LocalParam> {
    return local;
  }

  protected async standardizeFromParam(
    from: FromParam,
    localFieldValues: string[],
    metadata?: any
  ): Promise<any[]> {
    if (typeOf(from) === Types.Object) {
      return [from];
    }

    if (typeOf(from) === Types.Array) {
      return from as any[];
    }

    const result = await (from as Function)(localFieldValues, metadata);
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

  private async generateAsValue(param: GenerateAsValueParam) {
    const { localValue, fromFieldMap, asMap, joinFailedValues, as, metadata } =
      param;

    const fromValue = fromFieldMap.get(localValue);
    if (fromValue === undefined) {
      if (
        typeOf(localValue) === Types.Array ||
        typeOf(localValue) === Types.Object
      ) {
        // joinFailedValues.push(...localValue);
        // skip
      } else {
        joinFailedValues.push(localValue);
      }

      return undefined;
    }

    let result: any = {};
    if (asMap) {
      if (typeOf(asMap) === Types.String) {
        const fromFieldValue = this.getFieldValue(fromValue, asMap as string);
        if (fromFieldValue !== undefined) {
          // overwrite type
          result = fromFieldValue;
        }
      } else if (typeOf(asMap) === Types.Object) {
        Object.keys(asMap).forEach((key: string) => {
          const fromFieldValue = this.getFieldValue(fromValue, asMap[key]);
          if (fromFieldValue !== undefined) {
            result[key] = fromFieldValue;
          }
        });
      } else {
        // function
        result = await (asMap as Function)(fromValue, metadata);
      }
    } else {
      result = fromValue;
    }

    if (as) {
      return {
        [as]: result,
      };
    }

    return result;
  }

  private async handleLocalObj(param: HandleLocalObjParam) {
    const {
      local,
      localField,
      fromFieldMap,
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

    if (typeOf(localValue) === Types.Array) {
      if (!as) {
        throw new Error("Not found as when local value is array");
      }

      const parseAsField = this.parseFieldPath(as);
      if (typeOf(local[as]) === Types.Array) {
        const parseLocalField = this.parseFieldPath(localField);

        if (parseLocalField.path !== parseAsField.path) {
          throw new Error(
            `First path of localField and as not matching, ${parseLocalField.path} !== ${parseAsField.path}`
          );
        }

        for (const item of local[as]) {
          await this.handleLocalObj({
            local: item,
            localField: parseLocalField.newPath,
            fromFieldMap,
            fromField,
            as: parseAsField.newPath,
            asMap,
            joinFailedValues,
            metadata,
          });
        }

        return;
      }

      if (typeOf[local[as]] === Types.Object) {
        throw new Error(
          `Field ${as} existed but is object. It must be an array when local value is array`
        );
      }

      local[parseAsField.path] = [];
      for (const value of localValue) {
        const asValue = await this.generateAsValue({
          localValue: value,
          fromFieldMap,
          as: parseAsField.newPath,
          asMap,
          joinFailedValues,
          metadata,
        });

        if (!asValue) {
          continue;
        }

        local[parseAsField.path].push(asValue);
      }
    }

    // Not array
    if (as) {
      const parseAsField = this.parseFieldPath(as);
      const asValue = await this.generateAsValue({
        localValue,
        fromFieldMap,
        as: parseAsField.newPath,
        asMap,
        joinFailedValues,
        metadata,
      });

      if (!asValue) {
        return;
      }

      if (typeOf[local[parseAsField.path]] === Types.Array) {
        throw new Error(
          `Field ${as} existed but is array. It must be an object when local value is object`
        );
      }

      if (typeOf[local[parseAsField.path]] === Types.Object) {
        Object.assign(local[parseAsField.path], asValue);
        return;
      }

      local[parseAsField.path] = asValue;
      return;
    }

    // as not defined
    const asValue = await this.generateAsValue({
      localValue,
      fromFieldMap,
      as: undefined,
      asMap,
      joinFailedValues,
      metadata,
    });

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

    const localFieldValues = this.getFieldValue(local, localField);
    const result: any[] = await this.standardizeFromParam(
      from,
      localFieldValues,
      metadata
    );

    if (isEmptyObject(result)) {
      joinFailedValues.push(...localFieldValues);
      return this.generateResult(joinFailedValues, local, metadata);
    }

    // optimize find: O(1) at next step
    const fromFieldMap = new Map(
      result.map((obj) => [this.getFieldValue(obj, fromField), obj])
    );

    if (typeOf(local) === Types.Array) {
      for (const item of local as object[]) {
        await this.handleLocalObj({
          local: item,
          localField,
          fromFieldMap,
          fromField,
          as,
          asMap,
          joinFailedValues,
          metadata,
        });
      }

      return this.generateResult(joinFailedValues, local, metadata);
    }

    await this.handleLocalObj({
      local,
      localField,
      fromFieldMap,
      fromField,
      as,
      asMap,
      joinFailedValues,
      metadata,
    });

    return this.generateResult(joinFailedValues, local, metadata);
  }
}
