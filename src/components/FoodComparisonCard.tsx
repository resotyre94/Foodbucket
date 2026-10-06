import React from 'react';
import { ArrowUpRight, BellPlus, Heart, Star } from 'lucide-react';
import { ACTIVE_PLATFORMS } from '../providers/ProviderSystem';
import { DealBadgeType, NormalizedFoodItem, PlatformId } from '../types/food';
import { FoodImage, formatQar, formatRelativeSyncTime } from './FoodImage';
import { OrderRedirectPayload } from './OrderRedirectModal';

interface BestDealRecommendationCardProps {
  item: NormalizedFoodItem;
  onSelectOrder: (payload: OrderRedirectPayload) => void;
  onOpenRestaurant: (restaurantId: string) => void;
  isDemoData: boolean;
  lang: 'en' | 'ar';
}

export const BestDealRecommendationCard: React.FC<BestDealRecommendationCardProps> = ({
  item,
  onSelectOrder,
  onOpenRestaurant,
  isDemoData,
  lang,
}) => {
  const bestQuote = item.bestQuote || item.cheapestQuote;
  if (!bestQuote) return null;

  const platform = ACTIVE_PLATFORMS.find((p) => p.id === bestQuote.platformId)!;

  return (
    <section
      aria-label="Food Bucket Recommends Best Deal"
      className="rounded-2xl bg-slate-900 text-white dark:bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Image Column */}
        <div className="lg:col-span-4 relative rounded-xl overflow-hidden aspect-[4/3] bg-slate-800">
          <FoodImage
            src={item.imageUrl}
            alt={lang === 'ar' ? item.nameAr : item.nameEn}
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 font-medium">
            <span>
              {item.cuisine} · ★ {bestQuote.rating.toFixed(1)} · {bestQuote.estimatedMinutes} min
            </span>
            {isDemoData && <span className="font-mono-num text-amber-300">DEMO DATA</span>}
          </div>
        </div>

        {/* Recommendation Details */}
        <div className="lg:col-span-5 space-y-2">
          <p className="text-xs font-bold tracking-wider text-amber-400">
            {lang === 'ar' ? 'توصية فود باكت الذكية' : 'FOOD BUCKET RECOMMENDS'} · BEST DEAL
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {lang === 'ar' ? item.nameAr : item.nameEn}
          </h2>
          <button
            type="button"
            onClick={() => onOpenRestaurant(item.restaurantId)}
            className="text-sm text-slate-300 hover:text-white underline underline-offset-4 transition-colors text-left"
          >
            {lang === 'ar' ? item.restaurantNameAr : item.restaurantNameEn}
          </button>

          <div className="pt-2 grid grid-cols-3 gap-3 text-sm border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Platform</span>
              <span className="font-bold text-emerald-400">
                {lang === 'ar' ? platform.nameAr : platform.name}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Food / Offer</span>
              <span className="font-mono-num text-slate-200">
                QAR {bestQuote.foodPrice}{' '}
                {bestQuote.offerLabel ? `(${bestQuote.offerLabel})` : ''}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Delivery</span>
              <span className="font-mono-num text-emerald-400 font-semibold">
                {bestQuote.deliveryFee === 0
                  ? 'FREE'
                  : bestQuote.deliveryFee !== null
                  ? `QAR ${bestQuote.deliveryFee}`
                  : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>

        {/* Total & Primary CTA */}
        <div className="lg:col-span-3 flex flex-col justify-between lg:items-end lg:border-l lg:border-slate-800 lg:pl-6 space-y-3">
          <div className="lg:text-right">
            <span className="text-xs text-slate-400 block">
              {lang === 'ar' ? 'الإجمالي النهائي' : 'TOTAL ESTIMATED COST'}
            </span>
            <span className="text-3xl font-extrabold font-mono-num text-white">
              {bestQuote.estimatedTotal !== null
                ? formatQar(bestQuote.estimatedTotal)
                : 'Final total unavailable'}
            </span>
            {item.maxSavingsQar > 0 && (
              <p className="text-xs font-semibold text-emerald-400 mt-1 font-mono-num">
                {lang === 'ar'
                  ? `توفر تقريباً: QAR ${item.maxSavingsQar}`
                  : `You save approximately: QAR ${item.maxSavingsQar}`}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              onSelectOrder({
                dishName: lang === 'ar' ? item.nameAr : item.nameEn,
                restaurantName: lang === 'ar' ? item.restaurantNameAr : item.restaurantNameEn,
                platformId: bestQuote.platformId,
                quote: bestQuote,
                isDemoData,
              })
            }
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-lg shadow-rose-600/25"
          >
            <span>
              {lang === 'ar'
                ? `اطلب الآن عبر ${platform.nameAr}`
                : `ORDER NOW · ${platform.name.toUpperCase()}`}
            </span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

interface FoodComparisonCardProps {
  item: NormalizedFoodItem;
  selectedPlatforms: PlatformId[];
  isFavoriteFood: boolean;
  onToggleFavoriteFood: (foodId: string) => void;
  onOpenRestaurant: (restaurantId: string) => void;
  onSelectOrder: (payload: OrderRedirectPayload) => void;
  onQuickCreateAlert: (item: NormalizedFoodItem) => void;
  nowMs: number;
  isOffline: boolean;
  isDemoData: boolean;
  lang: 'en' | 'ar';
}

const BADGE_LABELS: Record<DealBadgeType, string> = {
  BEST_DEAL: 'BEST DEAL',
  CHEAPEST: 'CHEAPEST',
  FASTEST: 'FASTEST',
  BEST_RATED: 'BEST RATED',
  FREE_DELIVERY: 'FREE DELIVERY',
  BIGGEST_DISCOUNT: 'BIGGEST DISCOUNT',
};

export const FoodComparisonCard: React.FC<FoodComparisonCardProps> = ({
  item,
  selectedPlatforms,
  isFavoriteFood,
  onToggleFavoriteFood,
  onOpenRestaurant,
  onSelectOrder,
  onQuickCreateAlert,
  nowMs,
  isOffline,
  isDemoData,
  lang,
}) => {
  const visibleQuotes = item.quotes.filter(
    (q) => selectedPlatforms.length === 0 || selectedPlatforms.includes(q.platformId)
  );

  const bestQuote = item.bestQuote || item.cheapestQuote;
  const bestPlatform = bestQuote
    ? ACTIVE_PLATFORMS.find((p) => p.id === bestQuote.platformId)
    : null;

  const freshness = formatRelativeSyncTime(
    bestQuote?.lastUpdatedIso || null,
    nowMs,
    isOffline,
    isDemoData,
    lang
  );

  return (
    <article className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Top Dish Header */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 border-b border-slate-100 dark:border-slate-800">
        <div className="relative w-full sm:w-40 h-44 sm:h-32 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
          <FoodImage
            src={item.imageUrl}
            alt={lang === 'ar' ? item.nameAr : item.nameEn}
            className="w-full h-full"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Clean unboxed metadata row */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>{item.cuisine}</span>
              <span aria-hidden="true">·</span>
              <span>{item.distanceKm} km</span>
              <span aria-hidden="true">·</span>
              <span className={freshness.isStale ? 'text-amber-600 dark:text-amber-400' : ''}>
                {freshness.shortLabel}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2 mt-1">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {lang === 'ar' ? item.nameAr : item.nameEn}
                </h3>
                <button
                  type="button"
                  onClick={() => onOpenRestaurant(item.restaurantId)}
                  className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 underline underline-offset-2 mt-0.5 text-left"
                >
                  {lang === 'ar' ? item.restaurantNameAr : item.restaurantNameEn} · Compare full menu
                </button>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onQuickCreateAlert(item)}
                  aria-label={`Set price alert for ${item.nameEn}`}
                  title="Set Price Alert"
                  className="min-h-[44px] min-w-[44px] rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                >
                  <BellPlus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleFavoriteFood(item.id)}
                  aria-label={
                    isFavoriteFood
                      ? `Remove ${item.nameEn} from favorites`
                      : `Add ${item.nameEn} to favorites`
                  }
                  className="min-h-[44px] min-w-[44px] rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                >
                  <Heart
                    className={`w-4 h-4 ${isFavoriteFood ? 'fill-rose-600 text-rose-600' : ''}`}
                  />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {lang === 'ar' ? item.descriptionAr : item.descriptionEn}
            </p>
          </div>

          {/* Highlight summary bar */}
          {bestQuote && bestPlatform && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  BEST DEAL: {lang === 'ar' ? bestPlatform.nameAr : bestPlatform.name} ·{' '}
                  <span className="font-mono-num">{formatQar(bestQuote.estimatedTotal)}</span>
                </span>
                {item.maxSavingsQar > 0 && (
                  <span className="text-slate-500 dark:text-slate-400 font-mono-num">
                    · YOU SAVE QAR {item.maxSavingsQar}
                  </span>
                )}
              </div>
              <span className="text-slate-500 dark:text-slate-400 font-mono-num">
                Normal price: QAR {item.normalPriceQar + 5}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Platform Price Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/30">
              <th className="py-2.5 pl-4 pr-2 font-medium">Platform</th>
              <th className="py-2.5 px-2 font-medium text-right">Food</th>
              <th className="py-2.5 px-2 font-medium text-right">Delivery</th>
              <th className="py-2.5 px-2 font-medium hidden sm:table-cell">Offer / Promo</th>
              <th className="py-2.5 px-2 font-medium text-right hidden md:table-cell">ETA · Rating</th>
              <th className="py-2.5 px-2 font-medium text-right">Total</th>
              <th className="py-2.5 pl-2 pr-4 font-medium text-right">Order</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {visibleQuotes.map((q) => {
              const p = ACTIVE_PLATFORMS.find((pl) => pl.id === q.platformId)!;
              const isBestDeal = bestQuote?.platformId === q.platformId && q.available;

              if (!q.available) {
                return (
                  <tr key={q.platformId} className="opacity-60">
                    <td className="py-3 pl-4 pr-2 font-semibold text-slate-700 dark:text-slate-300">
                      {lang === 'ar' ? p.nameAr : p.name}
                    </td>
                    <td colSpan={5} className="py-3 px-2 text-xs text-amber-600 dark:text-amber-400">
                      {p.name} data temporarily unavailable
                    </td>
                    <td className="py-3 pl-2 pr-4 text-right text-xs text-slate-400">Unavailable</td>
                  </tr>
                );
              }

              return (
                <tr
                  key={q.platformId}
                  className={
                    isBestDeal
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/25'
                      : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                  }
                >
                  <td className="py-3 pl-4 pr-2">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {lang === 'ar' ? p.nameAr : p.name}
                        </span>
                        {isBestDeal && (
                          <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400">
                            · BEST DEAL
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {q.badges
                          .filter((b) => b !== 'BEST_DEAL')
                          .slice(0, 2)
                          .map((b) => BADGE_LABELS[b])
                          .join(' · ') || `Min. QAR ${q.minimumOrder}`}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-2 text-right font-mono-num text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {formatQar(q.foodPrice)}
                  </td>

                  <td className="py-3 px-2 text-right font-mono-num whitespace-nowrap">
                    {q.deliveryFee === null ? (
                      <span className="text-xs text-slate-400">Unavailable</span>
                    ) : q.deliveryFee === 0 ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        FREE
                      </span>
                    ) : (
                      <span className="text-slate-700 dark:text-slate-300">
                        {formatQar(q.deliveryFee)}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-2 text-xs hidden sm:table-cell whitespace-nowrap">
                    {q.offerLabel ? (
                      <span className="font-medium text-rose-600 dark:text-rose-400">
                        {q.offerLabel}
                        {q.promoCode ? ` (${q.promoCode})` : ''}
                      </span>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </td>

                  <td className="py-3 px-2 text-right text-xs text-slate-500 dark:text-slate-400 font-mono-num hidden md:table-cell whitespace-nowrap">
                    <span>{q.estimatedMinutes}m</span>
                    <span className="mx-1">·</span>
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                      {q.rating.toFixed(1)}
                    </span>
                  </td>

                  <td className="py-3 px-2 text-right font-mono-num whitespace-nowrap">
                    {q.estimatedTotal !== null ? (
                      <span
                        className={`text-base font-bold ${
                          isBestDeal
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formatQar(q.estimatedTotal)}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-sans">
                        Final total unavailable
                      </span>
                    )}
                  </td>

                  <td className="py-3 pl-2 pr-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectOrder({
                          dishName: lang === 'ar' ? item.nameAr : item.nameEn,
                          restaurantName:
                            lang === 'ar' ? item.restaurantNameAr : item.restaurantNameEn,
                          platformId: q.platformId,
                          quote: q,
                          isDemoData,
                        })
                      }
                      className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                        isBestDeal
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                      }`}
                    >
                      {lang === 'ar' ? `اطلب (${p.nameAr})` : `ORDER ON ${p.name.toUpperCase()}`}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
};
