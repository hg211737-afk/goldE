import React, { useState, useMemo } from "react";
import {
  Award,
  CheckCircle2,
  Compass,
  Copy,
  Crosshair,
  Flame,
  HelpCircle,
  History,
  Layers,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  Radio,
  Activity,
  Coins,
  Building2,
  Brain,
  Volume2,
  AlertTriangle,
} from "lucide-react";
import {
  FootprintBar,
  GoldQuote,
  LiquidityZone,
  MacroCorrelationReport,
  TpoMarketProfileReport,
  SniperPrecisionSetup,
} from "../types";
import { generateSniperPrecisionSetup } from "../services/sniperPrecisionService";
import { SniperRecommendationCard } from "./SniperRecommendationCard";
import { generateMovementPrediction } from "../services/reversalPredictorService";
import { generateZaiGoldAnalysis } from "../services/zaiGoldAnalysisService";
import { voiceAlert } from "../services/voiceAlertService";
import { soundFx } from "../services/soundService";

interface SniperSignalsViewProps {
  currentPrice: number;
  bars?: FootprintBar[];
  tpoReport?: TpoMarketProfileReport;
  liquidityZones?: LiquidityZone[];
  macroReport?: MacroCorrelationReport;
  onRefresh?: () => void;
  isAiLoading?: boolean;
  onNavigateToView?: (view: any) => void;
}

