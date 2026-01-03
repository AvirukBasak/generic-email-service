import { CollectionReference, Query, QuerySnapshot, WhereFilterOp } from "firebase-admin/firestore";
import { QueryableField, IQueryWrapper } from "@/wrappers/IQueryWrapper";
import { QuerySortOrder } from "@/types";

export class FirestoreQueryWrapper<M> implements IQueryWrapper<M, QuerySnapshot, WhereFilterOp> {
  private query: Query;

  private constructor(ref: CollectionReference) {
    this.query = ref as unknown as Query;
  }

  static create<U>(ref: CollectionReference): FirestoreQueryWrapper<U> {
    return new FirestoreQueryWrapper<U>(ref);
  }

  where<K extends QueryableField<M>>(field: K, op: WhereFilterOp, value: M[K] | M[K][]): FirestoreQueryWrapper<M> {
    this.query = this.query.where(field, op, value);
    return this;
  }

  // prettier-ignore
  orderBy<K extends QueryableField<M>>(field: K, direction: QuerySortOrder = QuerySortOrder.ASCENDING): FirestoreQueryWrapper<M> {
    this.query = this.query.orderBy(field, direction === QuerySortOrder.ASCENDING ? "asc" : "desc");
    return this;
  }

  limit(n: number): FirestoreQueryWrapper<M> {
    this.query = this.query.limit(n);
    return this;
  }

  get(): Promise<QuerySnapshot> {
    return this.query.get();
  }
}
