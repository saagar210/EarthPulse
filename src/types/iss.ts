export interface IssPosition {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface IssData {
  current: IssPosition;
  trail: IssPosition[];
}
