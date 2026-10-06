import {
  DealBadgeType,
  FuturePlatformMetadata,
  NormalizedFoodItem,
  PlatformId,
  PlatformMetadata,
  PlatformOffer,
  PlatformQuote,
  QatarZone,
  RestaurantComparison,
} from '../types/food';

export const FOOD_IMAGES = {
  biryani: '/src/assets/images/food_chicken_biryani_1791284110927.jpg',
  shawarma: '/src/assets/images/food_arabic_shawarma_1791284125042.jpg',
  burger: '/src/assets/images/food_smash_burger_1791284139937.jpg',
  pizza: '/src/assets/images/food_truffle_pizza_1791284150202.jpg',
  parottaKarak: '/src/assets/images/food_kerala_parotta_karak_1791284164119.jpg',
};

export const QATAR_ZONES: QatarZone[] = [
  {
    id: 'west_bay',
    nameEn: 'West Bay (Dafna)',
    nameAr: 'الخليج الغربي (الدفنة)',
    cityEn: 'Doha',
    deliveryMultiplier: 1.0,
    extraMinutes: 0,
  },
  {
    id: 'al_sadd',
    nameEn: 'Al Sadd',
    nameAr: 'السد',
    cityEn: 'Doha',
    deliveryMultiplier: 1.0,
    extraMinutes: -2,
  },
  {
    id: 'lusail',
    nameEn: 'Lusail Marina',
    nameAr: 'مارينا لوسيل',
    cityEn: 'Lusail',
    deliveryMultiplier: 1.2,
    extraMinutes: 5,
  },
  {
    id: 'the_pearl',
    nameEn: 'The Pearl-Qatar',
    nameAr: 'اللؤلؤة قطر',
    cityEn: 'Doha',
    deliveryMultiplier: 1.2,
    extraMinutes: 4,
  },
  {
    id: 'msheireb',
    nameEn: 'Msheireb Downtown',
    nameAr: 'مشيرب قلب الدوحة',
    cityEn: 'Doha',
    deliveryMultiplier: 1.0,
    extraMinutes: 0,
  },
  {
    id: 'al_rayyan',
    nameEn: 'Education City / Al Rayyan',
    nameAr: 'المدينة التعليمية / الريان',
    cityEn: 'Al Rayyan',
    deliveryMultiplier: 1.25,
    extraMinutes: 6,
  },
  {
    id: 'al_wakrah',
    nameEn: 'Al Wakrah',
    nameAr: 'الوكرة',
    cityEn: 'Al Wakrah',
    deliveryMultiplier: 1.4,
    extraMinutes: 10,
  },
];

export const ACTIVE_PLATFORMS: PlatformMetadata[] = [
  {
    id: 'talabat',
    name: 'Talabat',
    nameAr: 'طلبات',
    accentHex: '#FF5A00',
    deepLinkScheme: 'talabat://qatar/search',
    webUrl: 'https://www.talabat.com/qatar',
    tagline: 'Qatar wide restaurant coverage & Talabat Pro perks',
  },
  {
    id: 'snoonu',
    name: 'Snoonu',
    nameAr: 'سنونو',
    accentHex: '#D91B24',
    deepLinkScheme: 'snoonu://restaurants',
    webUrl: 'https://snoonu.com/restaurants',
    tagline: 'Qatari super-app with rapid local fleet delivery',
  },
  {
    id: 'rafeeq',
    name: 'Rafeeq',
    nameAr: 'رفيق',
    accentHex: '#7C3AED',
    deepLinkScheme: 'rafeeq://food',
    webUrl: 'https://rafeeq.com',
    tagline: '100% Qatari platform with local restaurant deals',
  },
  {
    id: 'keeta',
    name: 'Keeta',
    nameAr: 'كيتا',
    accentHex: '#10B981',
    deepLinkScheme: 'keeta://qatar',
    webUrl: 'https://www.keeta-global.com',
    tagline: 'Aggressive zero-delivery vouchers & on-time guarantee',
  },
];

export const FUTURE_PLATFORMS: FuturePlatformMetadata[] = [
  {
    id: 'ninja',
    name: 'Ninja',
    nameAr: 'نينجا',
    status: 'planned_connector',
    description: 'Ultra-fast grocery & café express connector (Architecture ready)',
  },
  {
    id: 'akly',
    name: 'Akly',
    nameAr: 'أكلي',
    status: 'planned_connector',
    description: 'Healthy meal prep & macro-counted dish connector (Architecture ready)',
  },
  {
    id: 'foodak',
    name: 'Foodak',
    nameAr: 'فودك',
    status: 'planned_connector',
    description: 'Qatar local dining aggregator connector (Architecture ready)',
  },
  {
    id: 'wishbox',
    name: 'Wishbox',
    nameAr: 'ويش بوكس',
    status: 'planned_connector',
    description: 'Local courier & merchant delivery connector (Architecture ready)',
  },
];

export const QUICK_CATEGORIES = [
  'All',
  'Biryani',
  'Burger',
  'Pizza',
  'Shawarma',
  'Indian',
  'Arabic',
  'Chinese',
  'Kerala',
  'Breakfast',
  'Coffee',
  'Desserts',
  'Healthy',
  'Fast Food',
] as const;

export const SEARCH_EXAMPLES = [
  'Chicken Biryani',
  'Shawarma',
  'Burger',
  'Pizza',
  'Fried Rice',
  'Karak',
  'Kerala Parotta',
  'Coffee',
];

export const NL_SEARCH_EXAMPLES = [
  'cheap biryani',
  'best burger under 20',
  'pizza with free delivery',
  'Indian food under 30',
  'cheapest shawarma',
  'best food deal near me',
  'fastest burger',
  'biryani below QAR 15',
];

/**
 * Common modular interface that every food-delivery platform provider must implement.
 * Allows additional Qatar platforms (Ninja, Akly, Foodak, Wishbox) to be registered without UI changes.
 */
