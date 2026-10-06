import React, { useState } from 'react';
import { Briefcase, Home, LocateFixed, MapPin, Plus, Shield, X } from 'lucide-react';
import { QATAR_ZONES } from '../providers/ProviderSystem';
import { AddressLabel, QatarZone, SavedAddress } from '../types/food';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeZone: QatarZone;
  activeAddressLabel: AddressLabel;
  savedAddresses: SavedAddress[];
  onSelectLocation: (zoneId: string, label: AddressLabel) => void;
  onSaveAddress: (address: SavedAddress) => void;
  lang: 'en' | 'ar';
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  activeZone,
  activeAddressLabel,
  savedAddresses,
  onSelectLocation,
  onSaveAddress,
  lang,
}) => {
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'granted' | 'denied'>('idle');
  const [newLabel, setNewLabel] = useState<AddressLabel>('Home');
  const [newZoneId, setNewZoneId] = useState<string>(activeZone.id);
  const [streetNote, setStreetNote] = useState('');

  if (!isOpen) return null;

  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    setGeoStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Privately map coordinates to nearest Qatar zone without storing or exposing exact GPS coordinates
        const lat = position.coords.latitude;
        let detectedZoneId = 'west_bay';
        if (lat > 25.38) detectedZoneId = 'lusail';
        else if (lat > 25.35) detectedZoneId = 'the_pearl';
        else if (lat < 25.22) detectedZoneId = 'al_wakrah';
        else if (lat < 25.28) detectedZoneId = 'al_sadd';

        setGeoStatus('granted');
        onSelectLocation(detectedZoneId, 'Current');
        onClose();
      },
      () => {
        setGeoStatus('denied');
      },
      { timeout: 6000, maximumAge: 60000 }
    );
  };

  const handleAddSavedAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SavedAddress = {
      id: `addr-${newLabel.toLowerCase()}`,
      label: newLabel,
      zoneId: newZoneId,
      streetNote: streetNote.trim() || undefined,
    };
    onSaveAddress(updated);
    onSelectLocation(newZoneId, newLabel);
    setStreetNote('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 id="location-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'ar' ? 'تحديد موقع التوصيل في قطر' : 'Delivery Location in Qatar'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lang === 'ar'
                ? 'يؤثر الموقع على توفر المطاعم، رسوم التوصيل، ووقت الوصول.'
                : 'Affects restaurant availability, delivery fees, delivery times, and local offers.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close location selector"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS Current Location Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={geoStatus === 'locating'}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <LocateFixed className="w-4 h-4" />
            <span>
              {geoStatus === 'locating'
                ? lang === 'ar'
                  ? 'جارٍ تحديد المنطقة...'
                  : 'Detecting nearest Doha zone...'
                : lang === 'ar'
                ? 'استخدام موقعي الحالي'
                : 'Use Current Location'}
            </span>
          </button>
          {geoStatus === 'denied' && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              {lang === 'ar'
                ? 'تم رفض إذن الموقع أو تعذر الوصول إليه. يرجى اختيار منطقتك يدوياً أدناه.'
                : 'Location permission denied or unavailable. Please choose your Qatar zone manually below.'}
            </p>
          )}
        </div>

        {/* Saved Locations: Home, Office, Other */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
            {lang === 'ar' ? 'العناوين المحفوظة' : 'Saved Locations (Home · Office · Other)'}
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {savedAddresses.map((addr) => {
              const zone = QATAR_ZONES.find((z) => z.id === addr.zoneId) || QATAR_ZONES[0];
              const isSelected =
                activeAddressLabel === addr.label && activeZone.id === addr.zoneId;
              const Icon =
                addr.label === 'Home' ? Home : addr.label === 'Office' ? Briefcase : MapPin;
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => {
                    onSelectLocation(addr.zoneId, addr.label);
                    onClose();
                  }}
                  className={`min-h-[56px] p-2.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                    isSelected
                      ? 'border-rose-600 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900 dark:text-white">
                    <Icon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">{addr.label}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                    {lang === 'ar' ? zone.nameAr : zone.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Qatar Zone Selection */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
            {lang === 'ar' ? 'اختر المنطقة يدوياً' : 'Select Qatar Area Manually'}
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {QATAR_ZONES.map((zone) => {
              const isCurrent = activeZone.id === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    onSelectLocation(zone.id, activeAddressLabel);
                    onClose();
                  }}
                  className={`w-full min-h-[48px] px-4 py-2.5 flex items-center justify-between text-sm transition-colors ${
                    isCurrent
                      ? 'bg-rose-50/80 dark:bg-rose-950/30 font-semibold text-rose-700 dark:text-rose-300'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span>{lang === 'ar' ? zone.nameAr : zone.nameEn}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                    {zone.cityEn} ·{' '}
                    {zone.extraMinutes === 0
                      ? 'Standard ETA'
                      : zone.extraMinutes > 0
                      ? `+${zone.extraMinutes}m ETA`
                      : `${zone.extraMinutes}m ETA`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Update a Saved Location (Home / Office / Other) */}
        <form onSubmit={handleAddSavedAddress} className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
            {lang === 'ar' ? 'تحديث عنوان محفوظ' : 'Update Saved Location'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              aria-label="Address Label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value as AddressLabel)}
              className="min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            >
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
            </select>
            <select
              aria-label="Qatar Zone"
              value={newZoneId}
              onChange={(e) => setNewZoneId(e.target.value)}
              className="min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white sm:col-span-2"
            >
              {QATAR_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.nameEn} ({z.cityEn})
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={streetNote}
              onChange={(e) => setStreetNote(e.target.value)}
              placeholder={lang === 'ar' ? 'ملاحظة اختيارية (مثال: برج 12)' : 'Optional note (e.g. Tower 12)'}
              className="flex-1 min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'ar' ? 'حفظ' : 'Save'}</span>
            </button>
          </div>
        </form>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {lang === 'ar'
              ? 'خصوصيتك محمية: لا يتم كشف إحداثيات موقعك الدقيقة لأي طرف خارجي.'
              : 'Privacy Protected: Exact GPS coordinates are never stored or exposed externally.'}
          </span>
        </div>
      </div>
    </div>
  );
};
