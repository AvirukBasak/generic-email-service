export interface MemeImageModel {
  // set on create
  name: string;
  tags: string[];
  // initialize on create
  id: string;
  uploaderId: string;
  imageUrl: string;
  isUnavailable: boolean;
  // also init on create: various scores
  totalViews: number;
  uniqueViews: number;
  totalClicks: number;
  uniqueClicks: number;
  rankingScore: number;
  // AutoSetFields
  createdOn: FirebaseFirestore.Timestamp;
  lastModifiedOn: FirebaseFirestore.Timestamp;
  // deletion no allowed, so no ttl
}

export type MemeImageModelVariousScores =
  | "totalViews"
  | "uniqueViews"
  | "totalClicks"
  | "uniqueClicks"
  | "rankingScore";
