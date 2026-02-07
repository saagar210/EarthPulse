export interface GdacsAlert {
  id: string;
  title: string;
  description: string;
  alert_type: string;
  severity: string;
  latitude: number;
  longitude: number;
  pub_date: string;
  link: string;
  country: string;
}
