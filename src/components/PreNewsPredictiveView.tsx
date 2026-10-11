import React, { useState, useEffect, useMemo } from "react";
import {
  Newspaper,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldAlert,
  Zap,
  Target,
  BarChart3,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  RotateCw,
  Volume2,
  Sliders,
  DollarSign,
  Activity,
  Compass,
  Info,
} from "lucide-react";
import {
  HighImpactMacroEvent,
  MacroEventCode,
  PreNewsPredictiveReport,
  PreNewsScenario,
  PreNewsLiquidityTarget,
} from "../types";
import {
  generatePreNewsPredictiveReport,
  simulatePreNewsOutcome,
} from "../services/preNewsPredictiveService";
import { soundFx } from "../services/soundService";

interface PreNewsPredictiveViewProps {
  currentPrice: number;
  openAiKey?: string;
  onOpenSettings?: () => void;
}

export const PreNewsPredictiveView: React.FC<PreNewsPredictiveViewProps> = ({
  currentPrice = 4293.65,
  openAiKey,
  onOpenSettings,
}) => {
  const [selectedEventCode, setSelectedEventCode] = useState<MacroEventCode>("CPI");
  const [report, setReport] = useState<PreNewsPredictiveReport>(() =>
    generatePreNewsPredictiveReport(currentPrice, 101.42, -0.14, "CPI")
  );
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("scen_a_bullish");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // What-If Simulator state
  const [simSurprise, setSimSurprise] = useState<
    "extreme_bullish" | "mild_bullish" | "neutral" | "mild_bearish" | "extreme_bearish"
  >("mild_bullish");

  // Keep report synchronized when price changes or selected event changes
  useEffect(() => {
    setReport(
      generatePreNewsPredictiveReport(
        currentPrice,
        101.42,
        -0.14,
        selectedEventCode
      )
    );
  }, [currentPrice, selectedEventCode]);

  const activeEvent: HighImpactMacroEvent = report.featuredEvent;

  // Selected scenario
  const activeScenario = useMemo(() => {
    return (
      activeEvent.scenarios.find((s) => s.id === selectedScenarioId) ||
      activeEvent.scenarios[0]
    );
  }, [activeEvent, selectedScenarioId]);

  // Simulation result
  const simulationResult = useMemo(() => {
    return simulatePreNewsOutcome(activeEvent, simSurprise, currentPrice);
  }, [activeEvent, simSurprise, currentPrice]);

  // Copy order setup to clipboard
  const handleCopyOrder = (scenario: PreNewsScenario) => {
    const text = `=== XAU/USD Pre-News Setup (${activeEvent.code}) ===
الحدث: ${activeEvent.titleAr}
السيناريو: ${scenario.nameAr}
نقطة الدخول (Entry): $${scenario.sniperEntryPrice}
وقف الخسارة (SL): $${scenario.invalidationStopPrice}
الهدف الأول (TP1): $${scenario.targetPrice}
الهدف الثاني (TP2): $${scenario.tp2Price}
نسبة العائد للمخاطرة (R:R): ${scenario.riskRewardRatio}
الحركة المتوقعة: ${scenario.expectedGoldMovePips} نقطة
التوصية: ${scenario.actionRecommendationAr}`;

    navigator.clipboard.writeText(text);
    setCopiedId(scenario.id);
    soundFx.playChime();
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Text to speech for institutional briefing
  const handleToggleSpeak = () => {
    if (isSpeaking) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(activeEvent.aiSynthesisAr);
      utterance.lang = "ar-SA";
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      soundFx.playSonarPulse();
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    soundFx.playHudClick();
    setTimeout(() => {
      setReport(
        generatePreNewsPredictiveReport(
          currentPrice,
          101.42,
          -0.14,
          selectedEventCode
        )
      );
      setIsRefreshing(false);
      soundFx.playSuccessChime();
    }, 600);
  };

  return (
    <div className="flex-1 bg-[#0b0f17] text-slate-100 p-3 sm:p-5 overflow-y-auto space-y-4 select-none pb-24">
      {/* 1. Header Banner & Countdown */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#111726] to-[#1a1215] border border-amber-500/30 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                تأثير حرج فائق (Critical High-Impact)
              </span>

              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                تحليل استباقي قبل صدور الخبر (Pre-News Forecast)
              </span>

              {openAiKey ? (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  OpenAI GPT-4o موثق
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-indigo-400" />
                  OrderFlow Institutional Engine
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-amber-400 shrink-0" />
              <span>التحليل الاستباقي لأخبار الذهب وتمركز السيولة المؤسسية</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              تجميع وتحليل بيانات آخر 24 إصداراً للأخبار الكبرى، وتحديد أحواض سيولة القمم (BSL) والقيعان (SSL) وأفخاخ جوداس (Judas Swings) على الذهب (XAU/USD) قبل انفجار الحركة.
            </p>
          </div>

          {/* Quick Refresh & Live Countdown Card */}
          <div className="flex items-center gap-3 shrink-0 self-stretch md:self-auto justify-between md:justify-end">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/40 text-center shadow-lg min-w-[140px]">
              <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-bold mb-0.5">
                <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>العد التنازلي للصدور</span>
              </div>
              <div className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
                T- {activeEvent.countdownMinutes} دقيقة
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {activeEvent.timeFormatted}
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-750 flex items-center justify-center cursor-pointer active:scale-95 shadow-md"
              title="تحديث البيانات اللحظية الاستباقية"
            >
              <RotateCw
                className={`w-4 h-4 text-amber-400 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Event Selection Tabs (CPI, NFP, FOMC, PCE, Retail Sales) */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-xs text-slate-400 font-bold whitespace-nowrap pl-1">
            اختر المؤشر الاقتصادي:
          </span>
          {report.upcomingEvents.map((evt) => (
            <button
              key={evt.code}
              onClick={() => {
                setSelectedEventCode(evt.code);
                soundFx.playHudClick();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                selectedEventCode === evt.code
                  ? "bg-amber-500 text-slate-950 shadow-md font-black scale-102"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60"
              }`}
            >
              <span className="font-mono">{evt.code}</span>
              <span className="text-[10px] opacity-90 hidden sm:inline">
                ({evt.countdownMinutes}m)
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Event Profile & Institutional Sentiment Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Previous vs Forecast */}
        <div className="p-3.5 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>التوقعات مقابل السابق</span>
            <span className="text-amber-400 font-mono text-xs">{activeEvent.code}</span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div>
              <span className="text-[10px] text-slate-500 block">السابق (Prev):</span>
              <span className="text-sm font-bold text-slate-300 font-mono">
                {activeEvent.previous}
              </span>
            </div>
            <div className="text-slate-600 font-bold">←</div>
            <div>
              <span className="text-[10px] text-amber-400/80 block">المتوقع (Forecast):</span>
              <span className="text-sm font-black text-amber-300 font-mono">
                {activeEvent.forecast}
              </span>
            </div>
          </div>
        </div>

        {/* Historical Volatility */}
        <div className="p-3.5 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>التقلب التاريخي المتوقع</span>
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-lg font-black text-blue-400 font-mono pt-1">
            ±{activeEvent.historicalVolatilityPips} نقطة
          </div>
          <div className="text-[10px] text-slate-400">
            متوسط التوسع في أول 30 دقيقة
          </div>
        </div>

        {/* DXY Correlation */}
        <div className="p-3.5 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>حساسية الدولار DXY</span>
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400 font-mono pt-1">
            {activeEvent.dxyInverseSensitivity} Beta
          </div>
          <div className="text-[10px] text-slate-400">
            علاقة عكسية متطرفة مع الذهب
          </div>
        </div>

        {/* Pre-News Sentiment */}
        <div className="p-3.5 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>التمركز المؤسسي قبل الخبر</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xs font-black text-amber-300 pt-1 leading-snug line-clamp-1">
            {activeEvent.sentimentLabelAr}
          </div>
          <div className="text-[10px] text-emerald-400 font-bold">
            معدل نجاح الاستباق: {activeEvent.historicalTrackRecord.setupWinRatePercent}%
          </div>
        </div>
      </div>

      {/* 4. Pre-News Consolidation Range & Liquidity Pools Map (Interactive) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1320] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              خريطة تمركز السيولة ونطاق التماسك الهندسي (Pre-News Liquidity Map)
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">سعر الذهب اللحظي:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              ${currentPrice.toFixed(2)}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 font-mono">
              عرض النطاق: {activeEvent.preNewsConsolidation.rangeWidthPips} نقطة
            </span>
          </div>
        </div>

        {/* Visual Liquidity Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {activeEvent.liquidityTargets.map((target, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                target.type === "BSL_POOL"
                  ? "bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/70"
                  : target.type === "SSL_POOL"
                  ? "bg-rose-950/20 border-rose-500/40 hover:border-rose-500/70"
                  : target.type === "FVG_IMBALANCE"
                  ? "bg-amber-950/20 border-amber-500/40 hover:border-amber-500/70"
                  : "bg-blue-950/20 border-blue-500/40 hover:border-blue-500/70"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      target.type === "BSL_POOL"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : target.type === "SSL_POOL"
                        ? "bg-rose-500/20 text-rose-300"
                        : target.type === "FVG_IMBALANCE"
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {target.type}
                  </span>

                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    احتمال الصيد: {target.probabilitySweptPercent}%
                  </span>
                </div>

                <div className="text-sm font-bold text-white flex items-center justify-between pt-1">
                  <span className="font-mono text-base text-amber-300">
                    ${target.levelPrice}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {target.distancePips > 0 ? `+${target.distancePips}` : target.distancePips} نقطة
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-200 leading-snug">
                  {target.typeLabelAr}
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  {target.descriptionAr}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">الأوامر المتراكمة:</span>
                <span className="font-mono font-bold text-white">
                  {target.estimatedVolumeLots.toLocaleString()} لوت
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. The 3 Institutional Execution Scenarios (Playbooks) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0c111c] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <span>سيناريوهات التداول الاستباقية الثلاثة (Pre-News Tactical Scenarios)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              خطط تنفيذ دقيقة محددة بالأرقام قبل لحظة صدور الخبر لاقتناص رد الفعل المؤسسي
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {activeEvent.scenarios.map((scen, idx) => (
              <button
                key={scen.id}
                onClick={() => {
                  setSelectedScenarioId(scen.id);
                  soundFx.playHudClick();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedScenarioId === scen.id
                    ? scen.direction === "LONG"
                      ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                      : scen.direction === "SHORT"
                      ? "bg-rose-500 text-white font-black shadow-sm"
                      : "bg-amber-500 text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                السيناريو {idx === 0 ? "أ (شراء)" : idx === 1 ? "ب (بيع)" : "ج (فخ جوداس)"}
              </button>
            ))}
          </div>
        </div>

        {/* Active Scenario Card */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-750 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-black uppercase font-mono ${
                  activeScenario.direction === "LONG"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : activeScenario.direction === "SHORT"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}
              >
                {activeScenario.direction}
              </span>
              <h3 className="text-sm font-bold text-white">{activeScenario.nameAr}</h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                الاحتمالية:{" "}
                <strong className="text-emerald-400 font-mono">
                  {activeScenario.probabilityPercent}%
                </strong>
              </span>
              <span className="text-xs text-slate-400">
                العائد:{" "}
                <strong className="text-amber-400 font-mono">
                  {activeScenario.riskRewardRatio}
                </strong>
              </span>
              <button
                onClick={() => handleCopyOrder(activeScenario)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                {copiedId === activeScenario.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>نسخ الخطة كاملة</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-amber-300/90 leading-relaxed font-semibold bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
            الشرط الفني: {activeScenario.conditionAr}
          </p>

          {/* Key Execution Levels */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">نقطة الدخول القناص</span>
              <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
                ${activeScenario.sniperEntryPrice}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">وقف الخسارة (SL)</span>
              <span className="text-sm sm:text-base font-black text-rose-400 font-mono">
                ${activeScenario.invalidationStopPrice}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">الهدف الأول (TP1)</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                ${activeScenario.targetPrice}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">الهدف الممتد (TP2)</span>
              <span className="text-sm sm:text-base font-black text-emerald-300 font-mono">
                ${activeScenario.tp2Price}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed pt-1">
            <strong className="text-white">طريقة التنفيذ المؤسسي: </strong>
            {activeScenario.actionRecommendationAr}
          </div>
        </div>
      </div>

      {/* 6. Interactive "What-If" News Simulator */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#121829] to-[#0c121e] border border-blue-500/30 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              محاكي نتائج الخبر الاستباقي (Pre-News Outcome Simulator)
            </h2>
          </div>
          <span className="text-xs text-blue-300/80">
            اضغط على أي نتيجة لمعاينة المسار الفوري ورد فعل الذهب المتوقع
          </span>
        </div>

        {/* Selector Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => {
              setSimSurprise("extreme_bullish");
              soundFx.playHudClick();
            }}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
              simSurprise === "extreme_bullish"
                ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg"
                : "bg-slate-900/80 text-emerald-400 border-emerald-500/30 hover:bg-slate-800"
            }`}
          >
            مفاجأة إيجابية عظمى للذهب 🟢🟢
          </button>
          <button
            onClick={() => {
              setSimSurprise("mild_bullish");
              soundFx.playHudClick();
            }}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
              simSurprise === "mild_bullish"
                ? "bg-emerald-600 text-white border-emerald-500 font-black shadow-lg"
                : "bg-slate-900/80 text-emerald-300 border-emerald-500/20 hover:bg-slate-800"
            }`}
          >
            إيجابي معتدل للذهب 🟢
          </button>
          <button
            onClick={() => {
              setSimSurprise("neutral");
              soundFx.playHudClick();
            }}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
              simSurprise === "neutral"
                ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg"
                : "bg-slate-900/80 text-amber-300 border-amber-500/30 hover:bg-slate-800"
            }`}
          >
            مطابق للتوقعات تماماً ⚪
          </button>
          <button
            onClick={() => {
              setSimSurprise("mild_bearish");
              soundFx.playHudClick();
            }}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
              simSurprise === "mild_bearish"
                ? "bg-rose-600 text-white border-rose-500 font-black shadow-lg"
                : "bg-slate-900/80 text-rose-300 border-rose-500/20 hover:bg-slate-800"
            }`}
          >
            سلبي معتدل للذهب 🔴
          </button>
          <button
            onClick={() => {
              setSimSurprise("extreme_bearish");
              soundFx.playHudClick();
            }}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
              simSurprise === "extreme_bearish"
                ? "bg-rose-500 text-slate-950 border-rose-400 font-black shadow-lg"
                : "bg-slate-900/80 text-rose-400 border-rose-500/30 hover:bg-slate-800"
            }`}
          >
            مفاجأة سلبية عظمى للذهب 🔴🔴
          </button>
        </div>

        {/* Dynamic Simulation Result Box */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-blue-500/30 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">الحركة المتوقعة:</span>
              <span
                className={`text-lg font-black font-mono ${
                  simulationResult.projectedGoldMovePips > 0
                    ? "text-emerald-400"
                    : simulationResult.projectedGoldMovePips < 0
                    ? "text-rose-400"
                    : "text-amber-400"
                }`}
              >
                {simulationResult.projectedGoldMovePips > 0
                  ? `+${simulationResult.projectedGoldMovePips}`
                  : simulationResult.projectedGoldMovePips}{" "}
                نقطة
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">السعر المتوقع فوراً:</span>
              <span className="text-lg font-black font-mono text-amber-300">
                ${simulationResult.projectedPrice}
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/40">
              {simulationResult.targetHitLevel}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">
            {simulationResult.summaryAr}
          </p>

          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-amber-300 font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>التوصية الفورية للسيناريو: {simulationResult.recommendedSetupAr}</span>
          </div>
        </div>
      </div>

      {/* 7. Institutional Trap Warning & Safe Trading Windows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>تحذير فخ السيولة والانزلاق السعري (Liquidity Trap Warning)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {activeEvent.institutionalTrapWarningAr}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>نافذة التداول الآمن بعد الخبر (Safe Execution Window)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {activeEvent.safeTradingWindowAr}
          </p>
        </div>
      </div>

      {/* 8. AI Synthesized Institutional Briefing & Voice Synthesis */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 border border-emerald-500/30 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              التقرير الاستباقي الشامل المولد بالذكاء الاصطناعي المؤسسي
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleSpeak}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isSpeaking
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSpeaking ? "إيقاف القراءة الصوتية" : "استماع صوتي"}</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(activeEvent.aiSynthesisAr);
                soundFx.playChime();
                setCopiedId("ai_synthesis");
                setTimeout(() => setCopiedId(null), 2000);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedId === "ai_synthesis" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-300" />
                  <span>نسخ التقرير</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium">
          {activeEvent.aiSynthesisAr}
        </div>
      </div>

      {/* 9. Golden Rules for Gold News Trading */}
      <div className="p-4 rounded-xl bg-[#0a0f18] border border-slate-850 space-y-2.5">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
          <Info className="w-4 h-4 text-amber-400" />
          <span>القواعد الذهبية المؤسسية للتداول وقت أخبار الذهب:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
          {report.goldenRulesForNewsTradingAr.map((rule, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2"
            >
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
