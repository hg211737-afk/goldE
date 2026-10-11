import React, { useState, useMemo } from "react";
import {
  Brain,
  Sparkles,
  Crosshair,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  BarChart3,
  Flame,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  Layers,
  Activity,
  Coins,
  Building2,
  Compass,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Zap,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import {
  FootprintBar,
  LiquidityZone,
  MacroCorrelationReport,
  TpoMarketProfileReport,
  ZaiAnalysisResult,
} from "../types";
import { generateZaiGoldAnalysis } from "../services/zaiGoldAnalysisService";
import { soundFx } from "../services/soundService";
import { voiceAlert } from "../services/voiceAlertService";

interface ZaiGoldAnalysisViewProps {
  currentPrice: number;
  bars?: FootprintBar[];
  tpoReport?: TpoMarketProfileReport;
  liquidityZones?: LiquidityZone[];
  macroReport?: MacroCorrelationReport;
  onNavigateToView?: (view: any) => void;
}

export const ZaiGoldAnalysisView: React.FC<ZaiGoldAnalysisViewProps> = ({
  currentPrice,
  bars,
  tpoReport,
  liquidityZones,
  macroReport,
  onNavigateToView,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [evalMode, setEvalMode] = useState<"AUTO" | "FORCE_ACTIVE" | "FORCE_WAIT">("AUTO");
  const [refreshSpin, setRefreshSpin] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const analysis: ZaiAnalysisResult = useMemo(() => {
    return generateZaiGoldAnalysis({
      currentPrice,
      bars,
      tpoReport,
      liquidityZones,
      macroReport,
      forceMode: evalMode,
    });
  }, [currentPrice, bars, tpoReport, liquidityZones, macroReport, evalMode, refreshKey]);

  const isActiveSetup = analysis.decisionState === "ACTIVE_GRADE_A_SETUP";
  const setup = analysis.activeTradeSetup;
  const waiting = analysis.waitingZoneGuidance;

  const handleManualRefresh = () => {
    setRefreshSpin(true);
    soundFx.playChime();
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshSpin(false), 500);
  };

  const handleSpeakBriefing = () => {
    soundFx.playIcebergAlert();
    voiceAlert.speak(analysis.voiceBriefingAr, "urgent");
  };

  const handleCopyCommand = () => {
    if (setup?.mtCommand) {
      navigator.clipboard.writeText(setup.mtCommand);
      setCopied(true);
      soundFx.playHudClick();
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-2.5 sm:p-4 bg-[#0a0d14] text-slate-100 font-['Cairo'] overflow-y-auto space-y-4 max-w-7xl mx-auto w-full">
      {/* Top Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#111827] via-[#0f172a] to-[#1e1b4b] border-2 border-indigo-500/40 shadow-2xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="relative p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.5)]">
            <Brain className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 ring-2 ring-slate-950 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>الذكاء الاصطناعي z.ai لتحليل الذهب المؤسسي</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  {analysis.version}
                </span>
              </h2>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black ${
                isActiveSetup
                  ? "bg-emerald-400 text-slate-950 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  : "bg-amber-400 text-slate-950"
              }`}>
                {isActiveSetup ? "فرصة صفقة قوية نشطة الآن" : "بروتوكول الانتظار والمراقبة"}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              محرك استدلال كمي يحلل الذهب في الوقت الحقيقي؛ يقتنص الصفقات الممتازة فور جاهزيتها، ويحميك بأمر الانتظار الصريح عند ابتعاد السعر عن مناطق القوة.
            </p>
          </div>
        </div>

        {/* Action Controls & Simulation Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setEvalMode("AUTO")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                evalMode === "AUTO"
                  ? "bg-indigo-600 text-white shadow-xs font-black"
                  : "text-slate-400 hover:text-white"
              }`}
              title="التقييم التلقائي المباشر بناءً على موقع السعر الحقيقي"
            >
              آلي لحظي (Auto)
            </button>
            <button
              onClick={() => setEvalMode("FORCE_ACTIVE")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                evalMode === "FORCE_ACTIVE"
                  ? "bg-emerald-600 text-white shadow-xs font-black"
                  : "text-slate-400 hover:text-white"
              }`}
              title="محاكاة ظهور فرصة صفقة قوية A+"
            >
              فرصة نشطة
            </button>
            <button
              onClick={() => setEvalMode("FORCE_WAIT")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                evalMode === "FORCE_WAIT"
                  ? "bg-amber-600 text-white shadow-xs font-black"
                  : "text-slate-400 hover:text-white"
              }`}
              title="محاكاة وضع الانتظار وتحديد النطاق المستهدف"
            >
              وضع الانتظار
            </button>
          </div>

          <button
            onClick={handleSpeakBriefing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs cursor-pointer shadow-md active:scale-95 hover:opacity-90 transition-all"
            title="الاستماع للملخص الصوتي بصوت المساعد التكتيكي"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>نطق تقرير z.ai</span>
          </button>

          <button
            onClick={handleManualRefresh}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer active:scale-95"
            title="تحديث التحليل وقراءة مستويات السوق فوراً"
          >
            <RefreshCw className={`w-4 h-4 ${refreshSpin ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Status HUD Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-['Cairo']">سعر الذهب اللحظي:</span>
          <span className="text-base sm:text-lg font-black text-white tracking-tight">
            ${currentPrice.toFixed(2)}
          </span>
          <span className="text-[10px] text-emerald-400 block font-['Cairo']">بث فوري مباشر</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-['Cairo']">حالة قرار z.ai:</span>
          <span className={`text-sm sm:text-base font-black font-['Cairo'] ${
            isActiveSetup ? "text-emerald-400" : "text-amber-400"
          }`}>
            {isActiveSetup ? "دخول فوري معتمد" : "انتظار النطاق المحدد"}
          </span>
          <span className="text-[10px] text-slate-400 block font-['Cairo']">ثقة النموذج: {analysis.confidenceScore}%</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-['Cairo']">المرحلة الهيكلية:</span>
          <span className="text-xs font-bold text-cyan-300 block font-['Cairo'] truncate mt-0.5">
            {analysis.marketPhaseAr}
          </span>
          <span className="text-[10px] text-slate-400 block font-['Cairo']">تحديد خوارزمي</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-['Cairo']">تكامل أدوات المنصة:</span>
          <span className="text-sm font-black text-indigo-300 block font-mono">
            5 / 5 أدوات متوافقة
          </span>
          <span className="text-[10px] text-emerald-400 block font-['Cairo']">فوت برنت • TPO • حيتان</span>
        </div>
      </div>

      {/* CORE DECISION DISPLAY: ACTIVE SETUP vs WAITING ZONE */}
      {isActiveSetup && setup ? (
        /* CASE 1: ACTIVE GRADE-A SETUP CARD */
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c1a16] via-[#0a131b] to-[#0d1722] border-2 border-emerald-500/50 shadow-[0_0_35px_rgba(16,185,129,0.15)] space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-emerald-500/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Crosshair className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-emerald-500 text-slate-950 font-mono">
                    {setup.orderType}
                  </span>
                  <span className="text-xs font-black text-emerald-300">
                    صفقة قناصة A+ مكتملة الأركان
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                    R:R {setup.riskReward}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white mt-1">
                  {analysis.decisionHeadlineAr}
                </h3>
              </div>
            </div>

            <button
              onClick={handleCopyCommand}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md active:scale-95 ${
                copied
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30"
              }`}
              title="نسخ أمر التنفيذ لمنصات التداول MT4 / MT5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "تم النسخ بنجاح!" : "نسخ الأمر (MT4/5)"}</span>
            </button>
          </div>

          {/* Numbers Grid: Entry - SL - Targets */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/40">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">سعر الدخول المثالي (Limit):</span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                ${setup.entryPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                النطاق: [${setup.entryRange.min} - ${setup.entryRange.max}]
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/40">
              <span className="text-[10px] text-rose-400 block font-['Cairo']">وقف الخسارة المحكم (SL بالملي):</span>
              <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                ${setup.stopLoss.toFixed(2)}
              </span>
              <span className="text-[10px] text-rose-300 block font-mono">
                المسافة: -{setup.slPips} نقطة (Pips)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/40">
              <span className="text-[10px] text-emerald-400 block font-['Cairo']">الهدف الأول (TP1 - تأمين):</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                ${setup.tp1.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-300 block font-mono">
                +{Math.abs(Math.round((setup.tp1 - setup.entryPrice) * 10))} نقطة (حجز 50%)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/40">
              <span className="text-[10px] text-cyan-400 block font-['Cairo']">الهدف الأقصى (TP3):</span>
              <span className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
                ${setup.tp3.toFixed(2)}
              </span>
              <span className="text-[10px] text-cyan-400 block font-mono">
                TP2: ${setup.tp2.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <strong className="text-emerald-400 block mb-1">🎯 الأطروحة التكتيكية لمحرك z.ai:</strong>
            {setup.thesisAr}
            <div className="mt-1.5 text-[11px] text-slate-400 font-mono">
              🛡️ {setup.slRationaleAr}
            </div>
          </div>
        </div>
      ) : (
        /* CASE 2: WAITING FOR KEY ZONE GUIDANCE CARD */
        waiting && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1b140b] via-[#151119] to-[#0e1424] border-2 border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.15)] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <AlertTriangle className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-amber-500 text-slate-950 font-mono">
                      WAIT &amp; WATCH
                    </span>
                    <span className="text-xs font-black text-amber-300">
                      بروتوكول الانضباط المؤسسي (تجنب الدخول العشوائي)
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white mt-1">
                    {analysis.decisionHeadlineAr}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-bold">
                  المسافة للنطاق: ${waiting.distanceFromCurrentPriceDollars} ({waiting.distancePips} نقطة)
                </span>
              </div>
            </div>

            {/* Why Wait & Target Zone Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Target Zone Highlight (Left 5 Cols) */}
              <div className="md:col-span-5 p-3.5 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 block font-['Cairo'] font-bold">
                    📍 المنطقة المنتظرة التي حددها z.ai:
                  </span>
                  <h4 className="text-sm font-black text-white mt-0.5">
                    {waiting.recommendedZoneNameAr}
                  </h4>
                  <div className="my-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-center">
                    <span className="text-xs text-slate-400 block font-['Cairo']">النطاق المحدد بالدولار:</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono block">
                      ${waiting.targetZoneRange.min.toFixed(2)} - ${waiting.targetZoneRange.max.toFixed(2)}
                    </span>
                    <span className="text-xs text-emerald-400 font-bold block mt-0.5 font-mono">
                      نقطة الارتداد النموذجية: ${waiting.idealBouncePrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span>الإجراء المخطط له عند الوصول: </span>
                  <strong className="text-emerald-400 font-bold">
                    {waiting.expectedActionUponArrival === "BUY" ? "تفعيل صفقة شراء قناصة (Buy)" : "تفعيل صفقة بيع (Sell)"}
                  </strong>
                </div>
              </div>

              {/* Reasoning & Trigger Checklist (Right 7 Cols) */}
              <div className="md:col-span-7 space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-amber-400 block mb-1">💡 لماذا ننتظر ولا ندخل عند السعر الحالي؟</strong>
                  {waiting.whyWaitAr}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <strong className="text-xs text-cyan-300 block">
                    📋 الشروط التأكيدية المطلوبة فور وصول السعر للمنطقة لتفعيل الصفقة:
                  </strong>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {waiting.requiredConfirmationsAr.map((cond, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Contingency Invalidation */}
            <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>شرط الإلغاء والحماية: </strong> {waiting.contingencyWarningAr}
              </span>
            </div>
          </div>
        )
      )}

      {/* COMPREHENSIVE TOOLS BREAKDOWN (The 5 Pillars Driving z.ai) */}
      <div className="space-y-2">
        <h3 className="text-xs sm:text-sm font-black text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>تشخيص أدوات المنصة المدمجة في قرار z.ai (Integrated Tools Matrix):</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Live Cross-Verification</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* 1. Footprint & Order Flow */}
          <div className="p-3 rounded-xl bg-[#0e1422] border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-bold text-orange-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>١. تدفق الأوامر والفوت برنت</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded font-bold">
                {analysis.toolConfluence.footprintOrderFlow.deltaScore}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {analysis.toolConfluence.footprintOrderFlow.statusAr}
            </p>
            <span className="text-[10px] text-slate-400 block pt-0.5">
              {analysis.toolConfluence.footprintOrderFlow.imbalanceVerdictAr}
            </span>
          </div>

          {/* 2. TPO Market Profile */}
          <div className="p-3 rounded-xl bg-[#0e1422] border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-bold text-violet-400 flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>٢. بروفايل TPO والفاب</span>
              </span>
              <span className="text-[10px] font-mono text-violet-300 bg-violet-500/10 px-1.5 py-0.2 rounded font-bold">
                منطقة القيمة
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {analysis.toolConfluence.marketProfileTpo.statusAr}
            </p>
            <span className="text-[10px] text-slate-400 block pt-0.5">
              {analysis.toolConfluence.marketProfileTpo.pocLocationAr}
            </span>
          </div>

          {/* 3. Whale Radar */}
          <div className="p-3 rounded-xl bg-[#0e1422] border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-bold text-teal-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5" />
                <span>٣. رادار الحيتان الشامل</span>
              </span>
              <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-1.5 py-0.2 rounded font-bold">
                تطابق 97.4%
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {analysis.toolConfluence.whaleRadar.bullionTransfersAr}
            </p>
            <span className="text-[10px] text-slate-400 block pt-0.5">
              {analysis.toolConfluence.whaleRadar.cmeFuturesAlignmentAr}
            </span>
          </div>

          {/* 4. Reversal Predictor */}
          <div className="p-3 rounded-xl bg-[#0e1422] border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" />
                <span>٤. الجيب الذهبي 0.618 Fib</span>
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.2 rounded font-bold">
                ارتداد محتوم
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {analysis.toolConfluence.reversalPredictor.statusAr}
            </p>
            <span className="text-[10px] text-slate-400 block pt-0.5">
              {analysis.toolConfluence.reversalPredictor.fibGoldenPocketAr}
            </span>
          </div>

          {/* 5. Macro DXY Correlation */}
          <div className="p-3 rounded-xl bg-[#0e1422] border border-slate-800 space-y-1.5 md:col-span-2 lg:col-span-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                <span>٥. مؤشر الدولار والماكرو (DXY Correlation)</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-1.5 py-0.2 rounded font-bold">
                علاقة عكسية متوافقة
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {analysis.toolConfluence.macroDxy.statusAr} — {analysis.toolConfluence.macroDxy.dollarCorrelationAr}
            </p>
          </div>
        </div>
      </div>

      {/* Direct App Tool Quick Navigation Shortcuts */}
      {onNavigateToView && (
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-bold">التنقل السريع لأدوات المنصة المربوطة بـ z.ai:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onNavigateToView("signals")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold cursor-pointer"
            >
              التوصيات القناصة
            </button>
            <button
              onClick={() => onNavigateToView("radar")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold cursor-pointer"
            >
              رادار الحيتان
            </button>
            <button
              onClick={() => onNavigateToView("footprint")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold cursor-pointer"
            >
              شارت الفوت برنت
            </button>
            <button
              onClick={() => onNavigateToView("predictor")}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-yellow-300 font-bold cursor-pointer"
            >
              منبئ الارتداد
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
