import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowUpDown,
  Download,
  Heart,
  Home,
  MapPin,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Tag,
  WifiOff,
  X,
} from 'lucide-react';
import { DealsView } from './components/DealsView';
import { FavoritesAlertsView } from './components/FavoritesAlertsView';
import {
  BestDealRecommendationCard,
  FoodComparisonCard,
} from './components/FoodComparisonCard';
import { formatQar, formatRelativeSyncTime } from './components/FoodImage';
import { LocationModal } from './components/LocationModal';
import { OrderRedirectModal, OrderRedirectPayload } from './components/OrderRedirectModal';
import { RestaurantComparisonModal } from './components/RestaurantComparisonModal';
import { SettingsAboutView } from './components/SettingsAboutView';
import { useOnlineStatus, usePWAInstall } from './hooks/usePWAInstall';
import { TRANSLATIONS } from './i18n/translations';
import {
  ACTIVE_PLATFORMS,
  buildNormalizedComparisons,
  NL_SEARCH_EXAMPLES,
  QATAR_ZONES,
  QUICK_CATEGORIES,
  SEARCH_EXAMPLES,
} from './providers/ProviderSystem';
import {
  AddressLabel,
  DataMode,
  FavoriteCollection,
  NormalizedFoodItem,
  PlatformId,
  PlatformOffer,
  PriceAlert,
  ProviderSyncState,
  RestaurantComparison,
  SavedAddress,
  SortOption,
} from './types/food';
import { parseNaturalLanguageSearch } from './utils/nlSearchParser';

type NavTab = 'home' | 'search' | 'deals' | 'favorites' | 'settings';

const STORAGE_KEYS = {
  favorites: 'fb_qatar_favorites_v1',
  recentSearches: 'fb_qatar_recent_searches_v1',
  priceAlerts: 'fb_qatar_price_alerts_v1',
  savedAddresses: 'fb_qatar_saved_addresses_v1',
  zoneId: 'fb_qatar_active_zone_v1',
  addressLabel: 'fb_qatar_address_label_v1',
  theme: 'fb_qatar_theme_v1',
  lang: 'fb_qatar_lang_v1',
  cachedSnapshot: 'fb_qatar_cached_snapshot_v1',
};

const DEFAULT_SAVED_ADDRESSES: SavedAddress[] = [
  { id: 'addr-home', label: 'Home', zoneId: 'west_bay', streetNote: 'West Bay Lagoon' },
  { id: 'addr-office', label: 'Office', zoneId: 'msheireb', streetNote: 'Msheireb Downtown' },
  { id: 'addr-other', label: 'Other', zoneId: 'lusail', streetNote: 'Lusail Marina Walk' },
];