export interface FoodDeliveryProvider {
  readonly id: PlatformId;
  readonly metadata: PlatformMetadata;
  search(query: string, zone: QatarZone): Promise<RawPlatformQuoteRecord[]>;
  getRestaurants(zone: QatarZone): Promise<RawRestaurantRecord[]>;
  getMenu(restaurantId: string, zone: QatarZone): Promise<RawPlatformQuoteRecord[]>;
  getOffers(zone: QatarZone): Promise<PlatformOffer[]>;
  getPrices(itemId: string, zone: QatarZone): Promise<{
    foodPrice: number;
    deliveryFee: number | null;
    serviceFee: number | null;
    smallOrderFee: number;
    discountAmount: number;
    estimatedTotal: number | null;
  } | null>;
  getDeliveryFee(restaurantId: string, zone: QatarZone): Promise<number | null>;
  getAvailability(restaurantId: string, zone: QatarZone): Promise<boolean>;
  getLastUpdated(): string;
  getOrderLink(restaurantSlug: string, dishName?: string): { deepLink: string; webUrl: string };
}

export interface RawPlatformQuoteRecord {
  itemId: string;
  platformId: PlatformId;
  available: boolean;
  foodPrice: number;
  baseDeliveryFee: number | null;
  serviceFee: number | null;
  smallOrderFee: number;
  minimumOrder: number;
  discountAmount: number;
  offerLabel: string | null;
  promoCode?: string;
  baseEtaMinutes: number;
  rating: number;
  reviewCount: number;
}

export interface RawRestaurantRecord {
  id: string;
  nameEn: string;
  nameAr: string;
  cuisine: string;
  cuisineAr: string;
  distanceKm: number;
  isOpen: boolean;
  openingHours: string;
  imageUrl: string;
}

interface CatalogSeedItem {
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
  quotes: Record<PlatformId, Omit<RawPlatformQuoteRecord, 'itemId' | 'platformId'>>;
}

const DEMO_RESTAURANTS: RawRestaurantRecord[] = [
  {
    id: 'rest-biryani-abc',
    nameEn: 'Restaurant ABC · Royal Dum Biryani House',
    nameAr: 'مطعم ABC · بيت البرياني الملكي',
    cuisine: 'Indian',
    cuisineAr: 'هندي',
    distanceKm: 2.1,
    isOpen: true,
    openingHours: '11:00 AM – 1:00 AM',
    imageUrl: FOOD_IMAGES.biryani,
  },
  {
    id: 'rest-shawarma-mashawi',
    nameEn: 'Al Mashawi Al Arabi',
    nameAr: 'المشاوي العربي',
    cuisine: 'Arabic',
    cuisineAr: 'عربي',
    distanceKm: 1.8,
    isOpen: true,
    openingHours: '10:00 AM – 3:00 AM',
    imageUrl: FOOD_IMAGES.shawarma,
  },
  {
    id: 'rest-burger-exit55',
    nameEn: 'Dohaburger Smash Lab',
    nameAr: 'مختبر سماش برجر الدوحة',
    cuisine: 'Fast Food',
    cuisineAr: 'وجبات سريعة',
    distanceKm: 2.6,
    isOpen: true,
    openingHours: '12:00 PM – 2:00 AM',
    imageUrl: FOOD_IMAGES.burger,
  },
  {
    id: 'rest-pizza-napoli',
    nameEn: 'Forno Lusail Neapolitan Pizza',
    nameAr: 'فرن لوسيل للبيتزا النابولية',
    cuisine: 'Pizza',
    cuisineAr: 'بيتزا',
    distanceKm: 3.4,
    isOpen: true,
    openingHours: '11:30 AM – 12:30 AM',
    imageUrl: FOOD_IMAGES.pizza,
  },
  {
    id: 'rest-kerala-malabar',
    nameEn: 'Malabar Calicut Kitchen Doha',
    nameAr: 'مطبخ مالابار كاليكوت الدوحة',
    cuisine: 'Kerala',
    cuisineAr: 'كيرلا',
    distanceKm: 1.5,
    isOpen: true,
    openingHours: '6:00 AM – 11:30 PM',
    imageUrl: FOOD_IMAGES.parottaKarak,
  },
  {
    id: 'rest-karak-teatime',
    nameEn: 'Karak & Chapati Corner',
    nameAr: 'ركن الكرك والشباتي',
    cuisine: 'Coffee',
    cuisineAr: 'قهوة وكرك',
    distanceKm: 0.9,
    isOpen: true,
    openingHours: 'Open 24 Hours',
    imageUrl: FOOD_IMAGES.parottaKarak,
  },
  {
    id: 'rest-chinese-wok',
    nameEn: 'Golden Dragon Wok Doha',
    nameAr: 'ووك التنين الذهبي',
    cuisine: 'Chinese',
    cuisineAr: 'صيني',
    distanceKm: 2.9,
    isOpen: true,
    openingHours: '12:00 PM – 12:00 AM',
    imageUrl: FOOD_IMAGES.biryani,
  },
  {
    id: 'rest-healthy-green',
    nameEn: 'Green Macro Kitchen West Bay',
    nameAr: 'المطبخ الصحي الخليج الغربي',
    cuisine: 'Healthy',
    cuisineAr: 'صحي',
    distanceKm: 2.2,
    isOpen: true,
    openingHours: '8:00 AM – 10:30 PM',
    imageUrl: FOOD_IMAGES.shawarma,
  },
];

