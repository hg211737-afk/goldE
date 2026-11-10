import React, { useMemo } from "react";
import {
  Compass,
  Clock,
  Layers,
  Activity,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Target,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Zap,
} from "lucide-react";
import { PreSessionRoadmapReport } from "../types";
import { generatePreSessionRoadmap } from "../services/preSessionRoadmapService";
import { soundFx } from "../services/soundService";

interface PreSessionRoadmapViewProps {
  currentPrice: number;
  onNavigateToView?: (view: any) => void;
  onRefresh?: () => void;
}

export const PreSessionRoadmapView: React.FC<PreSessionRoadmapViewProps> = ({
  currentPrice = 4293.65,
  onNavigateToView,
  onRefresh,
}) => {
  const [isRotating, setIsRotating] = React.useState(false);

  const handleManualRefresh = () => {
    setIsRotating(true);
    soundFx.playHudClick();
    if (onRefresh) onRefresh();
    setTimeout(() => {
      setIsRotating(false);
      soundFx.playSuccessChime();
    }, 600);
  };
  const report: PreSessionRoadmapReport = useMemo(() => {
    return generatePreSessionRoadmap(currentPrice);
  }, [currentPrice]);

  return (
    <div className="flex-1 bg-[#0b0f17] text-slate-100 p-3 sm:p-5 overflow-y-auto space-y-4 select-none pb-24 font-['Cairo']">
      {/* 1. HEADER BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#181d2c] to-[#121c2e] border border-blue-500/30 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                خريطة الجلسات المسبقة (Pre-Session Roadmap)
              </span>

              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {report.dstStatusAr}
              </span>

              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                سعر الذهب: ${currentPrice.toFixed(2)}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              خريطة المستويات التفاعلية المسبقة ومناطق رد الفعل المخططة لجلسات الذهب
            </h1>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {report.sessionRoadmapSynthesisAr}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRotating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900/80 text-blue-200 border border-blue-500/40 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              title="تحديث خريطة ومستويات الجلسات اللحظية"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin text-blue-300" : ""}`} />
              <span>تحديث الخريطة</span>
            </button>

            <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-blue-500/30 font-mono text-center">
              <div>
                <div className="text-[10px] text-slate-400">الجلسة النشطة</div>
                <div className="text-xs font-black text-blue-300">{report.currentSession}</div>
                <div className="text-[10px] text-slate-500">{report.utcTimeDisplay}</div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-[10px] text-slate-400">افتتاح الجلسة التالية</div>
                <div className="text-xs font-black text-amber-400">خلال {report.sessionCountdownMinutes} دقيقة</div>
                <div className="text-[10px] text-slate-500">{report.nextSession}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MANDATORY RISK / WAIT NOTICE */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <p className="leading-relaxed">{report.mandatoryWaitNoticeAr}</p>
      </div>

      {/* 3. PREVIOUS SESSION METRICS */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              بيانات ومقاييس الجلسة السابقة (Previous Session Benchmarks)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {report.previousSessionMetrics.trendTypeAr}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">قمة الأمس High</span>
            <span className="text-rose-400 font-bold">${report.previousSessionMetrics.high}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">قاع الأمس Low</span>
            <span className="text-emerald-400 font-bold">${report.previousSessionMetrics.low}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">النطاق Range</span>
            <span className="text-white font-bold">{report.previousSessionMetrics.rangePips} Pip</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">نقطة التحكم POC</span>
            <span className="text-amber-400 font-bold">${report.previousSessionMetrics.pocPrice}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">الفاب المؤسسي VWAP</span>
            <span className="text-cyan-400 font-bold">${report.previousSessionMetrics.vwapPrice}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">الحجم الإجمالي Volume</span>
            <span className="text-white font-bold">{report.previousSessionMetrics.totalVolumeLots} Lot</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-500 text-[10px] block">صافي الدلتا Net Delta</span>
            <span className="text-emerald-400 font-bold">+{report.previousSessionMetrics.netDeltaPercent}%</span>
          </div>
        </div>
      </div>

      {/* 4. PLANNED BUY & SELL ZONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Planned Buy Zones */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">مناطق الشراء المخططة مسبقاً (Planned Buy Zones)</h3>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              انتظار تأكيد الرفض
            </span>
          </div>

          <div className="space-y-2.5">
            {report.plannedBuyZones.map((zone) => (
              <div
                key={zone.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300">{zone.typeAr}</span>
                  <span className="font-mono text-emerald-400 font-black">
                    ${zone.priceMin} - ${zone.priceMax}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">{zone.rationaleAr}</p>

                <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300">
                  <span className="font-bold block text-[10px]">شرط التفعيل الإلزامي:</span>
                  {zone.requiredConfirmationAr}
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] pt-1 border-t border-slate-800 text-slate-400">
                  <span>مستوى الإلغاء: ${zone.invalidationLevel}</span>
                  <span className="text-emerald-400 font-bold">قوة المنطقة: {zone.strengthPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planned Sell Zones */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">مناطق البيع المخططة مسبقاً (Planned Sell Zones)</h3>
            </div>
            <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-mono">
              انتظار تأكيد الامتصاص
            </span>
          </div>

          <div className="space-y-2.5">
            {report.plannedSellZones.map((zone) => (
              <div
                key={zone.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/20 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-300">{zone.typeAr}</span>
                  <span className="font-mono text-rose-400 font-black">
                    ${zone.priceMin} - ${zone.priceMax}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">{zone.rationaleAr}</p>

                <div className="p-2 rounded-lg bg-rose-950/20 border border-rose-500/20 text-[11px] text-rose-300">
                  <span className="font-bold block text-[10px]">شرط التفعيل الإلزامي:</span>
                  {zone.requiredConfirmationAr}
                </div>

                <div className="flex items-center justify-between font-mono text-[10px] pt-1 border-t border-slate-800 text-slate-400">
                  <span>مستوى الإلغاء: ${zone.invalidationLevel}</span>
                  <span className="text-rose-400 font-bold">قوة المنطقة: {zone.strengthPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE LEVEL REACTION RULES ENGINE */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              محرك سيناريوهات التفاعل الحركي مع المستويات (Level Interaction State Machine)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">قواعد حتمية دون عشوائية</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {report.reactionScenarios.map((scen) => (
            <div
              key={scen.id}
              className={`p-3.5 rounded-xl border space-y-2 ${
                scen.scenarioType === "WAIT"
                  ? "bg-amber-950/20 border-amber-500/30"
                  : scen.scenarioType === "REJECTION"
                  ? "bg-slate-950/80 border-cyan-500/30"
                  : "bg-slate-950/80 border-blue-500/30"
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{scen.levelNameAr}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    scen.scenarioType === "WAIT"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {scen.scenarioType}
                </span>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">الشرط الحركي:</span>
                  {scen.triggerConditionAr}
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">الإجراء المنفذ:</span>
                  <span className="font-semibold text-white">{scen.executionActionAr}</span>
                </div>
              </div>

              {scen.scenarioType !== "WAIT" && (
                <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-rose-400">الوقف: ${scen.stopLossPrice}</span>
                  <span className="text-emerald-400">الهدف: ${scen.takeProfitPrice}</span>
                  <span className="text-cyan-400 font-bold">R:R {scen.riskReward}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 6. HISTORICAL LEVEL ACCURACY LOG */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">
            سجل قياس دقة المستويات السابقة (Historical Level Accuracy Log)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {report.historicalAccuracyList.map((rec) => (
            <div
              key={rec.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 font-mono text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{rec.session}</span>
                <span className="text-slate-500 text-[10px]">{rec.dateStr}</span>
              </div>
              <div className="text-sm font-black text-amber-300">${rec.levelPrice}</div>
              <div className="text-[10px] text-slate-400">{rec.levelTypeAr}</div>
              <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-bold">{rec.priceActionReactionAr}</span>
                <span className="text-cyan-400 font-bold">{rec.accuracyScorePercent}% دقة</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
