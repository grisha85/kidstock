import React, { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { StockInfo } from '../types';
import { Calendar } from 'lucide-react';
import { soundService } from '../services/soundService';
import { formatGainLoss, formatCurrency } from '../utils/formatters';

interface StockMonthChartProps {
  stock: StockInfo;
}

interface MonthDataPoint {
  index: number;
  dateLabel: string;
  price: number;
}

export const StockMonthChart: React.FC<StockMonthChartProps> = ({ stock }) => {
  const { language } = useLanguage();
  const isHe = language === 'he';

  const basePrice = stock.currentPrice;

  // Generate 16 realistic daily/weekly closing prices over the past 30 days
  const points: MonthDataPoint[] = useMemo(() => {
    const list: MonthDataPoint[] = [];
    const count = 16;
    const now = new Date();

    // Overall trend roughly aligns with stock.dailyChangePercent or realistic monthly momentum
    const monthlyTrendPct = (stock.dailyChangePercent * 1.8) + (stock.peRatio > 25 ? 4.5 : 2.0);
    const startPrice = Math.max(1, basePrice / (1 + monthlyTrendPct / 100));

    for (let i = 0; i < count; i++) {
      const daysAgo = Math.round(((count - 1 - i) / (count - 1)) * 30);
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);

      const monthName = d.toLocaleString(isHe ? 'he-IL' : 'en-US', { month: 'short' });
      const dayNum = d.getDate();
      const dateStr = i === count - 1 ? (isHe ? 'היום' : 'Today') : `${monthName} ${dayNum}`;

      let p: number;
      if (i === 0) {
        p = startPrice;
      } else if (i === count - 1) {
        p = basePrice;
      } else {
        const progress = i / (count - 1);
        const wave = Math.sin(i * 1.1) * (basePrice * 0.022);
        p = startPrice + (basePrice - startPrice) * progress + wave;
      }

      list.push({
        index: i,
        dateLabel: dateStr,
        price: Number(p.toFixed(2)),
      });
    }

    return list;
  }, [basePrice, stock.dailyChangePercent, stock.peRatio, isHe]);

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(points.length - 1);
  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  const firstPrice = points[0]?.price || basePrice;
  const monthGainDollars = basePrice - firstPrice;
  const isMonthPositive = monthGainDollars >= 0;

  // Active point change relative to month start
  const activeDiff = activePoint ? activePoint.price - firstPrice : monthGainDollars;
  const activeDiffPct = firstPrice > 0 ? (activeDiff / firstPrice) * 100 : 0;

  // SVG dimensions
  const svgW = 420;
  const svgH = 110;
  const padX = 16;
  const padY = 16;

  const minP = Math.min(...points.map((p) => p.price)) * 0.98;
  const maxP = Math.max(...points.map((p) => p.price)) * 1.02;
  const rangeP = maxP - minP || 1;

  const getCoord = (p: MonthDataPoint, i: number) => {
    const x = padX + (i / (points.length - 1)) * (svgW - padX * 2);
    const y = svgH - padY - ((p.price - minP) / rangeP) * (svgH - padY * 2);
    return { x, y };
  };

  const coords = points.map((p, i) => getCoord(p, i));
  const pointsStr = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const activeCoord = activePoint ? coords[points.indexOf(activePoint)] : null;

  return (
    <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/90 shadow-xs mb-4">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>{isHe ? 'ביצועי חודש אחרון (1M):' : 'Last Month Performance (1M):'}</span>
        </div>

        {/* Live Hover Tooltip / Month Gain */}
        <div className="flex items-center gap-2 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500">
            {activePoint.dateLabel}:
          </span>
          <span className="text-xs font-black text-slate-900">
            {formatCurrency(activePoint.price)}
          </span>
          <span
            dir="ltr"
            className={`text-[11px] font-black flex items-center ${
              formatGainLoss(activeDiff, activeDiffPct).textClasses
            }`}
          >
            {formatGainLoss(activeDiff, activeDiffPct).combined}
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-24 overflow-visible select-none"
        >
          <defs>
            <linearGradient id={`stockGrad_${stock.ticker}`} x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={isMonthPositive ? '#10B981' : '#F43F5E'}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={isMonthPositive ? '#10B981' : '#F43F5E'}
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <polygon
            points={`${padX},${svgH - padY} ${pointsStr} ${svgW - padX},${svgH - padY}`}
            fill={`url(#stockGrad_${stock.ticker})`}
          />

          {/* Line */}
          <polyline
            fill="none"
            stroke={isMonthPositive ? '#10B981' : '#F43F5E'}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsStr}
          />

          {/* Guideline */}
          {activeCoord && (
            <line
              x1={activeCoord.x}
              y1={padY}
              x2={activeCoord.x}
              y2={svgH - padY}
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* Points */}
          {points.map((p, i) => {
            const coord = coords[i];
            const isActive = hoveredIdx === i;

            return (
              <g
                key={p.index}
                onMouseEnter={() => {
                  soundService.playClick();
                  setHoveredIdx(i);
                }}
                onClick={() => setHoveredIdx(i)}
                className="cursor-pointer"
              >
                <circle cx={coord.x} cy={coord.y} r="12" fill="transparent" />
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isActive ? '5' : '3'}
                  fill="white"
                  stroke={isMonthPositive ? '#10B981' : '#F43F5E'}
                  strokeWidth={isActive ? '2.5' : '1.5'}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-2 pt-0.5">
          <span>{isHe ? 'לפני 30 יום' : '30 Days Ago'}</span>
          <span>{isHe ? 'לפני שבועיים' : '2 Weeks Ago'}</span>
          <span className="text-blue-600 font-extrabold">{isHe ? 'היום' : 'Today'}</span>
        </div>
      </div>
    </div>
  );
};
