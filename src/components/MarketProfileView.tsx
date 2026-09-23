import React, { useState, useMemo } from "react";
import {
  BarChart2,
  Layers,
  ShieldAlert,
  Zap,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  SlidersHorizontal,
  Flame,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { FootprintBar, TpoMarketProfileReport } from "../types";
import { generateTpoMarketProfile } from "../services/marketProfileService";

interface MarketProfileViewProps {
  currentPrice: number;
  bars?: FootprintBar[];
}

export const MarketProfileView: React.FC<MarketProfileViewProps> = ({
  currentPrice,
  bars = [],
}) => {
  const [displayMode, setDisplayMode] = useState<"letters" | "blocks">("letters");
  const [selectedSession, setSelectedSession] = useState<"full" | "london" | "ny">("full");

  const report: TpoMarketProfileReport = useMemo(() => {
    return generateTpoMarketProfile(currentPrice, bars);
  }, [currentPrice, bars]);

  const {
    vah,
    val,
    poc,
    initialBalanceHigh,
    initialBalanceLow,
    initialBalanceRange,
    dayTypeAr,
    vwapBands,
    absorption,
    auctionBiasAr,
    keyActionRecommendationAr,
    levels,
  } = report;

  return (
    <div className="flex flex-col h-full bg-[#0a0e17] rounded-xl border border-slate-800/80 overflow-hidden select-none font-['Cairo'] text-slate-100">
      {/* Top Header / Stats Toolbar */}
      <div className="p-3 bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                بروفايل السوق المؤسسي (TPO Market Profile)
                <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30 font-mono">
                  Auction Theory
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-slate-400">
              نظرية المزاد • منطقة القيمة (70% Value Area) • قنوات الفاب والانحراف المعياري
            </p>
          </div>
        </div>

        {/* View Mode & Session Filters */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setDisplayMode("letters")}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
              displayMode === "letters"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            أحرف TPO
          </button>
          <button
            onClick={() => setDisplayMode("blocks")}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer font-bold ${
              displayMode === "blocks"
                ? "bg-violet-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            مدرج الحجم
          </button>
        </div>
      </div>

      {/* Main Content Area: Left/Top Auction Summary & Right/Bottom TPO Ladder */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Institutional Metrics, VWAP Bands & Trap Detector */}
        <div className="w-full lg:w-96 flex flex-col p-3 space-y-3 bg-[#0d121f] border-b lg:border-b-0 lg:border-r border-slate-800/80 overflow-y-auto shrink-0 text-xs">
          {/* Day Type & Auction Status Card */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-violet-500/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-bold">نمط يوم المزاد (Day Type):</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30 font-bold">
                {report.dayType}
              </span>
            </div>
            <div className="text-xs font-bold text-white leading-snug">{dayTypeAr}</div>
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              {auctionBiasAr}
            </div>
          </div>

          {/* Value Area Core Metrics (VAH / VAL / POC / IB) */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {/* VAH */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-500/30">
              <span className="text-[10px] text-rose-300 font-bold block">
                أعلى منطقة القيمة (VAH)
              </span>
              <span className="text-base font-black font-['JetBrains_Mono'] text-white">
                ${vah.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">حد المقاومة 70%</span>
            </div>

            {/* VAL */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/30">
              <span className="text-[10px] text-emerald-300 font-bold block">
                أدنى منطقة القيمة (VAL)
              </span>
              <span className="text-base font-black font-['JetBrains_Mono'] text-white">
                ${val.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">حد الدعم 70%</span>
            </div>

            {/* POC */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/30">
              <span className="text-[10px] text-amber-300 font-bold block">
                نقطة التحكم (TPO POC)
              </span>
              <span className="text-base font-black font-['JetBrains_Mono'] text-amber-300">
                ${poc.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">أعلى زمن تداول</span>
            </div>

            {/* Initial Balance */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-sky-500/30">
              <span className="text-[10px] text-sky-300 font-bold block">
                التوازن الأولي (IB Range)
              </span>
              <span className="text-base font-black font-['JetBrains_Mono'] text-sky-300">
                {initialBalanceRange.toFixed(1)}$
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">
                ${initialBalanceLow} - ${initialBalanceHigh}
              </span>
            </div>
          </div>

          {/* Institutional VWAP & Standard Deviation Bands */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                <span>قنوات الفاب والانحراف المعياري (VWAP Bands)</span>
              </span>
              <span
                className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  vwapBands.currentDeviation >= 0
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-rose-500/15 text-rose-300"
                }`}
              >
                {vwapBands.currentDeviation >= 0 ? "+" : ""}
                {vwapBands.currentDeviation}σ
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex items-center justify-between text-rose-400">
                <span>+2 StdDev (تشبع بيع):</span>
                <span>${vwapBands.upper2}</span>
              </div>
              <div className="flex items-center justify-between text-rose-300">
                <span>+1 StdDev (مقاومة أولى):</span>
                <span>${vwapBands.upper1}</span>
              </div>
              <div className="flex items-center justify-between text-sky-300 font-bold bg-sky-950/40 px-1.5 py-0.5 rounded">
                <span>خط الفاب المحوري (VWAP):</span>
                <span>${vwapBands.vwap}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-300">
                <span>-1 StdDev (دعم أول):</span>
                <span>${vwapBands.lower1}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span>-2 StdDev (تشبع شراء):</span>
                <span>${vwapBands.lower2}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-tight pt-1 border-t border-slate-800">
              {vwapBands.statusAr}
            </p>
          </div>

          {/* Institutional Trap & Absorption Detector */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#131124] to-[#0d0f1a] border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-amber-300 font-bold flex items-center gap-1.5 text-[11px]">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>كاشف المصائد والامتصاص (Absorption Detector)</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                {absorption.passiveAbsorptionRatio}% امتصاص
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block">مشترون محاصرون (Trapped Buyers)</span>
                <span className="text-rose-400 font-bold font-mono text-xs">
                  {absorption.trappedBuyersOz} Oz
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400 block">بائعون محاصرون (Trapped Sellers)</span>
                <span className="text-emerald-400 font-bold font-mono text-xs">
                  {absorption.trappedSellersOz} Oz
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-200 font-semibold leading-relaxed bg-slate-950/80 p-2 rounded-lg border border-slate-800">
              {absorption.trapSignalAr}
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>تطابق القوى المؤسسية (Confluence):</span>
              <span className="text-amber-400 font-bold font-mono">
                {absorption.confluenceScore}%
              </span>
            </div>
          </div>

          {/* Actionable Scenario Recommendation */}
          <div className="p-2.5 rounded-xl bg-violet-950/20 border border-violet-500/30 text-[11px] space-y-1">
            <div className="flex items-center gap-1 text-violet-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>خطة التنفيذ المؤسسية (Auction Playbook):</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {keyActionRecommendationAr}
            </p>
          </div>
        </div>

        {/* Right Column: Interactive TPO Auction Matrix Ladder */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#080b12]">
          {/* Ladder Legend */}
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-300 flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 font-mono text-[9px] text-black font-bold flex items-center justify-center">
                  AB
                </span>
                <span>فترات الـ IB الأولى</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-violet-600 font-mono text-[9px] text-white flex items-center justify-center">
                  VA
                </span>
                <span>منطقة القيمة (Value Area)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 font-mono text-[9px] text-black font-bold flex items-center justify-center">
                  P
                </span>
                <span>نقطة التحكم POC</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-amber-400"></span>
                <span>طبعات فردية (Single Prints)</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono">
              السعر اللحظي: <strong className="text-amber-400">${currentPrice.toFixed(2)}</strong>
            </div>
          </div>

          {/* TPO Matrix Rows (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 font-['JetBrains_Mono']">
            {levels.map((lvl) => {
              const isCurrent = Math.abs(currentPrice - lvl.price) < 0.25;
              const isVahLevel = Math.abs(lvl.price - vah) < 0.26;
              const isValLevel = Math.abs(lvl.price - val) < 0.26;

              return (
                <div
                  key={lvl.price}
                  className={`flex items-center text-xs py-0.5 px-2 rounded transition-all ${
                    lvl.isPoc
                      ? "bg-amber-500/20 border border-amber-500/50 shadow-xs"
                      : isCurrent
                      ? "bg-amber-400/25 border-l-4 border-amber-400"
                      : lvl.isValueArea
                      ? "bg-violet-950/25 hover:bg-violet-900/30"
                      : "hover:bg-slate-900/60"
                  }`}
                >
                  {/* Price Column */}
                  <div className="w-24 shrink-0 flex items-center gap-1">
                    <span
                      className={`font-bold ${
                        lvl.isPoc
                          ? "text-amber-300 font-extrabold"
                          : isCurrent
                          ? "text-white underline"
                          : lvl.isValueArea
                          ? "text-violet-200"
                          : "text-slate-400"
                      }`}
                    >
                      ${lvl.price.toFixed(2)}
                    </span>
                    {lvl.isPoc && (
                      <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1 rounded">
                        POC
                      </span>
                    )}
                    {isVahLevel && (
                      <span className="text-[9px] bg-rose-500 text-white font-black px-1 rounded">
                        VAH
                      </span>
                    )}
                    {isValLevel && (
                      <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1 rounded">
                        VAL
                      </span>
                    )}
                  </div>

                  {/* TPO Letters or Volume Bar */}
                  <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {displayMode === "letters" ? (
                      <div className="flex items-center gap-0.5 flex-wrap">
                        {lvl.letters.map((letter, idx) => {
                          const isIbLetter = letter === "A" || letter === "B";
                          return (
                            <span
                              key={idx}
                              className={`w-4 h-4 text-[10px] font-bold rounded flex items-center justify-center ${
                                lvl.isPoc
                                  ? "bg-amber-400 text-slate-950 shadow-xs"
                                  : isIbLetter
                                  ? "bg-sky-500 text-slate-950"
                                  : lvl.isValueArea
                                  ? "bg-violet-700 text-white"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {letter}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-full bg-slate-900 rounded-sm h-3.5 overflow-hidden flex items-center relative">
                        <div
                          style={{ width: `${Math.min(100, (lvl.volume / 800) * 100)}%` }}
                          className={`h-full ${
                            lvl.isPoc
                              ? "bg-amber-400"
                              : lvl.isValueArea
                              ? "bg-violet-600"
                              : "bg-slate-700"
                          }`}
                        />
                        <span className="absolute left-2 text-[9px] text-slate-200 font-bold">
                          {lvl.volume} Oz ({lvl.tpoCount} TPO)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Volume Tally */}
                  <div className="w-16 shrink-0 text-right text-[10px] text-slate-400">
                    {lvl.volume} Oz
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
