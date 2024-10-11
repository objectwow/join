export type Primitive = string | number | boolean;

export type LocalParam = object | object[];

export type FromParam = (...args: any[]) => any;

export type AsMap = { [key: string]: string };

export interface JoinDataParam {
  /**
   * Local object or an array of local objects to be joined.
   */
  local: LocalParam;

  /**
   * A callback function that returns the data from the source.
   */
  from: FromParam;

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

export type JoinDataResult =
  | { joinFailedValues: Primitive[]; allSuccess: boolean }
  | any;

export interface GenerateAsValueParam {
  localValue: Primitive;
  fromFieldMap: Map<any, object>;
  asMap: AsMap;
  joinFailedValues: Primitive[];
  metadata?: any;
}

export interface HandleLocalObjParam {
  local: object;
  localField: string;
  fromArr: object[];
  fromField: string;
  as: string;
  asMap: AsMap;
  joinFailedValues: Primitive[];
  metadata?: any;
}
