export interface ActiveShower {
  name: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  is_peak: boolean;
  peak_date: string;
  zhr: number;
  velocity_kps: number;
  parent_body: string;
  days_until_peak: number;
}
