import { CollectionReference, DocumentReference, FieldValue, Transaction } from "firebase-admin/firestore";
import { FirestoreQueryWrapper } from "@/wrappers/FirestoreQueryWrapper";
import { IDbAdapter } from "@/dbAdapters/IDbAdapter";
import { FirebaseFirestore } from "@/firebase/init";
import { CustomApiError } from "@/types/errors";
import { Nullable } from "@/types";

export class FirestoreAdapter<M> implements IDbAdapter<M, DocumentReference<M>, Transaction> {
  private collectionPath: string;

  private constructor(collectionPath: string) {
    this.collectionPath = collectionPath;
  }

  private getCollRef(): CollectionReference {
    return FirebaseFirestore.collection(this.collectionPath);
  }

  static create<M = never>(collectionPath: string): FirestoreAdapter<M> {
    return new FirestoreAdapter<M>(collectionPath);
  }

  docRef(id?: Nullable<string>): DocumentReference<M> {
    const collRef = this.getCollRef();
    return (id == null ? collRef.doc() : collRef.doc(id)) as DocumentReference<M>;
  }

  async set(
    data: Partial<M>,
    options: { merge?: boolean; id?: string } = {},
    tx: Nullable<Transaction>
  ): Promise<void> {
    const docRef = this.docRef(options.id);
    const merge = options.merge ?? false;
    data = {
      ...data,
      // Add auto fields
      createdOn: FieldValue.serverTimestamp(),
      lastModifiedOn: FieldValue.serverTimestamp(),
    };
    if (tx != null) {
      tx.set(docRef, data, { merge });
    } else {
      await docRef.set(data, { merge });
    }
  }

  async update(id: string, data: Partial<M>, tx: Nullable<Transaction>): Promise<void> {
    const docRef = this.docRef(id);
    if (tx != null) {
      tx.update(docRef, { ...data, lastModifiedOn: FieldValue.serverTimestamp() });
    } else {
      const docSnapshot = await docRef.get();
      if (!docSnapshot.exists) {
        throw CustomApiError.create(404, "Not Found");
      }
      await docRef.update({ ...data, lastModifiedOn: FieldValue.serverTimestamp() });
    }
  }

  async findById(id: string, tx: Nullable<Transaction>): Promise<Nullable<M>> {
    const docRef = this.docRef(id);
    const snapshot = tx != null ? await tx.get(docRef) : await docRef.get();
    if (!snapshot.exists) return null;
    return snapshot.data() as M;
  }

  query(): FirestoreQueryWrapper<M> {
    return FirestoreQueryWrapper.create<M>(this.getCollRef());
  }

  async delete(id: string, tx: Nullable<Transaction>): Promise<void> {
    const docRef = this.docRef(id);
    if (tx != null) {
      tx.delete(docRef);
    } else {
      await docRef.delete();
    }
  }
}
