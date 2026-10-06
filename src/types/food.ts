export type PlatformId = 'talabat' | 'snoonu' | 'rafeeq' | 'keeta';

export type FuturePlatformId = 'ninja' | 'akly' | 'foodak' | 'wishbox';

export type DataMode = 'demo' | 'live_api';

export type DealBadgeType =
  | 'BEST_DEAL'
  | 'CHEAPEST'
  | 'FASTEST'
  | 'BEST_RATED'
  | 'FREE_DELIVERY'
  | 'BIGGEST_DISCOUNT';

export type OfferCategory =
  | 'ALL'
  | 'BIGGEST_DISCOUNT'
  | 'FREE_DELIVERY'
  | 'BOGO'
  | 'QAR_OFF'
  | 'PERCENT_OFF'
  | 'LIMITED_TIME'
  | 'NEW_USER'
  | 'RESTAURANT_OFFER';

export type SortOption =
  | 'best_deal'
  | 'cheapest'
  | 'fastest'
  | 'highest_rated'
  | 'lowest_delivery'
  | 'biggest_discount';

export type AddressLabel = 'Home' | 'Office' | 'Other' | 'Current';

export interface QatarZone {
  id: string;
  nameEn: string;
  nameAr: string;
  cityEn: string;
  deliveryMultiplier: number;
  extraMinutes: number;
  unavailablePlatforms?: PlatformId[];
}

export interface SavedAddress {
  id: string;
  label: AddressLabel;
  customName?: string;
  zoneId: string;
  streetNote?: string;
}

export interface PlatformMetadata {
  id: PlatformId;
  name: string;
  nameAr: string;
  accentHex: string;
  deepLinkScheme: string;
  webUrl: string;
  tagline: string;
}

export interface FuturePlatformMetadata {
  id: FuturePlatformId;
  name: string;
  nameAr: string;
  status: 'planned_connector';
  description: string;
}

export interface PlatformQuote {
  platformId: PlatformId;
  available: boolean;
  foodPrice: number; // QAR
  deliveryFee: number | null; // null if fee unavailable
  serviceFee: number | null; // null if fee unavailable
  smallOrderFee: number; // QAR
  minimumOrder: number; // QAR
  discountAmount: number; // QAR saved from promo/offer
  offerLabel: string | null; // e.g. "QAR 5 OFF", "FREE DELIVERY", "20% OFF"
  promoCode?: string;
  estimatedMinutes: number;
  rating: number;
  reviewCount: number;
  estimatedTotal: number | null; // null if any required fee is unavailable ("Final total unavailable")
  lastUpdatedIso: string;
  orderWebUrl: string;
  orderDeepLink: string;
  badges: DealBadgeType[];
}

export interface NormalizedFoodItem {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  restaurantId: string;
  restaurantNameEn: string;
  restaurantNameAr: string;
  cuisine: string;
  category: string;
  distanceKm: number;
  imageUrl: string;
  normalPriceQar: number;
  quotes: PlatformQuote[];
  bestQuote: PlatformQuote | null;
  cheapestQuote: PlatformQuote | null;
  fastestQuote: PlatformQuote | null;
  maxSavingsQar: number;
}

export interface RestaurantComparison {
  id: string;
  nameEn: string;
  nameAr: string;
  cuisine: string;
  cuisineAr: string;
  distanceKm: number;
  isOpen: boolean;
  openingHours: string;
  averageRating: number;
  imageUrl: string;
  availablePlatforms: PlatformId[];
  basketComparison: {
    platformId: PlatformId;
    sampleBasketTotal: number | null;
    deliveryFee: number | null;
    serviceFee: number;
    etaMinutes: number;
    currentOffer: string | null;
    isCheapest: boolean;
    orderWebUrl: string;
    orderDeepLink: string;
  }[];
  menuItems: NormalizedFoodItem[];
}

export interface PlatformOffer {
  id: string;
  platformId: PlatformId;
  restaurantId: string;
  restaurantNameEn: string;
  restaurantNameAr: string;
  dishNameEn: string;
  dishNameAr: string;
  imageUrl: string;
  category: OfferCategory;
  titleEn: string;
  titleAr: string;
  promoCode?: string;
  normalPriceQar: number;
  dealPriceQar: number;
  savingsQar: number;
  minimumOrderQar: number;
  deliveryFeeQar: number;
  expiryText: string;
  conditionsEn: string;
  conditionsAr: string;
  lastUpdatedIso: string;
  orderWebUrl: string;
  orderDeepLink: string;
}

export interface ProviderSyncState {
  platformId: PlatformId;
  status: 'available' | 'syncing' | 'failed' | 'unavailable_live';
  lastSyncedIso: string | null;
  errorMessage?: string;
  latencyMs?: number;
}

export interface ParsedSearchIntent {
  rawQuery: string;
  cleanKeywords: string;
  detectedCategory?: string;
  detectedCuisine?: string;
  maxPriceQar?: number;
  freeDeliveryOnly?: boolean;
  hasOfferOnly?: boolean;
  suggestedSort?: SortOption;
  explanationChips: string[];
}

export interface PriceAlert {
  id: string;
  type: 'price_drop' | 'free_delivery';
  targetName: string;
  targetPriceQar?: number;
  restaurantName?: string;
  enabled: boolean;
  triggered: boolean;
  currentBestPriceQar?: number;
  matchedPlatform?: PlatformId;
  createdAtIso: string;
}

export interface FavoriteCollection {
  foodIds: string[];
  restaurantIds: string[];
  searches: string[];
  cuisines: string[];
}