const DEMO_CATALOG: CatalogSeedItem[] = [
  {
    id: 'item-chicken-biryani-abc',
    nameEn: 'Chicken Biryani',
    nameAr: 'برياني دجاج ملكي',
    descriptionEn: 'Fragrant saffron basmati rice cooked on dum with spiced chicken, caramelized onions, mint & raita.',
    descriptionAr: 'أرز بسمتي بالزعفران مطهو على الطريقة الهندية مع الدجاج المتبل والبصل المقرمش والرايتا.',
    restaurantId: 'rest-biryani-abc',
    restaurantNameEn: 'Restaurant ABC · Royal Dum Biryani House',
    restaurantNameAr: 'مطعم ABC · بيت البرياني الملكي',
    cuisine: 'Indian',
    category: 'Biryani',
    distanceKm: 2.1,
    imageUrl: FOOD_IMAGES.biryani,
    normalPriceQar: 22,
    quotes: {
      talabat: {
        available: true,
        foodPrice: 20,
        baseDeliveryFee: 5,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 3,
        offerLabel: 'QAR 3 OFF',
        promoCode: 'TLB3',
        baseEtaMinutes: 28,
        rating: 4.7,
        reviewCount: 1420,
      },
      snoonu: {
        available: true,
        foodPrice: 20,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 0,
        offerLabel: 'FREE DELIVERY',
        baseEtaMinutes: 24,
        rating: 4.8,
        reviewCount: 980,
      },
      rafeeq: {
        available: true,
        foodPrice: 19,
        baseDeliveryFee: 3,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 0,
        offerLabel: null,
        baseEtaMinutes: 31,
        rating: 4.6,
        reviewCount: 610,
      },
      keeta: {
        available: true,
        foodPrice: 18,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 10,
        discountAmount: 5,
        offerLabel: 'QAR 5 OFF',
        promoCode: 'KEETA5',
        baseEtaMinutes: 21,
        rating: 4.9,
        reviewCount: 845,
      },
    },
  },
  {
    id: 'item-arabic-shawarma-box',
    nameEn: 'Arabic Chicken Shawarma Box',
    nameAr: 'بوكس شاورما دجاج عربي على الصاج',
    descriptionEn: 'Toasted saj wraps sliced into 6 pieces with garlic toum, pickled turnips, spiced fries & pomegranate molasses.',
    descriptionAr: 'خبز صاج محمص مقطع 6 قطع مع ثوم كريمي، مخلل لفت، بطاطس مقرمشة ودبس رمان.',
    restaurantId: 'rest-shawarma-mashawi',
    restaurantNameEn: 'Al Mashawi Al Arabi',
    restaurantNameAr: 'المشاوي العربي',
    cuisine: 'Arabic',
    category: 'Shawarma',
    distanceKm: 1.8,
    imageUrl: FOOD_IMAGES.shawarma,
    normalPriceQar: 26,
    quotes: {
      talabat: {
        available: true,
        foodPrice: 24,
        baseDeliveryFee: 4,
        serviceFee: 1,
        smallOrderFee: 0,
        minimumOrder: 20,
        discountAmount: 4,
        offerLabel: 'QAR 4 OFF',
        promoCode: 'SHAW4',
        baseEtaMinutes: 25,
        rating: 4.8,
        reviewCount: 2150,
      },
      snoonu: {
        available: true,
        foodPrice: 22,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 5,
        offerLabel: 'QAR 5 OFF + FREE DEL',
        promoCode: 'SNOONU5',
        baseEtaMinutes: 19,
        rating: 4.9,
        reviewCount: 1890,
      },
      rafeeq: {
        available: true,
        foodPrice: 23,
        baseDeliveryFee: 2,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 3,
        offerLabel: 'QAR 3 OFF',
        baseEtaMinutes: 27,
        rating: 4.7,
        reviewCount: 740,
      },
      keeta: {
        available: true,
        foodPrice: 22,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 4,
        offerLabel: 'QAR 4 OFF',
        baseEtaMinutes: 22,
        rating: 4.8,
        reviewCount: 620,
      },
    },
  },
  {
    id: 'item-double-smash-burger',
    nameEn: 'Double Wagyu Smash Burger Meal',
    nameAr: 'وجبة دبل واغيو سماش برجر',
    descriptionEn: 'Two seared Wagyu patties with crispy lacy edges, double American cheddar, house truffle burger sauce & skin-on fries.',
    descriptionAr: 'قطعتان من لحم الواغيو المشوي مع جبنة شيدر مزدوجة، صوص الكمأة الخاص وبطاطس مقرمشة.',
    restaurantId: 'rest-burger-exit55',
    restaurantNameEn: 'Dohaburger Smash Lab',
    restaurantNameAr: 'مختبر سماش برجر الدوحة',
    cuisine: 'Fast Food',
    category: 'Burger',
    distanceKm: 2.6,
    imageUrl: FOOD_IMAGES.burger,
    normalPriceQar: 32,
    quotes: {
      talabat: {
        available: true,
        foodPrice: 28,
        baseDeliveryFee: 5,
        serviceFee: 1,
        smallOrderFee: 0,
        minimumOrder: 25,
        discountAmount: 6,
        offerLabel: '20% OFF',
        promoCode: 'BURGER20',
        baseEtaMinutes: 26,
        rating: 4.7,
        reviewCount: 910,
      },
      snoonu: {
        available: true,
        foodPrice: 27,
        baseDeliveryFee: 3,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 20,
        discountAmount: 4,
        offerLabel: 'QAR 4 OFF',
        baseEtaMinutes: 23,
        rating: 4.8,
        reviewCount: 830,
      },
      rafeeq: {
        available: true,
        foodPrice: 25,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 20,
        discountAmount: 7,
        offerLabel: 'QAR 7 OFF + FREE DEL',
        promoCode: 'RFQBURGER',
        baseEtaMinutes: 24,
        rating: 4.9,
        reviewCount: 540,
      },
      keeta: {
        available: true,
        foodPrice: 26,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 7,
        offerLabel: 'QAR 7 OFF',
        baseEtaMinutes: 20,
        rating: 4.8,
        reviewCount: 790,
      },
    },
  },
  {
    id: 'item-neapolitan-pizza',
    nameEn: 'Wood-Fired Burrata & Pepperoni Pizza',
    nameAr: 'بيتزا البوراتا والبيبروني على الحطب',
    descriptionEn: '48-hour fermented sourdough crust, San Marzano tomatoes, crispy beef pepperoni, fresh creamy burrata & basil.',
    descriptionAr: 'عجينة مخمرة 48 ساعة، طماطم سان مارزانو، بيبروني بقري مقرمش، جبنة بوراتا طازجة وريحان.',
    restaurantId: 'rest-pizza-napoli',
    restaurantNameEn: 'Forno Lusail Neapolitan Pizza',
    restaurantNameAr: 'فرن لوسيل للبيتزا النابولية',
    cuisine: 'Pizza',
    category: 'Pizza',
    distanceKm: 3.4,
    imageUrl: FOOD_IMAGES.pizza,
    normalPriceQar: 42,
    quotes: {
      talabat: {
        available: true,
        foodPrice: 38,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 30,
        discountAmount: 10,
        offerLabel: 'QAR 10 OFF + FREE DEL',
        promoCode: 'PIZZA10',
        baseEtaMinutes: 29,
        rating: 4.9,
        reviewCount: 1120,
      },
      snoonu: {
        available: true,
        foodPrice: 39,
        baseDeliveryFee: 0,
        serviceFee: 1,
        smallOrderFee: 0,
        minimumOrder: 30,
        discountAmount: 6,
        offerLabel: 'QAR 6 OFF',
        baseEtaMinutes: 27,
        rating: 4.8,
        reviewCount: 770,
      },
      rafeeq: {
        available: true,
        foodPrice: 38,
        baseDeliveryFee: 4,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 25,
        discountAmount: 5,
        offerLabel: 'QAR 5 OFF',
        baseEtaMinutes: 33,
        rating: 4.7,
        reviewCount: 410,
      },
      keeta: {
        available: true,
        foodPrice: 36,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 20,
        discountAmount: 6,
        offerLabel: 'QAR 6 OFF + FREE DEL',
        baseEtaMinutes: 25,
        rating: 4.8,
        reviewCount: 680,
      },
    },
  },
  {
    id: 'item-kerala-parotta-roast',
    nameEn: 'Kerala Parotta (3 pcs) & Nadan Chicken Roast',
    nameAr: 'براتا كيرلا (3 قطع) مع روست الدجاج الهندي',
    descriptionEn: 'Flaky layered Malabar parotta served with slow-roasted spicy coconut curry-leaf chicken roast & salna.',
    descriptionAr: 'براتا مالابار مورقة ومقرمشة تقدم مع دجاج روست بالتوابل الهندية وأوراق الكاري.',
    restaurantId: 'rest-kerala-malabar',
    restaurantNameEn: 'Malabar Calicut Kitchen Doha',
    restaurantNameAr: 'مطبخ مالابار كاليكوت الدوحة',
    cuisine: 'Kerala',
    category: 'Kerala',
    distanceKm: 1.5,
    imageUrl: FOOD_IMAGES.parottaKarak,
    normalPriceQar: 18,
    quotes: {
      talabat: {
        available: true,
        foodPrice: 16,
        baseDeliveryFee: 4,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 2,
        offerLabel: 'QAR 2 OFF',
        baseEtaMinutes: 22,
        rating: 4.8,
        reviewCount: 1640,
      },
      snoonu: {
        available: true,
        foodPrice: 15,
        baseDeliveryFee: 3,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 2,
        offerLabel: 'QAR 2 OFF',
        baseEtaMinutes: 20,
        rating: 4.7,
        reviewCount: 920,
      },
      rafeeq: {
        available: true,
        foodPrice: 15,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 12,
        discountAmount: 3,
        offerLabel: 'QAR 3 OFF + FREE DEL',
        promoCode: 'KERALA12',
        baseEtaMinutes: 24,
        rating: 4.8,
        reviewCount: 810,
      },
      keeta: {
        available: true,
        foodPrice: 14,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 10,
        discountAmount: 3,
        offerLabel: 'QAR 3 OFF + FREE DEL',
        promoCode: 'KEETA3',
        baseEtaMinutes: 18,
        rating: 4.9,
        reviewCount: 950,
      },
    },
  },
  {
    id: 'item-karak-chapati-box',
    nameEn: 'Doha Karak Flask (1L) & Cheese Honey Chapati Box',
    nameAr: 'دلة كرك قطري (1 لتر) مع بوكس شباتي جبن وعسل',
    descriptionEn: 'Cardamom-infused Qatari evaporated milk Karak tea flask paired with 4 warm griddled cheese & Sidr honey chapatis.',
    descriptionAr: 'دلة شاي كرك قطري بالهيل مع 4 فطائر شباتي ساخنة بالجبن وعسل السدر.',
    restaurantId: 'rest-karak-teatime',
    restaurantNameEn: 'Karak & Chapati Corner',
    restaurantNameAr: 'ركن الكرك والشباتي',
    cuisine: 'Arabic',
    category: 'Coffee',
    distanceKm: 0.9,
    imageUrl: FOOD_IMAGES.parottaKarak,
    normalPriceQar: 24,
    quotes: {
      talabat: {
        available: true,
        foodPrice: 20,
        baseDeliveryFee: 3,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 0,
        offerLabel: null,
        baseEtaMinutes: 18,
        rating: 4.9,
        reviewCount: 3400,
      },
      snoonu: {
        available: true,
        foodPrice: 19,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 4,
        offerLabel: 'QAR 4 OFF + FREE DEL',
        promoCode: 'KARAK15',
        baseEtaMinutes: 15,
        rating: 4.9,
        reviewCount: 4120,
      },
      rafeeq: {
        available: true,
        foodPrice: 19,
        baseDeliveryFee: 2,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 2,
        offerLabel: 'QAR 2 OFF',
        baseEtaMinutes: 19,
        rating: 4.8,
        reviewCount: 1560,
      },
      keeta: {
        available: true,
        foodPrice: 18,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 10,
        discountAmount: 2,
        offerLabel: 'FREE DELIVERY',
        baseEtaMinutes: 16,
        rating: 4.8,
        reviewCount: 1120,
      },
    },
  },
  {
    id: 'item-schezwan-fried-rice',
    nameEn: 'Schezwan Chicken Fried Rice & Crispy Chili Beef Combo',
    nameAr: 'كومبو أرز مقلي سيشوان بالدجاج ولحم كريسبي بالفلفل',
    descriptionEn: 'Wok-hei tossed jasmine fried rice with spicy Schezwan glaze, spring onions, dim sum & crispy chili beef.',
    descriptionAr: 'أرز جاسمين مقلي على الووك مع صلصة سيشوان الحارة، بصل أخضر، ديم سوم ولحم بقري مقرمش.',
    restaurantId: 'rest-chinese-wok',
    restaurantNameEn: 'Golden Dragon Wok Doha',
    restaurantNameAr: 'ووك التنين الذهبي',
    cuisine: 'Chinese',
    category: 'Chinese',
    distanceKm: 2.9,
    imageUrl: FOOD_IMAGES.biryani,
    normalPriceQar: 34,
    quotes: {
      talabat: {
        available: true,
        foodPrice: 30,
        baseDeliveryFee: 5,
        serviceFee: 1,
        smallOrderFee: 0,
        minimumOrder: 25,
        discountAmount: 5,
        offerLabel: 'QAR 5 OFF',
        baseEtaMinutes: 30,
        rating: 4.6,
        reviewCount: 530,
      },
      snoonu: {
        available: true,
        foodPrice: 29,
        baseDeliveryFee: 4,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 20,
        discountAmount: 5,
        offerLabel: 'QAR 5 OFF',
        baseEtaMinutes: 28,
        rating: 4.7,
        reviewCount: 490,
      },
      rafeeq: {
        available: true,
        foodPrice: 28,
        baseDeliveryFee: null, // Demonstrates honest handling when a delivery fee isn't returned by provider
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 20,
        discountAmount: 0,
        offerLabel: null,
        baseEtaMinutes: 32,
        rating: 4.5,
        reviewCount: 310,
      },
      keeta: {
        available: true,
        foodPrice: 27,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 6,
        offerLabel: 'QAR 6 OFF + FREE DEL',
        promoCode: 'WOK6',
        baseEtaMinutes: 23,
        rating: 4.8,
        reviewCount: 640,
      },
    },
  },
  {
    id: 'item-grilled-halloumi-bowl',
    nameEn: 'Grilled Halloumi, Zaatar Chicken & Quinoa Power Bowl',
    nameAr: 'بول الحلوم المشوي ودجاج الزعتر والكينوا الصحي',
    descriptionEn: '48g protein macro-balanced bowl with chargrilled chicken breast, Cypriot halloumi, avocado, pomegranate & tahini lemon dressing.',
    descriptionAr: 'وجبة صحية متوازنة (48 جم بروتين) مع صدر دجاج مشوي، جبن حلوم، أفوكادو، رمان وصوص الطحينة بالليمون.',
    restaurantId: 'rest-healthy-green',
    restaurantNameEn: 'Green Macro Kitchen West Bay',
    restaurantNameAr: 'المطبخ الصحي الخليج الغربي',
    cuisine: 'Healthy',
    category: 'Healthy',
    distanceKm: 2.2,
    imageUrl: FOOD_IMAGES.shawarma,
    normalPriceQar: 36,
    quotes: {
      talabat: {
        available: true,
        foodPrice: 32,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 25,
        discountAmount: 7,
        offerLabel: 'QAR 7 OFF + FREE DEL',
        promoCode: 'FIT7',
        baseEtaMinutes: 24,
        rating: 4.9,
        reviewCount: 680,
      },
      snoonu: {
        available: true,
        foodPrice: 33,
        baseDeliveryFee: 3,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 25,
        discountAmount: 5,
        offerLabel: 'QAR 5 OFF',
        baseEtaMinutes: 25,
        rating: 4.8,
        reviewCount: 520,
      },
      rafeeq: {
        available: true,
        foodPrice: 31,
        baseDeliveryFee: 3,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 20,
        discountAmount: 4,
        offerLabel: 'QAR 4 OFF',
        baseEtaMinutes: 27,
        rating: 4.7,
        reviewCount: 290,
      },
      keeta: {
        available: true,
        foodPrice: 30,
        baseDeliveryFee: 0,
        serviceFee: 0,
        smallOrderFee: 0,
        minimumOrder: 15,
        discountAmount: 4,
        offerLabel: 'QAR 4 OFF + FREE DEL',
        baseEtaMinutes: 21,
        rating: 4.8,
        reviewCount: 430,
      },
    },
  },
];

