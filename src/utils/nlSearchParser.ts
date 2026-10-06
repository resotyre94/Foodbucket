import { ParsedSearchIntent, SortOption } from '../types/food';

const CATEGORY_KEYWORDS: Record<string, string> = {
  biryani: 'Biryani',
  برياني: 'Biryani',
  burger: 'Burger',
  burgers: 'Burger',
  برجر: 'Burger',
  pizza: 'Pizza',
  بيتزا: 'Pizza',
  shawarma: 'Shawarma',
  شاورما: 'Shawarma',
  parotta: 'Kerala',
  porotta: 'Kerala',
  kerala: 'Kerala',
  karak: 'Coffee',
  كرك: 'Coffee',
  coffee: 'Coffee',
  قهوة: 'Coffee',
  'fried rice': 'Chinese',
  noodles: 'Chinese',
  chinese: 'Chinese',
  dessert: 'Desserts',
  desserts: 'Desserts',
  kunafa: 'Desserts',
  healthy: 'Healthy',
  salad: 'Healthy',
  poke: 'Healthy',
  breakfast: 'Breakfast',
  shakshuka: 'Breakfast',
};

const CUISINE_KEYWORDS: Record<string, string> = {
  indian: 'Indian',
  هندي: 'Indian',
  arabic: 'Arabic',
  عربي: 'Arabic',
  lebanese: 'Arabic',
  chinese: 'Chinese',
  asian: 'Chinese',
  kerala: 'Kerala',
  malabar: 'Kerala',
  american: 'Fast Food',
  italian: 'Pizza',
  healthy: 'Healthy',
};

export function parseNaturalLanguageSearch(rawInput: string): ParsedSearchIntent {
  const rawQuery = rawInput.trim();
  const lower = rawQuery.toLowerCase();
  const explanationChips: string[] = [];

  let maxPriceQar: number | undefined;
  let freeDeliveryOnly: boolean | undefined;
  let hasOfferOnly: boolean | undefined;
  let suggestedSort: SortOption | undefined;
  let detectedCategory: string | undefined;
  let detectedCuisine: string | undefined;

  // 1. Detect price ceiling ("under 20", "below QAR 15", "< 25", "less than 30")
  const priceMatch = lower.match(/(?:under|below|less than|<|أقل من)\s*(?:qar|qr|ريال)?\s*(\d+)/i) ||
                     lower.match(/(?:qar|qr)\s*(\d+)\s*(?:or less|max)/i);
  if (priceMatch && priceMatch[1]) {
    maxPriceQar = parseInt(priceMatch[1], 10);
    explanationChips.push(`Max Total: ≤ QAR ${maxPriceQar}`);
  }

  // 2. Detect free delivery intent
  if (lower.includes('free delivery') || lower.includes('no delivery fee') || lower.includes('توصيل مجاني')) {
    freeDeliveryOnly = true;
    explanationChips.push('Filter: Free Delivery');
  }

  // 3. Detect sort & deal intents
  if (lower.includes('cheapest') || lower.includes('cheap') || lower.includes('lowest price') || lower.includes('أرخص')) {
    suggestedSort = 'cheapest';
    explanationChips.push('Sort: Cheapest Total');
  } else if (lower.includes('fastest') || lower.includes('quick') || lower.includes('fast delivery') || lower.includes('أسرع')) {
    suggestedSort = 'fastest';
    explanationChips.push('Sort: Fastest Delivery');
  } else if (lower.includes('best deal') || lower.includes('best food deal') || lower.includes('best offer') || lower.includes('أفضل عرض')) {
    suggestedSort = 'best_deal';
    hasOfferOnly = true;
    explanationChips.push('Rank: Best Deal + Active Offer');
  } else if (lower.includes('best') || lower.includes('top rated') || lower.includes('highest rated')) {
    suggestedSort = 'best_deal';
    explanationChips.push('Rank: Best Overall Value');
  } else if (lower.includes('discount') || lower.includes('offer') || lower.includes('promo')) {
    hasOfferOnly = true;
    suggestedSort = 'biggest_discount';
    explanationChips.push('Filter: Biggest Discount');
  }

  // 4. Detect cuisine & category
  for (const [kw, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(kw)) {
      detectedCategory = cat;
      break;
    }
  }

  for (const [kw, cuis] of Object.entries(CUISINE_KEYWORDS)) {
    if (lower.includes(kw)) {
      detectedCuisine = cuis;
      explanationChips.push(`Cuisine: ${cuis}`);
      break;
    }
  }

  // 5. Strip modifier tokens to extract core dish keyword
  const cleaned = lower
    .replace(/(?:under|below|less than|<)\s*(?:qar|qr)?\s*\d+/gi, ' ')
    .replace(/\b(?:cheapest|cheap|fastest|best|food|deal|deals|near|me|in|qatar|doha|with|free|delivery|under|below|qar|qr|and|or|top|rated)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (detectedCategory && !explanationChips.some(c => c.includes(detectedCategory!))) {
    explanationChips.push(`Dish: ${detectedCategory}`);
  }

  return {
    rawQuery,
    cleanKeywords: cleaned,
    detectedCategory,
    detectedCuisine,
    maxPriceQar,
    freeDeliveryOnly,
    hasOfferOnly,
    suggestedSort,
    explanationChips,
  };
}
