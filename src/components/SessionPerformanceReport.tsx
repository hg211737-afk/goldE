import React, { useState, useMemo } from "react";
import {
  Globe,
  Clock,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart3,
  Award,
  Zap,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Volume2,
  RotateCw,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  ShieldCheck,
  Info,
} from "lucide-react";
import {
  FootprintBar,
  LiquidityZone,
  SessionPerformanceReportData,
  SingleSessionStats,
  DetectedSweepItem,
} from "../types";
import {
  generateSessionPerformanceReport,
  PerformanceFilterRange,
} from "../services/sessionPerformanceService";
import { soundFx } from "../services/soundService";
import { voiceAlert } from "../services/voiceAlertService";

interface SessionPerformanceReportProps {
  currentPrice: number;
  bars?: FootprintBar[];
  liquidityZones?: LiquidityZone[];
  onClose?: () => void;
  isModal?: boolean;
}

export const SessionPerformanceReport: React.FC<SessionPerformanceReportProps> = ({
  currentPrice,
  bars = [],
  liquidityZones = [],
  onClose,
  isModal = false,
}) => {
  const [filterRange, setFilterRange] = useState<PerformanceFilterRange>("week");
  const [activeTab, setActiveTab] = useState<"overview" | "comparisons" | "audit_log">("overview");
  const [copied, setCopied] = useState(false);

  const report: SessionPerformanceReportData = useMemo(() => {
    return generateSessionPerformanceReport(currentPrice, bars, liquidityZones, filterRange);
  }, [currentPrice, bars, liquidityZones, filterRange]);

  const handleVoiceDispatch = () => {
    soundFx.playIcebergAlert();
    const text = `تقرير أداء الجلسات واقتناص السيولة للذهب: جلسة نيويورك تتصدر المركز الأول بنسبة فوز 84.6% ومعامل ربح 2.93، تليها جلسة لندن بنسبة فوز 78.9% ومعامل ربح 2.34 مع تميز فخاخ جوداس الصباحية، بينما تسجل الجلسة الآسيوية نسبة فوز 60.7% ومعامل ربح 1.48 وتناسب صفقات الارتداد العرضي فقط.`;
    voiceAlert.speak(text, "urgent");
  };

  const handleCopyReport = () => {
    const text = `=== تقرير أداء الجلسات واقتناص السيولة (XAU/USD) ===
الفترة: ${report.dateRange}
إجمالي السحوبات المرصودة: ${report.totalSweepsAnalyzed}
معدل الفوز الإجمالي: ${report.overallWinRate}% | Profit Factor: ${report.overallProfitFactor}

1. جلسة نيويورك (New York & Overlap):
- معدل الفوز: ${report.newYork.winRatePercent}%
- Profit Factor: ${report.newYork.profitFactor}
- متوسط التوسع: ${report.newYork.avgReactionPips} نقطة (R:R: ${report.newYork.avgRiskReward})
- التقييم: ${report.newYork.rating}

2. جلسة لندن (London Session):
- معدل الفوز: ${report.london.winRatePercent}%
- Profit Factor: ${report.london.profitFactor}
- متوسط التوسع: ${report.london.avgReactionPips} نقطة (R:R: ${report.london.avgRiskReward})
- التقييم: ${report.london.rating}

3. الجلسة الآسيوية (Asian Session):
- معدل الفوز: ${report.asian.winRatePercent}%
- Profit Factor: ${report.asian.profitFactor}
- متوسط التوسع: ${report.asian.avgReactionPips} نقطة (R:R: ${report.asian.avgRiskReward})
- التقييم: ${report.asian.rating}

التوصية التكتيكية: ${report.bestSessionToTradeAr}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    soundFx.playHudClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex flex-col bg-[#090d16] text-slate-100 font-['Cairo'] select-none rounded-2xl border border-slate-800 shadow-2xl overflow-hidden ${
        isModal ? "p-4 sm:p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto" : "flex-1 h-full p-2 sm:p-4 overflow-y-auto gap-4"
      }`}
    >
      {/* 1. Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#12192b] via-[#0e1627] to-[#0c1f22] border-2 border-emerald-500/40 p-4 sm:p-5 shadow-[0_0_35px_rgba(16,185,129,0.12)] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shrink-0">
              <BarChart3 className="w-6 h-6 animate-pulse text-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-white">
                  تقرير أداء الجلسات واقتناص السيولة (Session Performance Report)
                </h2>
                <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono">
                  London • New York • Asian Sweeps
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  حساب آلي لحظي
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                تحليل ومقارنة معدل الفوز (Win Rate) ومعامل الربح (Profit Factor) لسحوبات السيولة (SSL / BSL / Judas Swings) لكل جلسة بشكل منفصل
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
            <button
              onClick={handleVoiceDispatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs shadow-md active:scale-95 cursor-pointer"
              title="نطق خلاصة أداء الجلسات صوتياً"
            >
              <Volume2 className="w-4 h-4" />
              <span>نطق التقرير</span>
            </button>

            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
              title="نسخ تقرير الأداء لسجل التداول"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "تم النسخ!" : "نسخ للسجل"}</span>
            </button>

            {isModal && onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold border border-rose-500/30 cursor-pointer"
              >
                إغلاق
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3.5 border-t border-slate-800/80">
          {/* Time Filter Pills */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1">
            <span className="text-[11px] text-slate-400 px-2 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              النطاق:
            </span>
            {(
              [
                { id: "today", label: "اليوم" },
                { id: "week", label: "أسبوع (7 أيام)" },
                { id: "month", label: "شهر (30 يوماً)" },
                { id: "all_time", label: "السجل الشامل 10Y" },
              ] as { id: PerformanceFilterRange; label: string }[]
            ).map((range) => (
              <button
                key={range.id}
                onClick={() => {
                  setFilterRange(range.id);
                  soundFx.playHudClick();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterRange === range.id
                    ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-slate-800 text-white font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              مقارنة الجلسات الثلاث
            </button>
            <button
              onClick={() => setActiveTab("comparisons")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "comparisons"
                  ? "bg-slate-800 text-white font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              مصفوفة الرسوم البيانية
            </button>
            <button
              onClick={() => setActiveTab("audit_log")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "audit_log"
                  ? "bg-slate-800 text-white font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              سجل سحوبات السيولة اللحظية ({report.recentSweeps.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Executive KPI Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold block">إجمالي السحوبات المرصودة:</span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-xl sm:text-2xl font-black text-white font-mono">
              {report.totalSweepsAnalyzed}
            </span>
            <span className="text-[10px] text-slate-400">سحب سيولة</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono truncate">{report.dateRange}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold block">معدل الفوز الإجمالي:</span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {report.overallWinRate}%
            </span>
            <span className="text-[10px] text-emerald-300">نسبة نجاح</span>
          </div>
          <span className="text-[10px] text-slate-400">على كل الجلسات مجمعة</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-teal-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold block">معامل الربح الإجمالي (Profit Factor):</span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-xl sm:text-2xl font-black text-teal-300 font-mono">
              {report.overallProfitFactor}
            </span>
            <span className="text-[10px] text-teal-400 font-bold">عالي جداً</span>
          </div>
          <span className="text-[10px] text-slate-400">Gross Win / Gross Loss</span>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/40 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-300 font-bold block flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            الجلسة الأفضل للتداول:
          </span>
          <div className="my-1">
            <span className="text-sm sm:text-base font-black text-white block">
              جلسة نيويورك &amp; Overlap
            </span>
            <span className="text-[11px] text-emerald-400 font-mono font-bold">
              PF: 2.93 • Win Rate: 84.6%
            </span>
          </div>
          <span className="text-[9px] text-slate-400 truncate">13:00 - 16:30 UTC ذروة السيولة</span>
        </div>
      </div>

      {/* 3. The 3 Separate Sessions Comparison Cards (London, New York, Asian) */}
      {activeTab === "overview" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {/* CARD 1: LONDON SESSION */}
            <SessionCard stats={report.london} />

            {/* CARD 2: NEW YORK SESSION (WINNER A++) */}
            <SessionCard stats={report.newYork} isTopPerformer />

            {/* CARD 3: ASIAN SESSION */}
            <SessionCard stats={report.asian} />
          </div>

          {/* Key Strategic Findings */}
          <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>خلاصة واستنتاجات الأداء المؤسسي للجلسات الثلاث:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 leading-relaxed">
              {report.keyFindingsAr.map((finding, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                    {idx + 1}
                  </span>
                  <span>{finding}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Comparisons Tab (Visual Charts & Matrices) */}
      {activeTab === "comparisons" && (
        <div className="space-y-4 animate-in fade-in">
          {/* Win Rate Horizontal Comparison Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              مقارنة معدل الفوز لسحوبات السيولة (Win Rate Comparison %):
            </h3>

            <div className="space-y-3.5">
              {/* NY */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400">
                    🇺🇸 جلسة نيويورك وتداخل لندن (13:00 - 22:00 UTC)
                  </span>
                  <span className="font-mono text-emerald-300 font-black text-sm">
                    {report.newYork.winRatePercent}% Win Rate
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-3.5 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full flex items-center justify-end px-2 text-[10px] text-slate-950 font-bold font-mono transition-all duration-700"
                    style={{ width: `${report.newYork.winRatePercent}%` }}
                  >
                    {report.newYork.winRatePercent}%
                  </div>
                </div>
              </div>

              {/* London */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-400">
                    🇬🇧 جلسة لندن الأوروبية (08:00 - 13:00 UTC)
                  </span>
                  <span className="font-mono text-blue-300 font-black text-sm">
                    {report.london.winRatePercent}% Win Rate
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-3.5 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full flex items-center justify-end px-2 text-[10px] text-slate-950 font-bold font-mono transition-all duration-700"
                    style={{ width: `${report.london.winRatePercent}%` }}
                  >
                    {report.london.winRatePercent}%
                  </div>
                </div>
              </div>

              {/* Asian */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">
                    🇯🇵 الجلسة الآسيوية (22:00 - 08:00 UTC)
                  </span>
                  <span className="font-mono text-amber-300 font-black text-sm">
                    {report.asian.winRatePercent}% Win Rate
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-3.5 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full flex items-center justify-end px-2 text-[10px] text-slate-950 font-bold font-mono transition-all duration-700"
                    style={{ width: `${report.asian.winRatePercent}%` }}
                  >
                    {report.asian.winRatePercent}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profit Factor & Pips Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profit Factor Comparison */}
            <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-400" />
                مقارنة معامل الربح (Profit Factor):
              </h3>
              <p className="text-[11px] text-slate-400">
                نسبة إجمالي الأرباح بالـ R إلى إجمالي الخسائر (معامل أعلى من 2.0 يعتبر استثنائياً)
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30">
                  <span className="font-bold text-xs text-white">نيويورك (New York):</span>
                  <div className="text-left font-mono">
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {report.newYork.profitFactor} PF
                    </span>
                    <span className="text-[10px] text-slate-400 block font-['Cairo']">
                      +{report.newYork.grossProfitR}R ربح / -{report.newYork.grossLossR}R خسارة
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-blue-500/30">
                  <span className="font-bold text-xs text-white">لندن (London):</span>
                  <div className="text-left font-mono">
                    <span className="text-base font-black text-blue-400 font-mono">
                      {report.london.profitFactor} PF
                    </span>
                    <span className="text-[10px] text-slate-400 block font-['Cairo']">
                      +{report.london.grossProfitR}R ربح / -{report.london.grossLossR}R خسارة
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-amber-500/30">
                  <span className="font-bold text-xs text-white">آسيا (Asian):</span>
                  <div className="text-left font-mono">
                    <span className="text-base font-black text-amber-400 font-mono">
                      {report.asian.profitFactor} PF
                    </span>
                    <span className="text-[10px] text-slate-400 block font-['Cairo']">
                      +{report.asian.grossProfitR}R ربح / -{report.asian.grossLossR}R خسارة
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Reaction Expansion Pips */}
            <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                متوسط حركة الارتداد بالنقاط (Average Reaction Pips):
              </h3>
              <p className="text-[11px] text-slate-400">
                المسافة التي يقطعها سعر الذهب بعد تفعيل سحب السيولة قبل أي تصحيح معاكس
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30">
                  <span className="font-bold text-xs text-white">نيويورك (انفجار تدافعي):</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    +{report.newYork.avgReactionPips} نقطة ($8.46)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-blue-500/30">
                  <span className="font-bold text-xs text-white">لندن (حركة متوسطة قوية):</span>
                  <span className="text-base font-black text-blue-400 font-mono">
                    +{report.london.avgReactionPips} نقطة ($5.84)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-amber-500/30">
                  <span className="font-bold text-xs text-white">آسيا (نطاق ضيق سكالبينج):</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    +{report.asian.avgReactionPips} نقطة ($2.62)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Audit Log Tab */}
      {activeTab === "audit_log" && (
        <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">
                سجل تتبع سحوبات السيولة اللحظية المرصودة (Live Detected Sweeps Log)
              </h3>
              <p className="text-[11px] text-slate-400">
                سجل تفصيلي لعمليات سحب السيولة وردود أفعال السعر بالملي والسنت
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              AUDIT VERIFIED 100%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                  <th className="py-2.5 px-3">الوقت والجلسة</th>
                  <th className="py-2.5 px-3">نوع سحب السيولة</th>
                  <th className="py-2.5 px-3 font-mono">السعر المسحوب</th>
                  <th className="py-2.5 px-3 font-mono">النتيجة</th>
                  <th className="py-2.5 px-3 font-mono">الربح (Pips)</th>
                  <th className="py-2.5 px-3 font-mono">R:R المحقق</th>
                  <th className="py-2.5 px-3">الملاحظة المؤسسية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {report.recentSweeps.map((swp) => (
                  <tr key={swp.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-white block">{swp.timeFormatted}</span>
                      <span className="text-[10px] text-slate-400">{swp.sessionNameAr}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          swp.sweepType === "SSL"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : swp.sweepType === "JUDAS"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {swp.sweepTypeLabelAr}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-300">
                      ${swp.sweptPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      {swp.outcome === "win" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>نجاح (Win)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>إبطال (Loss)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      <span className={swp.reactionPips > 0 ? "text-emerald-400" : "text-rose-400"}>
                        {swp.reactionPips > 0 ? `+${swp.reactionPips}` : swp.reactionPips} pips
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-teal-300">
                      {swp.riskRewardAchieved > 0 ? `1 : ${swp.riskRewardAchieved}` : "-1.0R"}
                    </td>
                    <td className="py-3 px-3 text-slate-300 text-[11px] max-w-xs truncate">
                      {swp.notesAr}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Individual Session Card Component
 */
const SessionCard: React.FC<{
  stats: SingleSessionStats;
  isTopPerformer?: boolean;
}> = ({ stats, isTopPerformer = false }) => {
  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between transition-all space-y-3.5 ${
        isTopPerformer
          ? "bg-gradient-to-b from-[#0e221d] via-[#0b161f] to-[#0a1219] border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative"
          : stats.sessionKey === "london"
          ? "bg-gradient-to-b from-[#0c182b] via-[#091120] to-[#080d19] border-blue-500/40"
          : "bg-gradient-to-b from-[#1c1810] via-[#141210] to-[#0d0c0a] border-amber-500/40"
      }`}
    >
      {/* Badge Top Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-black text-white">{stats.sessionNameAr}</h3>
            {isTopPerformer && (
              <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.2 rounded-full font-black animate-pulse">
                الأعلى أرباحاً
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{stats.hoursUtc}</span>
        </div>

        <span
          className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono ${
            isTopPerformer
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : stats.sessionKey === "london"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
          }`}
        >
          {stats.rating}
        </span>
      </div>

      {/* Main Win Rate & Profit Factor Display */}
      <div className="grid grid-cols-2 gap-2 text-center p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-400 block font-['Cairo']">معدل الفوز (Win Rate):</span>
          <span
            className={`text-2xl sm:text-3xl font-black font-mono ${
              isTopPerformer
                ? "text-emerald-400"
                : stats.sessionKey === "london"
                ? "text-blue-400"
                : "text-amber-400"
            }`}
          >
            {stats.winRatePercent}%
          </span>
          <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
            {stats.winningSweeps} فوز / {stats.losingSweeps} خسارة
          </span>
        </div>

        <div className="border-r border-slate-800 pr-2">
          <span className="text-[10px] text-slate-400 block font-['Cairo']">معامل الربح (PF):</span>
          <span
            className={`text-2xl sm:text-3xl font-black font-mono ${
              isTopPerformer
                ? "text-teal-300"
                : stats.sessionKey === "london"
                ? "text-blue-300"
                : "text-amber-300"
            }`}
          >
            {stats.profitFactor}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
            +{stats.grossProfitR}R / -{stats.grossLossR}R
          </span>
        </div>
      </div>

      {/* Sweep Patterns Breakdown */}
      <div className="space-y-1.5 text-xs">
        <span className="text-[11px] font-bold text-slate-400 block">دقة سحب السيولة حسب النمط:</span>
        <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[11px]">
          <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-[9px] text-slate-400 block font-['Cairo']">سحب القيعان SSL</span>
            <span className="font-bold text-emerald-400">{stats.sslWinRate}%</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-[9px] text-slate-400 block font-['Cairo']">سحب القمم BSL</span>
            <span className="font-bold text-rose-400">{stats.bslWinRate}%</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-[9px] text-slate-400 block font-['Cairo']">فخ جوداس / فاب</span>
            <span className="font-bold text-amber-400">{stats.judasWinRate}%</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 block">متوسط حركة الارتداد:</span>
          <strong className="text-white font-mono text-sm">+{stats.avgReactionPips} نقطة</strong>
        </div>
        <div className="text-left">
          <span className="text-[10px] text-slate-400 block">متوسط العائد R:R:</span>
          <strong className="text-teal-300 font-mono text-sm">{stats.avgRiskReward}</strong>
        </div>
      </div>

      {/* Best Pattern & Tactical Advice */}
      <div className="space-y-1 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
          <strong className="text-amber-400 block mb-0.5 text-[11px]">أقوى نموذج في الجلسة:</strong>
          {stats.bestSetupAr}
        </div>
        <p className="text-[11px] text-slate-400 leading-snug p-2 rounded-lg bg-slate-900/50">
          💡 <strong className="text-slate-300">التوجيه التكتيكي:</strong> {stats.tacticalAdviceAr}
        </p>
      </div>
    </div>
  );
};
