import React, { useState } from 'react';
import { Check, Copy, ExternalLink, ShieldCheck, Smartphone, X } from 'lucide-react';
import { ACTIVE_PLATFORMS } from '../providers/ProviderSystem';
import { PlatformId, PlatformQuote } from '../types/food';
import { formatQar } from './FoodImage';

export interface OrderRedirectPayload {
  dishName: string;
  restaurantName: string;
  platformId: PlatformId;
  quote: PlatformQuote;
  isDemoData: boolean;
}

interface OrderRedirectModalProps {
  payload: OrderRedirectPayload | null;
  onClose: () => void;
  lang: 'en' | 'ar';
}

export const OrderRedirectModal: React.FC<OrderRedirectModalProps> = ({
  payload,
  onClose,
  lang,
}) => {
  const [copiedPromo, setCopiedPromo] = useState(false);

  if (!payload) return null;

  const platform = ACTIVE_PLATFORMS.find((p) => p.id === payload.platformId)!;
  const { quote, dishName, restaurantName, isDemoData } = payload;

  const handleCopyPromo = async () => {
    if (!quote.promoCode) return;
    try {
      await navigator.clipboard.writeText(quote.promoCode);
      setCopiedPromo(true);
      setTimeout(() => setCopiedPromo(false), 2000);
    } catch {
      setCopiedPromo(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
    >
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {lang === 'ar' ? 'التوجيه المباشر إلى تطبيق التوصيل' : 'Direct Platform Hand-off'}
              {isDemoData ? ' · DEMO DATA' : ''}
            </p>
            <h3 id="order-modal-title" className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {lang === 'ar' ? `الطلب عبر ${platform.nameAr}` : `Order on ${platform.name}`}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              {dishName} · {restaurantName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Itemized Total Calculation */}
        <div className="py-4 space-y-2.5 text-sm border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>{lang === 'ar' ? 'سعر الوجبة' : 'Food price'}</span>
            <span className="font-mono-num">{formatQar(quote.foodPrice, true)}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>{lang === 'ar' ? 'رسوم التوصيل' : 'Delivery fee'}</span>
            <span className="font-mono-num">
              {quote.deliveryFee === null
                ? 'Unavailable'
                : quote.deliveryFee === 0
                ? 'FREE (QAR 0.00)'
                : formatQar(quote.deliveryFee, true)}
            </span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>{lang === 'ar' ? 'رسوم الخدمة' : 'Service fee'}</span>
            <span className="font-mono-num">
              {quote.serviceFee === null ? 'Unavailable' : formatQar(quote.serviceFee, true)}
            </span>
          </div>
          {quote.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
              <span>
                {lang === 'ar' ? 'الخصم / العرض المتاح' : 'Discount / Offer'} ({quote.offerLabel})
              </span>
              <span className="font-mono-num">- {formatQar(quote.discountAmount, true)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
            <span className="font-semibold text-slate-900 dark:text-white">
              {lang === 'ar' ? 'الإجمالي التقديري' : 'Estimated Total'}
            </span>
            <span className="text-xl font-bold font-mono-num text-rose-600 dark:text-rose-400">
              {quote.estimatedTotal !== null
                ? formatQar(quote.estimatedTotal, true)
                : 'Final total unavailable'}
            </span>
          </div>
        </div>

        {/* Promo code copy box if available */}
        {quote.promoCode && (
          <div className="mt-4 flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/70">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'ar' ? 'كود الخصم عند الدفع' : 'Apply promo code at checkout'}
              </p>
              <p className="font-mono-num font-bold text-sm text-slate-900 dark:text-white">
                {quote.promoCode}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyPromo}
              className="min-h-[44px] px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              {copiedPromo ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{lang === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'نسخ الكود' : 'Copy Code'}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Action links: Official App Deep Link + Official Web Link */}
        <div className="mt-5 space-y-2.5">
          <a
            href={quote.orderWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <span>
              {lang === 'ar'
                ? `افتح موقع ${platform.nameAr} الرسمي`
                : `Open ${platform.name} Official Website`}
            </span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href={quote.orderDeepLink}
            onClick={onClose}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <Smartphone className="w-4 h-4" />
            <span>
              {lang === 'ar'
                ? `فتح في تطبيق ${platform.nameAr} (${quote.orderDeepLink.split('?')[0]})`
                : `Launch ${platform.name} App Deep Link (${quote.orderDeepLink.split('?')[0]})`}
            </span>
          </a>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p>
            {lang === 'ar'
              ? 'تطبيق Food Bucket لا يجمع كلمات المرور ولا يعالج المدفوعات. يتم إتمام الطلب بأمان داخل المنصة الرسمية المختارة.'
              : 'Food Bucket never collects delivery passwords or payment details. Your order completes directly on the official provider.'}
          </p>
        </div>
      </div>
    </div>
  );
};