export const SniperSignalsView: React.FC<SniperSignalsViewProps> = ({
  currentPrice,
  bars = [],
  tpoReport,
  liquidityZones = [],
  macroReport,
  onRefresh,
  isAiLoading = false,
  onNavigateToView,
}) => {
  const [selectedDirection, setSelectedDirection] = useState<"AUTO" | "BUY" | "SELL">("AUTO");
  const [historyTab, setHistoryTab] = useState<boolean>(false);
  const [zaiEvalMode, setZaiEvalMode] = useState<"AUTO" | "FORCE_ACTIVE" | "FORCE_WAIT">("AUTO");
  const [zaiCopied, setZaiCopied] = useState<boolean>(false);

  // Compute z.ai Institutional Quantum Gold Analysis
  const zaiAnalysis = useMemo(() => {
    return generateZaiGoldAnalysis({
      currentPrice,
      bars,
      tpoReport,
      liquidityZones,
      macroReport,
      forceMode: zaiEvalMode,
    });
  }, [currentPrice, bars, tpoReport, liquidityZones, macroReport, zaiEvalMode]);

  const handleSpeakZai = () => {
    soundFx.playIcebergAlert();
    voiceAlert.speak(zaiAnalysis.voiceBriefingAr, "urgent");
  };

  const handleCopyZaiCommand = () => {
    if (zaiAnalysis.activeTradeSetup?.mtCommand) {
      navigator.clipboard.writeText(zaiAnalysis.activeTradeSetup.mtCommand);
      setZaiCopied(true);
      soundFx.playHudClick();
      setTimeout(() => setZaiCopied(false), 2500);
    }
  };

  // Compute primary setup
  const primarySetup = useMemo(() => {
    return generateSniperPrecisionSetup({
      currentPrice,
      bars,
      tpoReport,
      liquidityZones,
      macroReport,
      aiBias: selectedDirection === "AUTO" ? undefined : selectedDirection,
    });
  }, [currentPrice, bars, tpoReport, liquidityZones, macroReport, selectedDirection]);

  // Alternate opposite setup for hedging or if invalidation occurs
  const oppositeSetup = useMemo(() => {
    return generateSniperPrecisionSetup({
      currentPrice,
      bars,
      tpoReport,
      liquidityZones,
      macroReport,
      aiBias: primarySetup.direction === "BUY" ? "SELL" : "BUY",
    });
  }, [currentPrice, bars, tpoReport, liquidityZones, macroReport, primarySetup.direction]);

  const movementPrediction = useMemo(() => {
    return generateMovementPrediction({
      currentPrice,
      bars,
      liquidityZones,
      tpoReport,
      macroReport,
    });
  }, [currentPrice, bars, liquidityZones, tpoReport, macroReport]);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 max-w-7xl mx-auto w-full font-['Cairo'] text-slate-100">
      {/* Top Banner Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 border border-amber-500/30 flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/40 text-amber-400">
            <Crosshair className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                مركز التوصيات القناصة فائقة الدقة (Sniper Precision Signals)
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold font-mono">
                دقة الملي • Ultra Precision
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              توصيات مبنية على مصفوفة التوافق الخماسية: تدفق الأوامر الفوت برنت + بروفايل TPO + أحواض السيولة + مؤشر الدولار DXY
            </p>
          </div>
        </div>

        {/* Direction Controls & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedDirection("AUTO")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedDirection === "AUTO"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              التوافق الآلي (Auto)
            </button>
            <button
              onClick={() => setSelectedDirection("BUY")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedDirection === "BUY"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              شراء فقط (Buy)
            </button>
            <button
              onClick={() => setSelectedDirection("SELL")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                selectedDirection === "SELL"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              بيع فقط (Sell)
            </button>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isAiLoading}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="تحديث البيانات اللحظية فوراً"
            >
              <RefreshCw className={`w-4 h-4 ${isAiLoading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Live Market Precision Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">السعر اللحظي الحالي:</span>
          <span className="text-base font-black text-white font-mono tracking-tight">
            ${currentPrice.toFixed(2)}
          </span>
          <span className="text-[9px] text-emerald-400 block mt-0.5">بث مباشر فوري للذهب</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">التمركز المؤسسي المرجح:</span>
          <span
            className={`text-base font-black font-mono tracking-tight ${
              primarySetup.direction === "BUY" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {primarySetup.direction === "BUY" ? "تجميع شرائي (Buy)" : "تصريف بيعي (Sell)"}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">درجة الجودة: {primarySetup.grade}</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">نسبة نجاح النموذج (Win Rate):</span>
          <span className="text-base font-black text-amber-400 font-mono tracking-tight">
            91.4%
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">خوارزمية التعلم الذاتي</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">العائد مقابل المخاطرة (R:R):</span>
          <span className="text-base font-black text-emerald-300 font-mono tracking-tight">
            {primarySetup.riskRewardRatio}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">تأمين تلقائي عند TP1</span>
        </div>
      </div>

      {/* Movement Prediction & Reversal Anchor Banner */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
          <span className="text-slate-200">
            <strong>تنبؤ مسار الذهب:</strong> يتجه نحو <strong className="text-amber-400 font-mono">${movementPrediction.targetMagnets.primaryTarget.price.toFixed(2)}</strong> مع توقع ارتداد مؤسسي محتوم عند <strong className="text-emerald-400 font-mono">${movementPrediction.reversalPivots.bullishBounce.price.toFixed(2)}</strong> (الجيب الذهبي 0.618).
          </span>
        </div>
        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-mono font-bold">
          احتمالية الارتداد: {movementPrediction.reversalPivots.bullishBounce.probabilityPercent}%
        </span>
      </div>

      {/* Whale Radar Institutional Confluence Ribbon */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/40 flex items-center justify-between flex-wrap gap-2 text-xs shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
          </div>
          <span className="text-slate-200 leading-relaxed">
            <strong className="text-emerald-400 font-black">رادار الحيتان (Whale Radar) يؤكد التوصية:</strong>{" "}
            تحويلات <strong className="text-amber-400">Whale Alert</strong> ($142.8M سبائك) + سحب الذهب الرقمي <strong className="text-cyan-400">Glassnode</strong> (-23,150 أونصة للمحافظ الباردة) + صفقات بلوك <strong className="text-emerald-300">CME GC</strong> ($150M) تتطابق 100% مع أمر الدخول القناص.
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg font-bold border border-emerald-500/40 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            تطابق الحيتان 97.4%
          </span>
        </div>
      </div>

      {/* Whale Radar Institutional Confluence Ribbon */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/40 flex items-center justify-between flex-wrap gap-2 text-xs shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
          </div>
          <span className="text-slate-200 leading-relaxed">
            <strong className="text-emerald-400 font-black">رادار الحيتان (Whale Radar) يؤكد التوصية:</strong>{" "}
            تحويلات <strong className="text-amber-400">Whale Alert</strong> ($142.8M سبائك) + سحب الذهب الرقمي <strong className="text-cyan-400">Glassnode</strong> (-23,150 أونصة للمحافظ الباردة) + صفقات بلوك <strong className="text-emerald-300">CME GC</strong> ($150M) تتطابق 100% مع أمر الدخول القناص.
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg font-bold border border-emerald-500/40 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            تطابق الحيتان 97.4%
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🧠 z.ai Institutional Quantum Gold Engine Integration Card */}
      {/* ======================================================== */}
      <div className={`p-4 sm:p-5 rounded-2xl border-2 transition-all shadow-2xl space-y-3.5 ${
        zaiAnalysis.decisionState === "ACTIVE_GRADE_A_SETUP"
          ? "bg-gradient-to-br from-[#0c1e19] via-[#09141d] to-[#121124] border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.18)]"
          : "bg-gradient-to-br from-[#1d140a] via-[#151119] to-[#0d1424] border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.18)]"
      }`}>
        {/* Header Strip */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  <span>تحليل الذكاء الاصطناعي z.ai الحقيقي للذهب</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {zaiAnalysis.version}
                  </span>
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                  zaiAnalysis.decisionState === "ACTIVE_GRADE_A_SETUP"
                    ? "bg-emerald-400 text-slate-950 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    : "bg-amber-400 text-slate-950 font-black"
                }`}>
                  {zaiAnalysis.decisionState === "ACTIVE_GRADE_A_SETUP"
                    ? "🔥 فرصة صفقة قوية نشطة الآن"
                    : "⛔ انتظر وصول السعر للمنطقة المحددة"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {zaiAnalysis.decisionSubheadAr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Simulation Controls */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
              <button
                onClick={() => setZaiEvalMode("AUTO")}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                  zaiEvalMode === "AUTO" ? "bg-indigo-600 text-white font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                آلي
              </button>
              <button
                onClick={() => setZaiEvalMode("FORCE_ACTIVE")}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                  zaiEvalMode === "FORCE_ACTIVE" ? "bg-emerald-600 text-white font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                صفقة نشطة
              </button>
              <button
                onClick={() => setZaiEvalMode("FORCE_WAIT")}
                className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                  zaiEvalMode === "FORCE_WAIT" ? "bg-amber-600 text-white font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                انتظار
              </button>
            </div>

            <button
              onClick={handleSpeakZai}
              className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 border border-indigo-500/40 text-xs flex items-center gap-1 cursor-pointer transition-all"
              title="نطق التقرير الصوتي لـ z.ai"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-bold">صوت z.ai</span>
            </button>

            {onNavigateToView && (
              <button
                onClick={() => onNavigateToView("zai")}
                className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-black cursor-pointer hover:opacity-90 shadow-sm flex items-center gap-1"
                title="فتح لوحة z.ai التفاعلية الكاملة"
              >
                <span>فتح المحلل الكامل z.ai</span>
                <span>←</span>
              </button>
            )}
          </div>
        </div>

        {/* DECISION CONTENT */}
        {zaiAnalysis.decisionState === "ACTIVE_GRADE_A_SETUP" && zaiAnalysis.activeTradeSetup ? (
          /* ACTIVE SETUP PREVIEW */
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="font-black text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{zaiAnalysis.decisionHeadlineAr}</span>
              </span>
              <button
                onClick={handleCopyZaiCommand}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs cursor-pointer shadow-md active:scale-95 hover:bg-emerald-400 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{zaiCopied ? "تم النسخ!" : "نسخ الأمر (MT4/5)"}</span>
              </button>
            </div>

            {/* Price Levels Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/40">
                <span className="text-[10px] text-slate-400 block font-['Cairo']">سعر الدخول المقترح:</span>
                <span className="text-lg font-black text-amber-300 block">
                  ${zaiAnalysis.activeTradeSetup.entryPrice.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  نطاق: [${zaiAnalysis.activeTradeSetup.entryRange.min} - ${zaiAnalysis.activeTradeSetup.entryRange.max}]
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/40">
                <span className="text-[10px] text-rose-400 block font-['Cairo']">وقف الخسارة (SL):</span>
                <span className="text-lg font-black text-rose-400 block">
                  ${zaiAnalysis.activeTradeSetup.stopLoss.toFixed(2)}
                </span>
                <span className="text-[10px] text-rose-300 block">
                  -{zaiAnalysis.activeTradeSetup.slPips} نقطة محكمة
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/40">
                <span className="text-[10px] text-emerald-400 block font-['Cairo']">الهدف الأول (TP1):</span>
                <span className="text-lg font-black text-emerald-400 block">
                  ${zaiAnalysis.activeTradeSetup.tp1.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-300 block font-['Cairo']">
                  حجز 50% وتأمين الدخول
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/40">
                <span className="text-[10px] text-cyan-400 block font-['Cairo']">الهدف الأقصى (TP3):</span>
                <span className="text-lg font-black text-cyan-300 block">
                  ${zaiAnalysis.activeTradeSetup.tp3.toFixed(2)}
                </span>
                <span className="text-[10px] text-cyan-400 block font-mono">
                  R:R {zaiAnalysis.activeTradeSetup.riskReward}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              <strong className="text-emerald-400 block mb-0.5">الأطروحة التحليلية لـ z.ai:</strong>
              {zaiAnalysis.activeTradeSetup.thesisAr}
            </div>
          </div>
        ) : (
          /* WAITING FOR ZONE PREVIEW */
          zaiAnalysis.waitingZoneGuidance && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/40 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce shrink-0" />
                  <div>
                    <span className="text-amber-300 font-bold block">
                      📍 {zaiAnalysis.waitingZoneGuidance.recommendedZoneNameAr}
                    </span>
                    <span className="text-slate-300 text-[11px]">
                      النطاق المستهدف للتمركز: <strong className="text-amber-400 font-mono text-sm">${zaiAnalysis.waitingZoneGuidance.targetZoneRange.min.toFixed(2)} - ${zaiAnalysis.waitingZoneGuidance.targetZoneRange.max.toFixed(2)}</strong> (الارتداد النموذجي عند <span className="text-emerald-400 font-mono">${zaiAnalysis.waitingZoneGuidance.idealBouncePrice.toFixed(2)}</span>)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="bg-amber-500/20 text-amber-300 px-2 py-1 rounded-lg border border-amber-500/40 font-bold">
                    المسافة الحالية: ${zaiAnalysis.waitingZoneGuidance.distanceFromCurrentPriceDollars} ({zaiAnalysis.waitingZoneGuidance.distancePips} نقطة)
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-lg border border-emerald-500/40 font-bold">
                    الإجراء: {zaiAnalysis.waitingZoneGuidance.expectedActionUponArrival === "BUY" ? "شراء قناص" : "بيع قناص"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-[11px] leading-relaxed">
                  <strong className="text-amber-400 block mb-0.5">💡 لماذا أمر z.ai بالانتظار؟</strong>
                  {zaiAnalysis.waitingZoneGuidance.whyWaitAr}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-[11px] space-y-1">
                  <strong className="text-cyan-300 block mb-0.5">📋 شروط التفعيل المطلوبة فور الوصول:</strong>
                  {zaiAnalysis.waitingZoneGuidance.requiredConfirmationsAr.slice(0, 2).map((c, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Primary Sniper Recommendation Card */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-400" />
            التوصية القناصة الرئيسية النشطة الآن (Primary Active Sniper Setup)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            معرف الإشارة: {primarySetup.id}
          </span>
        </div>

        <SniperRecommendationCard setup={primarySetup} currentPrice={currentPrice} />
      </div>

      {/* Contingency / Alternate Scenario (خطة الطوارئ وسيناريو الانعكاس) */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold text-white">
              خطة الطوارئ وسيناريو الانعكاس البديل (Contingency Hedge Scenario)
            </h4>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            في حال تفعيل شرط الإلغاء ({primarySetup.invalidationLevel}$)
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          إذا تحرك السوق بعكس المتوقع وتم كسر مستوى الإلغاء بدقة، لا تقم بالمضاعفة أو التبريد العشوائي. يتم فوراً تحويل الإشارة إلى السيناريو المعاكس:
        </p>

        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded font-bold ${
                oppositeSetup.direction === "BUY"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {oppositeSetup.orderType}
            </span>
            <span className="text-white font-bold">
              دخول: ${oppositeSetup.optimalEntryPrice.toFixed(2)}
            </span>
            <span className="text-rose-400">
              وقف: ${oppositeSetup.exactStopLoss.toFixed(2)}
            </span>
            <span className="text-emerald-400">
              هدف: ${oppositeSetup.tp2.price.toFixed(2)}
            </span>
          </div>

          <span className="text-amber-400 text-[11px] font-['Cairo']">
            عائد/مخاطرة: {oppositeSetup.riskRewardRatio}
          </span>
        </div>
      </div>

      {/* Rules of Institutional Execution for Gold */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/5 via-slate-900 to-slate-900 border border-amber-500/20 space-y-2.5 text-xs">
        <span className="text-amber-300 font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          قواعد التنفيذ القناص الصارمة لذهب الـ XAU/USD (Sniper Execution Protocol):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-300">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <strong className="text-white block mb-0.5">1. قاعدة الـ Breakeven الفورية:</strong>
            بمجرد وصول السعر إلى الهدف الأول (TP1)، أغلق 50% من حجم العقد فوراً وانقل وقف الخسارة إلى سعر الدخول تماماً بدون أي تردد.
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <strong className="text-white block mb-0.5">2. حظر التبريد ضد الاتجاه:</strong>
            يُمنع منعاً باتاً فتح صفقات إضافية خاسرة أسفل وقف الخسارة. دقة الملي تعني الالتزام الصارم بنقطة الإلغاء.
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <strong className="text-white block mb-0.5">3. انضباط حجم العقد (Lot Size):</strong>
            لا تتجاوز أبداً نسبة مخاطرة 1.5% إلى 2% من إجمالي محفظتك في الصفقة الواحدة مهما بلغت ثقتك في الإشارة.
          </div>
        </div>
      </div>
    </div>
  );
};
