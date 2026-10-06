import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Database,
  Download,
  Globe,
  Info,
  MapPin,
  Moon,
  RefreshCw,
  Shield,
  Sun,
  Trash2,
  User,
} from 'lucide-react';
import { ACTIVE_PLATFORMS, FUTURE_PLATFORMS, QATAR_ZONES } from '../providers/ProviderSystem';
import { AddressLabel, DataMode, PlatformId, QatarZone, SavedAddress } from '../types/food';

interface SettingsAboutViewProps {
  profileName: string;
  onUpdateProfileName: (name: string) => void;
  activeZone: QatarZone;
  activeAddressLabel: AddressLabel;
  savedAddresses: SavedAddress[];
  onOpenLocationModal: () => void;
  preferredPlatforms: PlatformId[];
  onTogglePreferredPlatform: (id: PlatformId) => void;
  themeMode: 'light' | 'dark' | 'system';
  onChangeThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  lang: 'en' | 'ar';
  onChangeLang: (lang: 'en' | 'ar') => void;
  dataMode: DataMode;
  onChangeDataMode: (mode: DataMode) => void;
  failedProviders: PlatformId[];
  onToggleFailedProvider: (id: PlatformId) => void;
  recentSearches: string[];
  onClearSearchHistory: () => void;
  onClearCache: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstallApp: () => void;
}

