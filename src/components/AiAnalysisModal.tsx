import React, { useState, useMemo } from "react";
import {
  Award,
  BarChart2,
  Cpu,
  Flame,
  RotateCw,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  X,
  Zap,
  SlidersHorizontal,
  Globe2,
  Layers,
  CheckCircle2,
  XCircle,
  BrainCircuit,
} from "lucide-react";
import { AiAnalysisResult, MacroCorrelationReport } from "../types";
import { DualSmartLevelsWidget } from "./DualSmartLevelsWidget";
import { CorrelationWidget } from "./CorrelationWidget";
import { generateDualSmartLevels, getMacroCorrelationData } from "../services/correlationService";
import { recordTradeOutcome, getLearningStats } from "../services/goldService";
import { generateTpoMarketProfile } from "../services/marketProfileService";

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AiAnalysisResult | null;
  isLoading: boolean;
  onRefresh: () => void;
  currentPrice: number;
  macroReport?: MacroCorrelationReport;
  onOpenSettings?: () => void;
  activeModel?: string;
  hasCustomKey?: boolean;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isLoading,
  onRefresh,
  currentPrice,
  macroReport,
  onOpenSettings,
  activeModel = "Gemini 3.6 Flash",
  hasCustomKey = false,
}) => {
  const [modalTab, setModalTab] = useState<"overview" | "dual_levels" | "tpo_profile" | "correlation">("overview");
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const learningStats = analysis?.learningStats || getLearningStats();
  const tpoReport = useMemo(() => generateTpoMarketProfile(currentPrice), [currentPrice]);

  const handleRecordOutcome = (outcome: "win" | "loss") => {
    if (!analysis) return;
    recordTradeOutcome({
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      setupType: analysis.setup.type,
      entryPrice: currentPrice,
      stopLoss: 0,
      takeProfit: 0,
      outcome,
      profitPips: outcome === "win" ? 15 : -10,
      aiConfidence: analysis.confidenceScore,
    });
    setFeedbackGiven(outcome === "win" ? "✅ تم تسجيل صفقة ناجحة وتدريب الذكاء الاصطناعي بنجاح!" : "❌ تم تسجيل صفقة خاسرة لتحديث نماذج حماية الوقف والتعلم الذاتي.");
    setTimeout(() => setFeedbackGiven(null), 4000);
  };

  if (!isOpen) return null;

  const isBullish =
    analysis?.bias?.includes("صاعد") ||
    analysis?.bias?.toLowerCase().includes("bullish");
  const isBearish =
    analysis?.bias?.includes("هابط") ||
    analysis?.bias?.toLowerCase().includes("bearish");

  // Fallback or computed dual levels and macro report
  const dualLevels =
    analysis?.dualSmartLevels || generateDualSmartLevels(currentPrice);
  const activeMacro =
    macroReport || getMacroCorrelationData(currentPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-[#111622] border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col overflow-hidden text-slate-100 font-['Cairo']">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Cpu className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  تحليل الذكاء الاصطناعي المؤسسي (Gemini)
                  <span className="text-[10px] bg-amber-400/15 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                    XAU/USD
                  </span>
                </h2>
                <span className="hidden sm:inline-block text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 font-mono">
                  {activeModel}
                </span>
                {hasCustomKey && (
                  <span className="hidden md:inline-flex items-center gap-1 text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    مفتاح خاص
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                المستويات الذكية المرنة • ارتباط الدولار DXY • تدفق الأوامر والسيولة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="إعدادات مفتاح الذكاء الاصطناعي"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title="تحديث التحليل"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-900/90 border-b border-slate-800 px-3 py-1.5 gap-1.5 overflow-x-auto">
          <button
            onClick={() => setModalTab("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              modalTab === "overview"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>نظرة عامة والتحليل التنفيذي</span>
          </button>

          <button
            onClick={() => setModalTab("tpo_profile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              modalTab === "tpo_profile"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>بروفايل TPO والمصائد (Value Area & Traps)</span>
            <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.2 rounded font-mono">
              TPO
            </span>
          </button>

          <button
            onClick={() => setModalTab("dual_levels")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              modalTab === "dual_levels"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>المستويات الذكية المرنة (Dual Levels)</span>
            <span className="text-[10px] bg-slate-950/60 px-1.5 py-0.2 rounded text-amber-300 font-mono">
              جديد
            </span>
          </button>

          <button
            onClick={() => setModalTab("correlation")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              modalTab === "correlation"
                ? "bg-amber-500 text-slate-950 shadow-xs"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>ارتباط مؤشر الدولار والعملات (DXY & FX)</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">
              DXY
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs leading-relaxed">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                <div
                  className="absolute inset-2 rounded-full border-4 border-emerald-500/20 border-b-emerald-500 animate-spin"
                  style={{ animationDirection: "reverse" }}
                />
                <Cpu className="absolute inset-0 m-auto w-6 h-6 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  جاري تحليل دفتر الأوامر والمستويات الذكية المرنة...
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  يقوم الذكاء الاصطناعي برصد اختلالات الدلتا ومستويات الـ BSL/SSL وحساب سيناريوهات الاختراق والارتداد
                </p>
              </div>
            </div>
          ) : modalTab === "dual_levels" ? (
            <DualSmartLevelsWidget
              upperLevel={dualLevels.upperLevel}
              lowerLevel={dualLevels.lowerLevel}
              currentPrice={currentPrice}
            />
          ) : modalTab === "tpo_profile" ? (
            <div className="space-y-4">
              {/* TPO Top Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-900 border border-violet-500/30 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      بروفايل السوق المؤسسي (TPO Market Profile & Traps)
                      <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                        {tpoReport.dayType}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {tpoReport.dayTypeAr} • نطاق التوازن الأولي (IB): ${tpoReport.initialBalanceLow} - ${tpoReport.initialBalanceHigh}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">توافق قوى المزاد (Confluence):</span>
                  <span className="text-sm font-black text-amber-400 font-mono">
                    {tpoReport.absorption.confluenceScore}%
                  </span>
                </div>
              </div>

              {/* Value Area & VWAP Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30">
                  <span className="text-[10px] text-rose-300 font-bold block">سقف القيمة (VAH 70%)</span>
                  <span className="text-base font-black text-white font-mono">${tpoReport.vah.toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">مقاومة المزاد المؤسسية</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-300 font-bold block">قاع القيمة (VAL 70%)</span>
                  <span className="text-base font-black text-white font-mono">${tpoReport.val.toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">دعم المزاد المؤسسي</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30">
                  <span className="text-[10px] text-amber-300 font-bold block">نقطة التحكم (POC)</span>
                  <span className="text-base font-black text-amber-300 font-mono">${tpoReport.poc.toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">أعلى زمن وأحجام تداول</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-sky-500/30">
                  <span className="text-[10px] text-sky-300 font-bold block">خط الفاب (VWAP)</span>
                  <span className="text-base font-black text-sky-300 font-mono">${tpoReport.vwapBands.vwap.toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5 font-mono">
                    الانحراف: {tpoReport.vwapBands.currentDeviation >= 0 ? "+" : ""}{tpoReport.vwapBands.currentDeviation}σ
                  </span>
                </div>
              </div>

              {/* Absorption & Traps Breakdown */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#121024] to-[#0c0e18] border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-400" />
                    كاشف مصائد المتداولين والامتصاص الصامت (Trapped Traders & Iceberg Absorption)
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full">
                    {tpoReport.absorption.passiveAbsorptionRatio}% استيعاب صانع السوق
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-rose-500/20">
                    <span className="text-slate-400 block text-[11px]">مشترون محاصرون في القمة (Trapped Buyers):</span>
                    <span className="text-rose-400 font-black text-sm font-mono mt-0.5 block">
                      {tpoReport.absorption.trappedBuyersOz} Oz
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      حجم شرائي تم ابتلاعه عبر أوامر بيع مخفية عند القمة
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/80 border border-emerald-500/20">
                    <span className="text-slate-400 block text-[11px]">بائعون محاصرون في القاع (Trapped Sellers):</span>
                    <span className="text-emerald-400 font-black text-sm font-mono mt-0.5 block">
                      {tpoReport.absorption.trappedSellersOz} Oz
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      حجم بيع تم امتصاصه عبر جدار طلبات Iceberg عند القاع
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  <strong className="text-amber-400 block mb-1 font-bold">إشارة الرصد اللحظية:</strong>
                  {tpoReport.absorption.trapSignalAr}
                </div>
              </div>

              {/* Action Playbook */}
              <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/30 text-xs space-y-1.5">
                <span className="text-violet-300 font-bold block text-xs">
                  خطة التنفيذ وفق قواعد المزاد (Auction Playbook):
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {tpoReport.keyActionRecommendationAr}
                </p>
              </div>
            </div>
          ) : modalTab === "correlation" ? (
            <div className="h-[480px]">
              <CorrelationWidget
                report={activeMacro}
                goldPrice={currentPrice}
                onRefresh={onRefresh}
              />
            </div>
          ) : analysis ? (
            <>
              {/* Top Metric Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                    isBullish
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : isBearish
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-900/60">
                    {isBullish ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-normal">الاتجاه المؤسسي</span>
                    <span className="text-sm font-bold">{analysis.bias}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-amber-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">نسبة ثقة التحليل</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">{analysis.confidenceScore}%</span>
                      <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                          style={{ width: `${analysis.confidenceScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 text-sky-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">السعر اللحظي للذهب</span>
                    <span className="text-sm font-bold text-white font-mono">${currentPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* DXY & Macro Snapshot Bar */}
              <div
                onClick={() => setModalTab("correlation")}
                className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      مؤشر الدولار DXY والماكرو: {activeMacro.overallSentimentAr}
                    </span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">
                      {activeMacro.dxyAnalysisAr}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-amber-400 font-bold shrink-0">
                  عرض ويدجت الارتباط ←
                </span>
              </div>

              {/* TPO & Traps Snapshot Bar */}
              <div
                onClick={() => setModalTab("tpo_profile")}
                className="p-3 rounded-xl bg-gradient-to-r from-violet-950/30 via-slate-900 to-slate-900 border border-violet-500/30 hover:border-violet-400/60 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      بروفايل TPO والمصائد: {tpoReport.dayTypeAr.split(" (")[0]}
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                        {tpoReport.absorption.passiveAbsorptionRatio}% امتصاص
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">
                      VAH: ${tpoReport.vah.toFixed(1)} | VAL: ${tpoReport.val.toFixed(1)} | POC: ${tpoReport.poc.toFixed(1)} • {tpoReport.absorption.trapSignalAr.slice(0, 75)}...
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-violet-400 font-bold shrink-0">
                  تفاصيل TPO ←
                </span>
              </div>

              {/* Dual-Scenario Smart Levels (Embedded in Overview) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    المستويات الذكية المرنة (Smart Buy & Smart Sell Levels)
                  </span>
                  <button
                    onClick={() => setModalTab("dual_levels")}
                    className="text-[11px] text-amber-400 hover:underline font-bold"
                  >
                    شاشة المستويات الكاملة ←
                  </button>
                </div>

                <DualSmartLevelsWidget
                  upperLevel={dualLevels.upperLevel}
                  lowerLevel={dualLevels.lowerLevel}
                  currentPrice={currentPrice}
                />
              </div>

              {/* Summary & Insights */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-850 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Zap className="w-3.5 h-3.5" />
                  <span>الملخص التنفيذي لسلوك صناع السوق</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">{analysis.summary}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-850 space-y-1.5">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                  <Target className="w-3.5 h-3.5" />
                  <span>خارطة السيولة المستهدفة (BSL / SSL Sweep Targets)</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">{analysis.liquidityAnalysis}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-850 space-y-1.5">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>قراءة تدفق الأوامر ودلتا الفوت برنت (Order Flow & Delta)</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">{analysis.orderFlowInsight}</p>
              </div>

              {analysis.setup && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>خطة التداول المؤسسية المقترحة (Institutional Setup)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[11px]">
                      {analysis.setup.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 font-['JetBrains_Mono']">
                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-['Cairo'] block">نطاق الدخول</span>
                      <span className="text-xs font-bold text-white">{analysis.setup.entryZone}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-rose-400 font-['Cairo'] block">وقف الخسارة (SL)</span>
                      <span className="text-xs font-bold text-rose-300">{analysis.setup.stopLoss}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-emerald-400 font-['Cairo'] block">الهدف الأول (TP1)</span>
                      <span className="text-xs font-bold text-emerald-300">{analysis.setup.takeProfit1}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] text-amber-400 font-['Cairo'] block">نسبة العائد/المخاطرة</span>
                      <span className="text-xs font-bold text-amber-300">{analysis.setup.riskRewardRatio}</span>
                    </div>
                  </div>

                  {/* Self-Learning Feedback Buttons */}
                  <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                      <BrainCircuit className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>تقييم الصفقة لتعليم الذكاء الاصطناعي (معدل النجاح: <strong className="text-emerald-400 font-mono">{learningStats.winRate}%</strong>):</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRecordOutcome("win")}
                        className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>صفقة ناجحة (Win)</span>
                      </button>
                      <button
                        onClick={() => handleRecordOutcome("loss")}
                        className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>صفقة خاسرة (Loss)</span>
                      </button>
                    </div>
                  </div>
                  {feedbackGiven && (
                    <div className="p-2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-200 text-center text-[11px] font-bold animate-in fade-in">
                      {feedbackGiven}
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-amber-200 text-[11px]">
                <TriangleAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300 mb-0.5">توجيه حاسم لإدارة المخاطر في الذهب:</strong>
                  {analysis.keyAdvice}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-slate-400">
              لم يتم تحميل أي تحليل بعد. اضغط على تحديث لبدء التحليل الفوري.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