abstract class BaseQatarDeliveryProvider implements FoodDeliveryProvider {
  public readonly id: PlatformId;
  public readonly metadata: PlatformMetadata;
  protected lastUpdatedIso: string;

  constructor(id: PlatformId) {
    this.id = id;
    this.metadata = ACTIVE_PLATFORMS.find((p) => p.id === id)!;
    this.lastUpdatedIso = new Date().toISOString();
  }

  public touchTimestamp(iso?: string) {
    this.lastUpdatedIso = iso || new Date().toISOString();
  }

  public getLastUpdated(): string {
    return this.lastUpdatedIso;
  }

  public getOrderLink(restaurantSlug: string, dishName?: string): { deepLink: string; webUrl: string } {
    const queryParam = encodeURIComponent(dishName || restaurantSlug);
    return {
      deepLink: `${this.metadata.deepLinkScheme}?q=${queryParam}`,
      webUrl: `${this.metadata.webUrl}?utm_source=food_bucket_qatar&q=${queryParam}`,
    };
  }

  public async getAvailability(restaurantId: string, zone: QatarZone): Promise<boolean> {
    if (zone.unavailablePlatforms?.includes(this.id)) return false;
    const item = DEMO_CATALOG.find((c) => c.restaurantId === restaurantId);
    return item ? item.quotes[this.id].available : true;
  }

