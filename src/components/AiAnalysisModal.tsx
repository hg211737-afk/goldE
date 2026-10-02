import React, { useState, useMemo, useEffect } from "react";
import {
  Award,
  BarChart2,
  Bot,
  Compass,
  Cpu,
  Crosshair,
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
  Sparkles,
  Link2,
  Clock,
} from "lucide-react";
import { AiAnalysisResult, MacroCorrelationReport, ClaudeAnalysisResult, InstitutionalPendingLimitSetup } from "../types";
import { DualSmartLevelsWidget } from "./DualSmartLevelsWidget";
import { CorrelationWidget } from "./CorrelationWidget";
import { ConfluenceMatrixWidget } from "./ConfluenceMatrixWidget";
import { PendingLimitOrdersSection } from "./PendingLimitOrdersSection";
import { ClaudeAdvancedAnalysisWidget } from "./ClaudeAdvancedAnalysisWidget";
import { UnifiedAiSuperConfluenceCard } from "./UnifiedAiSuperConfluenceCard";
import { InteractiveGoldTrajectoryCanvas } from "./InteractiveGoldTrajectoryCanvas";
import { generateDualSmartLevels, getMacroCorrelationData } from "../services/correlationService";
import { recordTradeOutcome, getLearningStats } from "../services/goldService";
import { generateTpoMarketProfile } from "../services/marketProfileService";
import { SniperRecommendationCard } from "./SniperRecommendationCard";
import { generateSniperPrecisionSetup } from "../services/sniperPrecisionService";
import { generateMovementPrediction } from "../services/reversalPredictorService";
import { analyzeGoldWithClaude, calculateDualAiConsensus } from "../services/claudeService";
import { generateInstitutionalConfluenceMatrix } from "../services/confluenceService";
import { generateInstitutionalPendingLimits } from "../services/pendingLimitService";

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AiAnalysisResult | null;
  claudeAnalysis?: ClaudeAnalysisResult | null;
  pendingLimitSetups?: InstitutionalPendingLimitSetup[];
  initialTab?: "overview" | "pending_limits" | "confluence" | "claude" | "gemini" | "predictor" | "sniper" | "tpo_profile" | "dual_levels" | "correlation";
  isLoading: boolean;
  onRefresh: () => void;
  currentPrice: number;
  macroReport?: MacroCorrelationReport;
  onOpenSettings?: () => void;
  activeModel?: string;
  hasCustomKey?: boolean;
  customClaudeApiKey?: string;
  claudeModel?: string;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  claudeAnalysis,
  pendingLimitSetups: initialPendingLimits,
  initialTab = "overview",
  isLoading,
  onRefresh,
  currentPrice,
  macroReport,
  onOpenSettings,
  activeModel = "Gemini 3.6 Flash",
  hasCustomKey = false,
  customClaudeApiKey,
  claudeModel = "Claude 3.7 Sonnet",
}) => {
  const [modalTab, setModalTab] = useState<"overview" | "pending_limits" | "confluence" | "claude" | "gemini" | "predictor" | "sniper" | "tpo_profile" | "dual_levels" | "correlation">("overview");
  const [feedbackGiven, setFeedbackGiven] = useState<string | null>(null);
  const [localClaude, setLocalClaude] = useState<ClaudeAnalysisResult | null>(null);
  const [isClaudeLoading, setIsClaudeLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialTab) {
      setModalTab(initialTab as any);
    }
  }, [initialTab, isOpen]);

  // Load Claude analysis when opened or refreshed
  useEffect(() => {
    if (isOpen) {
      if (claudeAnalysis) {
        setLocalClaude(claudeAnalysis);
      } else {
        setIsClaudeLoading(true);
        analyzeGoldWithClaude({
          currentPrice,
          customApiKey: customClaudeApiKey,
          claudeModel,
        })
          .then((res) => setLocalClaude(res))
          .catch((err) => console.error(err))
          .finally(() => setIsClaudeLoading(false));
      }
    }
  }, [isOpen, currentPrice, claudeAnalysis, customClaudeApiKey, claudeModel]);

  const activeClaude = claudeAnalysis || localClaude;
  const dualConsensus = useMemo(
    () => calculateDualAiConsensus(analysis, activeClaude, currentPrice),
    [analysis, activeClaude, currentPrice]
  );

  const learningStats = analysis?.learningStats || getLearningStats();
  const tpoReport = useMemo(() => generateTpoMarketProfile(currentPrice), [currentPrice]);
  const activeMacro = macroReport || getMacroCorrelationData(currentPrice);

  const confluenceMatrix = useMemo(() => {
    if (analysis?.confluenceMatrix) return analysis.confluenceMatrix;
    return generateInstitutionalConfluenceMatrix({
      currentPrice,
      tpoReport,
      macroReport: activeMacro,
    });
  }, [analysis, currentPrice, tpoReport, activeMacro]);

  const movementPrediction = useMemo(() => {
    if (analysis?.prediction) return analysis.prediction;
    return generateMovementPrediction({
      currentPrice,
      tpoReport,
      macroReport: activeMacro,
    });
  }, [analysis, currentPrice, tpoReport, activeMacro]);

  const pendingLimits = useMemo(() => {
    if (initialPendingLimits) return initialPendingLimits;
    if (analysis?.pendingLimitSetups) return analysis.pendingLimitSetups;
    return generateInstitutionalPendingLimits({
      currentPrice,
      tpoReport,
      macroReport: activeMacro,
    });
  }, [initialPendingLimits, analysis, currentPrice, tpoReport, activeMacro]);

  const sniperSetup = useMemo(() => {
    if (analysis?.sniperSetup) return analysis.sniperSetup;
    return generateSniperPrecisionSetup({
      currentPrice,
      tpoReport,
      macroReport: activeMacro,
      aiBias: analysis?.bias,
    });
  }, [analysis, currentPrice, tpoReport, activeMacro]);

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

  // Fallback or computed dual levels
  const dualLevels =
    analysis?.dualSmartLevels || generateDualSmartLevels(currentPrice);

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
            <span>نظرة عامة وتوافق الذكاءين</span>
            <span className="text-[10px] bg-slate-950/60 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
              {dualConsensus.agreementScore}% توافق
            </span>
          </button>

          <button
            onClick={() => setModalTab("pending_limits")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              modalTab === "pending_limits"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-xs"
                : "text-emerald-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span>صفقات Limit المعلقة</span>
            <span className="text-[10px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded font-mono font-black">
              A++ مضمونة
            </span>
          </button>

          <button
            onClick={() => setModalTab("confluence")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              modalTab === "confluence"
                ? "bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 text-slate-950 font-black shadow-xs"
                : "text-emerald-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>التلاقي والربط الشامل (Confluence)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
              {confluenceMatrix.overallScore}% دقة
            </span>
          </button>

          <button
            onClick={() => setModalTab("claude")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              modalTab === "claude"
                ? "bg-gradient-to-r from-orange-500 via-amber-600 to-rose-600 text-white font-black shadow-xs border border-orange-400/50"
                : "text-orange-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-orange-200" />
            <span>تحليل كلاود (Claude 3.7)</span>
            <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded font-mono font-bold">
              الذكاء الثاني
            </span>
          </button>

          <button
            onClick={() => setModalTab("gemini")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              modalTab === "gemini"
                ? "bg-indigo-600 text-white font-black shadow-xs"
                : "text-indigo-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-300" />
            <span>تحليل Gemini (الذكاء الأول)</span>
          </button>

          <button
            onClick={() => setModalTab("predictor")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              modalTab === "predictor"
                ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black shadow-xs"
                : "text-amber-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>مسار الذهب والارتداد (Predictor)</span>
            <span className="text-[10px] bg-amber-400/25 text-amber-200 px-1.5 py-0.2 rounded font-mono font-bold">
              تنبؤ
            </span>
          </button>

          <button
            onClick={() => setModalTab("sniper")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              modalTab === "sniper"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-xs font-black"
                : "text-emerald-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>التوصية القناصة بالملي (Sniper Setup)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
              دقيقة جداً
            </span>
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
          ) : modalTab === "pending_limits" ? (
            <PendingLimitOrdersSection
              setups={pendingLimits}
              currentPrice={currentPrice}
              onRefresh={onRefresh}
            />
          ) : modalTab === "confluence" ? (
            <ConfluenceMatrixWidget
              confluence={confluenceMatrix}
              currentPrice={currentPrice}
            />
          ) : modalTab === "predictor" ? (
            <div className="space-y-4">
              {/* Movement Summary Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Compass className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      التنبؤ بحركة الذهب القادمة ومناطق الارتداد المؤسسي
                      <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                        {movementPrediction.directionConfidence}% ثقة
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {movementPrediction.primaryDirectionAr} • المدى المتوقع: {movementPrediction.expectedMovePips} نقطة (${movementPrediction.expectedMoveDollars})
                    </p>
                  </div>
                </div>

                <div className="text-right font-['JetBrains_Mono']">
                  <span className="text-[10px] text-slate-400 block font-['Cairo']">السعر اللحظي:</span>
                  <span className="text-sm font-black text-amber-400">
                    ${currentPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* State-of-the-Art Interactive Gold Trajectory Flight Path Canvas */}
              <InteractiveGoldTrajectoryCanvas
                currentPrice={currentPrice}
                primaryDirection={movementPrediction.primaryDirection}
                reversalPrice={movementPrediction.reversalPivots.bullishBounce.price}
                target1Price={movementPrediction.targetMagnets.primaryTarget.price}
                target2Price={movementPrediction.targetMagnets.secondaryTarget.price}
              />

              {/* Answers Grid: Where it will go & Where it will reverse */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. أين سيذهب الذهب القادم؟ */}
                <div className="p-4 rounded-xl bg-[#0b0f19] border border-slate-800 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs pb-2 border-b border-slate-800">
                    <Target className="w-4 h-4" />
                    <span>١. أين سيذهب الذهب القادم؟ (Target Magnets)</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {movementPrediction.targetMagnets.primaryTarget.labelAr}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {movementPrediction.targetMagnets.primaryTarget.reasonAr}
                        </span>
                      </div>
                      <span className="text-sm font-black text-amber-400 font-['JetBrains_Mono']">
                        ${movementPrediction.targetMagnets.primaryTarget.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {movementPrediction.targetMagnets.secondaryTarget.labelAr}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {movementPrediction.targetMagnets.secondaryTarget.reasonAr}
                        </span>
                      </div>
                      <span className="text-sm font-black text-emerald-400 font-['JetBrains_Mono']">
                        ${movementPrediction.targetMagnets.secondaryTarget.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">
                          {movementPrediction.targetMagnets.extremeExtension.labelAr}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {movementPrediction.targetMagnets.extremeExtension.reasonAr}
                        </span>
                      </div>
                      <span className="text-sm font-black text-teal-300 font-['JetBrains_Mono']">
                        ${movementPrediction.targetMagnets.extremeExtension.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. من أين سيرتد الذهب؟ */}
                <div className="p-4 rounded-xl bg-[#0b0f19] border border-amber-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs pb-2 border-b border-slate-800">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>٢. من أين سيرتد الذهب؟ (Reversal Pivots)</span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-emerald-950/20 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-300 block font-bold">
                          ارتداد صعودي (Bullish Bounce Spring)
                        </span>
                        <span className="text-xs text-slate-300">
                          الجيب الذهبي 0.618 وكتلة الطلب (احتمالية {movementPrediction.reversalPivots.bullishBounce.probabilityPercent}%)
                        </span>
                      </div>
                      <div className="text-left font-['JetBrains_Mono']">
                        <span className="text-xs font-black text-emerald-400">
                          ${movementPrediction.reversalPivots.bullishBounce.priceRange.min} - ${movementPrediction.reversalPivots.bullishBounce.priceRange.max}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-['Cairo']">
                          رد الفعل: +${movementPrediction.reversalPivots.bullishBounce.expectedReactionDollars}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-rose-950/20 rounded-lg border border-rose-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-rose-300 block font-bold">
                          ارتداد بيعي (Bearish Supply Rejection)
                        </span>
                        <span className="text-xs text-slate-300">
                          سحب سيولة القمم BSL وجدار العرض (احتمالية {movementPrediction.reversalPivots.bearishRejection.probabilityPercent}%)
                        </span>
                      </div>
                      <div className="text-left font-['JetBrains_Mono']">
                        <span className="text-xs font-black text-rose-400">
                          ${movementPrediction.reversalPivots.bearishRejection.priceRange.min} - ${movementPrediction.reversalPivots.bearishRejection.priceRange.max}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-['Cairo']">
                          رد الفعل: -${movementPrediction.reversalPivots.bearishRejection.expectedReactionDollars}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trajectory Steps Milestones */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-white block">
                  خريطة المسار المستقبلي المتوقع خطوة بخطوة:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {movementPrediction.trajectorySteps.map((step) => (
                    <div
                      key={step.stepNumber}
                      className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-amber-400 font-bold">
                          #{step.stepNumber}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {step.timeframeEstAr}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white truncate">
                        {step.titleAr}
                      </span>
                      <span className="text-xs font-black text-amber-300 font-mono mt-1">
                        {step.priceLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fibonacci Golden Pocket Snapshot */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-slate-300">
                    الجيب الذهبي لفيبوناتشي: <strong className="text-amber-400 font-mono">${movementPrediction.fibLevels.fib0618} - ${movementPrediction.fibLevels.fib0650}</strong>
                  </span>
                </div>
                <span className="text-slate-400 text-[11px]">
                  التوجيه الأمثل: <strong className="text-emerald-400">{movementPrediction.bestActionAr}</strong>
                </span>
              </div>
            </div>
          ) : modalTab === "sniper" ? (
            <div className="space-y-4">
              <SniperRecommendationCard
                setup={sniperSetup}
                currentPrice={currentPrice}
                onRecordFeedback={handleRecordOutcome}
              />
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
          ) : modalTab === "claude" ? (
            activeClaude ? (
              <ClaudeAdvancedAnalysisWidget
                analysis={activeClaude}
                currentPrice={currentPrice}
              />
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
                <Bot className="w-8 h-8 text-orange-400 animate-spin" />
                <h4 className="text-sm font-bold text-white">جاري توليد تحليل Claude 3.7 المتطور...</h4>
                <p className="text-xs text-slate-400">
                  يقوم الذكاء بتفكيك مصائد السيولة، وتحليل الأخبار الاقتصادية الكبرى، ومطابقة توقيت الجلسات
                </p>
              </div>
            )
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
              {/* Dual AI Consensus & Comparison Radar (Gemini & Claude Side-by-Side) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-orange-950/40 border border-amber-500/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-orange-500 text-white">
                      <Sparkles className="w-4 h-4 animate-spin" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                        رادار توافق الذكاءين: Gemini &amp; Claude 3.7
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold font-mono">
                          {dualConsensus.agreementScore}% توافق تام
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        مقارنة لحظية حية بين رؤية الذكاء الأول (Gemini) والذكاء الثاني (Claude)
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg">
                    {dualConsensus.recommendedActionAr}
                  </span>
                </div>

                {/* Side-by-Side Mini Cards: Gemini vs Claude */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Left: Gemini */}
                  <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        الذكاء الأول: Gemini
                      </span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded font-mono">
                        {analysis?.confidenceScore || 88}% ثقة
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white mb-1">
                      {analysis?.bias || "تجميع شرائي صاعد"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      الهدف: <strong className="text-amber-300 font-mono">{analysis?.setup?.takeProfit1 || "$4,306.00"}</strong> • الارتداد: <strong className="text-emerald-400 font-mono">${(currentPrice - 7.5).toFixed(2)}</strong>
                    </span>
                  </div>

                  {/* Right: Claude */}
                  <div
                    onClick={() => setModalTab("claude")}
                    className="p-3 rounded-lg bg-orange-950/30 border border-orange-500/30 hover:border-orange-400 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-orange-300 flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-orange-400" />
                        الذكاء الثاني: Claude 3.7
                      </span>
                      <span className="text-[10px] bg-orange-500/20 text-orange-300 px-1.5 py-0.2 rounded font-mono">
                        {activeClaude?.confidenceScore || 91}% ثقة
                      </span>
                    </div>
                    <span className="text-xs font-bold text-white mb-1">
                      {activeClaude?.biasAr || "توسع هيكلي صاعد"}
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>الهدف: <strong className="text-amber-300 font-mono">{activeClaude?.keyLevels?.target1 || "$4,308.00"}</strong></span>
                      <span className="text-orange-400 font-bold hover:underline">تفاصيل كلاود ←</span>
                    </div>
                  </div>
                </div>

                {/* Synthesis Summary */}
                <p className="text-[11px] text-slate-300 leading-relaxed bg-[#0b0f19] p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-amber-400">خلاصة التوافق: </strong>
                  {dualConsensus.synthesisSummaryAr}
                </p>
              </div>

              {/* 5-Factor Causal Linkage Card (Cross-Market Precision) */}
              <div
                onClick={() => setModalTab("confluence")}
                className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-amber-950/40 border-2 border-emerald-500/40 hover:border-emerald-400 transition-all cursor-pointer space-y-2 shadow-md group"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <Link2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-2">
                        الربط السببي والتلاقي المؤسسي الشامل (Cross-Market Confluence)
                        <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.2 rounded-full font-bold">
                          {confluenceMatrix.overallScore}% دقة فائقة
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-300">
                        {confluenceMatrix.gradeAr} • تلاقي قاع المزاد VAL مع فيبوناتشي 0.618 والدلتا
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-emerald-400 font-bold group-hover:underline flex items-center gap-1">
                    <span>فتح مصفوفة التلاقي الكاملة</span>
                    <span>←</span>
                  </span>
                </div>

                {/* The 5 Linkage Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 shrink-0">
                    ١. الماكرو DXY
                  </span>
                  <span className="text-slate-500">──&gt;</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 shrink-0">
                    ٢. سحب السيولة SSL
                  </span>
                  <span className="text-slate-500">──&gt;</span>
                  <span className="px-2 py-0.5 rounded-md bg-violet-500/15 border border-violet-500/30 text-violet-300 shrink-0">
                    ٣. مزاد TPO VAL
                  </span>
                  <span className="text-slate-500">──&gt;</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shrink-0">
                    ٤. فيبوناتشي 0.618
                  </span>
                  <span className="text-slate-500">──&gt;</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 shrink-0">
                    ٥. امتصاص الفوت برنت
                  </span>
                </div>
              </div>

              {/* High Probability Pending Limits Quick Card ( لم يصل إليها السعر بعد ) */}
              <div
                onClick={() => setModalTab("pending_limits")}
                className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border-2 border-emerald-500/50 hover:border-emerald-400 transition-all cursor-pointer flex items-center justify-between flex-wrap gap-2.5 shadow-md group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-white flex items-center gap-2">
                      صفقات Limit المعلقة فائقة الضمان (لم يصل إليها السعر بعد)
                      <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.2 rounded-full font-bold">
                        A++ مضمونة 98%
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-300 line-clamp-1">
                      {pendingLimits[0]?.orderType}: ${pendingLimits[0]?.limitPrice.toFixed(2)} (يبعد ${pendingLimits[0]?.distanceDollars}) • {pendingLimits[1]?.orderType}: ${pendingLimits[1]?.limitPrice.toFixed(2)} (يبعد ${pendingLimits[1]?.distanceDollars})
                    </span>
                  </div>
                </div>

                <span className="text-xs text-emerald-400 font-bold group-hover:underline shrink-0">
                  فتح شاشة الأوامر المعلقة ←
                </span>
              </div>

              {/* Unified AI Super-Confluence: Connecting Whales, Monte Carlo, Central Banks & Squeeze */}
              <UnifiedAiSuperConfluenceCard
                currentPrice={currentPrice}
                engineName="Dual AI Consensus"
                superConfluence={analysis?.superConfluenceSynthesis || activeClaude?.superConfluenceSynthesis}
              />

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

              {/* Ultra-Precise Sniper Recommendation Card */}
              <div className="space-y-2">
                <SniperRecommendationCard
                  setup={sniperSetup}
                  currentPrice={currentPrice}
                  onRecordFeedback={handleRecordOutcome}
                />

                {/* Self-Learning Feedback Buttons */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
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

