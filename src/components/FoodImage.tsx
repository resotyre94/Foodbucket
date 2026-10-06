import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

interface FoodImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const FoodImage: React.FC<FoodImageProps> = ({ src, alt, className = '' }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-rose-900/20 via-slate-800 to-slate-900 text-slate-300 p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-7 h-7 text-rose-500 mb-1.5 opacity-80" />
        <span className="text-xs font-medium line-clamp-2 max-w-[18ch]">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
};

export function formatQar(amount: number | null | undefined, showDecimals = false): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) {
    return 'Unavailable';
  }
  return showDecimals ? `QAR ${amount.toFixed(2)}` : `QAR ${Math.round(amount)}`;
}

export function formatRelativeSyncTime(
  iso: string | null,
  nowMs: number,
  isOffline: boolean,
  isDemoData: boolean,
  lang: 'en' | 'ar' = 'en'
): {
  shortLabel: string;
  clockLabel: string;
  isStale: boolean;
} {
  if (isOffline) {
    return {
      shortLabel: lang === 'ar' ? 'بيانات مخزنة مؤقتاً (غير متصل)' : 'Cached data (Offline)',
      clockLabel: 'Offline cache',
      isStale: true,
    };
  }

  if (!iso) {
    return {
      shortLabel: lang === 'ar' ? 'البيانات المباشرة غير متوفرة' : 'Live data unavailable',
      clockLabel: '--:--',
      isStale: true,
    };
  }

  const date = new Date(iso);
  const diffSec = Math.max(0, Math.floor((nowMs - date.getTime()) / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const clockLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const prefix = isDemoData ? (lang === 'ar' ? 'بيانات تجريبية · ' : 'DEMO DATA · ') : '';

  if (diffSec < 65) {
    return {
      shortLabel: `${prefix}${lang === 'ar' ? 'تمت المزامنة للتو' : 'Updated just now'}`,
      clockLabel,
      isStale: false,
    };
  }

  if (diffMin < 30) {
    return {
      shortLabel: `${prefix}${
        lang === 'ar' ? `تم التحديث منذ ${diffMin} دقيقة` : `Updated ${diffMin} min ago`
      }`,
      clockLabel,
      isStale: false,
    };
  }

  return {
    shortLabel: `${prefix}${
      lang === 'ar'
        ? `تم التحديث منذ ${diffMin} دقيقة · قد تكون البيانات قديمة`
        : `Updated ${diffMin} min ago · Data may be outdated`
    }`,
    clockLabel,
    isStale: true,
  };
}
