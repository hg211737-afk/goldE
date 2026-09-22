import React, { useState, useEffect } from "react";
import {
  Activity,
  ChartLine,
  Cpu,
  Flame,
  Layers,
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
  isAiLoading,
  activeLiquidityCount,
  connectionStatus,
  hasCustomApiKey,
}) => {
  const [prevPrice, setPrevPrice] = useState(quote.price);
  const [flashColor, setFlashColor] = useState<"up" | "down" | null>(null);

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

  const isPositive = quote.change24h >= 0;

  return (
    <header className="bg-[#111622] border-b border-slate-800/80 px-4 py-2.5 text-slate-200 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/25 to-yellow-600/15 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-sm">
              <span className="text-base font-['JetBrains_Mono']">Au</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 font-['JetBrains_Mono']">
                  XAU/USD
                  <span className="text-[11px] font-normal text-amber-400/90 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    الذهب (Gold Spot)
                  </span>
                </h1>
                <div
                  className={`flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium border transition-all ${
                    connectionStatus?.connected !== false
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                  }`}
                  title={connectionStatus?.source || "بث فوري مباشر عبر Binance WebSocket (XAU/USD)"}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      connectionStatus?.connected !== false ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                    }`}
                  />
                  <span className="hidden sm:inline font-mono">
                    {connectionStatus?.latencyMs ? `${connectionStatus.latencyMs}ms` : "Live"}
                  </span>
                  <span className="hidden md:inline">بث حي فوري</span>
                </div>
              </div>
              <p id="source" className="text-[11px] text-slate-400 font-mono">
                {connectionStatus?.source || "BINANCE:PAXGUSDT (XAU/USD Live Spot Gold)"}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 font-['JetBrains_Mono'] ${
              flashColor === "up"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                : flashColor === "down"
                ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                : "bg-slate-900/90 border-slate-750 text-white"
            }`}
          >
            <div id="price" className="text-xl sm:text-2xl font-bold tracking-tight" title={`السعر بدقة كاملة: $${quote.price}`}>
              ${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </div>
            <div className="flex flex-col text-[11px] leading-tight">
              <span className={`font-semibold flex items-center ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 ml-0.5" /> : <TrendingDown className="w-3 h-3 ml-0.5" />}
                {isPositive ? "+" : ""}
                {quote.changePercent24h.toFixed(2)}%
              </span>
              <span className="text-slate-400">
                {isPositive ? "+" : ""}${quote.change24h.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg font-['JetBrains_Mono']">
            <div>
              <span className="text-slate-400 text-[10px] block">طلب (Bid)</span>
              <span className="text-emerald-400 font-semibold">${quote.bid.toFixed(3)}</span>
            </div>
            <div className="w-[1px] h-6 bg-slate-800" />
            <div>
              <span className="text-slate-400 text-[10px] block">عرض (Ask)</span>
              <span className="text-rose-400 font-semibold">${quote.ask.toFixed(3)}</span>
            </div>
            <div className="w-[1px] h-6 bg-slate-800" />
            <div>
              <span className="text-slate-400 text-[10px] block">سبريد (Spread)</span>
              <span className="text-amber-300 font-medium">${quote.spread.toFixed(3)}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 text-[10px] block">أعلى 24h</span>
              <span className="font-['JetBrains_Mono'] text-white">${quote.high24h.toFixed(3)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">أدنى 24h</span>
              <span className="font-['JetBrains_Mono'] text-white">${quote.low24h.toFixed(3)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
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

          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 flex-wrap">
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

          <button
            onClick={onOpenAiModal}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Cpu className={`w-4 h-4 ${isAiLoading ? "animate-spin" : ""}`} />
            <span>تحليل الذكاء المؤسسي</span>
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
    </header>
  );
};