  public async getDeliveryFee(restaurantId: string, zone: QatarZone): Promise<number | null> {
    const item = DEMO_CATALOG.find((c) => c.restaurantId === restaurantId);
    if (!item) return null;
    const baseFee = item.quotes[this.id].baseDeliveryFee;
    if (baseFee === null) return null;
    if (baseFee === 0) return 0;
    return Math.round(baseFee * zone.deliveryMultiplier);
  }

  public async getPrices(itemId: string, zone: QatarZone) {
    const item = DEMO_CATALOG.find((c) => c.id === itemId);
    if (!item) return null;
    const q = item.quotes[this.id];
    const deliveryFee =
      q.baseDeliveryFee === null
        ? null
        : q.baseDeliveryFee === 0
        ? 0
        : Math.round(q.baseDeliveryFee * zone.deliveryMultiplier);

    const estimatedTotal =
      deliveryFee === null || q.serviceFee === null
        ? null
        : Math.max(0, q.foodPrice + deliveryFee + q.serviceFee + q.smallOrderFee - q.discountAmount);

    return {
      foodPrice: q.foodPrice,
      deliveryFee,
      serviceFee: q.serviceFee,
      smallOrderFee: q.smallOrderFee,
      discountAmount: q.discountAmount,
      estimatedTotal,
    };
  }

