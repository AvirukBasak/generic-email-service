import { QuerySortOrder } from "@/types";

export type QueryableField<T> = Extract<keyof T, string>;

export interface IQueryWrapper<Model, QuerySnapshot, FilterOp> {
  where<K extends QueryableField<Model>>(
    field: K,
    op: FilterOp,
    value: Model[K] | Model[K][]
  ): IQueryWrapper<Model, QuerySnapshot, FilterOp>;

  orderBy<K extends QueryableField<Model>>(
    field: K,
    direction?: QuerySortOrder
  ): IQueryWrapper<Model, QuerySnapshot, FilterOp>;

  limit(n: number): IQueryWrapper<Model, QuerySnapshot, FilterOp>;

  get(): Promise<QuerySnapshot>;
}
