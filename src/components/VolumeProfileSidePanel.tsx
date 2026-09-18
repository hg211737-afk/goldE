import React, { useState, useMemo } from 'react';
import { FootprintBar, VolumeProfileData, VolumeProfileLevel } from '../types';
import { calculateVolumeProfile, ProfileRangeOption } from '../services/volumeProfileService';
import {
  BarChart2,
  Sliders,
  ShieldAlert,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  HelpCircle,
  TrendingUp,
  Activity,
  Bookmark,
} from 'lucide-react';

interface VolumeProfileSidePanelProps {
  bars: FootprintBar[];
  currentPrice: number;
  tickSize?: number;
}

export const VolumeProfileSidePanel: React.FC<VolumeProfileSidePanelProps> = ({
  bars,
  currentPrice,
  tickSize = 0.5,
}) => {
  const [rangeOption, setRangeOption] = useState<ProfileRangeOption>('SESSION');
  const [displayFilter, setDisplayFilter] = useState<'ALL' | 'HVN_ONLY' | 'VALUE_AREA'>('ALL');
  const [hoveredLevel, setHoveredLevel] = useState<VolumeProfileLevel | null>(null);

  // Compute Volume Profile based on selected range and bars
  const profile: VolumeProfileData = useMemo(() => {
    return calculateVolumeProfile(bars, currentPrice, rangeOption, tickSize);
  }, [bars, currentPrice, rangeOption, tickSize]);

  // Max volume for scaling bars
  const maxVolume = useMemo(() => {
    if (profile.levels.length === 0) return 1;
    return Math.max(...profile.levels.map((l) => l.volume), 1);
  }, [profile.levels]);

  // Filtered levels based on user display filter
  const displayedLevels = useMemo(() => {
    if (displayFilter === 'HVN_ONLY') {
      return profile.levels.filter((l) => l.isPOC || l.nodeType === 'HVN');
    }
    if (displayFilter === 'VALUE_AREA') {
      return profile.levels.filter((l) => l.isInValueArea);
    }
    return profile.levels;
  }, [profile.levels, displayFilter]);

  return (
    <div className="flex flex-col h-full bg-[#111622] rounded-xl border border-slate-800/80 overflow-hidden select-none font-['Cairo'] text-slate-100">
      {/* Header Bar */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-1.5">
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BarChart2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">بروفايل الحجم (Volume Profile)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-amber-500/20 text-amber-300 font-bold">
                Fixed Range
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block leading-tight">
              كشف كتل الحجم العالي (HVNs) كمستويات دعم ومقاومة
            </span>
          </div>
        </div>

        {/* Range Selector Pills */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-[10px]">
          <button
            onClick={() => setRangeOption('SESSION')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              rangeOption === 'SESSION'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="حساب كامل الجلسة المتاحة"
          >
            الجلسة
          </button>
          <button
            onClick={() => setRangeOption('LAST_20')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              rangeOption === 'LAST_20'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="آخر 20 شمعة فوت برنت"
          >
            20 شمعة
          </button>
          <button
            onClick={() => setRangeOption('LAST_10')}
            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              rangeOption === 'LAST_10'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
            title="آخر 10 شمعات فوت برنت"
          >
            10 شمعات
          </button>
        </div>
      </div>

      {/* Institutional Key Metrics Strip */}
      <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#0c101a] border-b border-slate-800/80 text-center">
        {/* POC (Point of Control) */}
        <div className="p-1.5 rounded-lg bg-amber-950/20 border border-amber-500/30 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
            <Target className="w-3 h-3" />
            <span>نقطة التحكم (POC)</span>
          </div>
          <span className="text-xs font-bold font-['JetBrains_Mono'] text-amber-300 mt-0.5">
            ${profile.pocPrice.toFixed(2)}
          </span>
          <span className="text-[9px] text-slate-400">
            {profile.pocVolume.toLocaleString()} عقد
          </span>
        </div>

        {/* VAH (Value Area High) */}
        <div className="p-1.5 rounded-lg bg-rose-950/20 border border-rose-500/30 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-[10px] text-rose-300 font-bold">
            <ArrowUpRight className="w-3 h-3 text-rose-400" />
            <span>أعلى القيمة (VAH)</span>
          </div>
          <span className="text-xs font-bold font-['JetBrains_Mono'] text-rose-200 mt-0.5">
            ${profile.vahPrice.toFixed(2)}
          </span>
          <span className="text-[9px] text-slate-400">مقاومة 70%</span>
        </div>

        {/* VAL (Value Area Low) */}
        <div className="p-1.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-bold">
            <ArrowDownRight className="w-3 h-3 text-emerald-400" />
            <span>أدنى القيمة (VAL)</span>
          </div>
          <span className="text-xs font-bold font-['JetBrains_Mono'] text-emerald-200 mt-0.5">
            ${profile.valPrice.toFixed(2)}
          </span>
          <span className="text-[9px] text-slate-400">دعم 70%</span>
        </div>
      </div>

      {/* Strategic Market Analysis Banner */}
      <div className="px-2.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-[11px] flex items-start gap-1.5 text-slate-300 leading-snug">
        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span>{profile.summaryText}</span>
          <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-['JetBrains_Mono']">
            <span>إجمالي الحجم: <strong className="text-slate-200">{profile.totalVolume.toLocaleString()}</strong></span>
            <span>صافي الدلتا: <strong className={profile.totalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {profile.totalDelta >= 0 ? `+${profile.totalDelta}` : profile.totalDelta}
            </strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="px-2.5 py-1 bg-[#0e1320] border-b border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">التصفية:</span>
          <button
            onClick={() => setDisplayFilter('ALL')}
            className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
              displayFilter === 'ALL'
                ? 'bg-slate-700 text-white font-bold'
                : 'hover:text-slate-200'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setDisplayFilter('HVN_ONLY')}
            className={`px-1.5 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1 ${
              displayFilter === 'HVN_ONLY'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                : 'hover:text-amber-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>عقد HVN فقط</span>
          </button>
          <button
            onClick={() => setDisplayFilter('VALUE_AREA')}
            className={`px-1.5 py-0.5 rounded cursor-pointer transition-all flex items-center gap-1 ${
              displayFilter === 'VALUE_AREA'
                ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                : 'hover:text-blue-300'
            }`}
          >
            <span>منطقة القيمة (VA)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-emerald-500/80"></span>
            <span className="text-[9px]">شراء</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-rose-500/80"></span>
            <span className="text-[9px]">بيع</span>
          </div>
        </div>
      </div>

      {/* Volume Profile Ladder / Histogram List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {displayedLevels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 p-4">
            <Activity className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
            <span className="text-xs">جاري جمع بيانات تداولات الحجم لبروفايل النطاق...</span>
          </div>
        ) : (
          displayedLevels.map((lvl) => {
            const isLivePrice = Math.abs(currentPrice - lvl.price) < tickSize * 0.7;
            const widthPct = Math.min(100, Math.max(4, (lvl.volume / maxVolume) * 100));
            const buyPct = lvl.volume > 0 ? (lvl.askVolume / lvl.volume) * 100 : 50;
            const sellPct = 100 - buyPct;

            // Support or Resistance categorization based on price position
            const isSupport = lvl.price < currentPrice;
            const isResistance = lvl.price > currentPrice;

            return (
              <div
                key={lvl.price}
                onMouseEnter={() => setHoveredLevel(lvl)}
                onMouseLeave={() => setHoveredLevel(null)}
                className={`relative px-2 py-1 rounded-md border transition-all cursor-pointer ${
                  lvl.isPOC
                    ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : isLivePrice
                    ? 'bg-yellow-400/20 border-yellow-300'
                    : lvl.nodeType === 'HVN'
                    ? 'bg-slate-800/80 border-amber-500/40'
                    : lvl.nodeType === 'LVN'
                    ? 'bg-slate-900/40 border-slate-800/50 opacity-70'
                    : 'bg-slate-900/60 border-slate-800/60 hover:border-slate-700'
                }`}
              >
                {/* Horizontal Volume Profile Dual Bar (Buy vs Sell volume) */}
                <div
                  className="absolute inset-y-0 right-0 rounded-r-md pointer-events-none opacity-25 overflow-hidden flex"
                  style={{ width: `${widthPct}%` }}
                >
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${sellPct}%` }}
                    title={`بيع: ${lvl.bidVolume}`}
                  />
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${buyPct}%` }}
                    title={`شراء: ${lvl.askVolume}`}
                  />
                </div>

                {/* Level Text & Indicators */}
                <div className="relative z-10 flex items-center justify-between text-xs">
                  {/* Price & Badges */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-['JetBrains_Mono'] font-bold ${
                        lvl.isPOC
                          ? 'text-amber-300'
                          : isLivePrice
                          ? 'text-yellow-300 font-extrabold'
                          : lvl.nodeType === 'HVN'
                          ? 'text-amber-200'
                          : 'text-slate-200'
                      }`}
                    >
                      ${lvl.price.toFixed(2)}
                    </span>

                    {/* Node Labels */}
                    {lvl.isPOC && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-500 text-slate-950">
                        POC
                      </span>
                    )}

                    {lvl.isVAH && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        VAH
                      </span>
                    )}

                    {lvl.isVAL && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        VAL
                      </span>
                    )}

                    {lvl.nodeType === 'HVN' && !lvl.isPOC && (
                      <span
                        className={`px-1.5 py-0.2 text-[9px] font-bold rounded border ${
                          isResistance
                            ? 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                            : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {isResistance ? 'مقاومة HVN' : 'دعم HVN'}
                      </span>
                    )}

                    {lvl.nodeType === 'LVN' && (
                      <span className="px-1 py-0.2 text-[8px] rounded bg-slate-800 text-slate-400 border border-slate-700">
                        فراغ LVN
                      </span>
                    )}

                    {isLivePrice && (
                      <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping inline-block" />
                    )}
                  </div>

                  {/* Volume and Delta metrics */}
                  <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-[11px]">
                    <span className="text-slate-300 font-semibold">
                      {lvl.volume.toLocaleString()}
                    </span>

                    <span
                      className={`text-[10px] font-bold ${
                        lvl.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {lvl.delta >= 0 ? `+${lvl.delta}` : lvl.delta}
                    </span>

                    <span className="text-[9px] text-slate-500 w-8 text-left">
                      {lvl.percentage}%
                    </span>
                  </div>
                </div>

                {/* Hover Detail Card */}
                {hoveredLevel?.price === lvl.price && (
                  <div className="mt-1 pt-1 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-['JetBrains_Mono']">
                    <span>
                      شراء عارض (Ask): <strong className="text-emerald-400">{lvl.askVolume}</strong>
                    </span>
                    <span>
                      بيع طالب (Bid): <strong className="text-rose-400">{lvl.bidVolume}</strong>
                    </span>
                    <span className="text-slate-300">
                      {lvl.isInValueArea ? 'ضمن منطقة القيمة 70%' : 'خارج منطقة القيمة'}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Top HVNs Strategic Summary */}
      {profile.hvnNodes.length > 0 && (
        <div className="p-2 bg-[#0d121c] border-t border-slate-800 text-[10px]">
          <div className="flex items-center justify-between mb-1 text-slate-400">
            <span className="font-bold text-amber-400 flex items-center gap-1">
              <Bookmark className="w-3 h-3" />
              أبرز عقد الحجم المؤسسية (Key HVNs):
            </span>
            <span>نقاط دعم/مقاومة مرجعية</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {profile.hvnNodes.map((hvn) => {
              const isAbove = hvn.price > currentPrice;
              return (
                <div
                  key={hvn.price}
                  className={`px-2 py-0.5 rounded-md border flex items-center gap-1 font-['JetBrains_Mono'] font-bold ${
                    hvn.isPOC
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : isAbove
                      ? 'bg-rose-950/30 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  <span>${hvn.price.toFixed(2)}</span>
                  <span className="text-[8px] opacity-75">
                    ({hvn.volume})
                  </span>
                  <span className="text-[9px] font-['Cairo']">
                    {hvn.isPOC ? 'POC' : isAbove ? 'مقاومة' : 'دعم'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