  public async search(query: string, zone: QatarZone): Promise<RawPlatformQuoteRecord[]> {
    const q = query.trim().toLowerCase();
    return DEMO_CATALOG.filter((item) => {
      if (!q) return true;
      return (
        item.nameEn.toLowerCase().includes(q) ||
        item.nameAr.includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.cuisine.toLowerCase().includes(q) ||
        item.restaurantNameEn.toLowerCase().includes(q)
      );
    }).map((item) => {
      const quote = item.quotes[this.id];
      const adjustedDelivery =
        quote.baseDeliveryFee === null
          ? null
          : quote.baseDeliveryFee === 0
          ? 0
          : Math.round(quote.baseDeliveryFee * zone.deliveryMultiplier);
      return {
        ...quote,
        itemId: item.id,
        platformId: this.id,
        baseDeliveryFee: adjustedDelivery,
        baseEtaMinutes: Math.max(12, quote.baseEtaMinutes + zone.extraMinutes),
      };
    });
  }

  public async getRestaurants(_zone: QatarZone): Promise<RawRestaurantRecord[]> {
    return DEMO_RESTAURANTS;
  }

  public async getMenu(restaurantId: string, zone: QatarZone): Promise<RawPlatformQuoteRecord[]> {
    const items = DEMO_CATALOG.filter((i) => i.restaurantId === restaurantId);
    return items.map((item) => {
      const quote = item.quotes[this.id];
      const adjustedDelivery =
        quote.baseDeliveryFee === null
          ? null
          : quote.baseDeliveryFee === 0
          ? 0
          : Math.round(quote.baseDeliveryFee * zone.deliveryMultiplier);
      return {
        ...quote,
        itemId: item.id,
        platformId: this.id,
        baseDeliveryFee: adjustedDelivery,
        baseEtaMinutes: Math.max(12, quote.baseEtaMinutes + zone.extraMinutes),
      };
    });
  }

  public async getOffers(zone: QatarZone): Promise<PlatformOffer[]> {
    const offers: PlatformOffer[] = [];
    for (const item of DEMO_CATALOG) {
      const q = item.quotes[this.id];
      if (!q.offerLabel && q.discountAmount === 0 && q.baseDeliveryFee !== 0) continue;
      const deliveryFee =
        q.baseDeliveryFee === null
          ? 0
          : q.baseDeliveryFee === 0
          ? 0
          : Math.round(q.baseDeliveryFee * zone.deliveryMultiplier);
      const total = Math.max(
        0,
        q.foodPrice + deliveryFee + (q.serviceFee ?? 0) + q.smallOrderFee - q.discountAmount
      );
      const savings = Math.max(2, item.normalPriceQar + 5 - total);
      const links = this.getOrderLink(item.restaurantNameEn, item.nameEn);

      let category: PlatformOffer['category'] = 'QAR_OFF';
      if (q.baseDeliveryFee === 0 && q.discountAmount >= 5) category = 'BIGGEST_DISCOUNT';
      else if (q.baseDeliveryFee === 0) category = 'FREE_DELIVERY';
      else if (q.offerLabel?.includes('%')) category = 'PERCENT_OFF';

      offers.push({
        id: `offer-${this.id}-${item.id}`,
        platformId: this.id,
        restaurantId: item.restaurantId,
        restaurantNameEn: item.restaurantNameEn,
        restaurantNameAr: item.restaurantNameAr,
        dishNameEn: item.nameEn,
        dishNameAr: item.nameAr,
        imageUrl: item.imageUrl,
        category,
        titleEn: q.offerLabel || 'Special App Deal',
        titleAr: q.offerLabel === 'FREE DELIVERY' ? 'توصيل مجاني' : `خصم ${q.discountAmount} ر.ق`,
        promoCode: q.promoCode,
        normalPriceQar: item.normalPriceQar + 5,
        dealPriceQar: total,
        savingsQar: savings,
        minimumOrderQar: q.minimumOrder,
        deliveryFeeQar: deliveryFee,
        expiryText: 'Ends tonight at 11:59 PM',
        conditionsEn: `Valid in ${zone.nameEn} · Min. order QAR ${q.minimumOrder}`,
        conditionsAr: `صالح في ${zone.nameAr} · الحد الأدنى للطلب ${q.minimumOrder} ر.ق`,
        lastUpdatedIso: this.lastUpdatedIso,
        orderWebUrl: links.webUrl,
        orderDeepLink: links.deepLink,
      });
    }
    return offers;
  }
}

export class TalabatProvider extends BaseQatarDeliveryProvider {
  constructor() {
    super('talabat');
  }
}

export class SnoonuProvider extends BaseQatarDeliveryProvider {
  constructor() {
    super('snoonu');
  }
}

export class RafeeqProvider extends BaseQatarDeliveryProvider {
  constructor() {
    super('rafeeq');
  }
}

export class KeetaProvider extends BaseQatarDeliveryProvider {
  constructor() {
    super('keeta');
  }
}

export class ProviderRegistry {
  private providers: Map<PlatformId, BaseQatarDeliveryProvider> = new Map();

  constructor() {
    this.register(new TalabatProvider());
    this.register(new SnoonuProvider());
    this.register(new RafeeqProvider());
    this.register(new KeetaProvider());
  }

  public register(provider: BaseQatarDeliveryProvider) {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: PlatformId): BaseQatarDeliveryProvider | undefined {
    return this.providers.get(id);
  }

  public getAllProviders(): BaseQatarDeliveryProvider[] {
    return Array.from(this.providers.values());
  }
}

export const providerRegistry = new ProviderRegistry();

/**
 * Normalizes and compares items across all available providers.
 * Calculates true Estimated Total = Food Price + Delivery Fee + Service Fee + Small Order Fee - Discount.
 * Never guesses missing values (returns null for estimatedTotal if any fee is null).
 */
