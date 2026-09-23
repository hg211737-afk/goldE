import React, { useState, useEffect } from "react";
import {
  Activity,
  BarChart2,
  ChartLine,
  Cpu,
  Crosshair,
  Flame,
  Layers,
  RotateCw,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { GoldQuote, Timeframe, ViewMode } from "../types";
import { PWAInstallButton } from "./PWAInstallButton";

interface HeaderProps {
  quote: GoldQuote;
  selectedSymbol?: string;
  onSymbolChange?: (sym: string) => void;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenAiModal: () => void;
  onOpenSettingsModal: () => void;
  onRefresh?: () => void;
  isAiLoading: boolean;
  activeLiquidityCount: number;
  connectionStatus?: {
    connected: boolean;
    latencyMs: number;
    source: string;
    updatesCount: number;
  };
  hasCustomApiKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  quote,
  timeframe,
  onTimeframeChange,
  viewMode,
  onViewModeChange,
  onOpenAiModal,
  onOpenSettingsModal,
  onRefresh,
  isAiLoading,
  connectionStatus,
  hasCustomApiKey,
}) => {
  const [prevPrice, setPrevPrice] = useState(quote.price);
  const [flashColor, setFlashColor] = useState<"up" | "down" | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    if (quote.price > prevPrice) {
      setFlashColor("up");
    } else if (quote.price < prevPrice) {
      setFlashColor("down");
    }
    const timer = setTimeout(() => setFlashColor(null), 800);
    setPrevPrice(quote.price);
    return () => clearTimeout(timer);
  }, [quote.price, prevPrice]);

  const handleManualRefresh = () => {
    setIsRotating(true);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRotating(false), 800);
  };

  const isPositive = quote.change24h >= 0;

  return (
    <header className="bg-[#0e131d] border-b border-slate-800/80 px-3 sm:px-4 py-2.5 text-slate-200 select-none">
      <div className="flex flex-col gap-2.5">
        {/* Top Row: Terminal Brand & Status (Matches Terminal Picture) */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            {/* Au Icon Badge */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/25 to-yellow-600/15 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-sm">
              <span className="text-base font-['JetBrains_Mono']">Au</span>
            </div>

            {/* Title & Terminal Details */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-base sm:text-lg tracking-tight text-white font-['JetBrains_Mono']">
                  XAU/USD
                </h1>

                {/* الذهب الفوري Badge */}
                <span className="text-[11px] font-semibold text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30">
                  الذهب الفوري
                </span>

                {/* Connection Live Dot Pill (Matching Terminal Picture) */}
                <div
                  className="flex items-center justify-center px-2 py-1 rounded-full bg-slate-900 border border-slate-800"
                  title={connectionStatus?.source || "بث مباشر حي (Live)"}
                >
                  <span
                    className={`w-2 h-2 rounded-full transition-all ${
                      connectionStatus?.connected !== false
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"
                        : "bg-amber-400"
                    }`}
                  />
                </div>

                {/* Refresh Icon Button ↻ (Matching Terminal Picture) */}
                <button
                  onClick={handleManualRefresh}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer active:scale-90"
                  title="تحديث الأسعار وتدفق الأوامر فوراً"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin text-amber-400" : ""}`} />
                </button>
              </div>

              {/* Subtitle from Picture */}
              <div className="text-[11px] text-slate-400 font-medium tracking-wide">
                Order Flow &amp; Liquidity Terminal
              </div>
            </div>
          </div>

          {/* Quick Right-Side Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAiModal}
              disabled={isAiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Cpu className={`w-3.5 h-3.5 ${isAiLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">تحليل الذكاء</span>
              <span className="sm:hidden">ذكاء AI</span>
            </button>

            <PWAInstallButton />

            <button
              onClick={onOpenSettingsModal}
              className="relative p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="إعدادات المنصة ومفتاح Gemini الذكي"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {hasCustomApiKey && (
                <span
                  className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#111622] animate-pulse"
                  title="مفتاح الذكاء الاصطناعي مفعّل"
                />
              )}
            </button>
          </div>
        </div>

        {/* Second Row: Prominent Terminal Price Card (Exact Picture Design) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#0a0e17] border border-slate-800/90 rounded-xl p-2.5 shadow-inner">
          {/* Main Price & Percentage Badge */}
          <div
            className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all duration-300 font-['JetBrains_Mono'] ${
              flashColor === "up"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : flashColor === "down"
                ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                : "bg-slate-900/80 border-slate-800 text-white"
            }`}
          >
            {/* Big Bold Live Price */}
            <div id="price" className="text-2xl sm:text-3xl font-black tracking-tight" title={`سعر الذهب: $${quote.price}`}>
              ${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {/* Change % and Direction Arrow (Matching Screenshot format: 1.03%- ↘) */}
            <div className="flex flex-col text-xs leading-tight">
              <span className={`font-bold flex items-center gap-0.5 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{quote.changePercent24h.toFixed(2)}%</span>
                <span>{isPositive ? "+" : "-"}</span>
              </span>
              <span className="text-[11px] text-slate-400">
                {isPositive ? "+" : ""}${quote.change24h.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Institutional Depth & Spread Snapshot */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-['JetBrains_Mono'] flex-wrap">
            <div>
              <span className="text-slate-400 text-[10px] block">طلب (Bid)</span>
              <span className="text-emerald-400 font-semibold">${quote.bid.toFixed(2)}</span>
            </div>
            <div className="w-[1px] h-6 bg-slate-800" />
            <div>
              <span className="text-slate-400 text-[10px] block">عرض (Ask)</span>
              <span className="text-rose-400 font-semibold">${quote.ask.toFixed(2)}</span>
            </div>
            <div className="w-[1px] h-6 bg-slate-800" />
            <div>
              <span className="text-slate-400 text-[10px] block">سبريد (Spread)</span>
              <span className="text-amber-300 font-medium">${quote.spread.toFixed(2)}</span>
            </div>
            <div className="hidden md:block w-[1px] h-6 bg-slate-800" />
            <div className="hidden md:block">
              <span className="text-slate-400 text-[10px] block">أعلى 24h</span>
              <span className="text-slate-200">${quote.high24h.toFixed(2)}</span>
            </div>
            <div className="hidden md:block w-[1px] h-6 bg-slate-800" />
            <div className="hidden md:block">
              <span className="text-slate-400 text-[10px] block">أدنى 24h</span>
              <span className="text-slate-200">${quote.low24h.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Third Row: Timeframes & Mode Selectors */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Timeframe Pills */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
            {(["1m", "3m", "5m", "15m", "1h", "4h"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all font-['JetBrains_Mono'] ${
                  timeframe === tf
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 flex-wrap">
            <button
              onClick={() => onViewModeChange("signals")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                viewMode === "signals"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm font-bold"
                  : "text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60"
              }`}
              title="التوصيات القناصة فائقة الدقة (Sniper Precision Signals)"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>التوصيات القناصة</span>
            </button>
            <button
              onClick={() => onViewModeChange("footprint")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                viewMode === "footprint"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="شارت تدفق الأوامر الفوت برنت"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>فوت برنت</span>
            </button>
            <button
              onClick={() => onViewModeChange("heatmap")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                viewMode === "heatmap"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="هيت ماب السيولة"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>هيت ماب</span>
            </button>
            <button
              onClick={() => onViewModeChange("cvd")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                viewMode === "cvd"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="CVD ودلتا الحجم"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>CVD</span>
            </button>
            <button
              onClick={() => onViewModeChange("marketprofile")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                viewMode === "marketprofile"
                  ? "bg-violet-600 text-white shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="بروفايل السوق TPO ومستويات الـ Value Area والفاب المؤسسي"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>بروفايل TPO</span>
            </button>
            <button
              onClick={() => onViewModeChange("optionflow")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                viewMode === "optionflow"
                  ? "bg-amber-500 text-slate-950 shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="أوبشن فلو وتدفق الخيارات المؤسسية"
            >
              <span>أوبشن فلو</span>
            </button>
            <button
              onClick={() => onViewModeChange("futures")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                viewMode === "futures"
                  ? "bg-indigo-600 text-white shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="العقود الآجلة وفروق الأسعار"
            >
              <span>الفيوتشر</span>
            </button>
            <button
              onClick={() => onViewModeChange("tradingview")}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer ${
                viewMode === "tradingview"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
              title="تريدنج فيو المباشر"
            >
              <ChartLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تريدنج فيو</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
