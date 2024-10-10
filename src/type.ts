export type Primitive = string | number | boolean;

export type LocalParam = object | object[];

export type AsMap = { [key: string]: string}

export interface JoinDataParam<FromFn> {
  local: LocalParam;
  from: FromFn;
  localField: string;
  fromField: string;
  as?: string;
  asMap?: AsMap
}