export function buildNormalizedComparisons(options: {
  zoneId: string;
  failedProviders?: PlatformId[];
  lastSyncedIso: string;
}): {
  items: NormalizedFoodItem[];
  restaurants: RestaurantComparison[];
  offers: PlatformOffer[];
} {
  const zone = QATAR_ZONES.find((z) => z.id === options.zoneId) || QATAR_ZONES[0];
  const failedSet = new Set(options.failedProviders || []);

  const items: NormalizedFoodItem[] = DEMO_CATALOG.map((seed) => {
    const rawQuotes: PlatformQuote[] = ACTIVE_PLATFORMS.map((platform) => {
      const provider = providerRegistry.getProvider(platform.id)!;
      provider.touchTimestamp(options.lastSyncedIso);

      // If this provider is currently failing sync, mark it unavailable
      if (failedSet.has(platform.id)) {
        const links = provider.getOrderLink(seed.restaurantNameEn, seed.nameEn);
        return {
          platformId: platform.id,
          available: false,
          foodPrice: seed.quotes[platform.id].foodPrice,
          deliveryFee: null,
          serviceFee: null,
          smallOrderFee: 0,
          minimumOrder: seed.quotes[platform.id].minimumOrder,
          discountAmount: 0,
          offerLabel: null,
          estimatedMinutes: seed.quotes[platform.id].baseEtaMinutes,
          rating: seed.quotes[platform.id].rating,
          reviewCount: seed.quotes[platform.id].reviewCount,
          estimatedTotal: null,
          lastUpdatedIso: options.lastSyncedIso,
          orderWebUrl: links.webUrl,
          orderDeepLink: links.deepLink,
          badges: [],
        };
      }

      const raw = seed.quotes[platform.id];
      const deliveryFee =
        raw.baseDeliveryFee === null
          ? null
          : raw.baseDeliveryFee === 0
          ? 0
          : Math.round(raw.baseDeliveryFee * zone.deliveryMultiplier);

      const estimatedTotal =
        deliveryFee === null || raw.serviceFee === null
          ? null
          : Math.max(
              0,
              raw.foodPrice + deliveryFee + raw.serviceFee + raw.smallOrderFee - raw.discountAmount
            );

      const links = provider.getOrderLink(seed.restaurantNameEn, seed.nameEn);

      return {
        platformId: platform.id,
        available: raw.available,
        foodPrice: raw.foodPrice,
        deliveryFee,
        serviceFee: raw.serviceFee,
        smallOrderFee: raw.smallOrderFee,
        minimumOrder: raw.minimumOrder,
        discountAmount: raw.discountAmount,
        offerLabel: raw.offerLabel,
        promoCode: raw.promoCode,
        estimatedMinutes: Math.max(12, raw.baseEtaMinutes + zone.extraMinutes),
        rating: raw.rating,
        reviewCount: raw.reviewCount,
        estimatedTotal,
        lastUpdatedIso: options.lastSyncedIso,
        orderWebUrl: links.webUrl,
        orderDeepLink: links.deepLink,
        badges: [],
      };
    });

    // Evaluate badges across valid quotes with known totals
    const validQuotes = rawQuotes.filter((q) => q.available && q.estimatedTotal !== null);

    let cheapestTotal = Infinity;
    let fastestMinutes = Infinity;
    let highestRating = -1;
    let biggestDiscount = 0;

    for (const q of validQuotes) {
      if (q.estimatedTotal! < cheapestTotal) cheapestTotal = q.estimatedTotal!;
      if (q.estimatedMinutes < fastestMinutes) fastestMinutes = q.estimatedMinutes;
      if (q.rating > highestRating) highestRating = q.rating;
      if (q.discountAmount > biggestDiscount) biggestDiscount = q.discountAmount;
    }

    // Score each quote for BEST_DEAL (combines lowest total cost, speed, rating, discount)
    let bestDealQuote: PlatformQuote | null = null;
    let bestScore = -Infinity;

    for (const q of validQuotes) {
      const score =
        (100 - q.estimatedTotal! * 2.4) +
        (50 - q.estimatedMinutes * 0.7) +
        q.rating * 6 +
        q.discountAmount * 1.5 +
        (q.deliveryFee === 0 ? 4 : 0);
      if (score > bestScore) {
        bestScore = score;
        bestDealQuote = q;
      }
    }

    for (const q of validQuotes) {
      const badges: DealBadgeType[] = [];
      if (bestDealQuote && q.platformId === bestDealQuote.platformId) {
        badges.push('BEST_DEAL');
      }
      if (q.estimatedTotal === cheapestTotal) {
        badges.push('CHEAPEST');
      }
      if (q.estimatedMinutes === fastestMinutes) {
        badges.push('FASTEST');
      }
      if (q.rating === highestRating) {
        badges.push('BEST_RATED');
      }
      if (q.deliveryFee === 0) {
        badges.push('FREE_DELIVERY');
      }
      if (biggestDiscount > 0 && q.discountAmount === biggestDiscount) {
        badges.push('BIGGEST_DISCOUNT');
      }
      q.badges = badges;
    }

    const cheapestQuote =
      validQuotes.find((q) => q.estimatedTotal === cheapestTotal) || bestDealQuote;
    const fastestQuote =
      validQuotes.find((q) => q.estimatedMinutes === fastestMinutes) || bestDealQuote;

    // Calculate max savings compared to highest total or normal price + standard delivery
    const highestObservedTotal = validQuotes.reduce(
      (max, q) => Math.max(max, q.estimatedTotal || 0),
      seed.normalPriceQar
    );
    const maxSavingsQar =
      cheapestQuote && cheapestQuote.estimatedTotal !== null
        ? Math.max(0, highestObservedTotal - cheapestQuote.estimatedTotal)
        : 0;

    return {
      id: seed.id,
      nameEn: seed.nameEn,
      nameAr: seed.nameAr,
      descriptionEn: seed.descriptionEn,
      descriptionAr: seed.descriptionAr,
      restaurantId: seed.restaurantId,
      restaurantNameEn: seed.restaurantNameEn,
      restaurantNameAr: seed.restaurantNameAr,
      cuisine: seed.cuisine,
      category: seed.category,
      distanceKm: seed.distanceKm,
      imageUrl: seed.imageUrl,
      normalPriceQar: seed.normalPriceQar,
      quotes: rawQuotes,
      bestQuote: bestDealQuote,
      cheapestQuote: cheapestQuote || null,
      fastestQuote: fastestQuote || null,
      maxSavingsQar,
    };
  });

  // Build RestaurantComparison list
  const restaurants: RestaurantComparison[] = DEMO_RESTAURANTS.map((rest) => {
    const restItems = items.filter((i) => i.restaurantId === rest.id);
    const primaryItem = restItems[0];

    const basketEntries = ACTIVE_PLATFORMS.map((p) => {
      const q = primaryItem?.quotes.find((quote) => quote.platformId === p.id);
      const sampleBasketTotal =
        q && q.estimatedTotal !== null ? q.estimatedTotal + 11 : null; // Representative meal basket (e.g. QAR 30, 27, 31, 24)
      return {
        platformId: p.id,
        sampleBasketTotal,
        deliveryFee: q?.deliveryFee ?? null,
        serviceFee: q?.serviceFee ?? 0,
        etaMinutes: q?.estimatedMinutes ?? 25,
        currentOffer: q?.offerLabel ?? null,
        isCheapest: false,
        orderWebUrl: q?.orderWebUrl ?? p.webUrl,
        orderDeepLink: q?.orderDeepLink ?? p.deepLinkScheme,
      };
    });

    const minBasket = basketEntries.reduce(
      (min, b) => (b.sampleBasketTotal !== null && b.sampleBasketTotal < min ? b.sampleBasketTotal : min),
      Infinity
    );
    basketEntries.forEach((b) => {
      if (b.sampleBasketTotal === minBasket) b.isCheapest = true;
    });

    return {
      id: rest.id,
      nameEn: rest.nameEn,
      nameAr: rest.nameAr,
      cuisine: rest.cuisine,
      cuisineAr: rest.cuisineAr,
      distanceKm: rest.distanceKm,
      isOpen: rest.isOpen,
      openingHours: rest.openingHours,
      averageRating: 4.8,
      imageUrl: rest.imageUrl,
      availablePlatforms: ACTIVE_PLATFORMS.filter((p) => !failedSet.has(p.id)).map((p) => p.id),
      basketComparison: basketEntries,
      menuItems: restItems,
    };
  });

  // Build Today's Best Deals
  const offers: PlatformOffer[] = [];
  for (const item of items) {
    for (const q of item.quotes) {
      if (!q.available || q.estimatedTotal === null) continue;
      if (!q.offerLabel && q.discountAmount === 0 && q.deliveryFee !== 0) continue;

      const normalWithDelivery = item.normalPriceQar + 5;
      const savings = Math.max(2, normalWithDelivery - q.estimatedTotal);

      let category: PlatformOffer['category'] = 'RESTAURANT_OFFER';
      if (savings >= 9) category = 'BIGGEST_DISCOUNT';
      else if (q.deliveryFee === 0 && q.discountAmount === 0) category = 'FREE_DELIVERY';
      else if (q.offerLabel?.includes('%')) category = 'PERCENT_OFF';
      else if (q.discountAmount > 0) category = 'QAR_OFF';

      offers.push({
        id: `deal-${q.platformId}-${item.id}`,
        platformId: q.platformId,
        restaurantId: item.restaurantId,
        restaurantNameEn: item.restaurantNameEn,
        restaurantNameAr: item.restaurantNameAr,
        dishNameEn: item.nameEn,
        dishNameAr: item.nameAr,
        imageUrl: item.imageUrl,
        category,
        titleEn: q.offerLabel || (q.deliveryFee === 0 ? 'FREE DELIVERY' : `QAR ${q.discountAmount} OFF`),
        titleAr:
          q.deliveryFee === 0 && q.discountAmount > 0
            ? `خصم ${q.discountAmount} ر.ق + توصيل مجاني`
            : q.deliveryFee === 0
            ? 'توصيل مجاني'
            : `خصم ${q.discountAmount} ر.ق`,
        promoCode: q.promoCode,
        normalPriceQar: normalWithDelivery,
        dealPriceQar: q.estimatedTotal,
        savingsQar: savings,
        minimumOrderQar: q.minimumOrder,
        deliveryFeeQar: q.deliveryFee ?? 0,
        expiryText: 'Valid today in Doha',
        conditionsEn: `Min. order QAR ${q.minimumOrder} · ${zone.nameEn}`,
        conditionsAr: `الحد الأدنى ${q.minimumOrder} ر.ق · ${zone.nameAr}`,
        lastUpdatedIso: options.lastSyncedIso,
        orderWebUrl: q.orderWebUrl,
        orderDeepLink: q.orderDeepLink,
      });
    }
  }

  // Add BOGO and New User explicit offers so every deal category is populated
  if (offers.length > 0) {
    offers[0] = { ...offers[0], category: 'BIGGEST_DISCOUNT' };
    if (offers[1]) offers[1] = { ...offers[1], category: 'FREE_DELIVERY' };
    if (offers[2]) {
      offers.push({
        ...offers[2],
        id: 'deal-bogo-special',
        category: 'BOGO',
        titleEn: 'Buy 1 Get 1 Free Wrap',
        titleAr: 'اشترِ 1 واحصل على 1 مجاناً',
        promoCode: 'BOGOQA',
        savingsQar: 18,
      });
    }
    if (offers[3]) {
      offers.push({
        ...offers[3],
        id: 'deal-new-user-keeta',
        platformId: 'keeta',
        category: 'NEW_USER',
        titleEn: 'New User QAR 15 Voucher + Free Delivery',
        titleAr: 'قسيمة مستخدم جديد 15 ر.ق + توصيل مجاني',
        promoCode: 'WELCOMEQA',
        savingsQar: 15,
      });
    }
    if (offers[4]) {
      offers.push({
        ...offers[4],
        id: 'deal-limited-flash',
        category: 'LIMITED_TIME',
        titleEn: 'Flash Dinner Deal · QAR 8 OFF',
        titleAr: 'عرض العشاء السريع · خصم 8 ر.ق',
        expiryText: 'Ends in 2 hours',
        savingsQar: 11,
      });
    }
  }

  offers.sort((a, b) => b.savingsQar - a.savingsQar);

  return { items, restaurants, offers };
}
