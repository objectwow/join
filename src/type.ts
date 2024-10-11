export type Primitive = string | number | boolean;

export type LocalValue = any | any[];

export type LocalParam = object | object[];

export type FromParam =
  | ((localFieldValues: Primitive[], metadata: any) => any)
  | object
  | object[];

export type AsMap =
  | ((fromValue: any, metadata: any) => any)
  | { [key: string]: string }
  | string;

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
  localValue: LocalValue;
  fromFieldMap: Map<any, object>;
  as: string;
  asMap: AsMap;
  joinFailedValues: Primitive[];
  metadata?: any;
}

export interface HandleLocalObjParam {
  local: object;
  localField: string;
  fromFieldMap: Map<any, object>;
  fromField: string;
  as: string;
  asMap: AsMap;
  joinFailedValues: Primitive[];
  metadata?: any;
}
