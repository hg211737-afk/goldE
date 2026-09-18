import React, { useState, useEffect } from 'react';
import {
  Clock,
  Zap,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { getMarketSessionStatus, MarketSessionInfo, GOLD_SESSIONS_SCHEDULE } from '../services/marketSessionService';

interface MarketSessionBarProps {
  onOpenScheduleModal?: () => void;
  strictFilterActive?: boolean;
}

export const MarketSessionBar: React.FC<MarketSessionBarProps> = ({
  onOpenScheduleModal,
  strictFilterActive = true,
}) => {
  const [sessionInfo, setSessionInfo] = useState<MarketSessionInfo>(() => getMarketSessionStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionInfo(getMarketSessionStatus());
    }, 30000); // refresh every 30 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#0b0e14] border-b border-slate-800/80 px-3 py-1.5 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left / Status: Market Open/Closed and Active Session */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
              sessionInfo.isMarketOpen
                ? sessionInfo.liquidityLevel === 'PRIME'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                sessionInfo.isMarketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{sessionInfo.isMarketOpen ? 'السوق مفتوح' : 'السوق مغلق'}</span>
            <span className="text-slate-500 font-normal">|</span>
            <span className="font-semibold text-white">{sessionInfo.sessionNameAr}</span>
          </div>

          {/* Liquidity Badge */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-400">مستوى السيولة:</span>
            {sessionInfo.liquidityLevel === 'PRIME' && (
              <span className="flex items-center gap-1 text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 animate-pulse">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>ذروة السيولة العالمية (Prime)</span>
              </span>
            )}
            {sessionInfo.liquidityLevel === 'HIGH' && (
              <span className="flex items-center gap-1 text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>سيولة مرتفعة ونشطة</span>
              </span>
            )}
            {sessionInfo.liquidityLevel === 'MODERATE' && (
              <span className="text-sky-300 font-medium bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                سيولة متوسطة (تجميع نطاقي)
              </span>
            )}
            {sessionInfo.liquidityLevel === 'LOW' && (
              <span className="text-yellow-400 font-medium bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>سيولة ضعيفة / خمول</span>
              </span>
            )}
            {sessionInfo.liquidityLevel === 'NONE' && (
              <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                منعدمة (إغلاق أسبوعي/صيانة)
              </span>
            )}
          </div>
        </div>

        {/* Right / Next Event, Countdown & Recommendation Safety Guard */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
          {/* Next Market Event */}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400/90" />
            <span className="hidden sm:inline text-slate-400">{sessionInfo.nextEvent.nameAr}:</span>
            <span className="font-['JetBrains_Mono'] text-white font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              {sessionInfo.nextEvent.countdownStr}
            </span>
          </div>

          {/* Strict Signal Quality Guarantee Indicator */}
          <div
            className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
            title="نظام حماية الصفقات: يتم حجب التوصيات تلقائياً أثناء إغلاق السوق أو عند انخفاض نسبة النجاح عن 90%"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">فلتر جودة التوصيات الصارم:</span>
            <span className="font-bold text-amber-400">
              {sessionInfo.canTradeSignals ? '90%+ نجاح فقط' : 'معلّق لحماية المحفظة'}
            </span>
          </div>

          {/* Sessions Guide Modal Trigger */}
          {onOpenScheduleModal && (
            <button
              onClick={onOpenScheduleModal}
              className="flex items-center gap-1 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-2 py-0.5 rounded border border-slate-800 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>جدول الجلسات والسيولة</span>
              <ChevronRight className="w-3 h-3 text-slate-500 rotate-180" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
