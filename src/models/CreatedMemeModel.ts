export interface MemeTextContentModel {
  text: string;
  rgba: string;
  x: number;
  y: number;
}

export interface CreatedMemeModel {
  // set by creator, private to creator alone
  memeImageId: string;
  content: MemeTextContentModel[];
  // initialize on create
  id: string;
  creatorId: string;
  // AutoSetFields
  createdOn: FirebaseFirestore.Timestamp;
  lastModifiedOn: FirebaseFirestore.Timestamp;
  ttl?: FirebaseFirestore.Timestamp;
}
