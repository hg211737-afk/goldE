import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  DollarSign,
  Droplet,
  Flame,
  Globe2,
  HelpCircle,
  Layers,
  Radio,
  RotateCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ship,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Volume2,
  Wallet,
  Zap,
} from "lucide-react";
import {
  CrudeOilAnalysisReport,
  CrudeOilMarketData,
  CrudeOilSniperRecommendation,
} from "../types";
import { generateCrudeOilAnalysisReport } from "../services/crudeOilAnalysisService";
import { soundFx } from "../services/soundService";

interface CrudeOilAnalysisViewProps {
  onBackToGold?: () => void;
  onNavigateToBitcoin?: () => void;
  onNavigateToXpl?: () => void;
}

export const CrudeOilAnalysisView: React.FC<CrudeOilAnalysisViewProps> = ({
  onBackToGold,
  onNavigateToBitcoin,
  onNavigateToXpl,
}) => {
  const [report, setReport] = useState<CrudeOilAnalysisReport | null>(null);
  const [timeframe, setTimeframe] = useState<"1m" | "5m" | "15m" | "1h" | "4h" | "1D">("15m");
  const [activeTab, setActiveTab] = useState<
    | "footprint_dom"
    | "sniper"
    | "heatmap"
    | "cvd"
    | "options"
    | "cot"
    | "marketprofile"
    | "warroom"
    | "eia"
    | "montecarlo"
    | "whales"
  >("footprint_dom");
  const [selectedFootprintIndex, setSelectedFootprintIndex] = useState<number>(0);
  const [calcMargin, setCalcMargin] = useState<number>(2000);
  const [calcLeverage, setCalcLeverage] = useState<number>(10);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [customPrice, setCustomPrice] = useState<number>(74.85);
  const [showTradingViewModal, setShowTradingViewModal] = useState<boolean>(false);

  const loadData = (showToast = false) => {
    if (showToast) {
      setIsRefreshing(true);
      soundFx.playHudClick();
    }
    const data = generateCrudeOilAnalysisReport(customPrice);
    setReport(data);
    if (showToast) {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  useEffect(() => {
    loadData();
    // Auto refresh every 20 seconds
    const interval = setInterval(() => {
      loadData();
    }, 20000);
    return () => clearInterval(interval);
  }, [customPrice]);

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[600px] text-amber-400">
        <RotateCw className="w-8 h-8 animate-spin mb-3" />
        <span className="text-sm font-semibold">جاري تهيئة منظومة تحليل تدفق أوامر النفط الخام المؤسسية WTI/CL...</span>
      </div>
    );
  }

  const { marketData, recommendation, footprintBars, domLevels, liquidityZones, optionsFlow, cotReport, marketProfile, warRoom, eiaReport, monteCarlo, mlForecast, cvdMetrics, whaleAlerts, aiSynthesisAr } = report;

  const handleCopyOrder = () => {
    const text = `=== توصية قناص النفط الخام المؤسسية (WTI Crude Oil) ===
الرمز: ${marketData.symbol}
الاتجاه: ${recommendation.direction === "LONG" ? "شراء استراتيجي (LONG)" : "بيع استراتيجي (SHORT)"}
منطقة الدخول: $${recommendation.entryZone.min} - $${recommendation.entryZone.max} (المثالي: $${recommendation.entryZone.ideal})
الهدف الأول (TP1): $${recommendation.takeProfits.tp1} (إغلاق ${recommendation.takeProfits.tp1ContractsPercent}%)
الهدف الثاني (TP2): $${recommendation.takeProfits.tp2} (إغلاق ${recommendation.takeProfits.tp2ContractsPercent}%)
الهدف الثالث (TP3): $${recommendation.takeProfits.tp3} (إغلاق ${recommendation.takeProfits.tp3ContractsPercent}%)
وقف الخسارة (SL): $${recommendation.stopLoss.price}
نسبة العائد للمخاطرة: ${recommendation.riskRewardRatio}
نسبة النجاح المقدرة: ${recommendation.confidencePercent}%
أسباب الدخول:
${recommendation.catalystsAr.map((c) => `- ${c}`).join("\n")}
========================================`;

    navigator.clipboard.writeText(text);
    setCopiedId("order-all");
    soundFx.playIcebergAlert();
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleToggleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(recommendation.audioBriefingAr);
    utterance.lang = "ar-SA";
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Position sizing calculation
  const calculatedContracts = Math.max(1, Math.floor((calcMargin * calcLeverage) / (marketData.price * 100)));
  const calculatedBarrels = calculatedContracts * 1000;
  const potentialProfitTp2 = ((recommendation.takeProfits.tp2 - recommendation.entryZone.ideal) * calculatedBarrels).toFixed(0);
  const potentialLoss = ((recommendation.entryZone.ideal - recommendation.stopLoss.price) * calculatedBarrels).toFixed(0);

  return (
    <div className="flex flex-col gap-4 w-full text-slate-100 font-sans pb-16">
      {/* 1. TOP HEADER & ASSET SWITCHER BAR */}
      <div className="bg-gradient-to-r from-slate-950 via-[#14120c] to-[#0c1322] border border-amber-500/30 rounded-xl p-4 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              <Droplet className="w-7 h-7 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wide font-['JetBrains_Mono']">
                  CRUDE OIL (WTI / CL) PRO
                </h1>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  NYMEX & ICE
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  بث لحظي مباشر
                </span>
                <span className="text-xs bg-orange-500/20 text-orange-300 border border-orange-500/40 px-2 py-0.5 rounded-full font-bold">
                  {marketData.termStructure === "BACKWARDATION" ? "باكوارديشن (شح مادي +0.72$)" : "كونتانغو"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                منظومة التحليل المؤسسي الشامل للنفط الخام: تدفق أوامر، Footprint، DOM، خريطة السيولة، عقود الخيارات GEX، تقرير COT، غرفة أوبك+، ومخزونات EIA
              </p>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex items-center gap-3 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-400 block">سعر برميل WTI اللحظي</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black font-['JetBrains_Mono'] text-white">
                    ${marketData.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                      marketData.change24h >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    }`}
                  >
                    {marketData.change24h >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {marketData.change24h >= 0 ? "+" : ""}
                    {marketData.change24h.toFixed(2)}$ ({marketData.changePercent24h}%)
                  </span>
                </div>
              </div>
              <div className="border-r border-slate-800 pr-3 mr-1 text-right">
                <span className="text-[10px] text-slate-400 block">برنت (BRENT)</span>
                <span className="text-sm font-black font-['JetBrains_Mono'] text-amber-300">
                  ${marketData.brentPrice.toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-500 block">الفارق +${marketData.brentWtiSpread.toFixed(2)}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToggleSpeak}
                className={`p-2.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSpeaking
                    ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30 animate-pulse"
                    : "bg-slate-800/80 hover:bg-slate-700 text-amber-300 border-amber-500/30"
                }`}
                title="موجز صوتي استخباراتي للصفقة باللغة العربية"
              >
                <Volume2 className="w-4 h-4" />
                <span className="hidden sm:inline">{isSpeaking ? "إيقاف الصوت" : "موجز صوتي"}</span>
              </button>

              <button
                onClick={handleCopyOrder}
                className="p-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="نسخ مواصفات الصفقة المؤسسية"
              >
                {copiedId === "order-all" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedId === "order-all" ? "تم النسخ" : "نسخ الصفقة"}</span>
              </button>

              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                title="تحديث البيانات"
              >
                <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
              </button>

              {onBackToGold && (
                <button
                  onClick={onBackToGold}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-black text-xs hover:brightness-110 transition-all shadow-md cursor-pointer flex items-center gap-1"
                >
                  <span>العودة للذهب</span>
                  <span className="font-['JetBrains_Mono']">XAU/USD</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Key Energy Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">أعلى / أدنى 24h</span>
            <span className="font-mono font-bold text-white">${marketData.high24h} / ${marketData.low24h}</span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">السبريد (Spread)</span>
            <span className="font-mono font-bold text-emerald-400">${marketData.spread.toFixed(2)} (ضيق جداً)</span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">هوامش التكرير 3:2:1</span>
            <span className="font-mono font-bold text-amber-300">${marketData.crackSpread321.toFixed(2)}/bbl</span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">مؤشر تقلب النفط OVX</span>
            <span className="font-mono font-bold text-cyan-300">{marketData.impliedVolatilityOvxFoil}</span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">العقود المفتوحة (OI)</span>
            <span className="font-mono font-bold text-slate-200">{(marketData.openInterestContracts / 1000).toFixed(0)}k عقد</span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">أوامر الخيارات Put/Call</span>
            <span className="font-mono font-bold text-emerald-400">{optionsFlow.putCallRatio} (صعودي)</span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">تخفيض أوبك+ الطوعي</span>
            <span className="font-mono font-bold text-orange-400">{warRoom.opecPlusPolicy.saudiVoluntaryCutMbpd}M برميل/ي</span>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS (ALL GOLD EQUIVALENTS) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => setActiveTab("footprint_dom")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "footprint_dom"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>1. الشارت و Footprint & DOM</span>
        </button>

        <button
          onClick={() => setActiveTab("sniper")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "sniper"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>2. توصية القناص المؤسسية</span>
          <span className="text-[9px] bg-emerald-500 text-slate-950 px-1 py-0.2 rounded font-black">
            88.5%
          </span>
        </button>

        <button
          onClick={() => setActiveTab("heatmap")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "heatmap"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>3. خريطة السيولة والحرارة</span>
        </button>

        <button
          onClick={() => setActiveTab("cvd")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "cvd"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>4. تدفق الأوامر و CVD</span>
        </button>

        <button
          onClick={() => setActiveTab("options")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "options"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>5. عقود الخيارات و GEX</span>
        </button>

        <button
          onClick={() => setActiveTab("cot")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "cot"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>6. تقرير COT للمتداولين</span>
        </button>

        <button
          onClick={() => setActiveTab("marketprofile")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "marketprofile"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>7. بروفايل السوق TPO</span>
        </button>

        <button
          onClick={() => setActiveTab("warroom")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "warroom"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>8. غرفة أوبك+ والجيوسياسة</span>
        </button>

        <button
          onClick={() => setActiveTab("eia")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "eia"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>9. رادار مخزونات EIA و API</span>
        </button>

        <button
          onClick={() => setActiveTab("montecarlo")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "montecarlo"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>10. نموذج AI و Monte Carlo</span>
        </button>

        <button
          onClick={() => setActiveTab("whales")}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "whales"
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
          }`}
        >
          <Ship className="w-3.5 h-3.5" />
          <span>11. رادار الحيتان والناقلات VLCC</span>
        </button>
      </div>

      {/* 3. MAIN TAB CONTENT PANELS */}
      <div className="w-full">
        {/* TAB 1: FOOTPRINT & DOM & REALTIME ORDER FLOW */}
        {activeTab === "footprint_dom" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Footprint Chart View */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm font-bold text-white">
                    مخطط فوت برنت العناقيد اللحظي للنفط (Footprint Bid/Ask Cluster 15m)
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">الفترة:</span>
                  {(["1m", "5m", "15m", "1h"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2 py-0.5 rounded font-mono ${
                        timeframe === tf ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footprint Bar Selector & Delta Stats */}
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {footprintBars.map((bar, idx) => (
                  <button
                    key={`${bar.timestamp}-${idx}`}
                    onClick={() => setSelectedFootprintIndex(idx)}
                    className={`p-2 rounded-lg border text-left min-w-[120px] transition-all cursor-pointer ${
                      selectedFootprintIndex === idx
                        ? "bg-slate-800 border-amber-500/60 shadow"
                        : "bg-slate-950/60 border-slate-800 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>شمعة #{idx + 1}</span>
                      <span className={bar.close >= bar.open ? "text-emerald-400" : "text-rose-400"}>
                        {bar.close >= bar.open ? "▲" : "▼"} ${bar.close.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold mt-1">
                      دلتا:{" "}
                      <span className={bar.deltaBarrels >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {bar.deltaBarrels >= 0 ? "+" : ""}
                        {(bar.deltaBarrels / 1000000).toFixed(1)}M bbl
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Bar Cluster Ladder */}
              {footprintBars[selectedFootprintIndex] && (
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span>
                      الشمعة المحددة: الافتتاح ${footprintBars[selectedFootprintIndex].open} | الإغلاق ${footprintBars[selectedFootprintIndex].close} | القمة ${footprintBars[selectedFootprintIndex].high} | القاع ${footprintBars[selectedFootprintIndex].low}
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      POC: ${footprintBars[selectedFootprintIndex].pocPrice}
                    </span>
                  </div>

                  {/* Footprint Grid */}
                  <div className="flex flex-col gap-1 max-h-[360px] overflow-y-auto pr-1">
                    <div className="grid grid-cols-5 text-[10px] font-bold text-slate-400 border-b border-slate-800/80 pb-1 text-center">
                      <span>أوامر البيع (Bid)</span>
                      <span>السعر $/bbl</span>
                      <span>أوامر الشراء (Ask)</span>
                      <span>الدلتا الصافية</span>
                      <span>اختلال السيولة (Imbalance)</span>
                    </div>
                    {footprintBars[selectedFootprintIndex].clusters.map((cluster, cIdx) => (
                      <div
                        key={cIdx}
                        className={`grid grid-cols-5 text-xs py-1 px-1 rounded items-center text-center font-mono ${
                          cluster.isPoc
                            ? "bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold"
                            : "bg-slate-900/40 hover:bg-slate-850"
                        }`}
                      >
                        <span className={`text-slate-300 ${cluster.imbalanceSell ? "text-rose-400 font-black bg-rose-500/20 rounded px-1" : ""}`}>
                          {cluster.bidQty}
                        </span>
                        <span className={`font-black ${cluster.isPoc ? "text-amber-400 underline" : "text-slate-100"}`}>
                          ${cluster.price.toFixed(2)}
                        </span>
                        <span className={`text-slate-300 ${cluster.imbalanceBuy ? "text-emerald-400 font-black bg-emerald-500/20 rounded px-1" : ""}`}>
                          {cluster.askQty}
                        </span>
                        <span className={cluster.delta >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {cluster.delta >= 0 ? "+" : ""}{cluster.delta}
                        </span>
                        <span>
                          {cluster.imbalanceBuy && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1 rounded font-bold">
                              شراء 3x
                            </span>
                          )}
                          {cluster.imbalanceSell && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1 rounded font-bold">
                              بيع 3x
                            </span>
                          )}
                          {cluster.isPoc && !cluster.imbalanceBuy && !cluster.imbalanceSell && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-bold">
                              POC أعلى حجم
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Flow Absorption Summary */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-300">تشخيص تدفق الأوامر اللحظي:</h4>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    {cvdMetrics.absorptionTypeAr}. {cvdMetrics.divergenceNotesAr}
                  </p>
                </div>
              </div>
            </div>

            {/* DOM Ladder (Depth of Market) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm font-bold text-white">دفتر الأوامر اللحظي (DOM Ladder)</h2>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                  1 عقد = 1,000 برميل
                </span>
              </div>

              {/* DOM Ladder Table */}
              <div className="flex flex-col gap-1">
                <div className="grid grid-cols-3 text-[10px] font-bold text-slate-400 border-b border-slate-800/80 pb-1 text-center">
                  <span className="text-emerald-400">عقود الشراء (Bid)</span>
                  <span>السعر ($)</span>
                  <span className="text-rose-400">عقود البيع (Ask)</span>
                </div>

                {domLevels.map((lvl, lIdx) => (
                  <div
                    key={lIdx}
                    className={`grid grid-cols-3 text-xs py-1 px-1.5 rounded items-center font-mono ${
                      lvl.isInstitutionalWall
                        ? "bg-amber-500/20 border border-amber-500/50 text-amber-300 font-black shadow"
                        : Math.abs(lvl.price - marketData.price) < 0.04
                        ? "bg-slate-800 border border-slate-700 text-white font-bold"
                        : "bg-slate-950/40 text-slate-300"
                    }`}
                  >
                    {/* Bid column */}
                    <div className="flex items-center gap-1 justify-start">
                      {lvl.bidContracts > 0 ? (
                        <>
                          <div
                            className="h-2 rounded bg-emerald-500/40"
                            style={{ width: `${Math.min(100, (lvl.bidContracts / 20000) * 100)}%` }}
                          />
                          <span className="text-emerald-400 font-bold">{lvl.bidContracts.toLocaleString()}</span>
                        </>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </div>

                    {/* Price column */}
                    <div className="text-center">
                      <span className={lvl.isInstitutionalWall ? "text-amber-400 font-black" : "text-white"}>
                        ${lvl.price.toFixed(2)}
                      </span>
                      {lvl.wallType === "OPEC_DEFENSE" && (
                        <span className="block text-[8px] text-amber-400 font-bold">جدار أوبك+</span>
                      )}
                      {lvl.wallType === "COMMERCIAL_HEDGE" && (
                        <span className="block text-[8px] text-emerald-400 font-bold">طلب المصافي</span>
                      )}
                      {lvl.wallType === "CTA_STOP_POOL" && (
                        <span className="block text-[8px] text-rose-400 font-bold">وقف خسارة CTA</span>
                      )}
                    </div>

                    {/* Ask column */}
                    <div className="flex items-center gap-1 justify-end">
                      {lvl.askContracts > 0 ? (
                        <>
                          <span className="text-rose-400 font-bold">{lvl.askContracts.toLocaleString()}</span>
                          <div
                            className="h-2 rounded bg-rose-500/40"
                            style={{ width: `${Math.min(100, (lvl.askContracts / 20000) * 100)}%` }}
                          />
                        </>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* DOM Institutional Note */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 text-[11px] text-slate-400 mt-2">
                <span className="text-amber-400 font-bold">ملاحظة دفتر الأوامر: </span>
                تمركز جدار شراء هائل بأكثر من 18,900 عقد (18.9 مليون برميل) عند $73.00 يمثل صمام أمان مؤسسي دفاعي، بينما العروض البيعية متناثرة حتى حاجز $76.35.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SNIPER RECOMMENDATION & ORDER SPECIFICATION */}
        {activeTab === "sniper" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-[#1c140c] border border-amber-500/40 rounded-xl p-5 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <span>توصية القناص المؤسسية للنفط</span>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                        {recommendation.directionLabelAr}
                      </span>
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">
                      كود العملية: {recommendation.tradeId} | نسبة النجاح: {recommendation.confidencePercent}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyOrder}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === "order-all" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "order-all" ? "تم نسخ الأوامر" : "نسخ الأوامر لمنصة التداول"}</span>
                  </button>
                </div>
              </div>

              {/* Order Execution Parameters Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <span className="text-[10px] text-slate-400 block">نطاق الدخول المقترح</span>
                  <span className="text-lg font-black font-['JetBrains_Mono'] text-amber-300">
                    ${recommendation.entryZone.min} - ${recommendation.entryZone.max}
                  </span>
                  <span className="text-[10px] text-slate-500 block">المثالي: ${recommendation.entryZone.ideal}</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <span className="text-[10px] text-slate-400 block">الهدف الأول (TP1 - 40%)</span>
                  <span className="text-lg font-black font-['JetBrains_Mono'] text-emerald-400">
                    ${recommendation.takeProfits.tp1}
                  </span>
                  <span className="text-[10px] text-emerald-500/80 block">+${(recommendation.takeProfits.tp1 - recommendation.entryZone.ideal).toFixed(2)}/bbl</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <span className="text-[10px] text-slate-400 block">الهدف الثاني (TP2 - 35%)</span>
                  <span className="text-lg font-black font-['JetBrains_Mono'] text-emerald-400">
                    ${recommendation.takeProfits.tp2}
                  </span>
                  <span className="text-[10px] text-emerald-500/80 block">+${(recommendation.takeProfits.tp2 - recommendation.entryZone.ideal).toFixed(2)}/bbl</span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <span className="text-[10px] text-slate-400 block">وقف الخسارة (SL Invalidation)</span>
                  <span className="text-lg font-black font-['JetBrains_Mono'] text-rose-400">
                    ${recommendation.stopLoss.price}
                  </span>
                  <span className="text-[10px] text-rose-500/80 block">المخاطرة: -${(recommendation.entryZone.ideal - recommendation.stopLoss.price).toFixed(2)}/bbl</span>
                </div>
              </div>

              {/* R:R and Catalysts */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-bold text-amber-300">
                    نسبة العائد إلى المخاطرة (R:R): <span className="font-mono text-white">{recommendation.riskRewardRatio}</span>
                  </span>
                  <span className="text-slate-400">المدى الزمني: {recommendation.timeHorizonAr}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-300 mb-2">الدعائم والمحفزات المؤسسية للصفقة (Institutional Catalysts):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {recommendation.catalystsAr.map((cat, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded border border-slate-800/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-300 leading-relaxed">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Institutional Thesis */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 text-xs leading-relaxed">
                <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  أطروحة غرفة التداول الاستثمارية:
                </h4>
                <p className="text-slate-300">{recommendation.institutionalThesisAr}</p>
              </div>
            </div>

            {/* Position Size Calculator in Barrels / Contracts */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Wallet className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">حاسبة حجم الصفقة وإدارة المخاطر (Crude Sizing)</h3>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">الهامش المخصص ($ USD):</label>
                  <input
                    type="number"
                    value={calcMargin}
                    onChange={(e) => setCalcMargin(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white text-sm focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">الرافعة المالية المستخدمة (Leverage):</label>
                  <select
                    value={calcLeverage}
                    onChange={(e) => setCalcLeverage(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-white text-sm focus:border-amber-500 outline-none"
                  >
                    <option value={1}>1x (بدون رافعة)</option>
                    <option value={5}>5x</option>
                    <option value={10}>10x</option>
                    <option value={20}>20x</option>
                    <option value={50}>50x</option>
                  </select>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">عدد العقود القياسية:</span>
                    <span className="font-mono font-bold text-white">{calculatedContracts} عقود (CL)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">إجمالي كمية البراميل:</span>
                    <span className="font-mono font-bold text-amber-300">{calculatedBarrels.toLocaleString()} برميل</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                    <span className="text-slate-400">الربح المتوقع عند TP2:</span>
                    <span className="font-mono font-bold text-emerald-400">+${potentialProfitTp2}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">أقصى خسارة عند SL:</span>
                    <span className="font-mono font-bold text-rose-400">-${potentialLoss}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LIQUIDITY HEATMAP & MAGNETIC POOLS */}
        {activeTab === "heatmap" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  خريطة السيولة الحرارية وأحواض التصفيات المغناطيسية للنفط (Liquidity Heatmap)
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                ترصد تمركز أوامر وقف الخسارة للمضاربين وجدران الدفاع الحكومية
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liquidityZones.map((zone) => (
                <div
                  key={zone.id}
                  className={`border rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden ${
                    zone.type === "MAGNETIC_POOL_SELL"
                      ? "bg-rose-950/20 border-rose-500/40"
                      : zone.type === "OPEC_INTERVENTION_FLOOR"
                      ? "bg-amber-950/20 border-amber-500/50"
                      : zone.type === "SPR_REFILL_ZONE"
                      ? "bg-blue-950/20 border-blue-500/40"
                      : "bg-emerald-950/20 border-emerald-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        zone.type === "MAGNETIC_POOL_SELL"
                          ? "bg-rose-500/20 text-rose-300"
                          : zone.type === "OPEC_INTERVENTION_FLOOR"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-blue-500/20 text-blue-300"
                      }`}
                    >
                      {zone.type}
                    </span>
                    <span className="text-xs font-mono font-black text-white">
                      ${zone.priceMin.toFixed(2)} - ${zone.priceMax.toFixed(2)}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-white mt-1">{zone.titleAr}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{zone.descriptionAr}</p>

                  <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/80 text-slate-400">
                    <span>حجم السيولة التقديري: {(zone.volumeBarrelsTotal / 1000000).toFixed(1)}M برميل</span>
                    <span className="text-amber-400 font-bold">كثافة الحوض: {zone.strengthPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CVD & ORDER FLOW DIVERGENCE */}
        {activeTab === "cvd" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  تحليل دلتا الحجم التراكمية (Cumulative Volume Delta - CVD)
                </h2>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                تباين صعودي (Bullish Divergence)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-xs text-slate-400 block">صافي دلتا الجلسة (CVD)</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  +{(cvdMetrics.cumulativeDeltaBarrels / 1000000).toFixed(2)}M برميل
                </span>
                <span className="text-[10px] text-slate-500 block">ضغط شرائي عدواني مستمر</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-xs text-slate-400 block">نسبة الشراء الماركت العدواني</span>
                <span className="text-xl font-black font-mono text-amber-300">
                  {cvdMetrics.aggressiveBuyRatioPercent}%
                </span>
                <span className="text-[10px] text-slate-500 block">تفوق المشترين في السوق</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-xs text-slate-400 block">حالة الامتصاص (Absorption)</span>
                <span className="text-base font-bold text-white">
                  {cvdMetrics.absorptionDetected ? "امتصاص شراء مؤكد" : "لا يوجد"}
                </span>
                <span className="text-[10px] text-emerald-400 block">Iceberg Bids نشطة</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 text-xs leading-relaxed">
              <h4 className="font-bold text-amber-400 mb-1">تفاصيل إشارة التباين (Divergence Analysis):</h4>
              <p className="text-slate-300">{cvdMetrics.divergenceNotesAr}</p>
            </div>
          </div>
        )}

        {/* TAB 5: OPTIONS FLOW & GEX GAMMA EXPOSURE */}
        {activeTab === "options" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  تدفق عقود خيارات النفط والتعرض لغاما (WTI Options Gamma Exposure GEX)
                </h2>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                {optionsFlow.gammaRegimeAr}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] text-slate-400 block">جدار الكول (Call Wall)</span>
                <span className="text-xl font-black font-mono text-rose-400">${optionsFlow.callWallPrice.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block">مقاومة غاما قصوى</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] text-slate-400 block">جدار البوت (Put Wall)</span>
                <span className="text-xl font-black font-mono text-emerald-400">${optionsFlow.putWallPrice.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block">دعم وحماية مؤسسية</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] text-slate-400 block">سعر الألم الأقصى (Max Pain)</span>
                <span className="text-xl font-black font-mono text-amber-300">${optionsFlow.maxPainPrice.toFixed(2)}</span>
                <span className="text-[10px] text-slate-500 block">نقطة تعادل صناع السوق</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] text-slate-400 block">صافي غاما (Net GEX)</span>
                <span className="text-xl font-black font-mono text-cyan-400">+{optionsFlow.netGammaGexMillions}M$</span>
                <span className="text-[10px] text-slate-500 block">استقرار وتخميد للتقلبات</span>
              </div>
            </div>

            {/* Dominant Strikes Table */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3">
              <h3 className="text-xs font-bold text-slate-300 mb-2">أبرز مستويات الإضراب النشطة (Key Strike Pegs):</h3>
              <div className="grid grid-cols-5 text-[10px] font-bold text-slate-400 border-b border-slate-800 pb-1 text-center">
                <span>سعر الإضراب Strike</span>
                <span>عقود Call OI</span>
                <span>عقود Put OI</span>
                <span>صافي الغاما Net GEX</span>
                <span>التأثير</span>
              </div>
              <div className="flex flex-col gap-1 mt-1 font-mono text-xs">
                {optionsFlow.dominantStrikes.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-5 py-1 px-1 rounded bg-slate-900/40 text-center items-center">
                    <span className="font-bold text-white">${s.strike.toFixed(2)}</span>
                    <span className="text-emerald-400">{s.callOi.toLocaleString()}</span>
                    <span className="text-rose-400">{s.putOi.toLocaleString()}</span>
                    <span className={s.netGex >= 0 ? "text-cyan-400" : "text-amber-400"}>
                      {s.netGex >= 0 ? "+" : ""}{s.netGex}M$
                    </span>
                    <span className="text-[10px]">
                      {s.sentiment === "BULLISH" && <span className="text-emerald-400 font-bold">صعودي</span>}
                      {s.sentiment === "BEARISH" && <span className="text-rose-400 font-bold">هبوطي</span>}
                      {s.sentiment === "PIN" && <span className="text-amber-400 font-bold">نقطة تثبيت</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CFTC COT REPORT */}
        {activeTab === "cot" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  تقرير التزامات المتداولين لهيئة CFTC (Commitment of Traders - COT Report)
                </h2>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                إشارة شراء قوية (STRONG BULLISH REVERSAL)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-xs text-slate-400 block">صافي مراكز الصناديق (Managed Money)</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  +{cotReport.managedMoneyNetPosition.toLocaleString()} عقد
                </span>
                <span className="text-[10px] text-slate-500 block">شراء: {cotReport.managedMoneyLongs.toLocaleString()} | بيع: {cotReport.managedMoneyShorts.toLocaleString()}</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-xs text-slate-400 block">صافي مراكز المنتجين (Commercial Hedgers)</span>
                <span className="text-xl font-black font-mono text-slate-300">
                  {cotReport.commercialNetPosition.toLocaleString()} عقد
                </span>
                <span className="text-[10px] text-slate-500 block">تحوط روتيني منخفض للمنتجين</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-xs text-slate-400 block">التغير الأسبوعي في السيولة</span>
                <span className="text-xl font-black font-mono text-amber-300">
                  +{(cotReport.weeklyShiftBarrels / 1000000).toFixed(1)}M برميل
                </span>
                <span className="text-[10px] text-slate-500 block">تدفقات استثمارية جديدة</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 text-xs leading-relaxed flex flex-col gap-2">
              <div>
                <span className="font-bold text-amber-400">سلوك الصناديق الاستثمارية المضاربة: </span>
                <span className="text-slate-300">{cotReport.speculativeSentimentAr}</span>
              </div>
              <div>
                <span className="font-bold text-emerald-400">سلوك المنتجين والمصافي التجاريين: </span>
                <span className="text-slate-300">{cotReport.commercialHedgingTrendAr}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: MARKET PROFILE TPO */}
        {activeTab === "marketprofile" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">بروفايل السوق التراكمي (TPO Market Profile)</h2>
              </div>
              <span className="text-xs text-amber-400 font-bold">{marketProfile.profileTypeAr}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] text-slate-400 block">قمة منطقة القيمة (VAH)</span>
                <span className="text-lg font-black font-mono text-emerald-400">${marketProfile.valueAreaHigh.toFixed(2)}</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] text-slate-400 block">نقطة التحكم السعري (POC)</span>
                <span className="text-lg font-black font-mono text-amber-300">${marketProfile.pocPrice.toFixed(2)}</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] text-slate-400 block">قاع منطقة القيمة (VAL)</span>
                <span className="text-lg font-black font-mono text-rose-400">${marketProfile.valueAreaLow.toFixed(2)}</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-[10px] text-slate-400 block">نطاق التوازن الأولي (IB)</span>
                <span className="text-lg font-black font-mono text-white">${marketProfile.initialBalanceLow.toFixed(2)} - ${marketProfile.initialBalanceHigh.toFixed(2)}</span>
              </div>
            </div>

            {/* TPO Letters Ladder */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 flex flex-col gap-1 max-h-[300px] overflow-y-auto">
              {marketProfile.tpoLetters.map((tpo, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between text-xs py-1 px-2 rounded font-mono ${
                    tpo.isPoc
                      ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold"
                      : tpo.isValueArea
                      ? "bg-slate-900/60 text-slate-200"
                      : "text-slate-500"
                  }`}
                >
                  <span className="w-20 font-bold">${tpo.price.toFixed(2)}</span>
                  <div className="flex-1 flex items-center gap-1 overflow-hidden px-2">
                    {tpo.letters.map((letter, lIdx) => (
                      <span key={lIdx} className="w-4 h-4 rounded bg-slate-800 text-[10px] flex items-center justify-center text-amber-400 font-bold">
                        {letter}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {tpo.isPoc ? "نقطة POC القصوى" : tpo.isSinglePrint ? "طبعة أحادية (Single Print)" : `${tpo.tpoCount} TPO`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: GEOPOLITICAL & OPEC+ WAR ROOM */}
        {activeTab === "warroom" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Globe2 className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">غرفة العمليات الجيوسياسية وسياسات تحالف أوبك+ (OPEC+ War Room)</h2>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                انضباط حصص أوبك: {warRoom.opecPlusPolicy.quotaDisciplinePercent}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Geopolitical Hotspots */}
              <div className="md:col-span-2 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-slate-300">ممرات الملاحة ونقاط الاختناق الحرجة (Critical Choke Points):</h3>
                <div className="flex flex-col gap-2">
                  {warRoom.geopoliticalHotspots.map((spot, idx) => (
                    <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{spot.regionAr}</span>
                        <span className="text-rose-400 font-bold font-mono">درجة الخطر: {spot.riskScorePercent}%</span>
                      </div>
                      <p className="text-xs text-slate-300">{spot.statusAr}</p>
                      <div className="text-[11px] text-amber-400 font-mono pt-1 border-t border-slate-850">
                        علاوة المخاطر السعرية المضافة: +${spot.impactUsdPerBarrel.toFixed(2)}/برميل
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SPR Status & Crack Margins */}
              <div className="flex flex-col gap-3">
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-amber-400">الاحتياطي الاستراتيجي الأمريكي (SPR):</h4>
                  <div className="text-xl font-black font-mono text-white">
                    {warRoom.sprRefillStatus.currentSprLevelMbbl}M / {warRoom.sprRefillStatus.maxCapacityMbbl}M برميل
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{warRoom.sprRefillStatus.narrativeAr}</p>
                  <span className="text-[11px] text-emerald-400 font-mono mt-1">
                    سعر الشراء المستهدف للوزارة: &lt;${warRoom.sprRefillStatus.doeTargetBuyPriceUsd}/برميل
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-amber-400">هوامش تكرير المصافي (3:2:1 Crack Margins):</h4>
                  <div className="text-xl font-black font-mono text-emerald-400">
                    ${warRoom.refineryCrackMargins.crack321Usd.toFixed(2)}/برميل
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{warRoom.refineryCrackMargins.signalAr}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: EIA & API INVENTORIES PRE-NEWS RADAR */}
        {activeTab === "eia" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  رادار مخزونات النفط الأمريكية الأسبوعية (EIA & API Inventory Radar)
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">{eiaReport.nextReleaseDate}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-xs text-slate-400 block">تقرير معهد البترول الأولي (API)</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  {eiaReport.apiCrudeInventoryMbbl > 0 ? "+" : ""}{eiaReport.apiCrudeInventoryMbbl}M برميل
                </span>
                <span className="text-[10px] text-emerald-400 block">سحب كبير غير متوقع (صعودي)</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-xs text-slate-400 block">توقعات تقرير EIA الرسمي</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  {eiaReport.forecastCrudeChangeMbbl}M برميل
                </span>
                <span className="text-[10px] text-slate-500 block">السابق: +{eiaReport.previousCrudeChangeMbbl}M برميل</span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                <span className="text-xs text-slate-400 block">مخزونات كوشينغ في أوكلاهوما (Cushing)</span>
                <span className="text-xl font-black font-mono text-amber-300">
                  {eiaReport.cushingOklahomaInventoryMbbl}M برميل
                </span>
                <span className="text-[10px] text-rose-400 block">نسبة السعة {eiaReport.cushingStorageCapacityPercent}% (شح مادي حرج)</span>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 text-xs leading-relaxed">
              <h4 className="font-bold text-amber-400 mb-1">الإرشاد التكتيكي للتعامل مع صدور الأرقام:</h4>
              <p className="text-slate-300">{eiaReport.strategicGuidanceAr}</p>
            </div>
          </div>
        )}

        {/* TAB 10: AI ML FORECAST & 10,000 MONTE CARLO SIMULATION */}
        {activeTab === "montecarlo" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Machine Learning Model */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">نموذج الذكاء الاصطناعي المؤسسي (ML Model)</h3>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold font-mono">
                  ثقة {mlForecast.prediction24h.confidencePercent}%
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex flex-col gap-1.5">
                <span className="text-xs text-slate-400">توقع المسار لـ 24 ساعة القادمة:</span>
                <span className="text-lg font-black text-emerald-400">{mlForecast.prediction24h.directionLabelAr}</span>
                <span className="text-xs font-mono text-white">
                  المستهدف السعري: ${mlForecast.prediction24h.targetPrice} (+{mlForecast.prediction24h.expectedMovePercent}%)
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2">أوزان العوامل في القرار التنبؤي (Feature Importance):</h4>
                <div className="flex flex-col gap-1.5">
                  {mlForecast.featuresImportance.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{f.featureAr}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-800 h-2 rounded overflow-hidden">
                          <div className="bg-amber-400 h-full rounded" style={{ width: `${f.weightPercent * 3}%` }} />
                        </div>
                        <span className="font-mono text-amber-300 w-8 text-right font-bold">{f.weightPercent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monte Carlo Simulator */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">محاكاة مونت كارلو (10,000 مسار احتمالي)</h3>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                  10,000 Paths
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <span className="text-slate-400 block">احتمال الصعود (Rise Probability):</span>
                  <span className="text-xl font-black font-mono text-emerald-400">{monteCarlo.probabilityRisePercent}%</span>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3">
                  <span className="text-slate-400 block">احتمال الهبوط (Fall Probability):</span>
                  <span className="text-xl font-black font-mono text-rose-400">{monteCarlo.probabilityFallPercent}%</span>
                </div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 flex flex-col gap-1 text-xs">
                <span className="text-slate-400">القيمة المتوقعة المتوسطة EV (24h):</span>
                <span className="text-lg font-black font-mono text-amber-300">${monteCarlo.expectedEvPrice}</span>
                <span className="text-[10px] text-slate-400">
                  فاصل الثقة 95%: من ${monteCarlo.confidenceInterval95.lower} إلى ${monteCarlo.confidenceInterval95.upper}
                </span>
              </div>

              {/* Volatility Cone Steps */}
              <div className="flex flex-col gap-1 text-[11px] font-mono">
                <span className="text-slate-400 font-sans mb-1 font-bold">مخروط التقلب السعري (Volatility Cone):</span>
                {monteCarlo.volatilityCone.map((c) => (
                  <div key={c.hour} className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">بعد {c.hour} ساعة:</span>
                    <span className="text-rose-400">${c.lower95}</span>
                    <span className="text-amber-300 font-bold">${c.mean}</span>
                    <span className="text-emerald-400">${c.upper95}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 11: WHALE SONAR & SUPERTANKER BLOCK FLOW */}
        {activeTab === "whales" && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Ship className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white">
                  رادار الصفقات الكبرى وتدفقات الناقلات العملاقة (Whale Sonar & Supertankers)
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                يرصد الصفقات الكتلية Block Trades في NYMEX و ICE ومبادلات الشحنات المادية
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {whaleAlerts.map((w) => (
                <div
                  key={w.id}
                  className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                      <Ship className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{w.counterpartyAr}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                          {w.venue}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">{w.executionTypeAr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold block">
                        +{w.contracts.toLocaleString()} عقود ({(w.barrelsTotal / 1000000).toFixed(1)}M برميل)
                      </span>
                      <span className="text-slate-400 text-[10px]">القيمة: ${w.usdValueMillions}M USD</span>
                    </div>
                    <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-center">
                      <span className="text-slate-400 text-[10px] block">السعر المنفذ</span>
                      <span className="font-bold text-white font-mono">${w.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. CROSS-ASSET QUICK LINKS FOOTER */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>التبديل الفوري بين الأصول والأسواق المالية الكبرى:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onBackToGold && (
            <button
              onClick={onBackToGold}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>الذهب الفوري (XAU/USD)</span>
            </button>
          )}
          {onNavigateToBitcoin && (
            <button
              onClick={onNavigateToBitcoin}
              className="px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>البتكوين (BTC/USD)</span>
            </button>
          )}
          {onNavigateToXpl && (
            <button
              onClick={onNavigateToXpl}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>XPL/USDT</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
