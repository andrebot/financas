export interface QueryCondition<T> {
  equals?: T;
  not?: T | QueryCondition<T>;
  in?: T[];
  notIn?: T[];
  lt?: T;
  lte?: T;
  gt?: T;
  gte?: T;
  contains?: T;
  startsWith?: T;
  endsWith?: T;
}

export type QueryFilter<T> = {
  [P in keyof T]?: T[P] | QueryCondition<T[P]>;
};
