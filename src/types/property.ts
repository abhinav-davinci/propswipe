export type PropertyType = 'apartment' | 'villa' | 'plot' | 'penthouse' | 'studio' | 'rowhouse';
export type TransactionType = 'buy' | 'rent';
export type FurnishingType = 'unfurnished' | 'semi-furnished' | 'fully-furnished';
export type FacingDirection = 'north' | 'south' | 'east' | 'west' | 'north-east' | 'north-west' | 'south-east' | 'south-west';

export interface PropertyLocation {
  area: string;
  subArea: string;
  city: string;
  lat: number;
  lng: number;
  landmarks: string[];
}

export interface PropertySpecs {
  bedrooms: number;
  bathrooms: number;
  carpetArea: number;
  floor: number;
  totalFloors: number;
  facing: FacingDirection;
  furnishing: FurnishingType;
  amenities: string[];
}

export interface MatchBreakdown {
  location: number;
  budget: number;
  size: number;
  amenities: number;
  connectivity: number;
  value: number;
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  rating: number;
  verified: boolean;
  image: string;
}

export interface Property {
  id: string;
  title: string;
  propertyType: PropertyType;
  transactionType: TransactionType;
  price: number;
  pricePerSqft: number;
  location: PropertyLocation;
  specs: PropertySpecs;
  images: string[];
  matchScore: number;
  matchBreakdown: MatchBreakdown;
  agent: Agent;
  tags: string[];
  aiSummary: string;
  listedDate: string;
  isNew: boolean;
  isPremium: boolean;
}

export type SwipeDirection = 'left' | 'right' | 'up' | 'superlike';

export interface SwipeAction {
  propertyId: string;
  direction: SwipeDirection;
  timestamp: number;
}
