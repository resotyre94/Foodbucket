import React from 'react';
import { Heart, MapPin, Star, X } from 'lucide-react';
import { ACTIVE_PLATFORMS } from '../providers/ProviderSystem';
import { PlatformId, RestaurantComparison } from '../types/food';
import { FoodImage, formatQar } from './FoodImage';
import { OrderRedirectPayload } from './OrderRedirectModal';

interface RestaurantComparisonModalProps {
  restaurant: RestaurantComparison | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (restaurantId: string) => void;
  onSelectOrder: (payload: OrderRedirectPayload) => void;
  isDemoData: boolean;
  lang: 'en' | 'ar';
}

export const RestaurantComparisonModal: React.FC<RestaurantComparisonModalProps> = ({
  restaurant,
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectOrder,
  isDemoData,
  lang,
}) => {
  if (!restaurant) return null;

  const cheapestEntry = restaurant.basketComparison.find((b) => b.isCheapest);
  const cheapestPlatform = cheapestEntry
    ? ACTIVE_PLATFORMS.find((p) => p.id === cheapestEntry.platformId)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restaurant-modal-title"
    >
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header image + restaurant identity */}
        <div className="relative h-48 sm:h-56 w-full">
          <FoodImage
            src={restaurant.imageUrl}
            alt={restaurant.nameEn}
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(restaurant.id)}
              aria-label={isFavorite ? `Remove ${restaurant.nameEn} from favorites` : `Save ${restaurant.nameEn} to favorites`}
              className="min-h-[44px] min-w-[44px] rounded-xl bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close restaurant comparison"
              className="min-h-[44px] min-w-[44px] rounded-xl bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-6 right-6 text-white">
            <p className="text-xs text-slate-200">
              {lang === 'ar' ? restaurant.cuisineAr : restaurant.cuisine} ·{' '}
              {restaurant.isOpen ? (lang === 'ar' ? 'مفتوح الآن' : 'Open Now') : 'Closed'} (
              {restaurant.openingHours}) · {restaurant.distanceKm} km
            </p>
            <h2 id="restaurant-modal-title" className="text-2xl font-bold mt-0.5">
              {lang === 'ar' ? restaurant.nameAr : restaurant.nameEn}
            </h2>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{restaurant.averageRating.toFixed(1)}</span>
              <span>·</span>
              <span>
                {lang === 'ar' ? 'متوفر على:' : 'Available on:'}{' '}
                {restaurant.availablePlatforms
                  .map((id) => ACTIVE_PLATFORMS.find((p) => p.id === id)?.name)
                  .join(', ')}
              </span>
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Compare Delivery Apps Section */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {lang === 'ar' ? 'قارن تطبيقات التوصيل' : 'Compare Delivery Apps'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'ar'
                    ? 'مقارنة إجمالي السلة القياسية شاملة رسوم التوصيل والخصومات الحالية'
                    : 'Standard meal basket comparison including delivery fee, service fee & active offers'}
                </p>
              </div>
              {cheapestPlatform && cheapestEntry && (
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {lang === 'ar' ? 'الأرخص:' : 'CHEAPEST:'} {cheapestPlatform.name} (
                    {formatQar(cheapestEntry.sampleBasketTotal)})
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {restaurant.basketComparison.map((entry) => {
                const p = ACTIVE_PLATFORMS.find((pl) => pl.id === entry.platformId)!;
                return (
                  <div
                    key={entry.platformId}
                    className={`p-3.5 rounded-xl border ${
                      entry.isCheapest
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {lang === 'ar' ? p.nameAr : p.name}
                      </span>
                      {entry.isCheapest && (
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          {lang === 'ar' ? 'الأرخص' : 'CHEAPEST'}
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-bold font-mono-num text-slate-900 dark:text-white mt-1.5">
                      {entry.sampleBasketTotal !== null
                        ? formatQar(entry.sampleBasketTotal)
                        : 'Unavailable'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {entry.deliveryFee === null
                        ? 'Fee unavailable'
                        : entry.deliveryFee === 0
                        ? 'Free Delivery'
                        : `Delivery: QAR ${entry.deliveryFee}`}{' '}
                      · {entry.etaMinutes}m
                    </p>
                    {entry.currentOffer && (
                      <p className="text-xs font-medium text-rose-600 dark:text-rose-400 mt-1 truncate">
                        {entry.currentOffer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Menu Price Comparison Table */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              {lang === 'ar'
                ? 'مقارنة أسعار القائمة عبر المنصات'
                : 'Menu & Platform Price Comparison'}
            </h3>
            <div className="space-y-4">
              {restaurant.menuItems.map((item) => (
                <div
                  key={item.id}
                  className="border-t border-slate-200 dark:border-slate-800 pt-4 first:border-t-0 first:pt-0"
                >
                  <div className="flex items-center justify-between gap-4 mb-2.5">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">
                        {lang === 'ar' ? item.nameAr : item.nameEn}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {lang === 'ar' ? item.descriptionAr : item.descriptionEn}
                      </p>
                    </div>
                    {item.maxSavingsQar > 0 && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono-num">
                        YOU SAVE QAR {item.maxSavingsQar}
                      </span>
                    )}
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                          <th className="py-2 pr-3 font-medium">Platform</th>
                          <th className="py-2 px-3 font-medium text-right">Food</th>
                          <th className="py-2 px-3 font-medium text-right">Delivery</th>
                          <th className="py-2 px-3 font-medium">Offer</th>
                          <th className="py-2 px-3 font-medium text-right">Total</th>
                          <th className="py-2 pl-3 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {item.quotes.map((q) => {
                          const p = ACTIVE_PLATFORMS.find((pl) => pl.id === q.platformId)!;
                          const isBest = item.bestQuote?.platformId === q.platformId;
                          return (
                            <tr
                              key={q.platformId}
                              className={
                                isBest ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-medium' : ''
                              }
                            >
                              <td className="py-2.5 pr-3 whitespace-nowrap">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {lang === 'ar' ? p.nameAr : p.name}
                                </span>
                                {isBest && (
                                  <span className="ml-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    BEST DEAL
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono-num whitespace-nowrap">
                                {formatQar(q.foodPrice)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono-num whitespace-nowrap">
                                {q.deliveryFee === null
                                  ? 'Unavailable'
                                  : q.deliveryFee === 0
                                  ? 'FREE'
                                  : formatQar(q.deliveryFee)}
                              </td>
                              <td className="py-2.5 px-3 text-xs text-rose-600 dark:text-rose-400 whitespace-nowrap">
                                {q.offerLabel || 'None'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono-num font-bold whitespace-nowrap">
                                {q.estimatedTotal !== null
                                  ? formatQar(q.estimatedTotal)
                                  : 'Final total unavailable'}
                              </td>
                              <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  disabled={!q.available}
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
                                  className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold transition-colors disabled:opacity-40"
                                >
                                  ORDER ON {p.name.toUpperCase()}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
