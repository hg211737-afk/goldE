import React from 'react';
import { LiquidityZone } from '../types';
import { Target, ShieldAlert, Sparkles, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface LiquidityZonesListProps {
  zones: LiquidityZone[];
  currentPrice: number;
}

export const LiquidityZonesList: React.FC<LiquidityZonesListProps> = ({ zones, currentPrice }) => {
  return (
    <div className="flex flex-col h-full bg-[#111622] rounded-xl border border-slate-800/80 overflow-hidden select-none">
      {/* Header */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Target className="w-3.5 h-3.5 text-amber-400" />
          <span>رادار كشف مناطق السيولة (Liquidity Pools Radar)</span>
        </div>
        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
          {zones.length} مناطق نشطة
        </span>
      </div>

      {/* Zones List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {zones.map((zone) => {
          const isAbove = zone.priceBottom > currentPrice;
          const distance = Math.abs(currentPrice - (zone.priceTop + zone.priceBottom) / 2);
          const pips = (distance * 10).toFixed(0);

          let badgeColor = '';
          let typeLabel = '';
          if (zone.type === 'BSL') {
            badgeColor = 'bg-rose-500/15 border-rose-500/30 text-rose-300';
            typeLabel = 'سيولة شراء علوية (BSL)';
          } else if (zone.type === 'SSL') {
            badgeColor = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
            typeLabel = 'سيولة بيع سفلية (SSL)';
          } else {
            badgeColor = 'bg-amber-500/15 border-amber-500/30 text-amber-300';
            typeLabel = 'فجوة قيمة عادلة (FVG)';
          }

          return (
            <div
              key={zone.id}
              className={`p-2.5 rounded-lg border transition-all ${
                zone.status === 'swept'
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900/80 border-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                  {typeLabel}
                </span>

                <span className="text-[11px] font-['JetBrains_Mono'] text-slate-300 flex items-center gap-1">
                  {isAbove ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  يبعد {distance.toFixed(2)}$ ({pips} نقطة)
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-semibold text-white">{zone.nameAr}</span>
                <span className="font-['JetBrains_Mono'] text-xs font-bold text-amber-300">
                  ${zone.priceBottom.toFixed(2)} - ${zone.priceTop.toFixed(2)}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
                {zone.description}
              </p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  حجم السيولة التقديري:{' '}
                  <strong className="text-slate-200 font-['JetBrains_Mono']">
                    {zone.volumeCluster} Lot
                  </strong>
                </span>

                <span
                  className={`font-semibold ${
                    zone.status === 'swept'
                      ? 'text-rose-400'
                      : zone.status === 'mitigated'
                      ? 'text-slate-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {zone.status === 'swept'
                    ? '⚠️ تم سحب السيولة (Swept)'
                    : zone.status === 'mitigated'
                    ? '✓ تم التخفيف'
                    : '🎯 هدف نشط (Untested)'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