export const SettingsAboutView: React.FC<SettingsAboutViewProps> = ({
  profileName,
  onUpdateProfileName,
  activeZone,
  activeAddressLabel,
  savedAddresses,
  onOpenLocationModal,
  preferredPlatforms,
  onTogglePreferredPlatform,
  themeMode,
  onChangeThemeMode,
  lang,
  onChangeLang,
  dataMode,
  onChangeDataMode,
  failedProviders,
  onToggleFailedProvider,
  recentSearches,
  onClearSearchHistory,
  onClearCache,
  notificationsEnabled,
  onToggleNotifications,
  isInstallable,
  isInstalled,
  onInstallApp,
}) => {
  const [cacheClearedNotice, setCacheClearedNotice] = useState(false);

  const handleClearCacheClick = () => {
    onClearCache();
    setCacheClearedNotice(true);
    setTimeout(() => setCacheClearedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {lang === 'ar' ? 'الإعدادات وحول التطبيق' : 'Settings & Configuration'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {lang === 'ar'
            ? 'إدارة الموقع، المنصات المفضلة، اللغة، المظهر، ومصادر البيانات.'
            : 'Manage your Qatar delivery zone, preferred platforms, language, theme, and provider sync architecture.'}
        </p>
      </div>

      {/* PWA Installation Card if not installed */}
      {!isInstalled && (
        <section className="rounded-2xl bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold">Install Food Bucket PWA</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Add Food Bucket to your Android, iOS, or desktop home screen for standalone app-like launch and offline access.
            </p>
          </div>
          {isInstallable ? (
            <button
              type="button"
              onClick={onInstallApp}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>INSTALL APP</span>
            </button>
          ) : (
            <span className="text-xs text-slate-300 font-mono-num">
              Browser menu → &quot;Add to Home Screen&quot;
            </span>
          )}
        </section>
      )}

      {/* 1. Profile & Location */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-rose-600" />
          <span>{lang === 'ar' ? 'الملف الشخصي والموقع في قطر' : 'Profile, Location & Saved Addresses'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="profile-name-input" className="block text-xs font-medium text-slate-500 mb-1">
              Display Name (Local Profile)
            </label>
            <input
              id="profile-name-input"
              type="text"
              value={profileName}
              onChange={(e) => onUpdateProfileName(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <span className="block text-xs font-medium text-slate-500 mb-1">
              Active Delivery Zone ({activeAddressLabel})
            </span>
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-between"
            >
              <span className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{lang === 'ar' ? activeZone.nameAr : activeZone.nameEn}</span>
              </span>
              <span className="text-xs text-rose-600 dark:text-rose-400">Change</span>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 mb-2">Saved Addresses</p>
          <div className="flex flex-wrap gap-2">
            {savedAddresses.map((addr) => {
              const z = QATAR_ZONES.find((zone) => zone.id === addr.zoneId) || QATAR_ZONES[0];
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={onOpenLocationModal}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                >
                  <strong>{addr.label}:</strong> {z.nameEn}
                  {addr.streetNote ? ` (${addr.streetNote})` : ''}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Theme, Language & Currency */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-rose-600" />
          <span>{lang === 'ar' ? 'المظهر، اللغة والعملة' : 'Theme, Language & Currency'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Theme */}
          <div>
            <span className="block text-xs font-medium text-slate-500 mb-1.5">Theme Mode</span>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onChangeThemeMode(mode)}
                  className={`min-h-[40px] rounded-lg text-xs font-semibold capitalize flex items-center justify-center gap-1 transition-colors ${
                    themeMode === mode
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {mode === 'light' && <Sun className="w-3.5 h-3.5" />}
                  {mode === 'dark' && <Moon className="w-3.5 h-3.5" />}
                  <span>{mode}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Language (English & Arabic RTL) */}
          <div>
            <span className="block text-xs font-medium text-slate-500 mb-1.5">
              Language / اللغة (RTL Support)
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors ${
                  lang === 'en'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                English (LTR)
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('ar')}
                className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors ${
                  lang === 'ar'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                العربية (RTL)
              </button>
            </div>
          </div>

          {/* Currency */}
          <div>
            <span className="block text-xs font-medium text-slate-500 mb-1.5">Default Currency</span>
            <div className="min-h-[48px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Qatari Riyal (QAR)</span>
              <span className="font-mono-num text-slate-500">QAR 18.00</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Preferred Platforms & Modular Provider Architecture */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-rose-600" />
          <span>Preferred Platforms & Modular Provider Architecture</span>
        </h2>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Select active Qatar delivery platforms to include in your search comparisons. Future platforms use the same <code>FoodDeliveryProvider</code> interface.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACTIVE_PLATFORMS.map((p) => {
            const isSelected =
              preferredPlatforms.length === 0 || preferredPlatforms.includes(p.id);
            return (
              <div
                key={p.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {p.name} ({p.nameAr})
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{p.tagline}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onTogglePreferredPlatform(p.id)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isSelected ? 'Enabled' : 'Hidden'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            Future Qatar Provider Slots (Modular Expansion Ready — Inactive Until Partner Feed Connected)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {FUTURE_PLATFORMS.map((fp) => (
              <div
                key={fp.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700"
              >
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {fp.name} · {fp.nameAr}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Connector slot ready
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Sync Settings, Data Transparency & Provider Resilience Simulator */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-rose-600" />
          <span>Sync Settings, Data Honesty & Provider Resilience</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChangeDataMode('demo')}
            className={`p-4 rounded-xl border text-left transition-colors ${
              dataMode === 'demo'
                ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/25'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                DEMO MODE (Sample Dataset)
              </span>
              {dataMode === 'demo' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Clearly badged as DEMO DATA. Demonstrates full price comparison, natural language search, and best deal calculations.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChangeDataMode('live_api')}
            className={`p-4 rounded-xl border text-left transition-colors ${
              dataMode === 'live_api'
                ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/25'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Authorized Live Feed Mode
              </span>
              {dataMode === 'live_api' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Queries authorized partner APIs via backend. Displays &quot;Live data unavailable&quot; when partner credentials are not present.
            </p>
          </button>
        </div>

        {/* Provider Error Handling Test */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Test Partial Provider Outage Resilience (Graceful Degradation)</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-2.5">
            Toggle a provider outage below to verify that when one provider fails (e.g., Rafeeq: Sync failed), the remaining providers continue working and offer a [RETRY] action.
          </p>
          <div className="flex flex-wrap gap-2">
            {ACTIVE_PLATFORMS.map((p) => {
              const isFailing = failedProviders.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onToggleFailedProvider(p.id)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    isFailing
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {p.name}: {isFailing ? 'Sync Failed (Tap to Restore)' : 'Available'}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Search History, Notifications & Local Cache */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-rose-600" />
          <span>Search History, Notifications & Offline Cache</span>
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Recent Searches ({recentSearches.length} stored)
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {recentSearches.join(' · ') || 'Search history is empty'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClearSearchHistory}
            disabled={recentSearches.length === 0}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Search History</span>
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Offline Comparison Cache & Local Storage
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reset cached provider responses and restore default preferences.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleNotifications}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              Notifications: {notificationsEnabled ? 'ON' : 'OFF'}
            </button>
            <button
              type="button"
              onClick={handleClearCacheClick}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold"
            >
              {cacheClearedNotice ? 'Cache Cleared ✓' : 'Clear Cache'}
            </button>
          </div>
        </div>
      </section>

      {/* 6. About Food Bucket, Security, Privacy & Creator Credit */}
      <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
          <Info className="w-4 h-4 text-rose-600" />
          <span>About Food Bucket · Privacy & Terms</span>
        </div>
        <p>
          <strong>ONE SEARCH. EVERY FOOD APP. BEST DEAL.</strong> Food Bucket is a responsive Web Application and Progressive Web App (PWA) designed for users in Qatar to compare food prices, delivery fees, service fees, and promo codes across Talabat, Snoonu, Rafeeq, and Keeta.
        </p>
        <div className="flex items-start gap-2 pt-1">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <strong>Security & Privacy Guarantee:</strong> Food Bucket never collects or stores credit card numbers, payment details, or external delivery platform passwords. All orders are handed off directly to the official delivery provider.
          </p>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-slate-500 dark:text-slate-400">
          <span>Food Bucket Qatar PWA · Standalone Web App</span>
          <span>
            Created by &quot;ALI,{' '}
            <a
              href="mailto:kmonkmol38@gmail.com"
              className="underline hover:text-slate-800 dark:hover:text-slate-200"
            >
              kmonkmol38@gmail.com
            </a>
            &quot;
          </span>
        </div>
      </section>
    </div>
  );
};
