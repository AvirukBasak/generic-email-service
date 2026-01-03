import { QuerySnapshot, WhereFilterOp } from "firebase-admin/firestore";
import { IQueryWrapper } from "@/wrappers/IQueryWrapper";
import { Nullable } from "@/types";

export interface IDbAdapter<Model, DocRef, Transaction> {
  docRef(id?: Nullable<string>): DocRef;

  set(data: Partial<Model>, options?: { merge?: boolean; id?: string }, tx?: Nullable<Transaction>): Promise<void>;

  update(id: string, data: Partial<Model>, tx?: Nullable<Transaction>): Promise<void>;

  findById(id: string, tx?: Nullable<Transaction>): Promise<Nullable<Model>>;

  query(): IQueryWrapper<Model, QuerySnapshot, WhereFilterOp>;

  delete(id: string, tx?: Nullable<Transaction>): Promise<void>;
}
