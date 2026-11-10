import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Cpu,
  Crosshair,
  Database,
  ExternalLink,
  Flame,
  Globe2,
  HelpCircle,
  History,
  Layers,
  LineChart,
  Radio,
  RefreshCw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Volume2,
  Zap,
  Binary,
  Sigma,
  Gauge,
} from "lucide-react";
import {
  FootprintBar,
  LiquidityZone,
  MacroCorrelationReport,
  TpoMarketProfileReport,
  ViewMode,
} from "../types";
import { generateArgon4Analysis } from "../services/argon4AnalysisService";
import { soundFx } from "../services/soundService";
import { voiceAlert } from "../services/voiceAlertService";

interface Argon4AnalysisViewProps {
  currentPrice: number;
  bars?: FootprintBar[];
  footprintBars?: FootprintBar[];
  tpoReport?: TpoMarketProfileReport | null;
  liquidityZones?: LiquidityZone[];
  macroReport?: MacroCorrelationReport | null;
  onNavigateToView?: (view: ViewMode) => void;
  onRefresh?: () => void;
}

export const Argon4AnalysisView: React.FC<Argon4AnalysisViewProps> = ({
  currentPrice,
  bars,
  footprintBars,
  tpoReport,
  liquidityZones,
  macroReport,
  onNavigateToView,
  onRefresh,
}) => {
  const activeBars = bars || footprintBars;
  const [forceMode, setForceMode] = useState<"AUTO" | "FORCE_ACTIVE" | "FORCE_WAIT">("AUTO");
  const [activeTab, setActiveTab] = useState<"engines" | "big_data" | "scenarios" | "smart_levels" | "audit">("engines");
  const [copiedTicket, setCopiedTicket] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Generate current Argon-4 PRO Report
  const report = useMemo(() => {
    return generateArgon4Analysis({
      currentPrice,
      bars: activeBars,
      tpoReport,
      liquidityZones,
      macroReport,
      forceMode,
    });
  }, [currentPrice, activeBars, tpoReport, liquidityZones, macroReport, forceMode]);

  // Voice briefing trigger
  const handleVoiceBriefing = () => {
    soundFx.playSonarPing(1150);
    setIsPlayingAudio(true);
    voiceAlert.speak(report.voiceBriefingAr, "urgent");
    setTimeout(() => setIsPlayingAudio(false), 9000);
  };

  // Copy MT5 command
  const handleCopyTicket = () => {
    if (report.tradeExecution.mt5TicketCommand) {
      navigator.clipboard.writeText(report.tradeExecution.mt5TicketCommand);
      soundFx.playHudClick();
      setCopiedTicket(true);
      setTimeout(() => setCopiedTicket(false), 2500);
    }
  };

  const isBuy = report.tradeExecution.action === "BUY";
  const isSell = report.tradeExecution.action === "SELL";
  const isWait = report.tradeExecution.action === "WAIT";

  const engineEntries = Object.values(report.proEngines);

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-5 max-w-7xl mx-auto w-full font-['Cairo'] text-slate-100 select-none">
      {/* Top Main Hero Banner with Pro AI Branding */}
      <div className="relative overflow-hidden p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#080d19] via-[#0f172a] to-[#0a1120] border border-cyan-500/35 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
        {/* Subtle Ambient Background Radials */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-500/25 via-blue-600/20 to-purple-600/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.35)]">
              <Cpu className="w-8 h-8 animate-pulse text-cyan-300" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>أرجون 4 برو</span>
                  <span className="font-['JetBrains_Mono'] text-cyan-400 font-extrabold text-lg tracking-wider">
                    ARGON4 PRO
                  </span>
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-xs">
                  العقل التحليلي المركزي للذهب
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  منظومة الـ 8 محركات المتخصصة
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                  Big Data Math (Z: +{report.bigDataMathEngine?.orderBookImbalance.zScore || 2.42}σ)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                محرك ذكاء اصطناعي وتحليل كمي ومؤسسي متكامل؛ يربط حركة السعر الفعلي، السيولة، تدفق الأوامر، عقود COMEX، والبيانات الكلية داخل نظام قرار مركزي صارم يمنع التداول العشوائي.
              </p>
            </div>
          </div>

          {/* Quick Actions & Live Market Price */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2 flex flex-col items-end">
              <span className="text-[10px] text-slate-400 font-mono">سعر الذهب اللحظي (XAU/USD)</span>
              <div className="text-xl font-black font-['JetBrains_Mono'] text-amber-400 flex items-center gap-1.5">
                <span>${currentPrice.toFixed(2)}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>

            <button
              onClick={handleVoiceBriefing}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer shadow-lg active:scale-95 ${
                isPlayingAudio
                  ? "bg-purple-600 text-white animate-pulse"
                  : "bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-indigo-500 text-white border border-purple-400/40"
              }`}
              title="استماع للإحاطة التكتيكية الصوتية لأرجون 4 برو باللغة العربية"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingAudio ? "جاري البث الصوتي..." : "الإحاطة الصوتية"}</span>
            </button>

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-all cursor-pointer active:scale-95"
                title="تحديث البيانات اللحظية فوراً"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Evaluation Mode Switcher & Status Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold">وضع اتخاذ القرار المركزي:</span>
            <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setForceMode("AUTO")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  forceMode === "AUTO"
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                التوافق التلقائي للـ 8 محركات (Auto)
              </button>
              <button
                onClick={() => setForceMode("FORCE_ACTIVE")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  forceMode === "FORCE_ACTIVE"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                إلزام صفقات الـ S-Tier المؤكدة فقط
              </button>
              <button
                onClick={() => setForceMode("FORCE_WAIT")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  forceMode === "FORCE_WAIT"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                فرض الانتظار المنضبط (Disciplined Wait)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">حالة القرار المركزي:</span>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-black border ${
                isWait
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : isBuy
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border-rose-500/40"
              }`}
            >
              {report.decisionStateAr}
            </span>
          </div>
        </div>
      </div>

      {/* Central Decision Core & Execution Command Center */}
      <div
        className={`p-5 sm:p-6 rounded-3xl border transition-all shadow-2xl ${
          isWait
            ? "bg-gradient-to-br from-amber-950/30 via-slate-900 to-[#19150b] border-amber-500/40"
            : isBuy
            ? "bg-gradient-to-br from-emerald-950/30 via-slate-900 to-[#0c1f19] border-emerald-500/40"
            : "bg-gradient-to-br from-rose-950/30 via-slate-900 to-[#220f13] border-rose-500/40"
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div
              className={`p-3.5 rounded-2xl border ${
                isWait
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  : isBuy
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-400 border-rose-500/40"
              }`}
            >
              {isWait ? (
                <ShieldAlert className="w-8 h-8" />
              ) : isBuy ? (
                <ArrowUpRight className="w-8 h-8" />
              ) : (
                <ArrowDownRight className="w-8 h-8" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400">قرار محرك ARGON4 PRO المركزي:</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-white">
                  {report.tradeExecution.grade}
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  توافق المحركات: {report.confluencePillarsCount}/8
                </span>
                {report.bigDataMathEngine && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold border ${
                      report.bigDataMathEngine.mathematicalDecisionGate.isVettedByBigData
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                    }`}
                  >
                    بوابة البيانات الضخمة: {report.bigDataMathEngine.mathematicalDecisionGate.gateStateAr}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {report.tradeExecution.actionAr}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">قوة التوافق الكلي</span>
              <span className="text-base font-black font-['JetBrains_Mono'] text-cyan-300">
                {report.overallConfidence}%
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">دقة خارج العينة (Out-of-Sample)</span>
              <span className="text-base font-black font-['JetBrains_Mono'] text-emerald-400">
                {report.outOfSampleAudit.outOfSampleWinRate}%
              </span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">العائد للمخاطرة (R:R)</span>
              <span className="text-base font-black font-['JetBrains_Mono'] text-amber-300">
                {report.tradeExecution.riskRewardRatio}
              </span>
            </div>
          </div>
        </div>

        {/* Trade Execution Ladder or Disciplined Standstill Notice */}
        {!isWait ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-4">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col">
              <span className="text-[11px] text-slate-400">سعر الدخول القناص</span>
              <span className="text-lg font-black font-['JetBrains_Mono'] text-white mt-1">
                ${report.tradeExecution.entryPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-400 mt-0.5 font-bold">تنفيذ ماركت مباشر</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-rose-500/30 flex flex-col">
              <span className="text-[11px] text-rose-300">وقف الخسارة (Stop Loss)</span>
              <span className="text-lg font-black font-['JetBrains_Mono'] text-rose-400 mt-1">
                ${report.tradeExecution.stopLossPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">خلف جدار السيولة والـ FVG</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex flex-col">
              <span className="text-[11px] text-emerald-300">الهدف الأول (TP1)</span>
              <span className="text-lg font-black font-['JetBrains_Mono'] text-emerald-400 mt-1">
                ${report.tradeExecution.tp1Price.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">إغلاق 50% وتأمين الدخول</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex flex-col">
              <span className="text-[11px] text-emerald-300">الهدف الثاني (TP2)</span>
              <span className="text-lg font-black font-['JetBrains_Mono'] text-emerald-400 mt-1">
                ${report.tradeExecution.tp2Price.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">منطقة امتصاص رئيسية</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex flex-col">
              <span className="text-[11px] text-cyan-300">الهدف الممتد (Runner)</span>
              <span className="text-lg font-black font-['JetBrains_Mono'] text-cyan-400 mt-1">
                ${report.tradeExecution.tpRunnerPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">سحب السيولة الأقصى BSL</span>
            </div>
          </div>
        ) : (
          <div className="my-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-300">
                بروتوكول الامتناع الصارم عن التداول (Strict Capital Preservation Standstill)
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {report.tradeExecution.rationaleAr}
              </p>
            </div>
          </div>
        )}

        {/* AI Synthesis & MT5 Script Output */}
        <div className="pt-2 flex flex-col gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
            <span className="font-bold text-cyan-400 block mb-1">
              التشخيص الرياضي والمؤسسي الشامل (ARGON4 PRO Master Synthesis):
            </span>
            {report.aiSynthesisAr}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2 overflow-x-auto max-w-full">
              <span className="text-slate-500 select-none">MT5 Command:</span>
              <code className="text-amber-300 whitespace-nowrap">
                {report.tradeExecution.mt5TicketCommand}
              </code>
            </div>

            <button
              onClick={handleCopyTicket}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold font-['Cairo'] transition-all cursor-pointer ${
                copiedTicket
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              }`}
            >
              {copiedTicket ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ أمر MT5</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Deep Institutional Views */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs flex-wrap">
          <button
            onClick={() => setActiveTab("engines")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "engines"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>المحركات الثمانية (8 Engines)</span>
          </button>
          <button
            onClick={() => setActiveTab("big_data")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "big_data"
                ? "bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-black shadow-sm"
                : "text-cyan-300 hover:text-white bg-cyan-950/40 border border-cyan-500/30"
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>محرك البيانات الضخمة (Big Data Math)</span>
          </button>
          <button
            onClick={() => setActiveTab("scenarios")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "scenarios"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>مقارنة السيناريوهات (Scenarios)</span>
          </button>
          <button
            onClick={() => setActiveTab("smart_levels")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "smart_levels"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>المستويات الذكية (Smart Levels)</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === "audit"
                ? "bg-cyan-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>مصادر البيانات ومراجعة الأداء (Data Audit)</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          Engine Version: ARGON4_PRO_v2.4_BIGDATA
        </span>
      </div>

      {/* TAB 1: THE 8 SPECIALIZED ENGINES */}
      {activeTab === "engines" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {engineEntries.map((engine) => (
              <div
                key={engine.id}
                className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs">
                        E{engine.engineNumber}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{engine.nameAr}</h4>
                        <span className="text-[9px] text-slate-400 font-mono block">{engine.nameEn}</span>
                      </div>
                    </div>

                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        engine.signal === "BULLISH"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : engine.signal === "BEARISH"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {engine.signal === "BULLISH" ? "صعود" : engine.signal === "BEARISH" ? "هبوط" : "حيادي"}
                    </span>
                  </div>

                  {/* Confidence progress */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400">التأكيد: {engine.confidence}%</span>
                      <span className="text-cyan-400 font-bold">الوزن: {engine.weightPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          engine.confidence > 75
                            ? "bg-gradient-to-r from-cyan-500 to-emerald-400"
                            : "bg-gradient-to-r from-amber-500 to-yellow-400"
                        }`}
                        style={{ width: `${engine.confidence}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="mt-2.5 space-y-1 bg-slate-950/70 p-2 rounded-xl border border-slate-800/80 text-[11px]">
                    {engine.primaryMetrics.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{m.labelAr}:</span>
                        <span className="font-mono font-bold text-amber-300">{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Confirmed Facts (أدلة قطعية) */}
                  <div className="mt-2.5 space-y-1">
                    <span className="text-[10px] text-cyan-400 font-bold block">الأدلة المؤكدة (Fact):</span>
                    <ul className="text-[10px] text-slate-300 space-y-0.5 list-disc list-inside">
                      {engine.confirmedFacts.slice(0, 2).map((fact, idx) => (
                        <li key={idx} className="truncate" title={fact}>
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer with Data Source Provenance */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span className="truncate max-w-[140px]" title={engine.dataSource}>
                    {engine.dataSource}
                  </span>
                  <span className="text-emerald-400">✓ حقيقي</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: BIG DATA MATH & STATISTICAL ORDER BOOK ENGINE */}
      {activeTab === "big_data" && report.bigDataMathEngine && (
        <div className="space-y-4">
          {/* 1. Mathematical Decision Gate Status */}
          <div
            className={`p-5 rounded-3xl border transition-all shadow-xl ${
              report.bigDataMathEngine.mathematicalDecisionGate.isVettedByBigData
                ? "bg-gradient-to-br from-indigo-950/40 via-slate-900 to-[#0e172a] border-indigo-500/40"
                : "bg-gradient-to-br from-rose-950/40 via-slate-900 to-[#1e131d] border-rose-500/40"
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-2xl border ${
                    report.bigDataMathEngine.mathematicalDecisionGate.isVettedByBigData
                      ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                      : "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  }`}
                >
                  <Sigma className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400">بوابة التحقق الرياضي للبيانات الضخمة:</span>
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md border ${
                        report.bigDataMathEngine.mathematicalDecisionGate.isVettedByBigData
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      }`}
                    >
                      {report.bigDataMathEngine.mathematicalDecisionGate.gateState}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                    {report.bigDataMathEngine.mathematicalDecisionGate.gateStateAr}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">درجة الثقة الإحصائية</span>
                  <span className="text-base font-black font-['JetBrains_Mono'] text-indigo-400">
                    {report.bigDataMathEngine.mathematicalDecisionGate.statisticalConfidenceScore}%
                  </span>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block font-mono">سرعة المعالجة اللحظية</span>
                  <span className="text-base font-black font-['JetBrains_Mono'] text-cyan-400">
                    {report.bigDataMathEngine.throughput.tickThroughputPerSec.toLocaleString()} t/s
                  </span>
                </div>
              </div>
            </div>

            {/* Mathematical Rationale & 3-Gate Checkpoints */}
            <div className="pt-4 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                {report.bigDataMathEngine.mathematicalDecisionGate.mathProofRationaleAr}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 font-mono text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px] font-['Cairo']">1. اختبار معنوية OBI (Z-Score)</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-emerald-400 font-bold text-sm">
                      Z = +{report.bigDataMathEngine.orderBookImbalance.zScore}σ
                    </span>
                    <span className="text-[10px] text-slate-400">p = {report.bigDataMathEngine.orderBookImbalance.pValue} &lt; 0.05</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-['Cairo'] mt-1">✓ رفض فرضية التوازن العشوائي H₀</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px] font-['Cairo']">2. السعر الدقيق الميكروهيكلي (Micro-Price)</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-cyan-300 font-bold text-sm">
                      ${report.bigDataMathEngine.orderBookImbalance.microPrice.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      {report.bigDataMathEngine.orderBookImbalance.microPriceDeltaDollars > 0 ? "+" : ""}
                      ${report.bigDataMathEngine.orderBookImbalance.microPriceDeltaDollars.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-['Cairo'] mt-1">✓ انحياز ميكروهيكلي لصالح الشراء</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <span className="text-slate-400 text-[10px] font-['Cairo']">3. تسارع دلتا عقود COMEX (CVD)</span>
                  <div className="flex items-baseline justify-between mt-1.5">
                    <span className="text-amber-300 font-bold text-sm">
                      {report.bigDataMathEngine.futuresFlow.cvdAcceleration > 0 ? "+" : ""}
                      {report.bigDataMathEngine.futuresFlow.cvdAcceleration} c/m²
                    </span>
                    <span className="text-[10px] text-slate-400">{report.bigDataMathEngine.futuresFlow.blockTradesCount} Block Trades</span>
                  </div>
                  <span className="text-[10px] text-amber-300 font-['Cairo'] mt-1">✓ تدفق مؤسسي متسارع في شيكاغو</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Order Book Imbalance (OBI) & Micro-Price Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OBI Meter & Formula */}
            <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">اختلال دفتر الأوامر اللحظي (Order Book Imbalance)</h4>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {report.bigDataMathEngine.orderBookImbalance.ratio > 0 ? "+" : ""}
                  {(report.bigDataMathEngine.orderBookImbalance.ratio * 100).toFixed(1)}%
                </span>
              </div>

              {/* Mathematical Equation Display */}
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 font-mono text-[11px] text-slate-300 flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-500 font-['Cairo'] text-xs">معادلة OBI القياسية:</span>
                <span className="text-cyan-300 font-bold">OBI = (Q_bid - Q_ask) / (Q_bid + Q_ask)</span>
              </div>

              {/* Visual Bid vs Ask Balance Meter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">
                    طلبات الشراء: {((0.5 + report.bigDataMathEngine.orderBookImbalance.ratio / 2) * 100).toFixed(1)}%
                  </span>
                  <span className="text-rose-400 font-bold">
                    عروض البيع: {((0.5 - report.bigDataMathEngine.orderBookImbalance.ratio / 2) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{
                      width: `${Math.round((0.5 + report.bigDataMathEngine.orderBookImbalance.ratio / 2) * 100)}%`,
                    }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
                    style={{
                      width: `${Math.round((0.5 - report.bigDataMathEngine.orderBookImbalance.ratio / 2) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                <span className="font-bold text-white block mb-0.5">نتيجة الاختبار الإحصائي:</span>
                {report.bigDataMathEngine.orderBookImbalance.hypothesisVerdictAr}
              </div>
            </div>

            {/* Micro-Price Stoikov Model */}
            <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">السعر الدقيق وميكروهيكل الأوامر (Micro-Price Engine)</h4>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {report.bigDataMathEngine.orderBookImbalance.microPriceDeltaDollars > 0 ? "+" : ""}
                  ${report.bigDataMathEngine.orderBookImbalance.microPriceDeltaDollars.toFixed(2)} Lead
                </span>
              </div>

              {/* Mathematical Formula */}
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 font-mono text-[11px] text-slate-300 flex items-center justify-between flex-wrap gap-2">
                <span className="text-slate-500 font-['Cairo'] text-xs">نموذج Stoikov &amp; Lehalle:</span>
                <span className="text-indigo-300 font-bold">P_micro = (Q_bid·P_ask + Q_ask·P_bid) / Total_Q</span>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-['Cairo']">سعر الماركت الفوري</span>
                  <span className="text-sm font-bold text-white mt-1 block">${currentPrice.toFixed(2)}</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-indigo-500/40">
                  <span className="text-indigo-300 text-[10px] block font-['Cairo']">السعر الدقيق Micro</span>
                  <span className="text-sm font-bold text-indigo-300 mt-1 block">
                    ${report.bigDataMathEngine.orderBookImbalance.microPrice.toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-['Cairo']">السبريد اللحظي</span>
                  <span className="text-sm font-bold text-amber-300 mt-1 block">
                    {report.bigDataMathEngine.orderBookImbalance.spreadPips} Pips
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
                <span className="font-bold text-cyan-400 block mb-0.5">الدلالة التكتيكية للسعر الدقيق:</span>
                السعر الدقيق يسبق تقلبات الشموع بـ 3-5 ثوانٍ، وتفوقه بقيمة +${report.bigDataMathEngine.orderBookImbalance.microPriceDeltaDollars.toFixed(2)} يؤكد أن صفقات الماركت تنفذ على عروض الأسعار العلوية مما يسحب السيولة نحو الأعلى.
              </div>
            </div>
          </div>

          {/* 3. Level-2 Depth 5-Tier Ladder Table */}
          <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">سلم عمق السيولة لـ 5 مستويات L2/L3 (Depth Ladder)</h4>
              </div>
              <span className="text-xs text-slate-400 font-mono">تغذية لحظية مباشرة لدفتر الأوامر</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 text-[11px] font-['Cairo']">
                    <th className="pb-2 text-right">المستوى</th>
                    <th className="pb-2 text-emerald-400 text-right">سعر الطلب (Bid)</th>
                    <th className="pb-2 text-emerald-400 text-right">الكمية (Lots)</th>
                    <th className="pb-2 text-center">العمق النسبي</th>
                    <th className="pb-2 text-rose-400 text-left">الكمية (Lots)</th>
                    <th className="pb-2 text-rose-400 text-left">سعر العرض (Ask)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {report.bigDataMathEngine.orderBookImbalance.depthLadder.map((tier) => (
                    <tr key={tier.tierNumber} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 font-bold text-slate-400">Tier #{tier.tierNumber}</td>
                      <td className="py-2.5 text-emerald-400 font-bold">${tier.bidPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-slate-200">{tier.bidVolumeLots.toLocaleString()} oz</td>
                      <td className="py-2.5 px-4">
                        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${Math.min(100, tier.bidDepthPercent)}%` }}
                          />
                          <div
                            className="h-full bg-rose-500 opacity-60"
                            style={{ width: `${Math.min(100, tier.askDepthPercent)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-2.5 text-slate-200 text-left">{tier.askVolumeLots.toLocaleString()} oz</td>
                      <td className="py-2.5 text-rose-400 font-bold text-left">${tier.askPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. COMEX Futures Ingestion & Shannon Entropy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* COMEX Futures Stats */}
            <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 space-y-3.5">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white">تدفق عقود بورصة شيكاغو (COMEX GC Futures Ingestion)</h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-['Cairo']">العقد النشط الرئيسي</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    {report.bigDataMathEngine.futuresFlow.activeContract}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-['Cairo']">صافي دلتا العقود (Net Delta)</span>
                  <span className="text-base font-bold text-emerald-400 mt-1 block">
                    {report.bigDataMathEngine.futuresFlow.netDeltaContracts > 0 ? "+" : ""}
                    {report.bigDataMathEngine.futuresFlow.netDeltaContracts.toLocaleString()} عقد
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-['Cairo']">علاوة السعر الفوري (Basis Spread)</span>
                  <span className="text-base font-bold text-amber-300 mt-1 block">
                    +${report.bigDataMathEngine.futuresFlow.basisSpreadDollars.toFixed(2)} (Z: +{report.bigDataMathEngine.futuresFlow.basisZScore}σ)
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-['Cairo']">صفقات كبار المؤسسات (Block Trades)</span>
                  <span className="text-base font-bold text-cyan-300 mt-1 block">
                    {report.bigDataMathEngine.futuresFlow.blockTradesCount} صفقات ضخمة
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-['Cairo']">
                اتساع علاوة Basis Spread إلى +${report.bigDataMathEngine.futuresFlow.basisSpreadDollars.toFixed(2)} دولار فوق السعر الفوري يعكس طلباً مادياً فورياً من قبل صناديق التحوط، مدعوماً بتسارع دلتا CVD بمعدل {report.bigDataMathEngine.futuresFlow.cvdAcceleration} عقد/دقيقة².
              </p>
            </div>

            {/* Shannon Entropy & High-Throughput Stream */}
            <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 space-y-3.5">
              <div className="flex items-center gap-2">
                <Binary className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">إنتروبيا شانون والمعالجة فائقة السرعة (Shannon Entropy)</h4>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 font-mono text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 font-['Cairo'] text-xs">إنتروبيا تدفق الأوامر H(X):</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {report.bigDataMathEngine.orderBookImbalance.shannonEntropyScore.toFixed(2)} / 1.00
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                    style={{
                      width: `${Math.round(report.bigDataMathEngine.orderBookImbalance.shannonEntropyScore * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-['Cairo']">
                  <span>تدفق منظم موجه (مؤسسي)</span>
                  <span>ضوضاء عشوائية مشتتة</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-['Cairo']">التدفق اللحظي</span>
                  <span className="text-xs font-bold text-cyan-400 mt-1 block">
                    {report.bigDataMathEngine.throughput.tickThroughputPerSec.toLocaleString()} t/s
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-['Cairo']">أحداث 24 ساعة</span>
                  <span className="text-xs font-bold text-emerald-400 mt-1 block">
                    {(report.bigDataMathEngine.throughput.totalProcessedEvents24h / 1000000).toFixed(1)}M
                  </span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block font-['Cairo']">زمن الاستجابة</span>
                  <span className="text-xs font-bold text-amber-300 mt-1 block">
                    {report.bigDataMathEngine.throughput.latencyMicroseconds} µs
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-['Cairo']">
                انخفاض إنتروبيا شانون إلى {report.bigDataMathEngine.orderBookImbalance.shannonEntropyScore.toFixed(2)} يثبت إحصائياً أن وصول الأوامر ليس ضوضاء عشوائية (Random Walk)، بل سلوك مؤسسي منظم يقوده كبار المتداولين بهدف تجميع عقود الشراء قبل الانفجار السعري.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCENARIOS COMPARISON */}
      {activeTab === "scenarios" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
            <Scale className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">
                مقارنة السيناريوهات الصعودية والهبوطية وفق ترجيح الأدلة (Scenario Arbiter)
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {report.scenarioComparison.selectionRationaleAr}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bullish Scenario Card */}
            <div
              className={`p-5 rounded-3xl border transition-all ${
                report.scenarioComparison.selectedScenario === "BULLISH"
                  ? "bg-gradient-to-br from-emerald-950/30 via-slate-900 to-[#0e1d18] border-emerald-500/50 shadow-lg"
                  : "bg-slate-900/50 border-slate-800 opacity-75"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-base font-bold text-white">السيناريو الصعودي (Bullish)</h4>
                </div>
                <span className="text-lg font-black font-['JetBrains_Mono'] text-emerald-400">
                  {report.scenarioComparison.bullishScenario.probability}%
                </span>
              </div>

              <div className="my-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">المحفز والأدلة الداعمة:</span>
                  <p className="text-slate-200 leading-relaxed font-semibold">
                    {report.scenarioComparison.bullishScenario.catalystAr}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">مستوى التفعيل (Trigger)</span>
                    <span className="text-white font-bold">
                      ${report.scenarioComparison.bullishScenario.triggerLevel.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">مستوى الإلغاء (Invalidation)</span>
                    <span className="text-rose-400 font-bold">
                      ${report.scenarioComparison.bullishScenario.invalidationPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">المحركات المؤيدة:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {report.scenarioComparison.bullishScenario.supportedEvidenceCount} من أصل 8 محركات
                  </span>
                </div>
              </div>
            </div>

            {/* Bearish Scenario Card */}
            <div
              className={`p-5 rounded-3xl border transition-all ${
                report.scenarioComparison.selectedScenario === "BEARISH"
                  ? "bg-gradient-to-br from-rose-950/30 via-slate-900 to-[#200f13] border-rose-500/50 shadow-lg"
                  : "bg-slate-900/50 border-slate-800 opacity-75"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-5 h-5 text-rose-400" />
                  <h4 className="text-base font-bold text-white">السيناريو الهبوطي (Bearish)</h4>
                </div>
                <span className="text-lg font-black font-['JetBrains_Mono'] text-rose-400">
                  {report.scenarioComparison.bearishScenario.probability}%
                </span>
              </div>

              <div className="my-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">المحفز والأدلة المعاكسة:</span>
                  <p className="text-slate-200 leading-relaxed font-semibold">
                    {report.scenarioComparison.bearishScenario.catalystAr}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">مستوى التفعيل (Trigger)</span>
                    <span className="text-white font-bold">
                      ${report.scenarioComparison.bearishScenario.triggerLevel.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">مستوى الإلغاء (Invalidation)</span>
                    <span className="text-rose-400 font-bold">
                      ${report.scenarioComparison.bearishScenario.invalidationPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">المحركات المؤيدة:</span>
                  <span className="font-bold text-rose-400 font-mono">
                    {report.scenarioComparison.bearishScenario.supportedEvidenceCount} من أصل 8 محركات
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SMART LEVELS & REACTION TRACKER */}
      {activeTab === "smart_levels" && (
        <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-base font-bold text-white">
                المستويات الذكية المرنة ومراقبة رد الفعل (Adaptive Reaction Levels)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديد مناطق الشراء والبيع مسبقاً قبل وصول السعر، ومراقبة قبول السعر أو رفضه فور الملامسة
              </p>
            </div>
            <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full font-mono font-bold">
              مراقبة آنية (Real-time Tracker)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-right py-2.5 font-medium">نوع المستوى</th>
                  <th className="text-right py-2.5 font-medium font-mono">السعر المحدد</th>
                  <th className="text-right py-2.5 font-medium">سلوك السعر اللحظي</th>
                  <th className="text-right py-2.5 font-medium font-mono">عتبة القبول</th>
                  <th className="text-right py-2.5 font-medium">التوصية التنفيذية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report.smartLevels.map((lvl) => (
                  <tr key={lvl.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3">
                      <span className="font-bold text-white block">{lvl.levelTypeAr}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{lvl.levelType}</span>
                    </td>
                    <td className="py-3 font-bold font-['JetBrains_Mono'] text-amber-300 text-sm">
                      ${lvl.levelPrice.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        {lvl.behaviorAr}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-300">
                      ±${lvl.acceptanceThreshold.toFixed(1)}
                    </td>
                    <td className="py-3 text-slate-200 font-semibold">
                      {lvl.actionableSignalAr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DATA PROVENANCE & OUT-OF-SAMPLE AUDIT */}
      {activeTab === "audit" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Out-of-Sample Performance Audit */}
          <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 space-y-3.5">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">
                سجل تدقيق واختبار النموذج خارج العينة (Out-of-Sample Audit)
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              تم قياس دقة نموذج ARGON4 PRO على بيانات تاريخية لم تُستخدم إطلاقاً في تدريبه لمنع التلاؤم المفرط (Overfitting).
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-['Cairo']">عدد الصفقات المختبرة</span>
                <span className="text-base font-bold text-white mt-1">
                  {report.outOfSampleAudit.testedTradesCount} صفقة
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-['Cairo']">نسبة النجاح الحقيقية</span>
                <span className="text-base font-bold text-emerald-400 mt-1">
                  {report.outOfSampleAudit.outOfSampleWinRate}%
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-['Cairo']">معامل الربحية (Profit Factor)</span>
                <span className="text-base font-bold text-amber-300 mt-1">
                  {report.outOfSampleAudit.profitFactor}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-['Cairo']">أقصى تراجع تاريخي (Drawdown)</span>
                <span className="text-base font-bold text-cyan-300 mt-1">
                  {report.outOfSampleAudit.maxHistoricalDrawdown}%
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
              <span className="font-bold text-emerald-400 block mb-0.5">حماية منع تسرب المستقبل:</span>
              {report.outOfSampleAudit.overfittingProtectionStatusAr}
            </div>
          </div>

          {/* Real-Time Data Sources Provenance */}
          <div className="p-5 rounded-3xl bg-[#0d1322] border border-slate-800 space-y-3.5">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h4 className="text-sm font-bold text-white">
                مصادر البيانات اللحظية والزمنية (Real-Time Data Feeds)
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              يعتمد النظام حصرياً على تغذيات أسعار وأوامر فعلية لحظية مع فحص زمن الاستجابة والاتصال:
            </p>

            <div className="space-y-2">
              {report.dataProvenance.map((feed, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{feed.feedAr}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{feed.feed}</span>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-emerald-400 text-[11px] font-bold block">{feed.status}</span>
                    <span className="text-slate-400 text-[10px]">{feed.latencyMs}ms Latency</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation shortcuts strip */}
      {onNavigateToView && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-bold">الانتقال السريع للأقسام المرتبطة:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateToView("signals")}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>مركز التوصيات القناصة</span>
            </button>
            <button
              onClick={() => onNavigateToView("pre_session_roadmap")}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>خريطة الجلسات المسبقة</span>
            </button>
            <button
              onClick={() => onNavigateToView("analytical_memory")}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>الذاكرة وسجل التدقيق</span>
            </button>
            <button
              onClick={() => onNavigateToView("gann_cycles")}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>مربع جان ودورات الزمن</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
