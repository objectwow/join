import { isNullOrUndefined, typeOf, Types } from "./util";

type Primitive = string | number | boolean;

const DOT = ".";

function parseFieldPath(fieldPath: string) {
  const [first, ...remain] = fieldPath.split(DOT);

  return {
    path: first,
    newPath: remain?.join("."),
  };
}

function getFieldValue(parent: object, path: string) {
  if (typeOf(parent) !== Types.Object) {
    return undefined;
  }

  const parsePath = parseFieldPath(path);
  if (!parsePath.newPath) {
    return parent[parsePath.path];
  }

  return getFieldValue(parent[parsePath.path], parsePath.newPath);
}

async function enrichLocalObj(
  local: object,
  localField: string,
  from: object | object[],
  fromField: string,
  as: string,
  joinFailedValues: Primitive[]
) {
  if (!from) {
    return;
  }

  const fromArr = typeOf(from) === Types.Array ? (from as object[]) : [from];

  const fromFieldMap = new Map(
    fromArr.map((obj) => [getFieldValue(obj, fromField), obj])
  );

  const localValue = getFieldValue(local, localField);

  if (isNullOrUndefined(localValue)) {
    return;
  }

  if (typeOf(localValue) === Types.Array) {
    local[as] = [];

    localValue.forEach((value: Primitive) => {
      const result = fromFieldMap.get(value);
      if (result === undefined) {
        joinFailedValues.push(value);
        return;
      }

      local[as].push(result);
    });

    return;
  }

  const result = fromFieldMap.get(localValue);
  if (result === undefined) {
    joinFailedValues.push(localValue);
    return;
  }

  local[as] = result;
}

export async function joinData<T extends (...args: any[]) => any>(param: {
  local: object | object[];
  from: T;
  localField: string;
  fromField: string;
  as: string;
}): Promise<{ joinFailedValues: Primitive[]; allSuccess: boolean }> {
  const { local, from, localField, fromField, as } = param;
  const joinFailedValues: Primitive[] = [];

  if (!local || !from || !localField || !fromField || !as) {
    throw new Error("Missing required parameters");
  }

  const result: any[] = await from();

  if (typeOf(local) === Types.Array) {
    (local as object[]).forEach((v) => {
      enrichLocalObj(v, localField, result, fromField, as, joinFailedValues);
    });

    return {
      joinFailedValues,
      allSuccess: !joinFailedValues.length,
    };
  }

  enrichLocalObj(local, localField, result, fromField, as, joinFailedValues);

  return {
    joinFailedValues,
    allSuccess: !joinFailedValues.length,
  };
}

// async function start() {
//   const local = [
//     {
//       _id: 1,
//       name: "abc",
//       provinceIds: ["1", "2", "3", "4"],
//       test: {
//         provinceId: "3",
//       },
//     },
//     {
//       _id: 1,
//       name: "abc",
//       provinceIds: ["1", "2", "3", "4"],
//       provinceId: "1",
//       test: {
//         provinceId: "3",
//       },
//     },
//   ];

//   const fromArr = [
//     {
//       id: "1",
//       name: "HCM",
//     },
//     {
//       id: "3",
//       name: "HN",
//     },
//   ];

//   const fromObj = {
//     id: "3",
//     test2: {
//       id: "3",
//     },
//     name: "HN",
//   };

//   //   const result = await joinData({
//   //     local,
//   //     from: () => fromArr,
//   //     localField: "provinceIds",
//   //     fromField: "id",
//   //     as: "provinces",
//   //   });

//   //   console.log(result);

//   const result2 = await joinData({
//     local,
//     from: async () => fromObj,
//     localField: "test.provinceId",
//     fromField: "test2.id",
//     as: "province",
//   });
//   console.log(result2);
//   console.dir(local, { depth: null });
// }

// start();
