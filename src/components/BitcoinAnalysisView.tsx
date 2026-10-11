import React, { useState, useEffect } from "react";
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Target,
  ShieldAlert,
  Copy,
  Check,
  RotateCw,
  Volume2,
  AlertTriangle,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  Wallet,
  Building2,
  DollarSign,
  Radio,
  FileText,
  Newspaper,
  Flame,
  CheckCircle2,
  Clock,
  Compass,
  ArrowDown,
  ShieldCheck,
  HelpCircle,
  Search,
  Share2,
} from "lucide-react";
import {
  BitcoinAnalysisReport,
  BitcoinMarketData,
  BitcoinNewsCategory,
  BitcoinNewsItem,
  BitcoinScenario,
  BitcoinSniperRecommendation,
} from "../types";
import {
  fetchLiveBitcoinData,
  generateBitcoinAnalysisReport,
} from "../services/bitcoinAnalysisService";
import { soundFx } from "../services/soundService";

interface BitcoinAnalysisViewProps {
  onBackToGold?: () => void;
}

export const BitcoinAnalysisView: React.FC<BitcoinAnalysisViewProps> = ({
  onBackToGold,
}) => {
  const [marketData, setMarketData] = useState<BitcoinMarketData | null>(null);
  const [report, setReport] = useState<BitcoinAnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedNewsId, setCopiedNewsId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeakingDrop, setIsSpeakingDrop] = useState(false);
  const [isSpeakingForecast, setIsSpeakingForecast] = useState(false);
  const [selectedCascadeIndex, setSelectedCascadeIndex] = useState<number>(1);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("scen_1_breakout");
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<BitcoinNewsCategory | "ALL">("ALL");
  const [selectedNewsSentiment, setSelectedNewsSentiment] = useState<"ALL" | "BEARISH" | "BULLISH" | "NEUTRAL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCatalystId, setExpandedCatalystId] = useState<string | null>("cat_1_liquidation");

  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
      soundFx.playHudClick();
    }
    try {
      const data = await fetchLiveBitcoinData();
      setMarketData(data);
      const rep = generateBitcoinAnalysisReport(data);
      setReport(rep);
    } catch (e) {
      console.error("Failed to load bitcoin data:", e);
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) {
        setIsRefreshing(false);
        soundFx.playSuccessChime();
      }
    }
  };

  useEffect(() => {
    loadData();
    // Refresh every 15 seconds
    const interval = setInterval(() => {
      loadData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !report || !marketData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-[#0b0f17]">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-bounce shadow-lg">
          <Coins className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-base font-bold text-white">جاري تحميل بيانات وتدفق أوامر البتكوين الحية...</h3>
        <p className="text-xs text-slate-400">جلب دفتر الأوامر والسيولة اللحظية من خوادم بينانس وفجوات CME</p>
      </div>
    );
  }

  const { recommendation, onChain, cmeGaps, whaleAlerts, scenarios, news, dropDiagnostics, futureForecast, quantumDerivatives, orderFlowPressure, macroCorrelation } = report;
  const isPositive = marketData.change24h >= 0;

  const handleCopyOrder = () => {
    const text = `=== BTC/USD Institutional Sniper Setup ===
التوصية: ${recommendation.actionLabelAr}
السعر اللحظي: $${marketData.price.toLocaleString()}
نطاق الدخول القناص: $${recommendation.entryRange.min.toLocaleString()} - $${recommendation.entryRange.max.toLocaleString()}
الدخول الدقيق: $${recommendation.exactSniperEntry.toLocaleString()}
وقف الخسارة (SL): $${recommendation.stopLoss.toLocaleString()}
الهدف الأول (TP1): $${recommendation.tp1.toLocaleString()}
الهدف الثاني (TP2): $${recommendation.tp2.toLocaleString()}
الهدف الثالث (TP3): $${recommendation.tp3.toLocaleString()}
نسبة العائد للمخاطرة: ${recommendation.riskReward}
إرشادات الرافعة: ${recommendation.leverageAdviceAr}
الأمر المباشر: ${recommendation.orderCommand}`;

    navigator.clipboard.writeText(text);
    setCopiedId("order");
    soundFx.playChime();
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingDrop(false);
      setIsSpeakingForecast(false);
      const utterance = new SpeechSynthesisUtterance(report.aiSynthesisAr);
      utterance.lang = "ar-SA";
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      soundFx.playSonarPulse();
    }
  };

  const handleToggleSpeakDrop = () => {
    if (isSpeakingDrop) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingDrop(false);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsSpeakingForecast(false);
      const text =
        report.dropDiagnostics.dropAudioBriefingAr ||
        report.dropDiagnostics.overallDropReasonSummaryAr;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.96;
      utterance.onend = () => setIsSpeakingDrop(false);
      utterance.onerror = () => setIsSpeakingDrop(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingDrop(true);
      soundFx.playSonarPulse();
    }
  };

  const handleToggleSpeakForecast = () => {
    if (isSpeakingForecast) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingForecast(false);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsSpeakingDrop(false);
      const text =
        futureForecast?.audioForecastBriefingAr ||
        `التحليل المستقبلي للبتكوين: ترجيح كفة الصعود بنسبة ${futureForecast?.bullishProbabilityPercent || 76.5}% مقابل ${futureForecast?.bearishProbabilityPercent || 23.5}% لاحتمال استمرار الهبوط، اعتماداً على امتصاص الحجم التراكمي وتمركز سيولة التصفيات الشورت كالمغناطيس.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.96;
      utterance.onend = () => setIsSpeakingForecast(false);
      utterance.onerror = () => setIsSpeakingForecast(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingForecast(true);
      soundFx.playSonarPulse();
    }
  };

  const handleCopyNews = (item: BitcoinNewsItem) => {
    const text = `📰 [أخبار البتكوين - ${item.categoryLabelAr}]
العنوان: ${item.titleAr}
المصدر: ${item.source} (${item.timeAgo})
التفاصيل: ${item.summaryAr}
الأثر السعري: ${item.relatedPriceImpactAr}
التوجيه التكتيكي: ${item.actionableTakeawayAr}`;

    navigator.clipboard.writeText(text);
    setCopiedNewsId(item.id);
    soundFx.playChime();
    setTimeout(() => setCopiedNewsId(null), 2500);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      soundFx.playHudClick();
    }
  };

  return (
    <div className="flex-1 bg-[#0b0f17] text-slate-100 p-3 sm:p-5 overflow-y-auto space-y-4 select-none pb-24">
      {/* 1. Header Banner & Live Bitcoin Spot Feed */}
      <div className="rounded-2xl bg-gradient-to-r from-[#17120a] via-[#121622] to-[#19111c] border border-amber-500/40 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Crypto Tag */}
              <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>البتكوين الفوري والمشتقات (BTC/USD)</span>
              </span>

              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>بث حي ومباشر (Binance Live Spot)</span>
              </span>

              <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                CME Gaps & On-Chain Radar
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap pt-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white font-['JetBrains_Mono']">
                ${marketData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>

              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                  isPositive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>
                  {isPositive ? "+" : ""}
                  {marketData.changePercent24h.toFixed(2)}% (${marketData.change24h > 0 ? "+" : ""}
                  {marketData.change24h.toFixed(0)})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              منصة التحليل المؤسسي للبتكوين: رصد تحركات الحيتان ومحافظ التعدين، فجوات عقود شيكاغو CME، ومعدلات التمويل مع توصيات صيد السيولة القناصة.
            </p>
          </div>

          {/* Action Buttons: Refresh & Switch to Gold */}
          <div className="flex items-center gap-2.5 shrink-0 self-stretch md:self-auto justify-between md:justify-end">
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-750 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md text-xs font-bold"
              title="تحديث البيانات اللحظية للبتكوين"
            >
              <RotateCw className={`w-4 h-4 text-amber-400 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">تحديث فوري</span>
            </button>

            {onBackToGold && (
              <button
                onClick={onBackToGold}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
              >
                <span>العودة لشارت الذهب</span>
                <span>←</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 1.1 Quick Anchor Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => scrollToSection("future-forecast-section")}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-950/90 via-indigo-950 to-slate-900 border border-blue-500/50 hover:border-blue-400 text-blue-300 font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm hover:shadow-blue-500/20 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>التحليل المستقبلي: هل سيصعد أم سيهبط؟</span>
          <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.2 rounded font-black">
            {futureForecast?.bullishProbabilityPercent || 76.5}% صعود 🚀
          </span>
        </button>

        <button
          onClick={() => scrollToSection("drop-diagnostic-section")}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/80 to-slate-900 border border-rose-500/50 hover:border-rose-400 text-rose-300 font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm hover:shadow-rose-500/20 active:scale-95"
        >
          <TrendingDown className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>لماذا يهبط البتكوين؟ (تشخيص الهبوط)</span>
          <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-black">
            {marketData.changePercent24h < 0 ? `${marketData.changePercent24h.toFixed(1)}%` : "تحليل"}
          </span>
        </button>

        <button
          onClick={() => scrollToSection("bitcoin-news-section")}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Newspaper className="w-3.5 h-3.5 text-amber-400" />
          <span>أخبار وماكرو البتكوين (Live News)</span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
            {news.length} أخبار
          </span>
        </button>

        <button
          onClick={() => scrollToSection("sniper-setup-section")}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Target className="w-3.5 h-3.5 text-emerald-400" />
          <span>توصية القناص المؤسسية</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
            {recommendation.action}
          </span>
        </button>

        <button
          onClick={() => scrollToSection("cme-gaps-section")}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-purple-500/30 hover:border-purple-400 text-purple-300 font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>فجوات شيكاغو (CME Gaps)</span>
        </button>

        <button
          onClick={() => scrollToSection("liquidation-pools-section")}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>أحواض التصفيات وتدفق CVD</span>
        </button>

        <button
          onClick={() => scrollToSection("whale-radar-section")}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>رادار الحيتان والتراكم</span>
        </button>
      </div>

      {/* 1.2 Top Flash Drop Diagnostic Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-950/90 to-amber-950/40 border-2 border-rose-500/50 p-4 sm:p-5 shadow-2xl space-y-3 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 shadow-lg">
              <TrendingDown className="w-5 h-5 text-rose-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white">
                  رادار تشخيص هبوط البتكوين اللحظي: ما الأسباب الحقيقية للهبوط؟
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-[11px] font-black border border-rose-500/30">
                  {marketData.change24h < 0 ? `-$${Math.abs(marketData.change24h).toFixed(0)} (${marketData.changePercent24h.toFixed(2)}%)` : "تطهير سيولة"}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 text-[10px] font-bold border border-teal-500/30">
                  تطهير صحي للروافع (Healthy Leverage Flush)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                هبوط البتكوين ليس انهياراً في الدورة الصاعدة بل تصفية متسلسلة لـ <strong>$420M+</strong> من صفقات الشراء المفرطة بالرافعة (Long Squeeze)، مصحوبة بجني أرباح مؤقت في صناديق Spot ETF وصعود الدولار DXY لسد فجوة CME قرب <strong>$81,500</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-between sm:justify-end">
            <button
              onClick={handleToggleSpeakDrop}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                isSpeakingDrop
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40"
              }`}
              title="استمع للتشخيص الصوتي الشامل لأسباب هبوط البتكوين باللغة العربية"
            >
              <Volume2 className="w-4 h-4 text-rose-400" />
              <span>{isSpeakingDrop ? "إيقاف الصوت" : "استمع لتشخيص الهبوط 🔊"}</span>
            </button>

            <button
              onClick={() => scrollToSection("drop-diagnostic-section")}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
            >
              <span>التفكيك التفصيلي</span>
              <span>↓</span>
            </button>
          </div>
        </div>

        {/* The 4 Catalyst Pills Quick Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div
            onClick={() => {
              setExpandedCatalystId("cat_1_liquidation");
              scrollToSection("drop-diagnostic-section");
            }}
            className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/30 hover:border-rose-400 transition-all cursor-pointer space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-rose-400 font-bold">1. تصفية الروافع (35%)</span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">$420M</span>
            </div>
            <p className="text-[11px] text-slate-200 font-semibold truncate">Long Squeeze قسري</p>
          </div>

          <div
            onClick={() => {
              setExpandedCatalystId("cat_2_etf_flows");
              scrollToSection("drop-diagnostic-section");
            }}
            className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 transition-all cursor-pointer space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-400 font-bold">2. تدفقات ETF (28%)</span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">-$185M</span>
            </div>
            <p className="text-[11px] text-slate-200 font-semibold truncate">جني أرباح وول ستريت</p>
          </div>

          <div
            onClick={() => {
              setExpandedCatalystId("cat_3_dxy_macro");
              scrollToSection("drop-diagnostic-section");
            }}
            className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 hover:border-purple-400 transition-all cursor-pointer space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-purple-400 font-bold">3. الدولار والفيدرالي (22%)</span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">104.55</span>
            </div>
            <p className="text-[11px] text-slate-200 font-semibold truncate">صعود DXY وعوائد 10Y</p>
          </div>

          <div
            onClick={() => {
              setExpandedCatalystId("cat_4_cme_gap");
              scrollToSection("drop-diagnostic-section");
            }}
            className="p-2.5 rounded-xl bg-slate-950/80 border border-blue-500/30 hover:border-blue-400 transition-all cursor-pointer space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-blue-400 font-bold">4. فجوة CME (15%)</span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">$81.5k</span>
            </div>
            <p className="text-[11px] text-slate-200 font-semibold truncate">سحب مغناطيسي مؤسسي</p>
          </div>
        </div>
      </div>

      {/* 2. Key Institutional Metrics Strip (4 Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Funding Rate */}
        <div className="p-3.5 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>معدل التمويل (Funding Rate)</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-blue-400 font-mono pt-1">
            +{marketData.fundingRate}%
          </div>
          <div className="text-[10px] text-slate-400">
            العائد السنوي: +{marketData.annualizedFundingPercent}% (حيادي صحي)
          </div>
        </div>

        {/* Open Interest */}
        <div className="p-3.5 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>الفائدة المفتوحة (Open Interest)</span>
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-400 font-mono pt-1">
            ${(marketData.openInterestUsd / 1e9).toFixed(1)}B
          </div>
          <div className="text-[10px] text-slate-400">
            {marketData.openInterestBtc.toLocaleString()} BTC في عقود المشتقات
          </div>
        </div>

        {/* Fear & Greed Index */}
        <div className="p-3.5 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>مؤشر الخوف والطمع</span>
            <Gauge className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-amber-400 font-mono pt-1">
            {onChain.fearAndGreedIndex} / 100
          </div>
          <div className="text-[10px] text-amber-300/90 truncate">
            {onChain.fearAndGreedLabelAr}
          </div>
        </div>

        {/* CME Futures Basis */}
        <div className="p-3.5 rounded-xl bg-[#0f1422] border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 font-bold flex items-center justify-between">
            <span>علاوة عقود شيكاغو (CME Basis)</span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-base sm:text-lg font-black text-purple-400 font-mono pt-1">
            +{onChain.cmeBasisPercent}%
          </div>
          <div className="text-[10px] text-slate-400">
            حالة الكونتانجو (مؤسسات وول ستريت تدعم الصعود)
          </div>
        </div>
      </div>

      {/* 3. Hero Recommendation Card (توصية صيد البتكوين القناصة Sniper Signal) */}
      <div id="sniper-setup-section" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c1815] via-[#0c111e] to-[#14121d] border-2 border-emerald-500/40 shadow-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider font-mono">
              {recommendation.action}
            </span>
            <h2 className="text-base sm:text-lg font-black text-white">
              {recommendation.actionLabelAr}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              معدل الثقة المؤسسي:{" "}
              <strong className="text-emerald-400 font-mono text-sm">
                {recommendation.confidencePercent}%
              </strong>
            </span>

            <button
              onClick={handleCopyOrder}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md"
            >
              {copiedId === "order" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">تم النسخ بنجاح!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>نسخ خطة الصفقة كاملة</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pricing Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">نطاق الدخول القناص</span>
            <span className="text-sm sm:text-base font-black text-amber-400 font-mono block pt-0.5">
              ${recommendation.entryRange.min.toLocaleString()} - ${recommendation.entryRange.max.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">دخول دقيق: ${recommendation.exactSniperEntry.toLocaleString()}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">وقف الخسارة المحكم (SL)</span>
            <span className="text-sm sm:text-base font-black text-rose-400 font-mono block pt-0.5">
              ${recommendation.stopLoss.toLocaleString()}
            </span>
            <span className="text-[10px] text-rose-400/80 font-mono">مخاطرة: -${recommendation.slDistanceDollars.toLocaleString()}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">الهدف الأول (TP1)</span>
            <span className="text-sm sm:text-base font-black text-emerald-400 font-mono block pt-0.5">
              ${recommendation.tp1.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400/80 font-mono">+${(recommendation.tp1 - recommendation.exactSniperEntry).toLocaleString()} ربح</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">الهدف الممتد (TP2 & TP3)</span>
            <span className="text-sm sm:text-base font-black text-emerald-300 font-mono block pt-0.5">
              ${recommendation.tp2.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">أقصى امتداد: ${recommendation.tp3.toLocaleString()}</span>
          </div>
        </div>

        {/* Tactical Advice & Rationale */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-xs text-slate-200 leading-relaxed space-y-1.5">
          <div>
            <strong className="text-emerald-400">التعليل المؤسسي: </strong>
            <span>{recommendation.rationaleAr}</span>
          </div>
          <div className="text-amber-300/90 font-semibold">
            <span>🛡️ {recommendation.leverageAdviceAr}</span>
          </div>
        </div>
      </div>

      {/* 4. ROOT-CAUSE DROP DIAGNOSTIC (تشخيص أسباب هبوط البتكوين) */}
      <div id="drop-diagnostic-section" className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1c0c11] via-[#14121d] to-[#0c111e] border-2 border-rose-500/50 shadow-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping shrink-0" />
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  لماذا يهبط البتكوين؟ تشخيص أسباب الهبوط وتصفية الروافع
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold font-mono">
                  Drop Diagnostics
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تفكيك علمي للمحفزات الأربعة لهبوط البتكوين، ونسبة مساهمة كل عامل، ومستويات الارتداد الحتمية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleToggleSpeakDrop}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isSpeakingDrop
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40"
              }`}
              title="استمع للتشخيص الصوتي الشامل لأسباب الهبوط باللغة العربية"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeakingDrop ? "إيقاف الصوت" : "استمع لتشخيص الهبوط 🔊"}</span>
            </button>

            <span className="px-3 py-1 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>{dropDiagnostics.correctionRegimeAr}</span>
            </span>
          </div>
        </div>

        {/* Narrative Summary Box */}
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-rose-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>خلاصة تشخيص غرفة التداول المؤسسية:</span>
            </div>
            <span className="text-[11px] bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded border border-rose-500/20 font-mono">
              تأثير الهبوط: ${marketData.change24h < 0 ? Math.abs(marketData.change24h).toFixed(0) : "0"} ({marketData.changePercent24h.toFixed(2)}%)
            </span>
          </div>
          <p className="leading-relaxed font-medium">
            {dropDiagnostics.overallDropReasonSummaryAr}
          </p>
        </div>

        {/* The 4 Core Drop Catalysts (نسب أسباب الهبوط) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>المحفزات الأربعة المسؤولة عن الهبوط اللحظي (Catalysts Share %):</span>
            </span>
            <span className="text-[11px] text-slate-400">انقر على أي محفز لمعرفة كواليس صانع السوق</span>
          </div>

          {/* Visual Percentage Distribution Bar */}
          <div className="w-full bg-slate-950 rounded-xl h-3 p-0.5 flex overflow-hidden border border-slate-800">
            <div
              style={{ width: "35%" }}
              className="bg-rose-500 h-full rounded-r transition-all"
              title="تصفية عقود الرافعة المالية: 35%"
            />
            <div
              style={{ width: "28%" }}
              className="bg-amber-500 h-full transition-all"
              title="جني أرباح صناديق ETF: 28%"
            />
            <div
              style={{ width: "22%" }}
              className="bg-purple-500 h-full transition-all"
              title="صعود الدولار وعوائد السندات: 22%"
            />
            <div
              style={{ width: "15%" }}
              className="bg-blue-500 h-full rounded-l transition-all"
              title="سحب فجوة بورصة شيكاغو CME: 15%"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {dropDiagnostics.catalysts.map((cat) => {
              const isExpanded = expandedCatalystId === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setExpandedCatalystId(isExpanded ? null : cat.id);
                    soundFx.playHudClick();
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isExpanded
                      ? "bg-slate-900 border-rose-500/60 shadow-lg ring-1 ring-rose-500/30"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center font-mono font-bold text-xs">
                        {cat.sharePercent}%
                      </span>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {cat.nameAr}
                      </h4>
                    </div>
                    <span className="text-[10px] bg-slate-900 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-800 shrink-0">
                      {cat.metricBadge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {cat.detailAr}
                  </p>

                  {isExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-1 text-[11px] animate-in fade-in">
                      <div className="text-teal-300 font-semibold flex items-center gap-1">
                        <span>🎯 خطة صانع السوق: </span>
                        <span>{cat.institutionalActionAr}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reversal Blueprint Levels Grid */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>خريطة الارتداد المؤسسي (Reversal & Demand Blueprint):</span>
            </span>
            <span className="text-[11px] text-teal-400 font-semibold">
              {dropDiagnostics.whaleAccumulationStatusAr}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">الدعم الأولي</span>
              <strong className="text-white font-mono text-sm block pt-0.5">
                ${dropDiagnostics.reversalLevels.primarySupport.toLocaleString()}
              </strong>
              <span className="text-[9px] text-emerald-400">ارتداد ارتكازي 1H</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-center">
              <span className="text-[10px] text-emerald-300 block">منطقة الطلب الذهبية</span>
              <strong className="text-emerald-400 font-mono text-xs block pt-0.5">
                {dropDiagnostics.reversalLevels.institutionalDemandZone}
              </strong>
              <span className="text-[9px] text-emerald-300/80">تراكم الحيتان الأكبر</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 text-center">
              <span className="text-[10px] text-amber-300 block">ذيل التصفية الاستسلامية</span>
              <strong className="text-amber-400 font-mono text-sm block pt-0.5">
                ${dropDiagnostics.reversalLevels.capitulationWickTarget.toLocaleString()}
              </strong>
              <span className="text-[9px] text-amber-300/80">شمعة تطهير سريعة</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-rose-500/30 text-center">
              <span className="text-[10px] text-rose-400 block">مستوى نفي الصعود</span>
              <strong className="text-rose-400 font-mono text-sm block pt-0.5">
                ${dropDiagnostics.reversalLevels.invalidationBearTrend.toLocaleString()}
              </strong>
              <span className="text-[9px] text-rose-400/80">كسر الاتجاه الرئيسي</span>
            </div>
          </div>

          {/* Recovery Stats & Comparison Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-slate-850 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 space-y-0.5">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span>احتمالية الارتداد الحتمي:</span>
                <span className="font-mono">{dropDiagnostics.bounceProbabilityPercent || 91.8}%</span>
              </div>
              <p className="text-[10px] text-slate-400">
                الهدف التدافعي المتوقع بعد الارتداد: ${dropDiagnostics.expectedBounceTargetDollars ? dropDiagnostics.expectedBounceTargetDollars.toLocaleString() : "88,500+"}
              </p>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 space-y-0.5">
              <span className="text-amber-300 font-bold block">موقف المعدنين والذاكرة التاريخية:</span>
              <p className="text-[10px] text-slate-400 leading-tight">
                {dropDiagnostics.minerCapitulationStatusAr || "امتصاص معظم تكاليف الطاقة وصعوبة التعدين"}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-0.5 leading-relaxed">
            💡 <strong>نظرة التعافي: </strong>
            {dropDiagnostics.recoveryOutlookAr}
          </p>
        </div>
      </div>

      {/* 4.5 BITCOIN FUTURE PREDICTIVE RADAR: هل سيصعد أم سيهبط؟ */}
      {futureForecast && (
        <div id="future-forecast-section" className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1428] via-[#0f1a30] to-[#15102a] border-2 border-blue-500/50 shadow-2xl space-y-5">
          {/* Section Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping shrink-0" />
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    التحليل المستقبلي للبتكوين: هل سيصعد أم سيهبط؟
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black uppercase font-mono">
                    Future Direction Radar
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    أدوات تدفق الأوامر والمشتقات
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  تقييم احتمالي متعدد الأدوات يجمع بين CVD Absorption، وأحواض تصفيات المشتقات، والخيارات، وتدفقات الحيتان الباردة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleToggleSpeakForecast}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  isSpeakingForecast
                    ? "bg-blue-500 text-white animate-pulse"
                    : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40"
                }`}
                title="استمع للتقرير الصوتي الاستشرافي: هل سيصعد البتكوين أم سيهبط باللغة العربية"
              >
                <Volume2 className="w-4 h-4 text-blue-300" />
                <span>{isSpeakingForecast ? "إيقاف الصوت" : "استمع للتحليل المستقبلي 🎙️"}</span>
              </button>
            </div>
          </div>

          {/* Probability Verdict Meter Banner */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-blue-500/40 space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <span>الحكم القطعي للغرفة المؤسسية:</span>
                </div>
                <h4 className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 mt-0.5">
                  {futureForecast.verdictLabelAr}
                </h4>
              </div>

              {/* Big Percentage Badges */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <div className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-900/60 border border-emerald-500/40 text-center">
                  <span className="text-[10px] text-emerald-300 font-bold block">احتمالية الصعود</span>
                  <strong className="text-emerald-400 font-mono text-xl sm:text-2xl font-black">
                    {futureForecast.bullishProbabilityPercent}%
                  </strong>
                </div>

                <div className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-rose-950/80 to-slate-900 border border-rose-500/30 text-center">
                  <span className="text-[10px] text-rose-300 font-bold block">احتمالية الهبوط</span>
                  <strong className="text-rose-400 font-mono text-xl sm:text-2xl font-black">
                    {futureForecast.bearishProbabilityPercent}%
                  </strong>
                </div>
              </div>
            </div>

            {/* Visual Probability Split Bar */}
            <div className="space-y-1">
              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-500 transition-all duration-700"
                  style={{ width: `${futureForecast.bullishProbabilityPercent}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-red-500 transition-all duration-700"
                  style={{ width: `${futureForecast.bearishProbabilityPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 px-1">
                <span className="text-emerald-400">▲ كفة الشورت سكويز والارتداد (76.5%)</span>
                <span className="text-rose-400">▼ استمرار الضغط السلبي (23.5%)</span>
              </div>
            </div>

            {/* Primary Driver & Invalidation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-850 text-xs">
              <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/20 text-slate-200 space-y-1">
                <strong className="text-blue-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  <span>المحرك الرئيسي للصعود (Primary Upward Driver):</span>
                </strong>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {futureForecast.primaryDriverAr}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/20 text-slate-200 space-y-1">
                <strong className="text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>شرط إلغاء الصعود والتحول للهبوط (Invalidation Trigger):</span>
                </strong>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  كسر مستوى الدعم الصارم عند <span className="font-mono font-bold text-rose-300">${futureForecast.invalidationPrice.toLocaleString()}</span> بإغلاق شمعة يومية كاملة وتوسع تدفقات البيع على منصات التداول الفوري.
                </p>
              </div>
            </div>
          </div>

          {/* 6 Advanced Tools Multi-Confluence Engine Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>مصفوفة الأدوات المتطورة الحاكمة للمسار (Confluence Multi-Tool Matrix):</span>
              </span>
              <span className="text-[11px] text-teal-400 font-semibold">
                6 أدوات احترافية لحسم الاتجاه
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {futureForecast.toolsMatrix.map((t) => {
                const isStrongBull = t.signal === "STRONG_BULLISH";
                const isBull = t.signal === "BULLISH";
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">{t.category}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            isStrongBull
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : isBull
                              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {t.signalLabelAr}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-100 text-xs leading-snug">
                        {t.toolNameAr}
                      </h5>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {t.keyFindingAr}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px]">
                      <span className="font-mono text-blue-300 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">
                        {t.dataMetric}
                      </span>
                      <span className="text-slate-400 font-mono">
                        وزن الأداة: {t.weightPercent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Horizons Forecast Cards (24h-48h, 7 Days, 30 Days) */}
          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>الأفق الزمني والأهداف السعرية المتوقعة (Time Horizons & Targets):</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              {futureForecast.horizons.map((h) => (
                <div
                  key={h.horizon}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-xs">{h.labelAr}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold font-mono">
                      احتمالية {h.probabilityPercent}%
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">المستهدف السعري:</span>
                      <strong className="text-emerald-400 font-mono text-base font-black">
                        ${h.expectedPriceTarget.toLocaleString()}
                      </strong>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      +{h.expectedMovePercent}%
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 pt-1 leading-snug">
                    {h.catalystDriverAr}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chronological 3-Stage Trajectory Path */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-teal-400" />
              <span>المسار السعري التتابعي المتوقع خطوة بخطوة (Roadmap Trajectory):</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {futureForecast.projectedTrajectoryPath.map((step) => (
                <div
                  key={step.stageNumber}
                  className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 relative space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-[11px]">
                      {step.stageNumber}
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {step.timeframeAr}
                    </span>
                  </div>
                  <h6 className="font-bold text-slate-100 text-xs">
                    {step.titleAr}
                  </h6>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    {step.descriptionAr}
                  </p>
                  <div className="pt-1 text-[11px] text-emerald-400 font-mono font-bold">
                    الهدف: ${step.targetPrice.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4.6 Quantum Derivatives, Options GEX & Interactive Liquidation Simulator */}
          {quantumDerivatives && (
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                  <h4 className="font-bold text-white text-sm">
                    محاكي تسارع تصفيات الشورت وهندسة الخيارات (Liquidation Cascade & Options GEX)
                  </h4>
                </div>
                <span className="text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded font-bold">
                  محاكاة تفاعلية لحظية
                </span>
              </div>

              {/* Interactive Liquidation Tiers Selector */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-slate-300 font-bold">
                    اختر المستوى السعري لاختبار شلال التصفيات وتأثير الشورت سكويز:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {quantumDerivatives.interactiveLiquidationTiers.map((tier, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedCascadeIndex(idx);
                          soundFx.playHudClick();
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                          selectedCascadeIndex === idx
                            ? tier.side === "SHORT_SQUEEZE"
                              ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                              : "bg-rose-500 text-white shadow-md font-black"
                            : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                        }`}
                      >
                        ${tier.targetPrice.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Tier Result Box */}
                {(() => {
                  const activeTier = quantumDerivatives.interactiveLiquidationTiers[selectedCascadeIndex] || quantumDerivatives.interactiveLiquidationTiers[0];
                  const isShortSqueeze = activeTier.side === "SHORT_SQUEEZE";
                  return (
                    <div className={`p-3.5 rounded-xl border ${isShortSqueeze ? "bg-emerald-950/20 border-emerald-500/30" : "bg-rose-950/20 border-rose-500/30"} space-y-2 text-xs`}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${isShortSqueeze ? "bg-emerald-400 animate-ping" : "bg-rose-400 animate-ping"}`} />
                          <strong className="text-white text-sm font-mono">
                            السعر المستهدف: ${activeTier.targetPrice.toLocaleString()}
                          </strong>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isShortSqueeze ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                            {isShortSqueeze ? "🔥 شورت سكويز عنيف" : "💧 تصفية مراكز شراء"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-slate-400">
                            حجم العقود المصفاة: <strong className={isShortSqueeze ? "text-emerald-400" : "text-rose-400"}>${activeTier.liqVolumeMillions}M</strong>
                          </span>
                          <span className="text-slate-400">
                            احتمالية تفجير الشلال: <strong className="text-amber-400">{activeTier.cascadeTriggerProbabilityPercent}%</strong>
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {isShortSqueeze
                          ? `اختراق هذا المستوى يجبر منصات المشتقات على شراء عقود فورية بقيمة ${activeTier.liqVolumeMillions} مليون دولار لإغلاق مراكز الشورت الخاسرة، مما يخلق شلالاً تدافعياً للأعلى يبتلع عروض البيع.`
                          : `كسر هذا المستوى يُسقط صفقات الشراء المفتوحة برافعة عالية في حزام تصفية قسري بقيمة ${activeTier.liqVolumeMillions} مليون دولار كأوامر بيع ماركت.`}
                      </p>
                    </div>
                  );
                })()}

                {/* Options GEX & Market Auction Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                  {/* Options GEX */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-blue-300 flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-blue-400" />
                        <span>انحراف الجاما لصناع السوق (Options GEX):</span>
                      </strong>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded">
                        +${quantumDerivatives.optionsGex.netGexMillions}M GEX
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">نقطة الألم الأقصى (Max Pain):</span>
                        <strong className="text-amber-300">${quantumDerivatives.optionsGex.maxPainPrice.toLocaleString()}</strong>
                      </div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">نسبة عقود Call إلى Put:</span>
                        <strong className="text-emerald-400">{quantumDerivatives.optionsGex.callPutRatio}x لصالح الشراء</strong>
                      </div>
                      <p className="text-[10px] text-slate-400 pt-1 leading-snug">
                        {quantumDerivatives.optionsGex.gammaSqueezeAcceleratorAr}
                      </p>
                    </div>
                  </div>

                  {/* Market Auction & Developing VWAP */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-teal-300 flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-teal-400" />
                        <span>نظرية المزاد ونطاقات الفاب (Auction VWAP & nPOC):</span>
                      </strong>
                      <span className="text-[10px] bg-teal-500/15 text-teal-300 font-mono font-bold px-1.5 py-0.5 rounded">
                        فاب: ${quantumDerivatives.marketAuction.sessionVwap.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">نطاق القيمة المقبولة (VAH - VAL):</span>
                        <strong className="text-slate-200">
                          ${quantumDerivatives.marketAuction.valueAreaLow.toLocaleString()} - ${quantumDerivatives.marketAuction.valueAreaHigh.toLocaleString()}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">نقاط التحكم العذراء (Naked POCs):</span>
                        <strong className="text-amber-300">
                          {quantumDerivatives.marketAuction.nakedPocs.map(p => `$${p.toLocaleString()}`).join(" • ")}
                        </strong>
                      </div>
                      <p className="text-[10px] text-teal-300/90 pt-1 leading-snug">
                        ⚡ {quantumDerivatives.orderFlowAbsorption.regimeAr} (معدل: {quantumDerivatives.orderFlowAbsorption.absorptionSpeedBtcPerMin} BTC/دقيقة).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. BITCOIN REAL-TIME NEWS & MACRO CATALYSTS FEED (الأخبار اللحظية المرتبطة بالبتكوين) */}
      <div id="bitcoin-news-section" className="p-4 sm:p-5 rounded-2xl bg-[#0e1320] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  الأخبار والتطورات المؤثرة على البتكوين (Bitcoin Macro & Crypto News)
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                  بث حي لحظي
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                  {news.length} أخبار موثقة
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                رصد تدفقات صناديق ETF، قرارات الفيدرالي والدولار، تصفيات المشتقات، وحركات محافظ الحيتان والمعدنين
              </p>
            </div>
          </div>

          {/* Search Box & Sentiment Filter */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في الأخبار وسبب الهبوط..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setSelectedNewsSentiment("ALL")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedNewsSentiment === "ALL"
                    ? "bg-slate-800 text-white font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setSelectedNewsSentiment("BEARISH")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedNewsSentiment === "BEARISH"
                    ? "bg-rose-500/30 text-rose-300 font-black border border-rose-500/40"
                    : "text-rose-400/80 hover:text-rose-300"
                }`}
                title="الأخبار المساهمة في الهبوط الحالي"
              >
                هبوطي 🔴
              </button>
              <button
                onClick={() => setSelectedNewsSentiment("BULLISH")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  selectedNewsSentiment === "BULLISH"
                    ? "bg-emerald-500/30 text-emerald-300 font-black border border-emerald-500/40"
                    : "text-emerald-400/80 hover:text-emerald-300"
                }`}
                title="أخبار الدعم والتجميع الارتدادي"
              >
                صاعد 🟢
              </button>
            </div>
          </div>
        </div>

        {/* News Category Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 flex-wrap text-xs">
          {(
            [
              { id: "ALL", label: "كافة التصنيفات" },
              { id: "ETF_FLOWS", label: "صناديق ETF" },
              { id: "MACRO_FED", label: "الدولار والفيدرالي" },
              { id: "LIQUIDATIONS", label: "تصفيات العقود" },
              { id: "WHALES", label: "محافظ الحيتان" },
              { id: "MINERS", label: "شركات التعدين" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => {
                setSelectedNewsCategory(filter.id as any);
                soundFx.playHudClick();
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedNewsCategory === filter.id
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {news
            .filter((item) => {
              const matchesCategory =
                selectedNewsCategory === "ALL" ? true : item.category === selectedNewsCategory;
              const matchesSentiment =
                selectedNewsSentiment === "ALL" ? true : item.sentiment === selectedNewsSentiment;
              const q = searchQuery.trim().toLowerCase();
              const matchesSearch =
                !q ||
                item.titleAr.toLowerCase().includes(q) ||
                item.summaryAr.toLowerCase().includes(q) ||
                item.categoryLabelAr.toLowerCase().includes(q) ||
                item.source.toLowerCase().includes(q);
              return matchesCategory && matchesSentiment && matchesSearch;
            })
            .map((item) => {
              const isBull = item.sentiment === "BULLISH";
              const isBear = item.sentiment === "BEARISH";
              const isCopied = copiedNewsId === item.id;
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-bold text-[10px] border border-slate-800">
                          {item.categoryLabelAr}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {item.source}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.timeAgo}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded font-black text-[10px] ${
                            isBull
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : isBear
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          }`}
                        >
                          {isBull ? "إيجابي صاعد 🟢" : isBear ? "سلبي ضاغط 🔴" : "حيادي 🟡"}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">
                      {item.titleAr}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {item.summaryAr}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="text-amber-300 font-semibold flex items-center gap-1">
                        <span>📉 الأثر السعري: </span>
                        <span className="text-slate-200 font-normal">{item.relatedPriceImpactAr}</span>
                      </div>

                      {isBear && (
                        <span className="text-[10px] bg-rose-500/15 text-rose-300 px-1.5 py-0.2 rounded border border-rose-500/30 font-bold">
                          محفز هبوطي 🔻
                        </span>
                      )}
                      {isBull && (
                        <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 font-bold">
                          دعم تجميعي 🟢
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="text-teal-300 font-semibold flex items-center gap-1">
                        <span>💡 التوجيه: </span>
                        <span className="text-slate-200 font-normal">{item.actionableTakeawayAr}</span>
                      </div>

                      <button
                        onClick={() => handleCopyNews(item)}
                        className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shrink-0"
                        title="نسخ ملخص الخبر"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>نسخ</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 6. CME Gaps & Liquidation Pools Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CME Chicago Gaps */}
        <div id="cme-gaps-section" className="p-4 rounded-2xl bg-[#0e1320] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">فجوات بورصة شيكاغو (CME Gaps Tracker)</h3>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
              مغناطيس سعري مؤسسي
            </span>
          </div>

          <div className="space-y-2">
            {cmeGaps.map((gap) => (
              <div key={gap.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-white font-mono">
                    ${gap.gapRange.min.toLocaleString()} - ${gap.gapRange.max.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">{gap.createdDate}</div>
                </div>

                <div className="text-left">
                  <div className="font-bold text-purple-400 font-mono">
                    احتمال السد: {gap.magneticFillProbability}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    البعد: ${gap.distanceDollars.toLocaleString()} ({gap.distancePercent}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liquidation Pools & CVD */}
        <div id="liquidation-pools-section" className="p-4 rounded-2xl bg-[#0e1320] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">أحواض التصفيات وتدفق الدلتا (Liquidation Heatmap)</h3>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
              تراكم أوامر الحيتان
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">تصفيات البيع المتراكمة (Short Liquidations):</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${(onChain.estimatedShortLiquidationsUsd / 1e6).toFixed(0)}M
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${orderFlowPressure.buyerDeltaPercent}%` }}
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${orderFlowPressure.sellerDeltaPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>قوة الشراء التراكمي (CVD): {orderFlowPressure.buyerDeltaPercent}%</span>
                <span>قوة البيع: {orderFlowPressure.sellerDeltaPercent}%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-850 text-xs text-slate-300">
              <strong className="text-white">جدار الدعم المؤسسي: </strong>
              <span className="font-mono font-bold text-amber-400">${orderFlowPressure.dominantWallPrice.toLocaleString()}</span>
              <span> ({orderFlowPressure.dominantWallSizeBtc.toLocaleString()} BTC في عمق الطلبات)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Live Whale Transactions Feed (محافظ الحيتان وصناديق ETF) */}
      <div id="whale-radar-section" className="p-4 sm:p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">رادار الحيتان والتحويلات الكبرى المباشرة (Whale Wallet Alerts)</h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
            {onChain.exchangeReserveTrendAr}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {whaleAlerts.map((wh) => (
            <div key={wh.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold text-[10px]">
                  {wh.whaleWalletTier}
                </span>
                <span className="text-[10px] text-slate-500">{wh.timeAgo}</span>
              </div>

              <div className="text-sm font-black text-white font-mono">
                {wh.amountBtc.toLocaleString()} BTC{" "}
                <span className="text-xs text-slate-400 font-normal">
                  (${((wh.valueUsd) / 1e6).toFixed(1)}M)
                </span>
              </div>

              <div className="text-[11px] text-slate-300 leading-snug">
                {wh.typeLabelAr}
              </div>

              <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-850">
                من: {wh.source} ← إلى: {wh.destination}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Tactical Scenarios Playbook (السيناريوهات الاستباقية الثلاثة) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0e1320] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>سيناريوهات حركة البتكوين القادمة (BTC Tactical Scenarios)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              مسارات مشروطة تمكنك من التداول مع صناع السوق في مختلف الاحتمالات
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {scenarios.map((scen, idx) => (
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
                      : "bg-rose-500 text-white font-black shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                سيناريو {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Scenario Box */}
        {(() => {
          const activeScen = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
          return (
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-750 space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-bold text-white">{activeScen.titleAr}</h4>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">
                    الاحتمالية:{" "}
                    <strong className="text-emerald-400 font-mono">{activeScen.probabilityPercent}%</strong>
                  </span>
                  <span className="text-slate-400">
                    الهدف:{" "}
                    <strong className="text-amber-400 font-mono">${activeScen.projectedTarget.toLocaleString()}</strong>
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <strong>الشرط الفني للتفعيل: </strong>
                {activeScen.triggerConditionAr}
              </div>

              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">المحفز الأساسي: </strong>
                {activeScen.catalystAr}
              </div>
            </div>
          );
        })()}
      </div>

      {/* 7. Macro Correlation (BTC vs Gold & Tech) */}
      <div className="p-4 rounded-xl bg-[#0a0f18] border border-slate-850 space-y-2 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 text-amber-400 font-bold">
          <span>ارتباط البتكوين بالذهب ومؤشر ناسداك (Macro Correlation Matrix):</span>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>الذهب (XAU): +{macroCorrelation.goldCorrelation30d}</span>
            <span>ناسداك (NDX): +{macroCorrelation.nasdaqCorrelation30d}</span>
            <span>الدولار (DXY): {macroCorrelation.dxyCorrelation30d}</span>
          </div>
        </div>
        <p className="text-slate-300 leading-relaxed">{macroCorrelation.digitalGoldThesisAr}</p>
      </div>

      {/* 8. AI Synthesized Institutional Briefing */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#131b28] to-slate-900 border border-amber-500/30 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              تقرير غرفة التداول اليومي للبتكوين بالذكاء الاصطناعي المؤسسي
            </h3>
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
                navigator.clipboard.writeText(report.aiSynthesisAr);
                soundFx.playChime();
                setCopiedId("ai");
                setTimeout(() => setCopiedId(null), 2000);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedId === "ai" ? (
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
          {report.aiSynthesisAr}
        </div>
      </div>
    </div>
  );
};
