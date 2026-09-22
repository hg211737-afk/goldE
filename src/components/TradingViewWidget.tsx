import React, { useEffect, useRef, useState } from "react";
import { Timeframe } from "../types";
import { Check, Layers } from "lucide-react";

interface TradingViewWidgetProps {
  timeframe: Timeframe;
}

declare global {
  interface Window {
    TradingView?: any;
  }
}

const SYMBOL_OPTIONS = [
  {
    id: "BINANCE:PAXGUSDT",
    label: "بينانس الرسمي (PAXG/USDT)",
    desc: "مطابقة 100% مع دفتر الأوامر والفوت برنت",
    recommended: true,
  },
  {
    id: "OANDA:XAUUSD",
    label: "أواندا الفوري (OANDA Spot)",
    desc: "شارت الفوركس الفوري XAU/USD",
    recommended: false,
  },
  {
    id: "TVC:GOLD",
    label: "مؤشر الذهب (TVC:GOLD)",
    desc: "مؤشر تريدنج فيو المجمع للذهب",
    recommended: false,
  },
  {
    id: "COMEX:GC1!",
    label: "عقود كومكس (COMEX:GC1!)",
    desc: "عقود الذهب الآجلة الرسمية في نيويورك",
    recommended: false,
  },
];

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ timeframe }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSymbol, setActiveSymbol] = useState("BINANCE:PAXGUSDT");

  const getInterval = (tf: Timeframe): string => {
    switch (tf) {
      case "1m":
        return "1";
      case "3m":
        return "3";
      case "5m":
        return "5";
      case "15m":
        return "15";
      case "1h":
        return "60";
      case "4h":
        return "240";
      default:
        return "5";
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: activeSymbol,
          interval: getInterval(timeframe),
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "ar_AE",
          toolbar_bg: "#0f1420",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview_gold_chart",
          hide_side_toolbar: false,
          studies: ["Volume@tv-basicstudies", "MAExp@tv-basicstudies"],
        });
      }
    };
    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [timeframe, activeSymbol]);

  const currentOpt = SYMBOL_OPTIONS.find((s) => s.id === activeSymbol) || SYMBOL_OPTIONS[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0e121a] rounded-xl border border-slate-800/80 overflow-hidden">
      <div className="px-3 sm:px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400 font-['JetBrains_Mono'] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {currentOpt.id}
          </span>
          {currentOpt.recommended && (
            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-medium">
              تطابق 100% مع بينانس
            </span>
          )}
        </div>

        {/* Source Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-0.5 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 px-1.5 hidden md:inline">مصدر الشارت:</span>
          {SYMBOL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveSymbol(opt.id)}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                activeSymbol === opt.id
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title={opt.desc}
            >
              {opt.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
      <div id="tradingview_gold_chart" ref={containerRef} className="flex-1 w-full h-full min-h-[450px]" />
    </div>
  );
};
