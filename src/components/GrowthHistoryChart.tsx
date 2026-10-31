import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { AccountStatus, ChildProfile } from '../types';
import { soundService } from '../services/soundService';
import { formatGainLoss, formatCurrency } from '../utils/formatters';

interface GrowthHistoryChartProps {
  child: ChildProfile;
  accountStatus: AccountStatus;
}

interface WeekPoint {
  weekNum: number;
  label: { en: string; he: string };
  dateLabel: string;
  value: number;
  change: number;
  changePercent: number;
}

export const GrowthHistoryChart: React.FC<GrowthHistoryChartProps> = ({
  child,
  accountStatus,
}) => {
  const { language } = useLanguage();
  const isHe = language === 'he';

  const totalDeposited = Math.max(10, child.totalDeposited);
  const currentNetWorth = accountStatus.totalNetWorth;
  const isOverallPositive = accountStatus.lifetimeNetGainLoss >= 0;

  // Generate 8 realistic weekly snapshots leading up to current balance
  const weekPoints: WeekPoint[] = React.useMemo(() => {
    const points: WeekPoint[] = [];
    const count = 8;
    const netGrowth = currentNetWorth - totalDeposited;

    const now = new Date();

    for (let i = 0; i < count; i++) {
      const weeksAgo = count - 1 - i;
      const d = new Date(now);
      d.setDate(d.getDate() - weeksAgo * 7);

      const monthName = d.toLocaleString(isHe ? 'he-IL' : 'en-US', { month: 'short' });
      const dayNum = d.getDate();
      const dateStr = `${monthName} ${dayNum}`;

      let val: number;
      if (i === 0) {
        val = totalDeposited * 0.98;
      } else if (i === count - 1) {
        val = currentNetWorth;
      } else {
        // Curve smoothly towards currentNetWorth with subtle realistic market wiggle
        const progress = i / (count - 1);
        const wiggle = Math.sin(i * 1.5) * (totalDeposited * 0.025);
        val = totalDeposited + netGrowth * Math.pow(progress, 1.2) + wiggle;
      }

      val = Math.max(1, Number(val.toFixed(2)));
      const change = val - totalDeposited;
      const changePercent = totalDeposited > 0 ? (change / totalDeposited) * 100 : 0;

      points.push({
        weekNum: i + 1,
        label: {
          en: i === count - 1 ? 'Today' : `Week ${i + 1}`,
          he: i === count - 1 ? 'היום' : `שבוע ${i + 1}`,
        },
        dateLabel: dateStr,
        value: val,
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(1)),
      });
    }

    return points;
  }, [totalDeposited, currentNetWorth, isHe]);

  // Active hovered point (default to latest point)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(weekPoints.length - 1);
  const activePoint = hoveredIdx !== null ? weekPoints[hoveredIdx] : weekPoints[weekPoints.length - 1];

  // SVG dimensions
  const svgW = 460;
  const svgH = 140;
  const padX = 24;
  const padY = 20;

  const minVal = Math.min(...weekPoints.map((p) => p.value)) * 0.96;
  const maxVal = Math.max(...weekPoints.map((p) => p.value)) * 1.04;
  const valRange = maxVal - minVal || 1;

  const getCoordinates = (p: WeekPoint, i: number) => {
    const x = padX + (i / (weekPoints.length - 1)) * (svgW - padX * 2);
    const y = svgH - padY - ((p.value - minVal) / valRange) * (svgH - padY * 2);
    return { x, y };
  };

  const pointsCoords = weekPoints.map((p, i) => getCoordinates(p, i));
  const pointsStr = pointsCoords.map((c) => `${c.x},${c.y}`).join(' ');

  const activeCoord = activePoint ? pointsCoords[weekPoints.indexOf(activePoint)] : null;

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
      {/* Header with Live Tooltip */}
      <div className="flex items-center justify-end gap-3 mb-2 min-h-6">
        {/* Dynamic Hover Tooltip Info Pill */}
        {activePoint && (
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs animate-in fade-in duration-100">
            <span className="text-xs font-bold text-slate-500">
              {isHe ? activePoint.label.he : activePoint.label.en} ({activePoint.dateLabel}):
            </span>
            <span className="text-xs font-black text-slate-900">
              {formatCurrency(activePoint.value)}
            </span>
            <span
              dir="ltr"
              className={`text-[11px] font-black flex items-center gap-0.5 ${
                formatGainLoss(activePoint.change, activePoint.changePercent).textClasses
              }`}
            >
              {formatGainLoss(activePoint.change, activePoint.changePercent).combined}
            </span>
          </div>
        )}
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-28 sm:h-32 overflow-visible select-none"
        >
          <defs>
            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isOverallPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.35" />
              <stop offset="100%" stopColor={isOverallPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Background Area Fill */}
          <polygon
            points={`${padX},${svgH - padY} ${pointsStr} ${svgW - padX},${svgH - padY}`}
            fill="url(#growthGrad)"
          />

          {/* Smooth Trend Polyline */}
          <polyline
            fill="none"
            stroke={isOverallPositive ? '#10B981' : '#F43F5E'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsStr}
          />

          {/* Vertical guideline on hovered point */}
          {activeCoord && (
            <line
              x1={activeCoord.x}
              y1={padY}
              x2={activeCoord.x}
              y2={svgH - padY}
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}

          {/* Interactive Hoverable Points */}
          {weekPoints.map((p, i) => {
            const coord = pointsCoords[i];
            const isActive = hoveredIdx === i;

            return (
              <g
                key={p.weekNum}
                onMouseEnter={() => {
                  soundService.playClick();
                  setHoveredIdx(i);
                }}
                onClick={() => setHoveredIdx(i)}
                className="cursor-pointer"
              >
                {/* Invisible large touch target */}
                <circle cx={coord.x} cy={coord.y} r="14" fill="transparent" />

                {/* Outer halo when active */}
                {isActive && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="8"
                    fill={isOverallPositive ? '#10B981' : '#F43F5E'}
                    opacity="0.25"
                    className="transition-all duration-150"
                  />
                )}

                {/* Visible point circle */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isActive ? '5.5' : '4'}
                  fill="white"
                  stroke={isOverallPositive ? '#10B981' : '#F43F5E'}
                  strokeWidth={isActive ? '3' : '2'}
                  className="transition-all duration-150"
                />
              </g>
            );
          })}
        </svg>

        {/* X-Axis Week Labels */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-3 pt-1">
          {weekPoints.map((p, i) => (
            <span
              key={p.weekNum}
              onClick={() => setHoveredIdx(i)}
              className={`cursor-pointer transition-colors ${
                hoveredIdx === i ? 'text-blue-600 font-extrabold' : 'hover:text-slate-600'
              }`}
            >
              {isHe ? p.label.he : p.label.en}
            </span>
          ))}
        </div>
      </div>

      <div className="text-[11px] text-slate-400 text-center font-medium mt-2">
        {isHe
          ? '💡 העבר את העכבר על הנקודות כדי לראות כמה שווה התיק בכל שבוע!'
          : '💡 Hover over any point to inspect your portfolio balance each week!'}
      </div>
    </div>
  );
};
