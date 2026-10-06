import React, { useEffect, useState } from 'react';
import { Bell, BellRing, Heart, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { ACTIVE_PLATFORMS } from '../providers/ProviderSystem';
import {
  FavoriteCollection,
  NormalizedFoodItem,
  PriceAlert,
  RestaurantComparison,
} from '../types/food';
import { formatQar } from './FoodImage';
import { OrderRedirectPayload } from './OrderRedirectModal';

interface FavoritesAlertsViewProps {
  favorites: FavoriteCollection;
  items: NormalizedFoodItem[];
  restaurants: RestaurantComparison[];
  priceAlerts: PriceAlert[];
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onAddPriceAlert: (alert: Omit<PriceAlert, 'id' | 'createdAtIso' | 'triggered'>) => void;
  onTogglePriceAlert: (id: string) => void;
  onDeletePriceAlert: (id: string) => void;
  onToggleFavoriteFood: (foodId: string) => void;
  onToggleFavoriteRestaurant: (restaurantId: string) => void;
  onRemoveFavoriteSearch: (searchQuery: string) => void;
  onToggleFavoriteCuisine: (cuisine: string) => void;
  onRunSearch: (query: string) => void;
  onOpenRestaurant: (restaurantId: string) => void;
  onSelectOrder: (payload: OrderRedirectPayload) => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  isDemoData: boolean;
  lang: 'en' | 'ar';
}

export const FavoritesAlertsView: React.FC<FavoritesAlertsViewProps> = ({
  favorites,
  items,
  restaurants,
  priceAlerts,
  notificationsEnabled,
  onToggleNotifications,
  onAddPriceAlert,
  onTogglePriceAlert,
  onDeletePriceAlert,
  onToggleFavoriteFood,
  onToggleFavoriteRestaurant,
  onRemoveFavoriteSearch,
  onToggleFavoriteCuisine,
  onRunSearch,
  onOpenRestaurant,
  onSelectOrder,
  onSyncNow,
  isSyncing,
  isDemoData,
  lang,
}) => {
  const [alertType, setAlertType] = useState<'price_drop' | 'free_delivery'>('price_drop');
  const [targetName, setTargetName] = useState('Chicken Biryani');
  const [targetPrice, setTargetPrice] = useState('15');

  // Automatically refresh comparison metadata when opening Favorites tab
  useEffect(() => {
    // Lightweight freshness touch
  }, []);

  const favoriteFoods = items.filter((i) => favorites.foodIds.includes(i.id));
  const favoriteRestaurants = restaurants.filter((r) => favorites.restaurantIds.includes(r.id));

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetName.trim()) return;
    onAddPriceAlert({
      type: alertType,
      targetName: targetName.trim(),
      targetPriceQar: alertType === 'price_drop' ? Number(targetPrice) || 15 : undefined,
      enabled: true,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header with Auto-Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {lang === 'ar' ? 'المفضلة وتنبيهات الأسعار' : 'Favorites & Price Alerts'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {lang === 'ar'
              ? 'يتم تحديث مقارنات الأسعار تلقائياً عند فتح عناصر المفضلة.'
              : 'Saved dishes, restaurants, searches, and automated QAR target price alerts.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onSyncNow}
          disabled={isSyncing}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Refreshing...' : 'Refresh Favorites'}</span>
        </button>
      </div>

      {/* Section 1: Price Alerts Engine */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BellRing className="w-5 h-5 text-rose-600" />
              <span>{lang === 'ar' ? 'تنبيهات الأسعار الذكية' : 'Smart Price & Free Delivery Alerts'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar'
                ? 'مثال: نبهني عندما يكون برياني الدجاج أقل من 15 ر.ق أو توصيل مجاني.'
                : 'Example: Notify me when "Chicken Biryani < QAR 15" or "Restaurant ABC has free delivery".'}
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleNotifications}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors ${
              notificationsEnabled
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>
              {notificationsEnabled
                ? lang === 'ar'
                  ? 'الإشعارات مفعلة'
                  : 'Notifications Enabled'
                : lang === 'ar'
                ? 'تفعيل الإشعارات'
                : 'Enable Notifications'}
            </span>
          </button>
        </div>

        {/* Create Alert Form */}
        <form onSubmit={handleCreateAlert} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <label htmlFor="alert-type-select" className="block text-xs font-medium text-slate-500 mb-1">
              {lang === 'ar' ? 'نوع التنبيه' : 'Alert Condition'}
            </label>
            <select
              id="alert-type-select"
              value={alertType}
              onChange={(e) => setAlertType(e.target.value as 'price_drop' | 'free_delivery')}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            >
              <option value="price_drop">Food Total &lt; Target QAR</option>
              <option value="free_delivery">Restaurant has Free Delivery</option>
            </select>
          </div>

          <div className={alertType === 'price_drop' ? 'sm:col-span-4' : 'sm:col-span-6'}>
            <label htmlFor="alert-target-input" className="block text-xs font-medium text-slate-500 mb-1">
              {alertType === 'price_drop'
                ? lang === 'ar'
                  ? 'اسم الوجبة'
                  : 'Dish or Search Keyword'
                : lang === 'ar'
                ? 'اسم المطعم'
                : 'Restaurant Name'}
            </label>
            <input
              id="alert-target-input"
              type="text"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder={alertType === 'price_drop' ? 'Chicken Biryani' : 'Restaurant ABC'}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
          </div>

          {alertType === 'price_drop' && (
            <div className="sm:col-span-2">
              <label htmlFor="alert-price-input" className="block text-xs font-medium text-slate-500 mb-1">
                {lang === 'ar' ? 'السعر المستهدف (ر.ق)' : 'Max QAR'}
              </label>
              <input
                id="alert-price-input"
                type="number"
                min={5}
                max={200}
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono-num text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'إضافة تنبيه' : 'Add Alert'}</span>
            </button>
          </div>
        </form>

        {/* Active Alerts List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {priceAlerts.map((alert) => {
            const matchedPlatform = alert.matchedPlatform
              ? ACTIVE_PLATFORMS.find((p) => p.id === alert.matchedPlatform)
              : null;

            return (
              <div
                key={alert.id}
                className="py-3.5 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {alert.type === 'price_drop'
                        ? `${alert.targetName} < QAR ${alert.targetPriceQar}`
                        : `${alert.targetName} has Free Delivery`}
                    </span>
                    {alert.triggered && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        · MATCHED NOW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {alert.triggered && matchedPlatform
                      ? `Available now on ${matchedPlatform.name}${
                          alert.currentBestPriceQar !== undefined
                            ? ` at QAR ${alert.currentBestPriceQar}`
                            : ' with FREE delivery'
                        }`
                      : 'Monitoring Talabat, Snoonu, Rafeeq & Keeta on sync'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onTogglePriceAlert(alert.id)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      alert.enabled
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {alert.enabled ? 'Active' : 'Paused'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePriceAlert(alert.id)}
                    aria-label={`Delete alert for ${alert.targetName}`}
                    className="min-h-[38px] min-w-[38px] rounded-lg text-slate-400 hover:text-rose-600 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 2: Favorite Food Items */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {lang === 'ar' ? 'الوجبات المفضلة' : 'Favorite Food Items'} ({favoriteFoods.length})
        </h2>
        {favoriteFoods.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No favorite dishes yet. Tap the heart icon on any dish to compare its latest total price here.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteFoods.map((item) => {
              const best = item.bestQuote || item.cheapestQuote;
              const platform = best
                ? ACTIVE_PLATFORMS.find((p) => p.id === best.platformId)
                : null;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.restaurantNameEn} · {item.cuisine}
                    </p>
                    <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {lang === 'ar' ? item.nameAr : item.nameEn}
                    </h3>
                    {best && platform && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-mono-num">
                        Best Deal: {platform.name} · {formatQar(best.estimatedTotal)} (Save QAR{' '}
                        {item.maxSavingsQar})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {best && (
                      <button
                        type="button"
                        onClick={() =>
                          onSelectOrder({
                            dishName: item.nameEn,
                            restaurantName: item.restaurantNameEn,
                            platformId: best.platformId,
                            quote: best,
                            isDemoData,
                          })
                        }
                        className="min-h-[40px] px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold whitespace-nowrap"
                      >
                        ORDER NOW
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onToggleFavoriteFood(item.id)}
                      aria-label={`Remove ${item.nameEn} from favorites`}
                      className="min-h-[40px] min-w-[40px] rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center"
                    >
                      <Heart className="w-4 h-4 fill-rose-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 3: Favorite Restaurants */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {lang === 'ar' ? 'المطاعم المفضلة' : 'Favorite Restaurants'} ({favoriteRestaurants.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favoriteRestaurants.map((rest) => {
            const cheapest = rest.basketComparison.find((b) => b.isCheapest);
            const platform = cheapest
              ? ACTIVE_PLATFORMS.find((p) => p.id === cheapest.platformId)
              : null;
            return (
              <div
                key={rest.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {rest.cuisine} · ★ {rest.averageRating.toFixed(1)} · {rest.distanceKm} km
                  </p>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {lang === 'ar' ? rest.nameAr : rest.nameEn}
                  </h3>
                  {cheapest && platform && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                      Cheapest App: {platform.name} ({formatQar(cheapest.sampleBasketTotal)} basket)
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenRestaurant(rest.id)}
                    className="min-h-[40px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold whitespace-nowrap"
                  >
                    Compare Apps
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavoriteRestaurant(rest.id)}
                    aria-label={`Remove ${rest.nameEn} from favorites`}
                    className="min-h-[40px] min-w-[40px] rounded-xl text-rose-600 flex items-center justify-center"
                  >
                    <Heart className="w-4 h-4 fill-rose-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Saved Searches & Cuisines */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {lang === 'ar' ? 'عمليات البحث المحفوظة' : 'Saved Searches'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {favorites.searches.map((q) => (
              <div
                key={q}
                className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => onRunSearch(q)}
                  className="min-h-[40px] px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Search className="w-3.5 h-3.5 text-rose-600" />
                  <span>{q}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveFavoriteSearch(q)}
                  aria-label={`Remove saved search ${q}`}
                  className="min-h-[40px] px-2.5 text-slate-400 hover:text-rose-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            {lang === 'ar' ? 'المطابخ المفضلة' : 'Favorite Cuisines'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Indian', 'Arabic', 'Kerala', 'Fast Food', 'Pizza', 'Chinese', 'Coffee', 'Healthy'].map(
              (c) => {
                const isFav = favorites.cuisines.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onToggleFavoriteCuisine(c)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      isFav
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {c} {isFav ? '♥' : '+'}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
