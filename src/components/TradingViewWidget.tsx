import React, { useEffect, useRef } from "react";
import { Timeframe } from "../types";

interface TradingViewWidgetProps {
  timeframe: Timeframe;
}

declare global {
  interface Window {
    TradingView?: any;
  }
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ timeframe }) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
          symbol: "OANDA:XAUUSD",
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
  }, [timeframe]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0e121a] rounded-xl border border-slate-800/80 overflow-hidden">
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <span className="font-bold text-amber-400 font-['JetBrains_Mono']">
          OANDA:XAUUSD • Gold Spot Direct Feed
        </span>
        <span className="text-slate-400 text-[11px]">
          شارت تريدنج فيو المباشر مع أدوات التحليل الفني
        </span>
      </div>
      <div id="tradingview_gold_chart" ref={containerRef} className="flex-1 w-full h-full min-h-[450px]" />
    </div>
  );
};
