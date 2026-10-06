export default interface Restaurant {
  id: string;
  name: string;
  cuisine?: string[];
  genres: string[];
  address: string;
  tel?: string;
  phone?: string;
  hours?: string;
  opening_hours?: {
    text?: string;
    [key: string]: unknown;
  };
  picture?: string;
  pictures?: string[];
  photos?: string[];
  price_range?: number;
  priceRange?: string; 
  rating?: number;
  visits?: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
  coordinates?: {
      lat: number;
      lng: number;
  };
}
