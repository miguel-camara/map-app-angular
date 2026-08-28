export interface Place {
  id: string;
  name: string;
  address: string;
  lng: number;
  lat: number;
  source: 'overpass' | 'local';
}
