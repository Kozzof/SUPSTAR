export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  travelPreferences: Record<string, unknown>;
  isActive?: boolean;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface Place {
  id: string;
  createdById: string;
  name: string;
  address: string;
  city: string;
  country: string;
  category: string;
  description: string;
  openingHours: Record<string, unknown> | null;
  priceLevel: number | null;
  tags: string[];
  ratingAverage: number;
  reviewCount: number;
  location: GeoPoint;
  createdAt: string;
  updatedAt: string;
}

export interface SearchPlacesResult {
  items: Place[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Review {
  id: string;
  userId: string;
  placeId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceStatus {
  id: string;
  userId: string;
  placeId: string;
  visited: boolean;
  wantToVisit: boolean;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlacePhoto {
  id: string;
  placeId: string;
  addedById: string | null;
  url: string;
  caption: string | null;
  displayOrder: number;
  createdAt: string;
}

export type ListMemberRole =
  | 'creator'
  | 'editor'
  | 'commenter'
  | 'reader';

export interface PlaceList {
  id: string;
  createdById: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  travelPreferences: Record<string, unknown>;
  hasPassword: boolean;
  oauthProvider: string | null;
}