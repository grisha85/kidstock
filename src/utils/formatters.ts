/**
 * Standardized money, gain/loss, and percentage formatting utilities for KidStock
 */

export interface FormattedGainLoss {
  isPositive: boolean;
  isZero: boolean;
  amountFormatted: string; // e.g. "+$1.57", "-$0.04", "$0.00"
  percentFormatted: string; // e.g. "+7.5%", "-0.2%", "0.0%"
  combined: string; // e.g. "+$1.57 (+7.5%)"
  badgeClasses: string; // CSS classes for badges/pills
  textClasses: string; // CSS classes for plain text
}

export function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toFixed(2)}`;
}

/**
 * Consistently format Gain/Loss values with correct minus signs, plus signs, and currencies.
 * Prevents glitchy combinations like "$-0.04" -> ensures "-$0.04" or "+$1.57".
 */
export function formatGainLoss(amount: number, percent?: number): FormattedGainLoss {
  const isZero = Math.abs(amount) < 0.005;
  const isPositive = amount > 0 && !isZero;

  const sign = isPositive ? '+' : amount < 0 ? '-' : '';
  const absAmount = Math.abs(amount).toFixed(2);
  // Prepend \u200E (LTR mark) to lock standard financial notation regardless of RTL context
  const amountFormatted = `\u200E${sign}$${absAmount}`;

  let percentFormatted = '';
  if (percent !== undefined) {
    const pSign = percent > 0 && Math.abs(percent) >= 0.05 ? '+' : percent < 0 ? '-' : '';
    const absPercent = Math.abs(percent).toFixed(1);
    percentFormatted = `\u200E${pSign}${absPercent}%`;
  }

  const combined = percentFormatted ? `${amountFormatted} (${percentFormatted})` : amountFormatted;

  const badgeClasses = isPositive
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold'
    : amount < 0
    ? 'bg-rose-50 text-rose-700 border border-rose-200/80 font-bold'
    : 'bg-slate-50 text-slate-600 border border-slate-200/80 font-bold';

  const textClasses = isPositive
    ? 'text-emerald-600 font-bold'
    : amount < 0
    ? 'text-rose-600 font-bold'
    : 'text-slate-600 font-bold';

  return {
    isPositive,
    isZero,
    amountFormatted,
    percentFormatted,
    combined,
    badgeClasses,
    textClasses,
  };
}
