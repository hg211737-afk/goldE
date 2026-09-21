import React, { useState, useEffect } from "react";
import { Clock, Globe, ShieldAlert, Sparkles, TrendingUp, Zap, AlertCircle } from "lucide-react";
import { getCurrentMarketSession, MarketSessionInfo } from "../services/sessionService";

export const MarketSessionWidget: React.FC = () => {
  const [sessionInfo, setSessionInfo] = useState<MarketSessionInfo>(getCurrentMarketSession());
  const [currentTimeUTC, setCurrentTimeUTC] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSessionInfo(getCurrentMarketSession(now));
      setCurrentTimeUTC(now.toISOString().substring(11, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getLiquidityBadgeStyle = (level: string) => {
    switch (level) {
      case "Extreme":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse";
      case "High":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Medium":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "Closed":
        return "bg-slate-700 text-slate-300 border-slate-600";
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  return (
    <div className="bg-[#111622] border-b border-slate-800 px-4 py-2 text-slate-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left: Current Active Session & Clock */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-750 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold text-white">{currentTimeUTC}</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-750 px-3 py-1 rounded-lg">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">الجلسة الحالية:</span>
            <strong className="text-amber-300">{sessionInfo.sessionNameAr}</strong>
          </div>

          <div className={`px-2.5 py-0.5 rounded border font-bold font-mono text-[11px] ${getLiquidityBadgeStyle(sessionInfo.liquidityLevel)}`}>
            {sessionInfo.liquidityLevel === "Extreme" && "🔥 ذروة السيولة (Overlap)"}
            {sessionInfo.liquidityLevel === "High" && "⚡ سيولة عالية (High Liquidity)"}
            {sessionInfo.liquidityLevel === "Medium" && "⚖️ سيولة متوسطة"}
            {sessionInfo.liquidityLevel === "Low" && "💤 سيولة منخفضة (هادئة)"}
            {sessionInfo.liquidityLevel === "Closed" && "🔒 السوق مغلق (عطلة نهاية الأسبوع)"}
          </div>
        </div>

        {/* Right: Liquidity Conditions & Recommendation */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{sessionInfo.liquidityDescriptionAr}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-medium ${
            sessionInfo.activeConditionsMet 
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" 
              : "bg-amber-500/15 border-amber-500/30 text-amber-300"
          }`}>
            {sessionInfo.activeConditionsMet ? <TrendingUp className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{sessionInfo.recommendedAction}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
