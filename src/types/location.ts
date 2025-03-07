export interface Location {
  id: string;
  name: string;
  type: string;
  position: { lat: number; lng: number };
  distance?: string;
  rating: number;
  amenities: string[];
  ageRange: string;
  address: string;
  imageUrl: string;
  isBookmarked: boolean;
}

export interface SavedLocation {
  id: string;
  user_id: string;
  location_id: string;
  name: string;
  type: string;
  lat: number;
  lng: number;
  rating: number;
  amenities: string[];
  age_range: string;
  address: string;
  image_url: string;
  created_at: string;
}
