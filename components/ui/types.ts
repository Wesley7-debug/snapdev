export interface Builder {
  username: string;
  name: string;
  avatar: string;
  role: string;
  bio: string;
  building: string;
  techStack: string[];
  xHandle: string;
  github: string;
  website: string;
  status: string;
  city: string;
  country: string;
  lng: number;
  lat: number;
  distanceKm?: number;
}
