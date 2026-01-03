export interface MemeImageUserStatsModel {
  memeImageId: string;
  clicks: number;
  views: number;
  lastViewedOn: FirebaseFirestore.Timestamp;
  lastClickedOn?: FirebaseFirestore.Timestamp;
}
