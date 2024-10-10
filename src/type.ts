export type Primitive = string | number | boolean;

export type LocalParam = object | object[];

export type AsMap = { [key: string]: string };

export interface JoinDataParam {
  local: LocalParam;
  from: (...args: any[]) => any;
  localField: string;
  fromField: string;
  as?: string;
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
  from: object | object[];
  fromField: string;
  as: string;
  asMap: AsMap;
  joinFailedValues: Primitive[];
  metadata?: any;
}
