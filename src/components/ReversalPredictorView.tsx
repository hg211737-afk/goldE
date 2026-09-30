import React, { useState, useMemo, useEffect } from "react";
import {
  Compass,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCw,
  Sparkles,
  Calculator,
  Layers,
  Activity,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  Flame,
  Info,
} from "lucide-react";
import {
  FootprintBar,
  GoldMovementPrediction,
  LiquidityZone,
  ReversalPivotZone,
  TrajectoryStep,
} from "../types";
import {
  generateMovementPrediction,
  calculateCustomReversal,
  predictGoldMovementWithAI,
} from "../services/reversalPredictorService";

interface ReversalPredictorViewProps {
  currentPrice: number;
  bars?: FootprintBar[];
  liquidityZones?: LiquidityZone[];
  timeframe?: string;
  customApiKey?: string;
  preferredModel?: string;
}

export const ReversalPredictorView: React.FC<ReversalPredictorViewProps> = ({
  currentPrice,
  bars = [],
  liquidityZones = [],
  timeframe = "5m",
  customApiKey,
  preferredModel = "gemini-2.5-flash",
}) => {
  const [prediction, setPrediction] = useState<GoldMovementPrediction>(() =>
    generateMovementPrediction({ currentPrice, bars, liquidityZones, timeframe })
  );
  const [selectedPivotTab, setSelectedPivotTab] = useState<"bullish" | "bearish" | "fibs">("bullish");
  const [selectedTrajectoryStep, setSelectedTrajectoryStep] = useState<number>(3);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Live Calculator State
  const [calcPrice, setCalcPrice] = useState<number>(currentPrice);
  const [calcDirection, setCalcDirection] = useState<"BUY" | "SELL">("BUY");

  // Keep calculator in sync when currentPrice updates if user hasn't manually diverged
  useEffect(() => {
    setPrediction(prev => {
      // Re-generate if price moved significantly (more than 0.50)
      if (Math.abs(prev.currentPrice - currentPrice) >= 0.50) {
        return generateMovementPrediction({ currentPrice, bars, liquidityZones, timeframe });
      }
      return prev;
    });
  }, [currentPrice, bars, liquidityZones, timeframe]);

  const customCalcResult = useMemo(() => {
    return calculateCustomReversal(calcPrice, calcDirection, currentPrice);
  }, [calcPrice, calcDirection, currentPrice]);

  const handleTriggerAiDeepForecast = async () => {
    setIsAiLoading(true);
    try {
      const aiResult = await predictGoldMovementWithAI({
        currentPrice,
        bars,
        liquidityZones,
        timeframe,
        customApiKey,
        preferredModel,
      });
      setPrediction(aiResult);
    } catch (err) {
      console.error("AI forecast failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const isBullish = prediction.primaryDirection === "BULLISH_EXPANSION";

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] text-slate-100 overflow-y-auto p-2 sm:p-4 gap-3 sm:gap-4 font-['Cairo'] select-none">
      {/* 1. Top Executive Banner: Answers the User's Questions Directly */}
      <div className="bg-gradient-to-r from-[#111726] via-[#161d2f] to-[#111726] border border-amber-500/30 rounded-2xl p-3.5 sm:p-5 shadow-[0_0_30px_rgba(245,158,11,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black text-white">
                  أداة التنبؤ بمسار الذهب ومناطق الارتداد المؤسسي
                </h1>
                <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-['JetBrains_Mono']">
                  Gold Movement &amp; Reversal Predictor
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  تحديث لحظي OANDA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد الاتجاه القادم بدقة • أين سيذهب الذهب • من أين سيرتد بالملي والسنت • مستويات فيبوناتشي الذهبية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerAiDeepForecast}
              disabled={isAiLoading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${isAiLoading ? "animate-spin" : ""}`} />
              <span>{isAiLoading ? "جاري التنبؤ العميق..." : "تنبؤ الذكاء الاصطناعي (Gemini)"}</span>
            </button>
            <button
              onClick={() => setPrediction(generateMovementPrediction({ currentPrice, bars, liquidityZones, timeframe }))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="إعادة حساب المؤشرات الحركية"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Direct Answer Summary Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-4 pt-3.5 border-t border-slate-800/80">
          {/* Question 1: What is the upcoming movement? */}
          <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">
              ١. حركة الذهب القادمة المتوقعة
            </span>
            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg ${isBullish ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                {isBullish ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </span>
              <div>
                <span className="text-sm font-black text-white block">
                  {prediction.primaryDirectionAr}
                </span>
                <span className="text-[11px] text-amber-400 font-bold font-['JetBrains_Mono']">
                  نسبة الاحتمالية: {prediction.directionConfidence}% • مسافة: {prediction.expectedMovePips} نقطة (${prediction.expectedMoveDollars})
                </span>
              </div>
            </div>
          </div>

          {/* Question 2: Where will gold go? */}
          <div className="bg-[#0b0f19]/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-slate-400 font-bold block mb-1">
              ٢. أين سيذهب الذهب القادم؟ (الأهداف)
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">الهدف الأول:</span>
                <span className="text-base font-black text-amber-400 font-['JetBrains_Mono']">
                  ${prediction.targetMagnets.primaryTarget.price.toFixed(2)}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">الهدف التوسعي:</span>
                <span className="text-base font-black text-emerald-400 font-['JetBrains_Mono']">
                  ${prediction.targetMagnets.secondaryTarget.price.toFixed(2)}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 truncate mt-1">
              {prediction.targetMagnets.primaryTarget.reasonAr}
            </span>
          </div>

          {/* Question 3: Where will it reverse from? */}
          <div className="bg-[#0b0f19]/90 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between shadow-[0_0_15px_rgba(245,158,11,0.05)]">
            <span className="text-[11px] text-amber-300 font-bold block mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>٣. من أين سيرتد الذهب؟ (نقطة الانعكاس)</span>
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">ارتداد صعودي من:</span>
                <span className="text-sm font-black text-emerald-300 font-['JetBrains_Mono']">
                  ${prediction.reversalPivots.bullishBounce.price.toFixed(2)}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">رفض بيعي من:</span>
                <span className="text-sm font-black text-rose-300 font-['JetBrains_Mono']">
                  ${prediction.reversalPivots.bearishRejection.price.toFixed(2)}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold truncate mt-1">
              احتمالية نجاح الارتداد: {prediction.reversalPivots.bullishBounce.probabilityPercent}% (الجيب الذهبي)
            </span>
          </div>
        </div>
      </div>

      {/* 2. Visual Step-by-Step Trajectory Path Map (Interactive Map) */}
      <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3 sm:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              خريطة مسار الحركة القادمة ومحطات الارتداد المتوقعة (Step-by-Step Trajectory)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            انقر على أي محطة للاطلاع على تحليل تدفق الأوامر وسلوك السعر
          </span>
        </div>

        {/* Milestone Steps Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-2.5 mt-2">
          {prediction.trajectorySteps.map((step) => {
            const isSelected = selectedTrajectoryStep === step.stepNumber;
            const isReversal = step.type === "reversal_bounce";
            const isTarget = step.type === "expansion_tp1" || step.type === "final_tp2";

            return (
              <button
                key={step.stepNumber}
                onClick={() => setSelectedTrajectoryStep(step.stepNumber)}
                className={`flex flex-col text-right p-3 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-slate-800/90 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                }`}
              >
                {isReversal && (
                  <span className="absolute -top-2 left-2 text-[9px] font-black bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 px-2 py-0.2 rounded-full shadow-xs">
                    محطة الارتداد
                  </span>
                )}
                {isTarget && (
                  <span className="absolute -top-2 left-2 text-[9px] font-black bg-emerald-500 text-slate-950 px-2 py-0.2 rounded-full shadow-xs">
                    هدف
                  </span>
                )}

                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400">
                    محطة #{step.stepNumber}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {step.timeframeEstAr}
                  </span>
                </div>

                <span className="text-xs font-bold text-white truncate">
                  {step.titleAr}
                </span>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400">السعر:</span>
                  <span
                    className={`text-sm font-black font-['JetBrains_Mono'] ${
                      isReversal
                        ? "text-amber-400"
                        : isTarget
                        ? "text-emerald-400"
                        : "text-slate-200"
                    }`}
                  >
                    {step.priceLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Deep Detail Box */}
        {selectedTrajectoryStep && (
          <div className="bg-[#0c101a] border border-amber-500/20 rounded-xl p-3.5 mt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm shrink-0 mt-0.5">
                {selectedTrajectoryStep}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">
                    {prediction.trajectorySteps[selectedTrajectoryStep - 1]?.titleAr}
                  </span>
                  <span className="text-[11px] font-bold text-amber-400 font-['JetBrains_Mono']">
                    {prediction.trajectorySteps[selectedTrajectoryStep - 1]?.priceLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {prediction.trajectorySteps[selectedTrajectoryStep - 1]?.descriptionAr}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <span className="text-[11px] text-slate-400">
                السلوك المتوقع: <strong className="text-emerald-400">{prediction.trajectorySteps[selectedTrajectoryStep - 1]?.actionAr}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Reversal Pivots Grid & Institutional Confluence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Left 2 Columns: Detailed Reversal Pivots */}
        <div className="lg:col-span-2 bg-[#111622] border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex flex-col gap-3.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                مناطق الارتداد المؤسسي الدقيقة (Institutional Reversal Pivots)
              </h2>
            </div>

            {/* Pivot Type Tabs */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setSelectedPivotTab("bullish")}
                className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                  selectedPivotTab === "bullish"
                    ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ارتداد صعودي (Bullish Bounce)
              </button>
              <button
                onClick={() => setSelectedPivotTab("bearish")}
                className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                  selectedPivotTab === "bearish"
                    ? "bg-rose-500 text-white font-black shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ارتداد بيعي (Bearish Rejection)
              </button>
              <button
                onClick={() => setSelectedPivotTab("fibs")}
                className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                  selectedPivotTab === "fibs"
                    ? "bg-amber-500 text-slate-950 font-black shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                مصفوفة فيبوناتشي 0.618
              </button>
            </div>
          </div>

          {/* Pivot Content Based on Selected Tab */}
          {selectedPivotTab === "bullish" && (
            <div className="flex flex-col gap-3">
              <div className="bg-gradient-to-br from-emerald-950/40 via-[#0e1420] to-[#0e1420] border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      {prediction.reversalPivots.bullishBounce.nameAr}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      تتطابق مع الجيب الذهبي وكتلة الطلب المؤسسي وسحب سيولة الـ SSL
                    </span>
                  </div>

                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block">نطاق الارتداد الدقيق:</span>
                    <span className="text-lg font-black text-emerald-300 font-['JetBrains_Mono']">
                      ${prediction.reversalPivots.bullishBounce.priceRange.min} - ${prediction.reversalPivots.bullishBounce.priceRange.max}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">المسافة من السعر الحالي</span>
                    <span className="text-xs font-bold text-amber-400 font-['JetBrains_Mono']">
                      {prediction.reversalPivots.bullishBounce.distancePips} نقطة
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">احتمالية تحقق الارتداد</span>
                    <span className="text-xs font-bold text-emerald-400 font-['JetBrains_Mono']">
                      {prediction.reversalPivots.bullishBounce.probabilityPercent}% (قوة فائقة)
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">رد الفعل المتوقع</span>
                    <span className="text-xs font-bold text-white font-['JetBrains_Mono']">
                      +${prediction.reversalPivots.bullishBounce.expectedReactionDollars}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">العائد للمخاطرة R:R</span>
                    <span className="text-xs font-bold text-teal-400 font-['JetBrains_Mono']">
                      {prediction.reversalPivots.bullishBounce.riskReward}
                    </span>
                  </div>
                </div>

                {/* Technical Rationale */}
                <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                  <span className="text-amber-400 font-bold block mb-1">
                    الشرح الفني وتدفق الأوامر للارتداد:
                  </span>
                  {prediction.reversalPivots.bullishBounce.technicalRationaleAr}
                </div>

                {/* Confluence Reasons */}
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    عوامل التلاقي المؤسسي التي تجعل هذا المستوى ارتداداً حتمياً:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {prediction.reversalPivots.bullishBounce.confluenceReasonsAr.map((reason, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-[#090d16] px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPivotTab === "bearish" && (
            <div className="flex flex-col gap-3">
              <div className="bg-gradient-to-br from-rose-950/40 via-[#0e1420] to-[#0e1420] border border-rose-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4" />
                      {prediction.reversalPivots.bearishRejection.nameAr}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      تتطابق مع جدار العرض وسحب سيولة القمم BSL وانحراف الفاب العلوي
                    </span>
                  </div>

                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block">نطاق الارتداد الدقيق:</span>
                    <span className="text-lg font-black text-rose-300 font-['JetBrains_Mono']">
                      ${prediction.reversalPivots.bearishRejection.priceRange.min} - ${prediction.reversalPivots.bearishRejection.priceRange.max}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">المسافة من السعر الحالي</span>
                    <span className="text-xs font-bold text-amber-400 font-['JetBrains_Mono']">
                      {prediction.reversalPivots.bearishRejection.distancePips} نقطة
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">احتمالية تحقق الارتداد</span>
                    <span className="text-xs font-bold text-rose-400 font-['JetBrains_Mono']">
                      {prediction.reversalPivots.bearishRejection.probabilityPercent}%
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">رد الفعل المتوقع</span>
                    <span className="text-xs font-bold text-white font-['JetBrains_Mono']">
                      -${prediction.reversalPivots.bearishRejection.expectedReactionDollars}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">العائد للمخاطرة R:R</span>
                    <span className="text-xs font-bold text-teal-400 font-['JetBrains_Mono']">
                      {prediction.reversalPivots.bearishRejection.riskReward}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                  <span className="text-amber-400 font-bold block mb-1">
                    الشرح الفني وتدفق الأوامر للارتداد:
                  </span>
                  {prediction.reversalPivots.bearishRejection.technicalRationaleAr}
                </div>

                <div className="mt-3">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                    عوامل التلاقي المؤسسي التي تجعل هذا المستوى ارتداداً حتمياً:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {prediction.reversalPivots.bearishRejection.confluenceReasonsAr.map((reason, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-[#090d16] px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-200"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPivotTab === "fibs" && (
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                مصفوفة فيبوناتشي المؤسسية والجيب الذهبي (Fibonacci Golden Pocket Matrix)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-['JetBrains_Mono']">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-['Cairo']">قمة التأرجح High</span>
                  <span className="font-bold text-slate-200">${prediction.fibLevels.swingHigh.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-['Cairo']">قاع التأرجح Low</span>
                  <span className="font-bold text-slate-200">${prediction.fibLevels.swingLow.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <span className="text-[10px] text-amber-300 block font-['Cairo'] font-bold">الجيب الذهبي 0.618</span>
                  <span className="font-black text-amber-400">${prediction.fibLevels.fib0618.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-amber-500/10 rounded-lg border border-amber-500/30">
                  <span className="text-[10px] text-amber-300 block font-['Cairo'] font-bold">الجيب الذهبي 0.650</span>
                  <span className="font-black text-amber-400">${prediction.fibLevels.fib0650.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-['Cairo']">مستوى التوازن 0.500</span>
                  <span className="font-bold text-slate-300">${prediction.fibLevels.fib0500.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-['Cairo']">مستوى 0.382</span>
                  <span className="font-bold text-slate-300">${prediction.fibLevels.fib0382.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-300 block font-['Cairo'] font-bold">امتداد 1.272</span>
                  <span className="font-bold text-emerald-400">${prediction.fibLevels.ext1272.toFixed(2)}</span>
                </div>
                <div className="p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-300 block font-['Cairo'] font-bold">امتداد 1.618</span>
                  <span className="font-black text-emerald-300">${prediction.fibLevels.ext1618.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Reversal Calculator (حاسبة الارتداد اللحظية) */}
        <div className="bg-[#111622] border border-slate-800 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                <Calculator className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">
                حاسبة الارتداد اللحظية المباشرة (Reversal Calculator)
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              أدخل أي سعر مستهدف لاحتساب منطقة الارتداد بالملي ووقف الخسارة ونسبة العائد للمخاطرة:
            </p>

            {/* Input price & direction */}
            <div className="flex flex-col gap-2 mt-1">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  السعر الأساسي المرجعي ($):
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="0.10"
                    value={calcPrice}
                    onChange={(e) => setCalcPrice(parseFloat(e.target.value) || currentPrice)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-['JetBrains_Mono'] focus:border-amber-500 focus:outline-hidden"
                  />
                  <button
                    onClick={() => setCalcPrice(currentPrice)}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 text-[10px] text-amber-300 hover:bg-slate-700 transition-all cursor-pointer shrink-0 font-bold"
                  >
                    السعر الحالي
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  نوع الارتداد المطلوب:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setCalcDirection("BUY")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      calcDirection === "BUY"
                        ? "bg-emerald-500 text-slate-950 font-black shadow-xs"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>ارتداد شراء (Bounce)</span>
                  </button>
                  <button
                    onClick={() => setCalcDirection("SELL")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      calcDirection === "SELL"
                        ? "bg-rose-500 text-white font-black shadow-xs"
                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>ارتداد بيع (Rejection)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="bg-[#0b0f19] border border-amber-500/20 rounded-xl p-3 mt-2 flex flex-col gap-2 font-['JetBrains_Mono']">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-[11px] font-bold text-amber-400 font-['Cairo']">
                  نقطة الارتداد المتوقعة:
                </span>
                <span className="text-sm font-black text-white">
                  ${customCalcResult.reversalLevel.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-['Cairo'] block">نطاق الدخول:</span>
                  <span className="text-slate-200">
                    ${customCalcResult.reversalRange.min} - ${customCalcResult.reversalRange.max}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-['Cairo'] block">وقف الخسارة SL:</span>
                  <span className="text-rose-400">
                    ${customCalcResult.stopLoss.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-['Cairo'] block">الهدف الأول TP1:</span>
                  <span className="text-emerald-400">
                    ${customCalcResult.takeProfit1.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-['Cairo'] block">الهدف الثاني TP2:</span>
                  <span className="text-teal-400">
                    ${customCalcResult.takeProfit2.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-[10px] text-slate-400 font-['Cairo']">العائد للمخاطرة R:R:</span>
                <span className="font-bold text-amber-400">{customCalcResult.riskRewardRatio}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              handleCopy(
                `XAU/USD ${calcDirection} Setup\nEntry Zone: $${customCalcResult.reversalRange.min} - $${customCalcResult.reversalRange.max}\nSL: $${customCalcResult.stopLoss}\nTP1: $${customCalcResult.takeProfit1}\nTP2: $${customCalcResult.takeProfit2}\nRR: ${customCalcResult.riskRewardRatio}`,
                "calc_signal"
              )
            }
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedText === "calc_signal" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedText === "calc_signal" ? "تم نسخ إحداثيات الارتداد!" : "نسخ إحداثيات الصفقة (MT4 / MT5)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
