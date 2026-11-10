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
  ShieldAlert,
  HelpCircle,
  Zap,
} from "lucide-react";
import { GannCyclesAnalysisReport } from "../types";
import { generateGannCyclesReport } from "../services/gannCyclesService";
import { soundFx } from "../services/soundService";

interface GannCyclesViewProps {
  currentPrice: number;
  onNavigateToView?: (view: any) => void;
  onRefresh?: () => void;
}

export const GannCyclesView: React.FC<GannCyclesViewProps> = ({
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
  const report: GannCyclesAnalysisReport = useMemo(() => {
    return generateGannCyclesReport(currentPrice);
  }, [currentPrice]);

  return (
    <div className="flex-1 bg-[#0b0f17] text-slate-100 p-3 sm:p-5 overflow-y-auto space-y-4 select-none pb-24 font-['Cairo']">
      {/* 1. HEADER BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#1a1528] to-[#121c2e] border border-purple-500/30 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-purple-400" />
                تحليل جان ودورات السعر والزمن (Gann Square of 9 & Time Cycles)
              </span>

              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                محرك تقلبات ATR لـ 6 أطر زمنية
              </span>

              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                سعر الذهب: ${currentPrice.toFixed(2)}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              محاور الاهتزاز الرقمي لمربع التسعة وزوايا جان الهندسية ودورات الزمن
            </h1>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              يربط هذا المحرك بين اهتزازات الأسعار الرقمية لـ W.D. Gann، ومستويات فيبوناتشي التوافقية، ودورات توقيت الجلسات، مع حساب التقلب الحقيقي بواسطة ATR لإدارة المخاطر وتحديد الوقف بدقة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRotating}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border border-purple-500/40 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              title="تحديث حسابات دورات جان وATR اللحظية"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin text-purple-300" : ""}`} />
              <span>تحديث جان</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-purple-500/30 font-mono text-center">
              <div>
                <div className="text-[10px] text-slate-400">مرساة الاهتزاز الرقمي</div>
                <div className="text-sm font-black text-purple-300">${report.vibrationalAnchorPrice}</div>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <div className="text-[10px] text-slate-400">درجة التوافق الرنيني</div>
                <div className="text-sm font-black text-emerald-400">{report.cycleResonanceScore}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DISCLAIMER BANNER (As requested in user brief: أداة مساعدة للاختبار وليست حقيقة مؤكدة) */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
        <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
        <p className="leading-relaxed">{report.gannDisclaimerAr}</p>
      </div>

      {/* 3. GANN SQUARE OF 9 LEVELS & ANGLES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Square of 9 Levels */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">
                مستويات اهتزاز مربع التسعة (Gann Square of 9 Harmonics)
              </h3>
            </div>
            <span className="text-[10px] text-purple-300 font-mono bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              حساب رياضي نسبي
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {report.gannSquareLevels.map((lvl) => {
              const isAbove = lvl.price > currentPrice;
              const isPrimary = lvl.price === report.primaryGannLevel.price;

              return (
                <div
                  key={`${lvl.degree}_${lvl.price}`}
                  className={`p-3 rounded-xl border transition-all space-y-1.5 ${
                    isPrimary
                      ? "bg-purple-950/30 border-purple-500/60 shadow-lg shadow-purple-500/10 scale-101"
                      : "bg-slate-950/70 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="font-mono text-purple-400">{lvl.degree}°</span>
                      <span>{lvl.roleAr}</span>
                    </span>

                    <span
                      className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded ${
                        isAbove
                          ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {isAbove ? `+${lvl.distancePips} Pip` : `-${lvl.distancePips} Pip`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-xs pt-0.5">
                    <span className="text-sm font-black text-white">${lvl.price.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400">
                      طاقة الاهتزاز: {lvl.vibrationalEnergyPercent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gann Angles (1x1, 1x2, 2x1) */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">زوايا جان الهندسية (Gann Angles)</h3>
          </div>

          <div className="space-y-2">
            {report.gannAngles.map((ang) => (
              <div
                key={ang.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-white">{ang.name}</span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.2 rounded font-bold ${
                      ang.biasAr === "Bullish Control"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : ang.biasAr === "Bearish Control"
                        ? "bg-rose-500/15 text-rose-400"
                        : "bg-cyan-500/15 text-cyan-400"
                    }`}
                  >
                    {ang.biasAr}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-purple-300">
                  السعر المقابل: ${ang.calculatedPrice}
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{ang.significanceAr}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. ATR VOLATILITY MULTI-TIMEFRAME ENGINE */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              محرك حساب التقلب الفعلي ومضاعفات الوقف (ATR Multi-Timeframe Volatility Engine)
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            حسابات آلية لوقف الخسارة والأهداف
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {report.atrMetrics.map((m) => (
            <div
              key={m.timeframe}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-amber-400 text-xs">فريم {m.timeframe}</span>
                <span className="text-[10px] text-slate-400 font-mono">{m.atrDollars}$</span>
              </div>

              <div>
                <div className="text-lg font-mono font-black text-white">{m.atrPips} Pip</div>
                <div className="text-[10px] text-slate-400">{m.volatilityStateAr}</div>
              </div>

              <div className="pt-1 border-t border-slate-800/80 font-mono text-[10px] space-y-0.5">
                <div className="flex justify-between text-rose-400">
                  <span>وقف مقترح:</span>
                  <span>{m.recommendedSlPips} Pip</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>هدف مقترح:</span>
                  <span>{m.recommendedTpPips} Pip</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. INTRADAY TIME CYCLES & TURNING POINTS */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            دورات السعر والزمن اليومية ونقاط الانعكاس المتوقعة (Time Turning Cycles)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {report.upcomingTimeCycles.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono text-cyan-400 font-bold">{c.session}</span>
                <span className="font-mono text-slate-500">{c.cycleTimeUtc}</span>
              </div>

              <h4 className="text-xs font-bold text-white leading-snug">{c.nameAr}</h4>

              <p className="text-[11px] text-slate-400 leading-normal">{c.expectedActionAr}</p>

              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between font-mono text-[10px]">
                <span className="text-slate-400">التقلب المتوقع: {c.averageVolatilityPips} Pip</span>
                <span className="text-emerald-400 font-bold">دقة {c.historicalAccuracyPercent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
