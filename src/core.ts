import { JoinError } from "./error";
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
        throw new JoinError(`Missing ${item.key} value`);
      }
    }
  }

  private parseFieldPath(fieldPath: string) {
    const [first, ...remain] = fieldPath.split(this.separateSymbol);
    return {
      path: first,
      newPath: remain.join(this.separateSymbol),
    };
  }

  private getFieldValue(local: object | object[], path: string) {
    if (typeOf(local) === Types.Array) {
      const arr = (local as object[])
        .map((v) => this.getFieldValue(v, path))
        .flat(Infinity);

      return Array.from(new Set(arr));
    }

    if (typeOf(local) === Types.Object) {
      const parsePath = this.parseFieldPath(path);
      if (!parsePath.newPath) {
        return local[parsePath.path];
      }

      return this.getFieldValue(local[parsePath.path], parsePath.newPath);
    }

    throw new JoinError(
      `local "${path}": type not supported, it must be object or array of objects`
    );
  }

  private async generateAsValue(param: GenerateAsValueParam) {
    const {
      local,
      localValue,
      fromFieldMap,
      asMap,
      joinFailedValues,
      as,
      metadata,
    } = param;

    const fromValue = fromFieldMap.get(localValue);
    if (fromValue === undefined) {
      joinFailedValues.push(localValue);
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
      } else if (
        typeOf(asMap) === Types.Function ||
        typeOf(asMap) === Types.AsyncFunction
      ) {
        result = await (asMap as Function)(fromValue, local, metadata);
      } else {
        throw new JoinError("asMap type not supported");
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
        throw new JoinError(
          `Not found as when local "${localField}" value is array`
        );
      }

      const parseAsField = this.parseFieldPath(as);
      if (typeOf(local[parseAsField.path]) === Types.Array) {
        const parseLocalField = this.parseFieldPath(localField);

        if (parseLocalField.path !== parseAsField.path) {
          throw new JoinError(
            `When local[${parseAsField.path}] is an array, first path of 'localField' and 'as' need matching, ${parseLocalField.path} !== ${parseAsField.path}`
          );
        }

        for (const item of local[parseAsField.path]) {
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

      if (typeOf(local[as]) === Types.Object) {
        throw new JoinError(
          `Field as "${as}" existed but is object. It must be an array when local value is array`
        );
      }

      local[parseAsField.path] = [];
      for (const value of localValue) {
        const asValue = await this.generateAsValue({
          local,
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
      return;
    }

    // Not array
    if (as) {
      const parseAsField = this.parseFieldPath(as);

      if (typeOf(local[parseAsField.path]) === Types.Array) {
        throw new JoinError(
          `Field as ${as} existed but is array. It must be an object when local value is object`
        );
      }

      const asValue = await this.generateAsValue({
        local,
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

      if (typeOf(local[parseAsField.path]) === Types.Object) {
        Object.assign(local[parseAsField.path], asValue);
        return;
      }

      local[parseAsField.path] = asValue;
      return;
    }

    // as not defined
    const asValue = await this.generateAsValue({
      local,
      localValue,
      fromFieldMap,
      as: undefined,
      asMap,
      joinFailedValues,
      metadata,
    });

    Object.assign(local, asValue);
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
    if (typeOf(from) === Types.Array) {
      return from as object[];
    }

    if (
      typeOf(from) === Types.Function ||
      typeOf(from) === Types.AsyncFunction
    ) {
      const result = await (from as Function)(localFieldValues, metadata);

      if (typeOf(result) === Types.Array) {
        return result as object[];
      }
    }

    throw new JoinError("from must be an array of objects");
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

  public async execute(
    param: JoinDataParam,
    metadata?: any
  ): Promise<JoinDataResult> {
    const { from, localField, fromField, as, asMap } = param;
    let { local } = param;
    const joinFailedValues: Primitive[] = [];

    if (as && as === localField) {
      throw new JoinError(
        `as "${as}" and localField "${localField}" cannot be the same`
      );
    }

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
    const fromFilter: any[] = await this.standardizeFromParam(
      from,
      localFieldValues,
      metadata
    );

    if (isEmptyObject(fromFilter)) {
      joinFailedValues.push(...localFieldValues);
      return this.generateResult(joinFailedValues, local, metadata);
    }

    // optimize find: O(1) at next step
    const fromFieldMap = new Map(
      fromFilter.map((obj) => [this.getFieldValue(obj, fromField), obj])
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