const DEFAULT_ALERTS: PriceAlert[] = [
  {
    id: 'alert-biryani-15',
    type: 'price_drop',
    targetName: 'Chicken Biryani',
    targetPriceQar: 15,
    enabled: true,
    triggered: true,
    currentBestPriceQar: 13,
    matchedPlatform: 'keeta',
    createdAtIso: new Date().toISOString(),
  },
  {
    id: 'alert-abc-free-del',
    type: 'free_delivery',
    targetName: 'Restaurant ABC',
    enabled: true,
    triggered: true,
    matchedPlatform: 'snoonu',
    createdAtIso: new Date().toISOString(),
  },
];

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [lang, setLang] = useState<'en' | 'ar'>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEYS.lang) as 'en' | 'ar') || 'en';
    } catch {
      return 'en';
    }
  });
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEYS.theme) as 'light' | 'dark' | 'system') || 'light';
    } catch {
      return 'light';
    }
  });

  // Location state
  const [activeZoneId, setActiveZoneId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.zoneId) || 'west_bay';
    } catch {
      return 'west_bay';
    }
  });
  const [activeAddressLabel, setActiveAddressLabel] = useState<AddressLabel>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEYS.addressLabel) as AddressLabel) || 'Home';
    } catch {
      return 'Home';
    }
  });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.savedAddresses);
      return raw ? JSON.parse(raw) : DEFAULT_SAVED_ADDRESSES;
    } catch {
      return DEFAULT_SAVED_ADDRESSES;
    }
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Search, Filters & Sort state
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>([]); // empty = ALL
  const [sortBy, setSortBy] = useState<SortOption>('best_deal');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState<boolean>(false);
  const [offersOnly, setOffersOnly] = useState<boolean>(false);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

  // Data Sync & Provider state
  const [dataMode, setDataMode] = useState<DataMode>('demo');
  const [failedProviders, setFailedProviders] = useState<PlatformId[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusBanner, setSyncStatusBanner] = useState<'idle' | 'syncing' | 'just_synced'>('idle');
  const [lastSyncedIso, setLastSyncedIso] = useState<string>(() => new Date().toISOString());
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [liveModeMessage, setLiveModeMessage] = useState<string | null>(null);

  // Initial local comparison state
  const initialComparison = useMemo(
    () =>
      buildNormalizedComparisons({
        zoneId: activeZoneId,
        failedProviders,
        lastSyncedIso,
      }),
    [activeZoneId, failedProviders, lastSyncedIso]
  );

  const [items, setItems] = useState<NormalizedFoodItem[]>(initialComparison.items);
  const [restaurants, setRestaurants] = useState<RestaurantComparison[]>(
    initialComparison.restaurants
  );
  const [offers, setOffers] = useState<PlatformOffer[]>(initialComparison.offers);
  const [providerStates, setProviderStates] = useState<ProviderSyncState[]>(() =>
    ACTIVE_PLATFORMS.map((p) => ({
      platformId: p.id,
      status: 'available',
      lastSyncedIso: new Date().toISOString(),
    }))
  );

  // Modals
  const [activeOrderRedirect, setActiveOrderRedirect] = useState<OrderRedirectPayload | null>(null);
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Persisted Collections
  const [profileName, setProfileName] = useState('Qatar Food Explorer');
  const [favorites, setFavorites] = useState<FavoriteCollection>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.favorites);
      return raw
        ? JSON.parse(raw)
        : {
            foodIds: ['item-chicken-biryani-abc', 'item-arabic-shawarma-box'],
            restaurantIds: ['rest-biryani-abc', 'rest-shawarma-mashawi'],
            searches: ['Chicken Biryani', 'cheap biryani', 'pizza with free delivery'],
            cuisines: ['Indian', 'Arabic', 'Kerala'],
          };
    } catch {
      return {
        foodIds: ['item-chicken-biryani-abc'],
        restaurantIds: ['rest-biryani-abc'],
        searches: ['Chicken Biryani'],
        cuisines: ['Indian', 'Arabic'],
      };
    }
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.recentSearches);
      return raw
        ? JSON.parse(raw)
        : ['Chicken Biryani', 'Shawarma', 'Burger', 'Pizza', 'Karak'];
    } catch {
      return ['Chicken Biryani', 'Shawarma', 'Burger', 'Pizza', 'Karak'];
    }
  });

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.priceAlerts);
      return raw ? JSON.parse(raw) : DEFAULT_ALERTS;
    } catch {
      return DEFAULT_ALERTS;
    }
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Hooks
  const isOnline = useOnlineStatus();
  const { isInstallable, isInstalled, isIOS, isDismissed, install, dismissPrompt } =
    usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  const t = TRANSLATIONS[lang];
  const activeZone = useMemo(
    () => QATAR_ZONES.find((z) => z.id === activeZoneId) || QATAR_ZONES[0],
    [activeZoneId]
  );

  // Apply RTL and Language on <html>
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem(STORAGE_KEYS.lang, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  // Apply Theme Mode on <html>
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark: boolean) => {
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    if (themeMode === 'dark') {
      applyTheme(true);
    } else if (themeMode === 'light') {
      applyTheme(false);
    } else {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(media.matches);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.theme, themeMode);
    } catch {
      // ignore
    }
  }, [themeMode]);

  // Persist user collections
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(recentSearches));
    } catch {
      // ignore
    }
  }, [recentSearches]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.priceAlerts, JSON.stringify(priceAlerts));
    } catch {
      // ignore
    }
  }, [priceAlerts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.savedAddresses, JSON.stringify(savedAddresses));
    } catch {
      // ignore
    }
  }, [savedAddresses]);

  // Periodic clock tick for relative freshness ("Updated 2 min ago")
  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Debounce search input & apply Natural Language Search parsing
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 180);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const parsedIntent = useMemo(
    () => parseNaturalLanguageSearch(debouncedQuery),
    [debouncedQuery]
  );

  // Sync with backend API (/api/sync) with offline / local fallback
  const performSync = useCallback(
    async (customFailedProviders?: PlatformId[], customMode?: DataMode, customZoneId?: string) => {
      const targetFailed = customFailedProviders ?? failedProviders;
      const targetMode = customMode ?? dataMode;
      const targetZone = customZoneId ?? activeZoneId;

      setIsSyncing(true);
      setSyncStatusBanner('syncing');

      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            zoneId: targetZone,
            mode: targetMode,
            failedProviders: targetFailed,
          }),
        });

        if (!response.ok) throw new Error('Sync request failed');
        const data = await response.json();

        setLastSyncedIso(data.syncedAtIso);
        setNowMs(Date.now());
        setProviderStates(data.providerStates || []);

        if (targetMode === 'live_api' && !data.liveDataAvailable) {
          setLiveModeMessage(
            data.message ||
              'Live data unavailable — Official partner API credentials are required for live feeds.'
          );
          setItems([]);
          setRestaurants([]);
          setOffers([]);
        } else {
          setLiveModeMessage(null);
          setItems(data.items);
          setRestaurants(data.restaurants);
          setOffers(data.offers);
          try {
            localStorage.setItem(
              STORAGE_KEYS.cachedSnapshot,
              JSON.stringify({
                syncedAtIso: data.syncedAtIso,
                items: data.items,
                restaurants: data.restaurants,
                offers: data.offers,
              })
            );
          } catch {
            // ignore
          }
        }
      } catch {
        // Fallback to local provider engine or cached snapshot
        const fallbackIso = new Date().toISOString();
        const localData = buildNormalizedComparisons({
          zoneId: targetZone,
          failedProviders: targetFailed,
          lastSyncedIso: fallbackIso,
        });
        setLastSyncedIso(fallbackIso);
        setNowMs(Date.now());
        setItems(localData.items);
        setRestaurants(localData.restaurants);
        setOffers(localData.offers);
        setProviderStates(
          ACTIVE_PLATFORMS.map((p) => ({
            platformId: p.id,
            status: targetFailed.includes(p.id) ? 'failed' : 'available',
            lastSyncedIso: targetFailed.includes(p.id) ? null : fallbackIso,
            errorMessage: targetFailed.includes(p.id)
              ? `${p.name} data temporarily unavailable`
              : undefined,
          }))
        );
      } finally {
        setIsSyncing(false);
        setSyncStatusBanner('just_synced');
        setTimeout(() => {
          setSyncStatusBanner((prev) => (prev === 'just_synced' ? 'idle' : prev));
        }, 4000);
      }
    },
    [activeZoneId, dataMode, failedProviders]
  );

  // Trigger initial sync on mount
  useEffect(() => {
    performSync();
  }, [performSync]);

  // Execute a search query & record in Recent Searches + apply NL filters
  const applySearchQuery = (queryText: string) => {
    setSearchInput(queryText);
    setDebouncedQuery(queryText);
    const intent = parseNaturalLanguageSearch(queryText);

    if (intent.detectedCategory) {
      setSelectedCategory(intent.detectedCategory);
    } else {
      setSelectedCategory('All');
    }

    if (intent.maxPriceQar !== undefined) {
      setMaxPriceFilter(intent.maxPriceQar);
    } else {
      setMaxPriceFilter(null);
    }

    if (intent.freeDeliveryOnly !== undefined) {
      setFreeDeliveryOnly(intent.freeDeliveryOnly);
    } else {
      setFreeDeliveryOnly(false);
    }

    if (intent.hasOfferOnly !== undefined) {
      setOffersOnly(intent.hasOfferOnly);
    } else {
      setOffersOnly(false);
    }

    if (intent.suggestedSort) {
      setSortBy(intent.suggestedSort);
    }

    if (queryText.trim()) {
      setRecentSearches((prev) => {
        const clean = queryText.trim();
        return [clean, ...prev.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
      });
    }
  };

  // Filtered and Sorted Normalized Food Items
  const filteredItems = useMemo(() => {
    const keyword = parsedIntent.cleanKeywords.toLowerCase();

    const matching = items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All') {
        const catMatch =
          item.category.toLowerCase() === selectedCategory.toLowerCase() ||
          item.cuisine.toLowerCase() === selectedCategory.toLowerCase();
        if (!catMatch) return false;
      }

      // NL detected cuisine filter
      if (parsedIntent.detectedCuisine) {
        if (
          item.cuisine.toLowerCase() !== parsedIntent.detectedCuisine.toLowerCase() &&
          item.category.toLowerCase() !== parsedIntent.detectedCuisine.toLowerCase()
        ) {
          return false;
        }
      }

      // Text keyword match
      if (keyword) {
        const textMatch =
          item.nameEn.toLowerCase().includes(keyword) ||
          item.nameAr.includes(keyword) ||
          item.descriptionEn.toLowerCase().includes(keyword) ||
          item.restaurantNameEn.toLowerCase().includes(keyword) ||
          item.category.toLowerCase().includes(keyword) ||
          item.cuisine.toLowerCase().includes(keyword);
        if (!textMatch) return false;
      }

      // Filter quotes by selected platforms
      const activeQuotes = item.quotes.filter(
        (q) =>
          q.available &&
          q.estimatedTotal !== null &&
          (selectedPlatforms.length === 0 || selectedPlatforms.includes(q.platformId))
      );

      if (activeQuotes.length === 0) return false;

      // Max price filter (either manual or from NL query like "under 20")
      const effectiveMaxPrice = maxPriceFilter ?? parsedIntent.maxPriceQar ?? null;
      if (effectiveMaxPrice !== null) {
        const hasUnderMax = activeQuotes.some((q) => (q.estimatedTotal ?? 999) <= effectiveMaxPrice);
        if (!hasUnderMax) return false;
      }

      // Free delivery filter
      if (freeDeliveryOnly || parsedIntent.freeDeliveryOnly) {
        const hasFreeDel = activeQuotes.some((q) => q.deliveryFee === 0);
        if (!hasFreeDel) return false;
      }

      // Active offer filter
      if (offersOnly || parsedIntent.hasOfferOnly) {
        const hasDiscount = activeQuotes.some((q) => q.discountAmount > 0 || Boolean(q.offerLabel));
        if (!hasDiscount) return false;
      }

      // Minimum rating filter
      if (minRatingFilter > 0) {
        const hasRating = activeQuotes.some((q) => q.rating >= minRatingFilter);
        if (!hasRating) return false;
      }

      return true;
    });

    // Sort matching items
    return [...matching].sort((a, b) => {
      const aQuotes = a.quotes.filter(
        (q) =>
          q.available &&
          q.estimatedTotal !== null &&
          (selectedPlatforms.length === 0 || selectedPlatforms.includes(q.platformId))
      );
      const bQuotes = b.quotes.filter(
        (q) =>
          q.available &&
          q.estimatedTotal !== null &&
          (selectedPlatforms.length === 0 || selectedPlatforms.includes(q.platformId))
      );

      const aMinTotal = Math.min(...aQuotes.map((q) => q.estimatedTotal ?? 999));
      const bMinTotal = Math.min(...bQuotes.map((q) => q.estimatedTotal ?? 999));

      const aMinEta = Math.min(...aQuotes.map((q) => q.estimatedMinutes));
      const bMinEta = Math.min(...bQuotes.map((q) => q.estimatedMinutes));

      const aMaxRating = Math.max(...aQuotes.map((q) => q.rating));
      const bMaxRating = Math.max(...bQuotes.map((q) => q.rating));

      const aMinDel = Math.min(...aQuotes.map((q) => q.deliveryFee ?? 99));
      const bMinDel = Math.min(...bQuotes.map((q) => q.deliveryFee ?? 99));

      if (sortBy === 'cheapest') return aMinTotal - bMinTotal;
      if (sortBy === 'fastest') return aMinEta - bMinEta;
      if (sortBy === 'highest_rated') return bMaxRating - aMaxRating;
      if (sortBy === 'lowest_delivery') return aMinDel - bMinDel;
      if (sortBy === 'biggest_discount') return b.maxSavingsQar - a.maxSavingsQar;

      // Default: 'best_deal'
      return b.maxSavingsQar * 1.5 - aMinTotal - (a.maxSavingsQar * 1.5 - bMinTotal);
    });
  }, [
    items,
    parsedIntent,
    selectedCategory,
    selectedPlatforms,
    maxPriceFilter,
    freeDeliveryOnly,
    offersOnly,
    minRatingFilter,
    sortBy,
  ]);

  // Toggle Platform Filter ("ALL" vs one or multiple platforms)
  const handleTogglePlatform = (id: PlatformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Toggle simulated provider failure to demonstrate partial failure resilience
  const handleToggleFailedProvider = (id: PlatformId) => {
    const updated = failedProviders.includes(id)
      ? failedProviders.filter((p) => p !== id)
      : [...failedProviders, id];
    setFailedProviders(updated);
    performSync(updated, dataMode, activeZoneId);
  };

  // Retry a failed provider
  const handleRetryProvider = (id: PlatformId) => {
    const updated = failedProviders.filter((p) => p !== id);
    setFailedProviders(updated);
    performSync(updated, dataMode, activeZoneId);
  };

  // Show temporary toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle favorites
  const handleToggleFavoriteFood = (foodId: string) => {
    setFavorites((prev) => {
      const exists = prev.foodIds.includes(foodId);
      const foodIds = exists
        ? prev.foodIds.filter((id) => id !== foodId)
        : [foodId, ...prev.foodIds];
      triggerToast(exists ? 'Removed from favorite dishes' : 'Saved dish to Favorites');
      return { ...prev, foodIds };
    });
  };

  const handleToggleFavoriteRestaurant = (restaurantId: string) => {
    setFavorites((prev) => {
      const exists = prev.restaurantIds.includes(restaurantId);
      const restaurantIds = exists
        ? prev.restaurantIds.filter((id) => id !== restaurantId)
        : [restaurantId, ...prev.restaurantIds];
      triggerToast(exists ? 'Removed restaurant from Favorites' : 'Saved restaurant to Favorites');
      return { ...prev, restaurantIds };
    });
  };

  // Quick create alert from a food card
  const handleQuickCreateAlert = (item: NormalizedFoodItem) => {
    const best = item.bestQuote || item.cheapestQuote;
    const targetQar = Math.max(10, (best?.estimatedTotal ?? item.normalPriceQar) - 2);
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      type: 'price_drop',
      targetName: item.nameEn,
      targetPriceQar: targetQar,
      enabled: true,
      triggered: false,
      currentBestPriceQar: best?.estimatedTotal ?? undefined,
      matchedPlatform: best?.platformId,
      createdAtIso: new Date().toISOString(),
    };
    setPriceAlerts((prev) => [newAlert, ...prev]);
    triggerToast(`Price alert set: ${item.nameEn} < QAR ${targetQar}`);
  };

  // Request Browser Notification Permission only when user explicitly clicks
  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      triggerToast('Price alert notifications paused');
      return;
    }
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setNotificationsEnabled(true);
          triggerToast('Notifications enabled for Qatar price alerts');
          return;
        }
      } catch {
        // fallback to in-app notifications
      }
    }
    setNotificationsEnabled(true);
    triggerToast('In-app price alert notifications enabled');
  };

  const freshnessInfo = formatRelativeSyncTime(
    lastSyncedIso,
    nowMs,
    !isOnline,
    dataMode === 'demo',
    lang
  );

  const selectedRestaurant = useMemo(
    () => restaurants.find((r) => r.id === activeRestaurantId) || null,
    [restaurants, activeRestaurantId]
  );

  const topRecommendedItem = filteredItems[0] || items[0] || null;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#0B0D11] text-slate-900 dark:text-slate-100 pb-20 md:pb-0">
      {/* Offline Banner */}
      {!isOnline && (
        <div
          role="status"
          className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2"
        >
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>
            {t.youAreOffline} — {t.offlineDescription} ({t.cachedDataBadge})
          </span>
        </div>
      )}

      {/* Top Navigation Bar (Strict 3-Zone Contract on Desktop) */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('home');
            }}
            className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-rose-600 dark:text-rose-500 whitespace-nowrap"
          >
            FOOD BUCKET
          </a>

          {/* Zone 2: 5 clean text navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            {(
              [
                { id: 'home', label: t.navHome },
                { id: 'search', label: t.navSearch },
                { id: 'deals', label: t.navDeals },
                { id: 'favorites', label: t.navFavorites },
                { id: 'settings', label: t.navSettings },
              ] as const
            ).map((item) => {
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(item.id);
                  }}
                  className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'border-rose-600 text-slate-900 dark:text-white font-semibold'
                      : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 2 primary actions (Location Selector + SYNC NOW) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              aria-label="Select delivery location in Qatar"
              className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-colors whitespace-nowrap max-w-[175px]"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate">
                {activeAddressLabel}: {lang === 'ar' ? activeZone.nameAr : activeZone.nameEn}
              </span>
            </button>

            <button
              type="button"
              onClick={() => performSync()}
              disabled={isSyncing}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? t.syncingLiveOffers : t.syncNow}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
        {/* Friendly PWA Install Banner (Hidden once installed or dismissed) */}
        {!isInstalled && !isDismissed && (isInstallable || isIOS) && (
          <section
            aria-label="Install Food Bucket App"
            className="rounded-2xl bg-slate-900 text-white p-4 sm:px-5 flex flex-wrap items-center justify-between gap-4 border border-slate-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center font-display font-extrabold text-sm shrink-0">
                FB
              </div>
              <div>
                <h2 className="text-sm font-bold">{t.installTitle}</h2>
                <p className="text-xs text-slate-300">{t.installBody}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isInstallable) install();
                  else setShowIOSModal(true);
                }}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.installBtn}</span>
              </button>
              <button
                type="button"
                onClick={dismissPrompt}
                aria-label="Dismiss install banner"
                className="min-h-[40px] min-w-[40px] rounded-xl text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* HOME & SEARCH VIEWS */}
        {(activeTab === 'home' || activeTab === 'search') && (
          <>
            {/* Hero & Universal Search Box */}
            <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-8 space-y-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-xs font-bold tracking-wider text-rose-600 dark:text-rose-400">
                    {t.philosophy}
                  </p>
                  <h1
                    className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1"
                    style={{ textWrap: 'balance' }}
                  >
                    {t.appName} — {t.subtitle}
                  </h1>
                </div>

                {/* Sync Status & Demo Mode Honesty Indicator */}
                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                  <span className="font-bold text-amber-700 dark:text-amber-400">
                    {dataMode === 'demo' ? `${t.demoModeLabel} · ${t.demoDataBadge}` : t.liveApiModeLabel}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {syncStatusBanner === 'syncing'
                      ? t.syncingLiveOffers
                      : syncStatusBanner === 'just_synced'
                      ? `${t.syncedJustNow} (${freshnessInfo.clockLabel})`
                      : `${t.lastSynced} ${freshnessInfo.clockLabel} (${freshnessInfo.shortLabel})`}
                  </span>
                </div>
              </div>

              {/* Universal Search Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  applySearchQuery(searchInput);
                }}
                className="relative"
              >
                <label htmlFor="universal-food-search" className="sr-only">
                  What are you craving?
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="universal-food-search"
                      type="search"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder={t.searchPlaceholder}
                      className="w-full min-h-[52px] pl-12 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-600"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput('');
                          setDebouncedQuery('');
                          setMaxPriceFilter(null);
                          setFreeDeliveryOnly(false);
                          setOffersOnly(false);
                        }}
                        aria-label="Clear search query"
                        className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="min-h-[52px] px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-sm"
                  >
                    <Search className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'قارن الأسعار' : 'Compare All Apps'}</span>
                  </button>
                </div>
              </form>

              {/* Natural Language Search Detected Intent Feedback */}
              {parsedIntent.explanationChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Smart Query Filters Applied:</span>
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {parsedIntent.explanationChips.join(' · ')}
                  </span>
                </div>
              )}

              {/* Quick Dish & Natural Language Search Examples */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">
                    {lang === 'ar' ? 'الأكثر بحثاً:' : 'Cravings:'}
                  </span>
                  {SEARCH_EXAMPLES.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => applySearchQuery(ex)}
                      className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        searchInput.toLowerCase() === ex.toLowerCase()
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {ex}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">
                    {lang === 'ar' ? 'بحث ذكي:' : 'Smart queries:'}
                  </span>
                  {NL_SEARCH_EXAMPLES.map((nl) => (
                    <button
                      key={nl}
                      type="button"
                      onClick={() => applySearchQuery(nl)}
                      className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        searchInput.toLowerCase() === nl.toLowerCase()
                          ? 'bg-rose-600 text-white font-semibold'
                          : 'bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      &ldquo;{nl}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Quick Categories Horizontal Scroller */}
            <section aria-label="Quick Food Categories" className="space-y-2">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {QUICK_CATEGORIES.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Platform Filter Bar (ALL, TALABAT, SNOONU, RAFEEQ, KEETA) + Sorting & Filter Controls */}
            <section
              aria-label="Platform and Sort Filters"
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Platform Filter Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setSelectedPlatforms([])}
                    className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                      selectedPlatforms.length === 0
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t.allPlatforms}
                  </button>
                  {ACTIVE_PLATFORMS.map((p) => {
                    const isSelected = selectedPlatforms.includes(p.id);
                    const state = providerStates.find((s) => s.platformId === p.id);
                    const isFailed = state?.status === 'failed';
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleTogglePlatform(p.id)}
                        className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <span>{p.name.toUpperCase()}</span>
                        {isFailed && <span className="text-amber-500">!</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Sorting & Quick Filter Toggles */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFreeDeliveryOnly((v) => !v)}
                    className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                      freeDeliveryOnly
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Free Delivery
                  </button>

                  <button
                    type="button"
                    onClick={() => setOffersOnly((v) => !v)}
                    className={`min-h-[42px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                      offersOnly
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Active Offers Only
                  </button>

                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 min-h-[42px]">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <label htmlFor="sort-select" className="sr-only">
                      Sort results
                    </label>
                    <select
                      id="sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none py-2"
                    >
                      <option value="best_deal">Sort: Best Deal</option>
                      <option value="cheapest">Sort: Cheapest Total</option>
                      <option value="fastest">Sort: Fastest Delivery</option>
                      <option value="highest_rated">Sort: Highest Rated</option>
                      <option value="lowest_delivery">Sort: Lowest Delivery Fee</option>
                      <option value="biggest_discount">Sort: Biggest Discount</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Extended Search Filters Row (when on Search tab or when filters active) */}
              {(activeTab === 'search' || maxPriceFilter !== null || minRatingFilter > 0) && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-slate-500 flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Max Total Budget:</span>
                    </span>
                    {[null, 15, 20, 25, 35].map((price) => (
                      <button
                        key={String(price)}
                        type="button"
                        onClick={() => setMaxPriceFilter(price)}
                        className={`min-h-[36px] px-3 py-1 rounded-lg font-mono-num font-semibold ${
                          maxPriceFilter === price
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {price === null ? 'Any Price' : `≤ QAR ${price}`}
                      </button>
                    ))}
                  </div>

                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-400">{t.recentSearches}:</span>
                      {recentSearches.slice(0, 4).map((rs) => (
                        <button
                          key={rs}
                          type="button"
                          onClick={() => applySearchQuery(rs)}
                          className="underline text-slate-600 dark:text-slate-300 hover:text-rose-600"
                        >
                          {rs}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setRecentSearches([])}
                        className="text-rose-600 dark:text-rose-400 font-semibold ml-1"
                      >
                        {t.clearSearchHistory}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Provider Availability & Partial Error Resilience Bar */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  {ACTIVE_PLATFORMS.map((p) => {
                    const st = providerStates.find((s) => s.platformId === p.id);
                    const isFailed = st?.status === 'failed';
                    const isUnavailableLive = st?.status === 'unavailable_live';

                    return (
                      <span key={p.id} className="inline-flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {p.name}:
                        </span>
                        {isFailed ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1">
                            <span>Sync failed</span>
                            <button
                              type="button"
                              onClick={() => handleRetryProvider(p.id)}
                              className="underline font-bold text-rose-600 dark:text-rose-400 ml-0.5"
                            >
                              [{t.retry}]
                            </button>
                          </span>
                        ) : isUnavailableLive ? (
                          <span className="text-slate-400">Data unavailable</span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Available
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>

                {/* Quick toggle to test Rafeeq failure resilience right from the status bar */}
                <button
                  type="button"
                  onClick={() => handleToggleFailedProvider('rafeeq')}
                  className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white underline"
                >
                  {failedProviders.includes('rafeeq')
                    ? 'Restore Rafeeq Feed'
                    : 'Test Rafeeq Outage Resilience'}
                </button>
              </div>
            </section>

            {/* Partial Provider Failure Banner (when a provider fails, others continue working) */}
            {failedProviders.map((failedId) => {
              const p = ACTIVE_PLATFORMS.find((pl) => pl.id === failedId)!;
              return (
                <div
                  key={failedId}
                  role="alert"
                  className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 px-4 py-3 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>{p.name} data temporarily unavailable.</strong> Comparing remaining available platforms so your search continues uninterrupted.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRetryProvider(failedId)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold whitespace-nowrap"
                  >
                    {t.retry}
                  </button>
                </div>
              );
            })}

            {/* Live API Mode Honest Notice (When switched to live mode without partner credentials) */}
            {dataMode === 'live_api' && liveModeMessage && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {t.liveDataUnavailable}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                  {liveModeMessage} Food Bucket never fabricates live prices or bypasses private platform security controls.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDataMode('demo');
                    performSync(failedProviders, 'demo', activeZoneId);
                  }}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Switch to Clearly Labelled DEMO MODE
                </button>
              </div>
            )}

            {/* FOOD BUCKET RECOMMENDS — Prominent Best Deal Card */}
            {topRecommendedItem && dataMode === 'demo' && (
              <BestDealRecommendationCard
                item={topRecommendedItem}
                onSelectOrder={(payload) => setActiveOrderRedirect(payload)}
                onOpenRestaurant={(restId) => setActiveRestaurantId(restId)}
                isDemoData={dataMode === 'demo'}
                lang={lang}
              />
            )}

            {/* Normalized Food Comparison Results */}
            {dataMode === 'demo' && (
              <section aria-label="Price Comparison Results" className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {lang === 'ar'
                      ? `مقارنة الأسعار الشاملة (${filteredItems.length} وجبة)`
                      : `Total Cost Comparison (${filteredItems.length} dishes compared)`}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Food price + Delivery fee + Service fee − Discount = Estimated Total (QAR)
                  </p>
                </div>

                {filteredItems.length === 0 ? (
                  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      No dishes match your current filters
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Try clearing your price ceiling or selecting All Categories.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        setDebouncedQuery('');
                        setSelectedCategory('All');
                        setSelectedPlatforms([]);
                        setMaxPriceFilter(null);
                        setFreeDeliveryOnly(false);
                        setOffersOnly(false);
                      }}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5">
                    {filteredItems.map((item) => (
                      <FoodComparisonCard
                        key={item.id}
                        item={item}
                        selectedPlatforms={selectedPlatforms}
                        isFavoriteFood={favorites.foodIds.includes(item.id)}
                        onToggleFavoriteFood={handleToggleFavoriteFood}
                        onOpenRestaurant={(restId) => setActiveRestaurantId(restId)}
                        onSelectOrder={(payload) => setActiveOrderRedirect(payload)}
                        onQuickCreateAlert={handleQuickCreateAlert}
                        nowMs={nowMs}
                        isOffline={!isOnline}
                        isDemoData={dataMode === 'demo'}
                        lang={lang}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Restaurant-Level Basket Comparison Section */}
            {dataMode === 'demo' && (
              <section aria-label="Compare Restaurants Across Delivery Apps" className="space-y-4 pt-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {t.compareRestaurants}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Select any restaurant to view its full platform comparison and menu breakdown
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {restaurants.slice(0, 4).map((rest) => {
                    const cheapest = rest.basketComparison.find((b) => b.isCheapest);
                    const cheapestPlatform = cheapest
                      ? ACTIVE_PLATFORMS.find((p) => p.id === cheapest.platformId)
                      : null;

                    return (
                      <div
                        key={rest.id}
                        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {rest.cuisine} · ★ {rest.averageRating.toFixed(1)} · {rest.distanceKm} km
                          </p>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                            {lang === 'ar' ? rest.nameAr : rest.nameEn}
                          </h3>

                          <div className="mt-3 space-y-1.5 text-xs border-t border-slate-100 dark:border-slate-800 pt-2.5">
                            {rest.basketComparison.map((b) => {
                              const p = ACTIVE_PLATFORMS.find((pl) => pl.id === b.platformId)!;
                              return (
                                <div
                                  key={b.platformId}
                                  className={`flex justify-between ${
                                    b.isCheapest
                                      ? 'font-bold text-emerald-600 dark:text-emerald-400'
                                      : 'text-slate-600 dark:text-slate-400'
                                  }`}
                                >
                                  <span>
                                    {p.name} {b.isCheapest ? '· CHEAPEST' : ''}
                                  </span>
                                  <span className="font-mono-num">
                                    {b.sampleBasketTotal !== null
                                      ? formatQar(b.sampleBasketTotal)
                                      : 'Unavailable'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveRestaurantId(rest.id)}
                          className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white transition-colors"
                        >
                          {cheapestPlatform
                            ? `Compare Menu (Best: ${cheapestPlatform.name})`
                            : 'Compare Delivery Apps'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}

        {/* DEALS VIEW */}
        {activeTab === 'deals' && (
          <DealsView
            offers={offers}
            items={items}
            selectedPlatforms={selectedPlatforms}
            onSelectOrder={(payload) => setActiveOrderRedirect(payload)}
            onOpenRestaurant={(restId) => setActiveRestaurantId(restId)}
            onSyncNow={() => performSync()}
            isSyncing={isSyncing}
            nowMs={nowMs}
            isOffline={!isOnline}
            isDemoData={dataMode === 'demo'}
            lang={lang}
          />
        )}

        {/* FAVORITES & PRICE ALERTS VIEW */}
        {activeTab === 'favorites' && (
          <FavoritesAlertsView
            favorites={favorites}
            items={items}
            restaurants={restaurants}
            priceAlerts={priceAlerts}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={handleToggleNotifications}
            onAddPriceAlert={(newAlert) => {
              setPriceAlerts((prev) => [
                {
                  ...newAlert,
                  id: `alert-${Date.now()}`,
                  triggered: true,
                  matchedPlatform: 'keeta',
                  currentBestPriceQar: newAlert.targetPriceQar
                    ? Math.max(11, newAlert.targetPriceQar - 2)
                    : undefined,
                  createdAtIso: new Date().toISOString(),
                },
                ...prev,
              ]);
              triggerToast(`Price alert created for ${newAlert.targetName}`);
            }}
            onTogglePriceAlert={(id) =>
              setPriceAlerts((prev) =>
                prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
              )
            }
            onDeletePriceAlert={(id) =>
              setPriceAlerts((prev) => prev.filter((a) => a.id !== id))
            }
            onToggleFavoriteFood={handleToggleFavoriteFood}
            onToggleFavoriteRestaurant={handleToggleFavoriteRestaurant}
            onRemoveFavoriteSearch={(q) =>
              setFavorites((prev) => ({
                ...prev,
                searches: prev.searches.filter((s) => s !== q),
              }))
            }
            onToggleFavoriteCuisine={(cuisine) =>
              setFavorites((prev) => ({
                ...prev,
                cuisines: prev.cuisines.includes(cuisine)
                  ? prev.cuisines.filter((c) => c !== cuisine)
                  : [...prev.cuisines, cuisine],
              }))
            }
            onRunSearch={(q) => {
              applySearchQuery(q);
              setActiveTab('search');
            }}
            onOpenRestaurant={(restId) => setActiveRestaurantId(restId)}
            onSelectOrder={(payload) => setActiveOrderRedirect(payload)}
            onSyncNow={() => performSync()}
            isSyncing={isSyncing}
            isDemoData={dataMode === 'demo'}
            lang={lang}
          />
        )}

        {/* SETTINGS & ABOUT VIEW */}
        {activeTab === 'settings' && (
          <SettingsAboutView
            profileName={profileName}
            onUpdateProfileName={setProfileName}
            activeZone={activeZone}
            activeAddressLabel={activeAddressLabel}
            savedAddresses={savedAddresses}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            preferredPlatforms={selectedPlatforms}
            onTogglePreferredPlatform={handleTogglePlatform}
            themeMode={themeMode}
            onChangeThemeMode={setThemeMode}
            lang={lang}
            onChangeLang={setLang}
            dataMode={dataMode}
            onChangeDataMode={(mode) => {
              setDataMode(mode);
              performSync(failedProviders, mode, activeZoneId);
            }}
            failedProviders={failedProviders}
            onToggleFailedProvider={handleToggleFailedProvider}
            recentSearches={recentSearches}
            onClearSearchHistory={() => {
              setRecentSearches([]);
              triggerToast('Search history cleared');
            }}
            onClearCache={() => {
              try {
                localStorage.removeItem(STORAGE_KEYS.cachedSnapshot);
              } catch {
                // ignore
              }
              performSync();
              triggerToast('Local cache cleared and resynced');
            }}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={handleToggleNotifications}
            isInstallable={isInstallable}
            isInstalled={isInstalled}
            onInstallApp={install}
          />
        )}
      </main>

      {/* Discreet Footer with Main Message & Creator Credit */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">FOOD BUCKET</span>
            <span>·</span>
            <span>{t.mainMessage}</span>
          </div>
          <div>
            Created by &quot;ALI,{' '}
            <a
              href="mailto:kmonkmol38@gmail.com"
              className="underline hover:text-slate-800 dark:hover:text-slate-200"
            >
              kmonkmol38@gmail.com
            </a>
            &quot;
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Home, Search, Deals, Favorites, Settings) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"
      >
        <div className="grid grid-cols-5 items-center h-16 px-1">
          {(
            [
              { id: 'home', label: t.navHome, Icon: Home },
              { id: 'search', label: t.navSearch, Icon: Search },
              { id: 'deals', label: t.navDeals, Icon: Tag },
              { id: 'favorites', label: t.navFavorites, Icon: Heart },
              { id: 'settings', label: t.navSettings, Icon: Settings },
            ] as const
          ).map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`min-h-[48px] flex flex-col items-center justify-center rounded-xl transition-colors ${
                  isActive
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 right-4 z-50 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 text-xs font-semibold shadow-xl"
        >
          {toastMessage}
        </div>
      )}

      {/* iOS Install Guide Modal */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Install Food Bucket on iOS
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              1. Tap the <strong>Share</strong> button in your Safari toolbar.
              <br />
              2. Scroll down and tap <strong>Add to Home Screen</strong>.
            </p>
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full min-h-[44px] rounded-xl bg-rose-600 text-white text-xs font-bold"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        activeZone={activeZone}
        activeAddressLabel={activeAddressLabel}
        savedAddresses={savedAddresses}
        onSelectLocation={(zoneId, label) => {
          setActiveZoneId(zoneId);
          setActiveAddressLabel(label);
          try {
            localStorage.setItem(STORAGE_KEYS.zoneId, zoneId);
            localStorage.setItem(STORAGE_KEYS.addressLabel, label);
          } catch {
            // ignore
          }
          performSync(failedProviders, dataMode, zoneId);
        }}
        onSaveAddress={(newAddr) => {
          setSavedAddresses((prev) => {
            const filtered = prev.filter((a) => a.label !== newAddr.label);
            return [...filtered, newAddr];
          });
        }}
        lang={lang}
      />

      {/* Restaurant Comparison Modal */}
      <RestaurantComparisonModal
        restaurant={selectedRestaurant}
        onClose={() => setActiveRestaurantId(null)}
        isFavorite={
          selectedRestaurant ? favorites.restaurantIds.includes(selectedRestaurant.id) : false
        }
        onToggleFavorite={handleToggleFavoriteRestaurant}
        onSelectOrder={(payload) => setActiveOrderRedirect(payload)}
        isDemoData={dataMode === 'demo'}
        lang={lang}
      />

      {/* Order Now Official Platform Hand-off Modal */}
      <OrderRedirectModal
        payload={activeOrderRedirect}
        onClose={() => setActiveOrderRedirect(null)}
        lang={lang}
      />
    </div>
  );
}
