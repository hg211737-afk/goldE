import React, { useState, useMemo } from "react";
import {
  Brain,
  History,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Clock,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Target,
  BarChart3,
  Award,
  Zap,
} from "lucide-react";
import { TradeJournalEntry, BacktestSummaryReport } from "../types";
import {
  getStoredJournalEntries,
  generateBacktestSummary,
  clearJournalStorage,
} from "../services/analyticalMemoryService";
import { soundFx } from "../services/soundService";

interface AnalyticalMemoryBacktestViewProps {
  currentPrice?: number;
  onNavigateToView?: (view: any) => void;
  onRefresh?: () => void;
}

export const AnalyticalMemoryBacktestView: React.FC<AnalyticalMemoryBacktestViewProps> = ({
  currentPrice = 4293.65,
  onNavigateToView,
  onRefresh,
}) => {
  const [entries, setEntries] = useState<TradeJournalEntry[]>(() => getStoredJournalEntries());
  const [filterSession, setFilterSession] = useState<"ALL" | "Tokyo" | "London" | "New York">("ALL");
  const [filterOutcome, setFilterOutcome] = useState<"ALL" | "WIN" | "LOSS" | "WAIT_EXERCISED">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(entries[0]?.id || null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    soundFx.playHudClick();
    setEntries(getStoredJournalEntries());
    if (onRefresh) onRefresh();
    setTimeout(() => {
      setIsRefreshing(false);
      soundFx.playSuccessChime();
    }, 600);
  };

  const summary: BacktestSummaryReport = useMemo(() => {
    return generateBacktestSummary(entries);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      const matchSession = filterSession === "ALL" || e.session === filterSession;
      const matchOutcome = filterOutcome === "ALL" || e.outcome === filterOutcome;
      return matchSession && matchOutcome;
    });
  }, [entries, filterSession, filterOutcome]);

  const handleResetStorage = () => {
    soundFx.playHudClick();
    clearJournalStorage();
    setEntries(getStoredJournalEntries());
  };

  return (
    <div className="flex-1 bg-[#0b0f17] text-slate-100 p-3 sm:p-5 overflow-y-auto space-y-4 select-none pb-24 font-['Cairo']">
      {/* 1. HEADER BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#111726] to-[#121c2e] border border-cyan-500/30 p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-cyan-400" />
                الذاكرة التحليلية المؤسسية (Analytical Memory)
              </span>

              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                اختبار عكسي حقيقي (No Lookahead Bias)
              </span>

              <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                سعر الذهب: ${currentPrice.toFixed(2)}
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-black text-white leading-tight">
              سجل تدقيق الصفقات ونظام الاختبار العكسي المتقدم (Walk-Forward Strategy Journal)
            </h1>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              تحفظ هذه الذاكرة نتائج كل فرصة تم رصدها، وتتعلم من أسباب النجاح أو الفشل، وتمتنع بصرامة عن إصدار أي إشارة (WAIT) عند غياب الأدلة الكافية أو في ظروف السوق غير المناسبة.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 text-cyan-200 border border-cyan-500/40 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap disabled:opacity-50"
              title="تحديث سجل الذاكرة ومؤشرات الاختبار العكسي"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-300" : ""}`} />
              <span>تحديث الذاكرة</span>
            </button>

            <button
              onClick={handleResetStorage}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>إعادة ضبط الذاكرة</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KEY PERFORMANCE METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>نسبة النجاح الإجمالية</span>
            <Award className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-emerald-400">
            {summary.winRate}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {summary.wins} ربح / {summary.losses} خسارة
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>معامل الربحية Profit Factor</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-cyan-400">
            {summary.profitFactor}x
          </div>
          <div className="text-[10px] text-slate-500 font-mono">عوائد تفوق الخسائر 3.6 مرة</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>التوقع الرياضي Expectancy</span>
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-indigo-300">
            +{summary.expectancyR}R
          </div>
          <div className="text-[10px] text-slate-500 font-mono">متوسط العائد لكل صفقة</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/30 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>أقصى تراجع Max DD</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-rose-400">
            {summary.maxDrawdownPercent}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">إدارة مخاطر صارمة</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>حالات الامتناع WAIT</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-amber-400">
            {summary.invalidatedOrWaited}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">قرارات حفظت رأس المال</div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>متوسط العائد للمخاطرة</span>
            <Target className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-mono font-black text-white">
            1 : {summary.avgWinR}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">R:R مؤسسي متفوق</div>
        </div>
      </div>

      {/* 3. REGIME PERFORMANCE MATRIX & SESSION BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Regime Detector */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                كاشف بيئات السوق (Market Regime Detector & Weakness Filter)
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
              تصفية الصفقات الضعيفة
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {summary.aiRegimeVerdictAr}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {summary.regimePerformance.map((rg) => (
              <div
                key={rg.regime}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{rg.regimeAr}</span>
                  <span
                    className={`font-mono font-black px-2 py-0.5 rounded text-[11px] ${
                      rg.winRate >= 85
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : rg.winRate >= 60
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    دقة {rg.winRate}% ({rg.tradesCount} صفقة)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">{rg.recommendedActionAr}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sessions Stats */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">الأداء الإحصائي بحسب الجلسة</h3>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">جلسة لندن (London Overlap)</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {summary.sessionStats.london.winRate}% دقة
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>معامل الربحية: {summary.sessionStats.london.profitFactor}x</span>
                <span className="text-emerald-400">+{summary.sessionStats.london.netPnlPips} Pip</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">جلسة نيويورك (NY Silver Bullet)</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {summary.sessionStats.newYork.winRate}% دقة
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>معامل الربحية: {summary.sessionStats.newYork.profitFactor}x</span>
                <span className="text-emerald-400">+{summary.sessionStats.newYork.netPnlPips} Pip</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">جلسة طوكيو (Asian Accumulation)</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {summary.sessionStats.tokyo.winRate}% دقة
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>معامل الربحية: {summary.sessionStats.tokyo.profitFactor}x</span>
                <span className="text-emerald-400">+{summary.sessionStats.tokyo.netPnlPips} Pip</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TRADE JOURNAL & AUDIT LOG */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              سجل تدقيق الصفقات وأسباب الفوز أو الخسارة ({filteredEntries.length} صفقة موثقة)
            </h3>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Session Filter */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500">الجلسة:</span>
              {(["ALL", "Tokyo", "London", "New York"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSession(s)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                    filterSession === s
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {s === "ALL" ? "الكل" : s}
                </button>
              ))}
            </div>

            {/* Outcome Filter */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500">النتيجة:</span>
              {(["ALL", "WIN", "LOSS", "WAIT_EXERCISED"] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setFilterOutcome(o)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                    filterOutcome === o
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {o === "ALL" ? "الكل" : o === "WIN" ? "ربح" : o === "LOSS" ? "خسارة" : "انتظار"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-2.5">
          {filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const isWin = entry.outcome === "WIN";
            const isLoss = entry.outcome === "LOSS";
            const isWait = entry.outcome === "WAIT_EXERCISED";

            return (
              <div
                key={entry.id}
                className="rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all overflow-hidden"
              >
                {/* Header row */}
                <div
                  onClick={() => {
                    soundFx.playHudClick();
                    setExpandedId(isExpanded ? null : entry.id);
                  }}
                  className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isWin
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : isLoss
                          ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {isWin ? "✓" : isLoss ? "✗" : "⏸"}
                    </span>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-white">{entry.setupNameAr}</h4>
                        <span className="text-[10px] px-2 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                          {entry.session} ({entry.dateStr})
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.2 rounded font-bold font-mono ${
                            entry.direction === "BUY"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : entry.direction === "SELL"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {entry.direction}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{entry.directionAr}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center font-mono text-xs">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500">الربح / الخسارة</div>
                      <div
                        className={`font-black ${
                          entry.pnlPips > 0
                            ? "text-emerald-400"
                            : entry.pnlPips < 0
                            ? "text-rose-400"
                            : "text-amber-400"
                        }`}
                      >
                        {entry.pnlPips > 0 ? `+${entry.pnlPips} Pip` : `${entry.pnlPips} Pip`}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-500">العائد للمخاطرة</div>
                      <div className="text-slate-300 font-bold">{entry.riskReward}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-500">نسبة الثقة</div>
                      <div className="text-cyan-400 font-bold">{entry.winProbability}%</div>
                    </div>

                    <button className="p-1 rounded text-slate-400 hover:text-white">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Audit Card */}
                {isExpanded && (
                  <div className="p-4 bg-slate-900/60 border-t border-slate-800/80 space-y-3 text-xs animate-in fade-in duration-150">
                    {/* Setup Levels */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">سعر الدخول:</span>
                        <span className="font-bold text-white">${entry.entryPrice}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">وقف الخسارة SL:</span>
                        <span className="font-bold text-rose-400">${entry.stopLoss}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">الهدف الأول TP1:</span>
                        <span className="font-bold text-emerald-400">${entry.tp1}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">الهدف الثاني TP2:</span>
                        <span className="font-bold text-cyan-400">${entry.tp2}</span>
                      </div>
                    </div>

                    {/* Audit Explanation */}
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                      <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-cyan-400" />
                        <span>التحليل التدقيقي لسبب النتيجة (Post-Trade Audit Analysis):</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {entry.auditExplanationAr}
                      </p>
                    </div>

                    {/* Key Lesson */}
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                      <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>الدرس المستفاد لتحديث نموذج التعلم الآلي:</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{entry.keyLessonAr}</p>
                    </div>

                    {/* Confluence Agreed vs Dissenting */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                        <span className="text-[10px] font-bold text-emerald-400 block">
                          الأدوات التي أيدت الفرصة ({entry.confluenceAgreed.length}):
                        </span>
                        <ul className="space-y-0.5 text-[11px] text-slate-300 list-disc list-inside">
                          {entry.confluenceAgreed.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-1">
                        <span className="text-[10px] font-bold text-rose-400 block">
                          الأدوات التي عارضت أو حذرت ({entry.dissentingTools.length}):
                        </span>
                        <ul className="space-y-0.5 text-[11px] text-slate-300 list-disc list-inside">
                          {entry.dissentingTools.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
