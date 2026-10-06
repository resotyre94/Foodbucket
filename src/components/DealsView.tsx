import React, { useState } from 'react';
import { ArrowUpRight, RefreshCw, Sparkles } from 'lucide-react';
import { ACTIVE_PLATFORMS } from '../providers/ProviderSystem';
import { NormalizedFoodItem, OfferCategory, PlatformId, PlatformOffer } from '../types/food';
import { FoodImage, formatQar, formatRelativeSyncTime } from './FoodImage';
import { OrderRedirectPayload } from './OrderRedirectModal';

interface DealsViewProps {
  offers: PlatformOffer[];
  items: NormalizedFoodItem[];
  selectedPlatforms: PlatformId[];
  onSelectOrder: (payload: OrderRedirectPayload) => void;
  onOpenRestaurant: (restaurantId: string) => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  nowMs: number;
  isOffline: boolean;
  isDemoData: boolean;
  lang: 'en' | 'ar';
}

const DEAL_CATEGORIES: { id: OfferCategory; labelEn: string; labelAr: string }[] = [
  { id: 'ALL', labelEn: 'All Deals', labelAr: 'كل العروض' },
  { id: 'BIGGEST_DISCOUNT', labelEn: 'Biggest Discount', labelAr: 'أكبر خصم' },
  { id: 'FREE_DELIVERY', labelEn: 'Free Delivery', labelAr: 'توصيل مجاني' },
  { id: 'BOGO', labelEn: 'Buy 1 Get 1', labelAr: 'اشترِ 1 واحصل على 1' },
  { id: 'QAR_OFF', labelEn: 'QAR OFF', labelAr: 'خصم نقدي (ر.ق)' },
  { id: 'PERCENT_OFF', labelEn: 'Percentage OFF', labelAr: 'خصم مئوي (%)' },
  { id: 'LIMITED_TIME', labelEn: 'Limited Time', labelAr: 'لفترة محدودة' },
  { id: 'NEW_USER', labelEn: 'New User Offer', labelAr: 'عرض مستخدم جديد' },
  { id: 'RESTAURANT_OFFER', labelEn: 'Restaurant Offers', labelAr: 'عروض المطاعم' },
];

export const DealsView: React.FC<DealsViewProps> = ({
  offers,
  items,
  selectedPlatforms,
  onSelectOrder,
  onOpenRestaurant,
  onSyncNow,
  isSyncing,
  nowMs,
  isOffline,
  isDemoData,
  lang,
}) => {
  const [activeCategory, setActiveCategory] = useState<OfferCategory>('ALL');

  const filteredOffers = offers.filter((offer) => {
    const matchesPlatform =
      selectedPlatforms.length === 0 || selectedPlatforms.includes(offer.platformId);
    const matchesCategory = activeCategory === 'ALL' || offer.category === activeCategory;
    return matchesPlatform && matchesCategory;
  });

  const handleOpenOffer = (offer: PlatformOffer) => {
    const matchedItem = items.find((i) => i.restaurantId === offer.restaurantId);
    const matchedQuote = matchedItem?.quotes.find((q) => q.platformId === offer.platformId);

    if (matchedItem && matchedQuote) {
      onSelectOrder({
        dishName: lang === 'ar' ? offer.dishNameAr : offer.dishNameEn,
        restaurantName: lang === 'ar' ? offer.restaurantNameAr : offer.restaurantNameEn,
        platformId: offer.platformId,
        quote: matchedQuote,
        isDemoData,
      });
    } else {
      onOpenRestaurant(offer.restaurantId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            {isDemoData
              ? lang === 'ar'
                ? 'وضع البيانات التجريبية · مقارنة فورية للعروض'
                : 'DEMO DATA · Instant Qatar Promo Aggregator'
              : 'Live Offers Feed'}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
            {lang === 'ar' ? 'أفضل عروض اليوم في قطر' : "TODAY'S BEST DEALS"}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'قارن العروض الحقيقية شاملة رسوم التوصيل والحد الأدنى للطلب عبر طلبات وسنونو ورفيق وكيتا.'
              : 'Verified total-cost savings across Talabat, Snoonu, Rafeeq, and Keeta.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onSyncNow}
          disabled={isSyncing}
          className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing live offers...' : 'SYNC NOW'}</span>
        </button>
      </div>

      {/* Deal Category Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {DEAL_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {lang === 'ar' ? cat.labelAr : cat.labelEn}
            </button>
          );
        })}
      </div>

      {/* Deals Grid */}
      {filteredOffers.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center">
          <Sparkles className="w-8 h-8 text-rose-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {lang === 'ar' ? 'لا توجد عروض مطابقة لهذا الفلتر' : 'No offers match this filter'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'جرب اختيار "كل العروض" أو تفعيل جميع تطبيقات التوصيل.'
              : 'Try selecting "All Deals" or enabling all delivery platforms.'}
          </p>
          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className="mt-4 min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"
          >
            {lang === 'ar' ? 'عرض جميع الصفقات' : 'Show All Deals'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => {
            const platform = ACTIVE_PLATFORMS.find((p) => p.id === offer.platformId)!;
            const freshness = formatRelativeSyncTime(
              offer.lastUpdatedIso,
              nowMs,
              isOffline,
              isDemoData,
              lang
            );

            return (
              <article
                key={offer.id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800">
                    <FoodImage
                      src={offer.imageUrl}
                      alt={lang === 'ar' ? offer.dishNameAr : offer.dishNameEn}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 text-white flex items-end justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold text-amber-300">
                          {lang === 'ar' ? platform.nameAr : platform.name} ·{' '}
                          {lang === 'ar' ? offer.titleAr : offer.titleEn}
                        </p>
                        <h3 className="text-base font-bold leading-snug mt-0.5">
                          {lang === 'ar' ? offer.dishNameAr : offer.dishNameEn}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Unboxed clean metadata */}
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <button
                        type="button"
                        onClick={() => onOpenRestaurant(offer.restaurantId)}
                        className="font-semibold text-slate-800 dark:text-slate-200 hover:underline"
                      >
                        {lang === 'ar' ? offer.restaurantNameAr : offer.restaurantNameEn}
                      </button>
                      <span> · </span>
                      <span>{offer.expiryText}</span>
                    </div>

                    {/* Savings Comparison Callout */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">
                          {lang === 'ar' ? 'السعر العادي' : 'Normal price'}
                        </span>
                        <span className="font-mono-num line-through text-slate-500 dark:text-slate-400 font-medium">
                          {formatQar(offer.normalPriceQar)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">
                          {lang === 'ar' ? 'أفضل صفقة' : 'Best deal'}
                        </span>
                        <span className="font-mono-num font-bold text-slate-900 dark:text-white text-sm">
                          {formatQar(offer.dealPriceQar)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold block">
                          {lang === 'ar' ? 'أنت توفر' : 'YOU SAVE'}
                        </span>
                        <span className="font-mono-num font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatQar(offer.savingsQar)}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                      <p>
                        {lang === 'ar' ? offer.conditionsAr : offer.conditionsEn}
                        {offer.promoCode ? ` · Code: ${offer.promoCode}` : ''}
                      </p>
                      <p className="text-[11px]">{freshness.shortLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => handleOpenOffer(offer)}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                  >
                    <span>
                      {lang === 'ar'
                        ? `عرض الصفقة على ${platform.nameAr}`
                        : `VIEW OFFER ON ${platform.name.toUpperCase()}`}
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
