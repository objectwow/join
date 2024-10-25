export type Primitive = string | number | boolean;

export type LocalValue = any | any[];

export type LocalParam = object | object[];

export type FromParam =
  | ((localFieldValues: Primitive[], metadata: any) => object[])
  | ((localFieldValues: Primitive[], metadata: any) => Promise<object[]>)
  | object[];

export type AsMap =
  | ((currentFrom: any, currentLocal: any, metadata: any) => any)
  | ((currentFrom: any, currentLocal: any, metadata: any) => Promise<any>)
  | { [key: string]: string }
  | string;

/**
 * Parameters for the `joinData` function to perform joins between local data and source data.
 */
export interface JoinDataParam {
  /**
   * Local object or array of local objects to be joined.
   */
  local: LocalParam;

  /**
   * Objects or an asynchronous callback function that returns the data from the source.
   */
  from: FromParam;

  /**
   * Field name in the local object(s) used for the join.
   */
  localField: string;

  /**
   * Field name in the `from` object used for the join.
   */
  fromField: string;

  /**
   * Optional new field name to store the result of the join in the local object(s).
   * If not specified, will overwrite the existing field.
   */
  as?: string;

  /**
   * Optional mapping from the `fromField` values to new field names in the local object(s).
   */
  asMap?: AsMap;
}

/**
 * Result type for the `joinData` function.
 * @property joinFailedValues - Contains the values that failed to join.
 * @property allSuccess - Indicates if all joins were successful.
 */
export type JoinDataResult =
  | { joinFailedValues: Primitive[]; allSuccess: boolean }
  | any;

/**
 * Parameters to generate the value for the `as` field in the local object(s).
 */
export interface GenerateAsValueParam {
  /**
   * The local object being processed.
   */
  local: any;

  /**
   * The value of the `localField` in the local object.
   */
  localValue: LocalValue;

  /**
   * Map of `fromField` values to their corresponding `from` objects.
   */
  fromFieldMap: Map<any, object>;

  /**
   * Name of the field to store the joined result.
   */
  as: string;

  /**
   * Mapping between `fromField` values and the desired field names in the local object(s).
   */
  asMap: AsMap;

  /**
   * Array to store the values that failed to join.
   */
  joinFailedValues: Primitive[];

  /**
   * Optional metadata to be used during join operation.
   */
  metadata?: any;
}

/**
 * Parameters for handling an individual local object during the join process.
 */
export interface HandleLocalObjParam {
  /**
   * The local object being processed.
   */
  local: object;

  /**
   * The field name in the local object used for the join.
   */
  localField: string;

  /**
   * Map of `fromField` values to their corresponding `from` objects.
   */
  fromFieldMap: Map<any, object>;

  /**
   * The field name in the `from` object used for the join.
   */
  fromField: string;

  /**
   * Name of the field to store the result of the join.
   */
  as: string;

  /**
   * Mapping between `fromField` values and the desired field names in the local object(s).
   */
  asMap: AsMap;

  /**
   * Array to store the values that failed to join.
   */
  joinFailedValues: Primitive[];

  /**
   * Optional metadata to be used during join operation.
   */
  metadata?: any;
}
