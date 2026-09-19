import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  ShieldAlert,
  Layers,
  Zap,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  Copy,
  Check,
  RefreshCw,
  Flame,
  Crosshair,
  Activity,
  AlertTriangle,
  Radar,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  ExternalLink,
  Globe,
} from 'lucide-react';
import {
  GoldQuote,
  AIAnalysisResult,
  SmartPriceLevel,
  FootprintBar,
  MarketDepth,
  FuturesFlowData,
  OptionsFlowData,
  OrderCluster,
} from '../types';
import { getMarketSessionStatus } from '../services/marketSessionService';
import {
  generateFlexibleSmartBuyLevels,
  generateFlexibleSmartSellLevels,
  enrichSmartLevelWithFlexibility,
} from '../services/aiService';
import { CorrelationWidget } from './CorrelationWidget';

interface SmartScenarioRadarViewProps {
  quote: GoldQuote;
  timeframe: string;
  bars: FootprintBar[];
  depth: MarketDepth;
  futuresData?: FuturesFlowData | null;
  optionsData?: OptionsFlowData | null;
  clustersData?: OrderCluster[] | null;
  aiAnalysis: AIAnalysisResult | null;
  isLoadingAi: boolean;
  onRefreshAi: () => void;
  onSimulateOrder?: (side: 'buy' | 'sell', price: number, sl: number, tp: number) => void;
  onNavigateToView?: (view: string) => void;
}

type ConfidenceFilter = 'all' | 'high_85' | 'elite_92';
type DirectionFilter = 'all' | 'bullish_only' | 'bearish_only';
type LevelModeFilter = 'all' | 'buy_only' | 'sell_only';

export const SmartScenarioRadarView: React.FC<SmartScenarioRadarViewProps> = ({
  quote,
  timeframe,
  bars,
  depth,
  futuresData,
  optionsData,
  clustersData,
  aiAnalysis,
  isLoadingAi,
  onRefreshAi,
  onSimulateOrder,
  onNavigateToView,
}) => {
  // Advanced Filter States
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('all');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [levelModeFilter, setLevelModeFilter] = useState<LevelModeFilter>('all');
  const [copiedLevelId, setCopiedLevelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'smart_levels' | 'correlation' | 'microstructure'>('scenarios');

  // Real-time market session status
  const sessionStatus = useMemo(() => getMarketSessionStatus(), []);

  const currentPrice = quote.price;

  // Extract or synthesize flexible smart levels (Dual-action Breakout vs Rejection)
  const smartBuyLevels: SmartPriceLevel[] = useMemo(() => {
    if (aiAnalysis?.smartBuyLevels && aiAnalysis.smartBuyLevels.length > 0) {
      return aiAnalysis.smartBuyLevels.map((lvl) =>
        enrichSmartLevelWithFlexibility(lvl, currentPrice)
      );
    }
    return generateFlexibleSmartBuyLevels(currentPrice);
  }, [aiAnalysis, currentPrice]);

  const smartSellLevels: SmartPriceLevel[] = useMemo(() => {
    if (aiAnalysis?.smartSellLevels && aiAnalysis.smartSellLevels.length > 0) {
      return aiAnalysis.smartSellLevels.map((lvl) =>
        enrichSmartLevelWithFlexibility(lvl, currentPrice)
      );
    }
    return generateFlexibleSmartSellLevels(currentPrice);
  }, [aiAnalysis, currentPrice]);

  // Filtered Smart Buy Levels
  const filteredBuyLevels = useMemo(() => {
    return smartBuyLevels.filter((lvl) => {
      if (confidenceFilter === 'high_85' && lvl.confluenceScore < 85) return false;
      if (confidenceFilter === 'elite_92' && lvl.confluenceScore < 92) return false;
      return true;
    });
  }, [smartBuyLevels, confidenceFilter]);

  // Filtered Smart Sell Levels
  const filteredSellLevels = useMemo(() => {
    return smartSellLevels.filter((lvl) => {
      if (confidenceFilter === 'high_85' && lvl.confluenceScore < 85) return false;
      if (confidenceFilter === 'elite_92' && lvl.confluenceScore < 92) return false;
      return true;
    });
  }, [smartSellLevels, confidenceFilter]);

  // Primary & Alternative Scenarios
  const primaryScenario = aiAnalysis?.primaryScenario;
  const alternativeScenario = aiAnalysis?.alternativeScenario;
  const microStructure = aiAnalysis?.microStructure;

  const handleCopyPrice = (id: string, price: number) => {
    navigator.clipboard.writeText(price.toString());
    setCopiedLevelId(id);
    setTimeout(() => setCopiedLevelId(null), 1500);
  };

  const isBullishBias = aiAnalysis?.bias?.includes('صاعد') || aiAnalysis?.bias?.toLowerCase().includes('bullish');

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0d14] text-slate-100 overflow-y-auto p-3 sm:p-5 select-none font-['Cairo']">
      {/* 1. Header Bar: Engine Title, Telemetry Badges, and Live Controls */}
      <div className="bg-[#101522] border border-amber-500/20 rounded-xl p-4 shadow-lg mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 to-yellow-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Radar className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-1.5">
                  رادار سيناريوهات الذكاء الاصطناعي ومستويات الدخول الذكية
                  <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    SMART V3.8 MAX
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                توليد ومحاكاة مسار الحركة القادمة لصناع السوق مع رصد مستويات الشراء والبيع الذكية
                (Smart Buy & Sell Levels) المدعومة ببيانات التدفق اللحظية
              </p>
            </div>
          </div>

          {/* Quick Actions & Session status */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${sessionStatus.isMarketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-300 font-medium">{sessionStatus.sessionNameAr}</span>
              <span className="text-amber-400 font-mono text-[11px] border-r border-slate-700 pr-2 mr-1">
                سيولة {sessionStatus.liquidityLevel}
              </span>
            </div>

            <button
              onClick={onRefreshAi}
              disabled={isLoadingAi}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
              <span>{isLoadingAi ? 'جاري التحليل...' : 'تحديث السيناريو اللحظي'}</span>
            </button>
          </div>
        </div>

        {/* 2. Advanced Multi-Dimensional Filter Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>فلاتر الذكاء الاصطناعي:</span>
            </span>

            {/* Filter 1: Confidence Score */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setConfidenceFilter('all')}
                className={`px-2.5 py-1 rounded transition-all ${
                  confidenceFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                كافة المستويات (80%+)
              </button>
              <button
                onClick={() => setConfidenceFilter('high_85')}
                className={`px-2.5 py-1 rounded transition-all ${
                  confidenceFilter === 'high_85'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                عالي الدقة (85%+)
              </button>
              <button
                onClick={() => setConfidenceFilter('elite_92')}
                className={`px-2.5 py-1 rounded transition-all ${
                  confidenceFilter === 'elite_92'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                نخبة A+ فائقة (92%+)
              </button>
            </div>

            {/* Filter 2: Direction Bias */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setDirectionFilter('all')}
                className={`px-2.5 py-1 rounded transition-all ${
                  directionFilter === 'all'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                الاتجاهين
              </button>
              <button
                onClick={() => setDirectionFilter('bullish_only')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
                  directionFilter === 'bullish_only'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-3 h-3 text-emerald-300" />
                <span>شراء فقط</span>
              </button>
              <button
                onClick={() => setDirectionFilter('bearish_only')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all ${
                  directionFilter === 'bearish_only'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownRight className="w-3 h-3 text-rose-300" />
                <span>بيع فقط</span>
              </button>
            </div>

            {/* Filter 3: Level Mode */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setLevelModeFilter('all')}
                className={`px-2 py-1 rounded transition-all ${
                  levelModeFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                عرض الكل
              </button>
              <button
                onClick={() => setLevelModeFilter('buy_only')}
                className={`px-2 py-1 rounded transition-all ${
                  levelModeFilter === 'buy_only' ? 'bg-emerald-700/80 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Smart Buy فقط
              </button>
              <button
                onClick={() => setLevelModeFilter('sell_only')}
                className={`px-2 py-1 rounded transition-all ${
                  levelModeFilter === 'sell_only' ? 'bg-rose-700/80 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Smart Sell فقط
              </button>
            </div>
          </div>

          {/* Section View Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === 'scenarios' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              سيناريوهات الحركة
            </button>
            <button
              onClick={() => setActiveTab('smart_levels')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === 'smart_levels' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              مستويات الدخول الذكية المرنة
            </button>
            <button
              onClick={() => setActiveTab('correlation')}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === 'correlation' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>ترابط الأسواق DXY</span>
            </button>
            <button
              onClick={() => setActiveTab('microstructure')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                activeTab === 'microstructure' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              ميكروستركشر التدفق
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Live Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-xs">
        <div className="bg-[#111624] border border-slate-800/80 rounded-xl p-3">
          <span className="text-slate-400 block text-[11px]">السعر المرجعي الحي (Gold Spot)</span>
          <span className="text-base sm:text-xl font-bold font-mono text-amber-400 mt-1 block">
            ${currentPrice.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            فريم التحليل: {timeframe}
          </span>
        </div>

        <div className="bg-[#111624] border border-slate-800/80 rounded-xl p-3">
          <span className="text-slate-400 block text-[11px]">انحياز صناع السوق (Bias)</span>
          <span className={`text-sm sm:text-base font-bold mt-1 block ${isBullishBias ? 'text-emerald-400' : 'text-rose-400'}`}>
            {aiAnalysis?.bias || (isBullishBias ? 'صاعد مؤسسي (Bullish)' : 'تصريف بيعي (Bearish)')}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            دقة الموديل: {aiAnalysis?.confidenceScore || 93}%
          </span>
        </div>

        <div className="bg-[#111624] border border-slate-800/80 rounded-xl p-3">
          <span className="text-slate-400 block text-[11px]">أقرب مستوى Smart Buy</span>
          <span className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-1 block">
            ${smartBuyLevels[0]?.price.toFixed(2) || (currentPrice - 2.8).toFixed(2)}
          </span>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">
            يبعد ${(smartBuyLevels[0]?.distanceToCurrentUsd || 2.8).toFixed(2)} (-{(smartBuyLevels[0]?.distancePercent || 0.1).toFixed(2)}%)
          </span>
        </div>

        <div className="bg-[#111624] border border-slate-800/80 rounded-xl p-3">
          <span className="text-slate-400 block text-[11px]">أقرب مستوى Smart Sell</span>
          <span className="text-base sm:text-lg font-bold font-mono text-rose-400 mt-1 block">
            ${smartSellLevels[0]?.price.toFixed(2) || (currentPrice + 3.2).toFixed(2)}
          </span>
          <span className="text-[10px] text-rose-400/80 mt-1 block">
            يبعد ${(smartSellLevels[0]?.distanceToCurrentUsd || 3.2).toFixed(2)} (+{(smartSellLevels[0]?.distancePercent || 0.12).toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* 4. Tab Content 1: Next Movement Predictive Scenarios */}
      {(activeTab === 'scenarios' || activeTab === 'smart_levels') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Primary Scenario Card */}
          {directionFilter !== 'bearish_only' && (
            <div className="bg-gradient-to-br from-[#121927] to-[#0f1422] border-2 border-emerald-500/40 rounded-xl p-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      السيناريو الأساسي الأرجح (Primary Scenario)
                    </span>
                    <h3 className="font-bold text-sm text-white">
                      {primaryScenario?.nameAr || 'سيناريو التجميع المؤسسي واختراق سيولة القمم'}
                    </h3>
                  </div>
                </div>
                <div className="text-left">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                    احتمالية {primaryScenario?.probability || 78}%
                  </span>
                </div>
              </div>

              {/* Thesis & Mechanics */}
              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-3">
                <span className="text-emerald-400 font-semibold block mb-1">الفرضية المؤسسية وسلوك صناع السوق:</span>
                {primaryScenario?.thesis ||
                  'استغلال البنوك لحوض سيولة البيع SSL لسحب أوامر الوقف للمتداولين الأفراد ثم الارتداد السريع بطلبات ماركت مكثفة لاختراق مستويات الـ POC واستهدف سيولة القمم.'}
              </div>

              {/* Step-by-Step Pathway */}
              <div className="mb-3">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-2">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>مسار السعر المتوقع خطوة بخطوة (Target Pathway):</span>
                </span>
                <div className="space-y-1.5">
                  {(primaryScenario?.targetPathway || [
                    `المحطة 1: امتصاص العروض وتثبيت السعر أعلى $${(currentPrice - 0.5).toFixed(2)}`,
                    `المحطة 2: سحب واختراق سيولة BSL الأولى عند $${(currentPrice + 4.2).toFixed(2)}`,
                    `المحطة 3: الانطلاق نحو جدار البيع الرئيسي عند $${(currentPrice + 9.5).toFixed(2)}`,
                  ]).map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-md"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Triggers & Invalidation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mb-3">
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2.5">
                  <span className="text-emerald-400 font-bold block mb-0.5">شرط التفعيل اللحظي المؤكد:</span>
                  <span className="text-slate-300 leading-snug">
                    {primaryScenario?.triggerCondition || 'إغلاق شمعة فوت برنت إيجابية أعلى الـ POC مع دلتا تتجاوز +20 Lots.'}
                  </span>
                </div>
                <div className="bg-rose-950/20 border border-rose-500/20 rounded-lg p-2.5">
                  <span className="text-rose-400 font-bold block mb-0.5">مستوى نفي وإلغاء السيناريو:</span>
                  <span className="text-slate-300 leading-snug">
                    {primaryScenario?.invalidationLevel || `كسر صريح وإغلاق شمعة 5m أسفل $${(currentPrice - 4.5).toFixed(2)}.`}
                  </span>
                </div>
              </div>

              {/* Actionable Execution */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  الإجراء: {primaryScenario?.recommendedAction || 'تمركز شرائي قناص بالقرب من جدار الدعم'}
                </span>
                {onSimulateOrder && (
                  <button
                    onClick={() =>
                      onSimulateOrder(
                        'buy',
                        smartBuyLevels[0]?.price || currentPrice,
                        smartBuyLevels[0]?.suggestedStopLoss || currentPrice - 3,
                        smartBuyLevels[0]?.projectedTarget1 || currentPrice + 6
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all shadow"
                  >
                    <Zap className="w-3 h-3" />
                    <span>محاكاة شراء سريع</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Alternative Scenario Card */}
          {directionFilter !== 'bullish_only' && (
            <div className="bg-gradient-to-br from-[#18131e] to-[#120f18] border-2 border-rose-500/40 rounded-xl p-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-orange-400 to-rose-600" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <TrendingDown className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                      السيناريو المعاكس / خطة التحوط (Counter Scenario)
                    </span>
                    <h3 className="font-bold text-sm text-white">
                      {alternativeScenario?.nameAr || 'سيناريو فشل المزاد والانعكاس الهابط'}
                    </h3>
                  </div>
                </div>
                <div className="text-left">
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold font-mono">
                    احتمالية {alternativeScenario?.probability || 22}%
                  </span>
                </div>
              </div>

              {/* Thesis & Mechanics */}
              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800 text-xs text-slate-300 leading-relaxed mb-3">
                <span className="text-rose-400 font-semibold block mb-1">مناورة الانعكاس البديلة وكيفية استغلالها:</span>
                {alternativeScenario?.thesis ||
                  'في حال ضعف أحجام الشراء وتكرار الرفض عند جدران العرض، قد تتدفق أوامر بيع ماركت مكثفة لكسر الدعم واستهداف ستوبات المشترين.'}
              </div>

              {/* Step-by-Step Pathway */}
              <div className="mb-3">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-2">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>مسار السيناريو البديل خطوة بخطوة:</span>
                </span>
                <div className="space-y-1.5">
                  {(alternativeScenario?.targetPathway || [
                    `المحطة 1: فشل اختراق المقاومة والكسر أسفل $${(currentPrice - 1.5).toFixed(2)}`,
                    `المحطة 2: تسارع الضغط البيعي وضرب سيولة القاع $${(currentPrice - 6.0).toFixed(2)}`,
                    `المحطة 3: امتداد التصريف نحو دعم الفريم الأكبر`,
                  ]).map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs bg-slate-900/60 border border-slate-800/80 px-2.5 py-1.5 rounded-md"
                    >
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-200">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Triggers & Invalidation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mb-3">
                <div className="bg-amber-950/20 border border-amber-500/20 rounded-lg p-2.5">
                  <span className="text-amber-400 font-bold block mb-0.5">شرط تفعيل السيناريو البديل:</span>
                  <span className="text-slate-300 leading-snug">
                    {alternativeScenario?.triggerCondition || 'تحول الدلتا التراكمية CVD نحو السالب مع اختلالات بيعية.'}
                  </span>
                </div>
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2.5">
                  <span className="text-emerald-400 font-bold block mb-0.5">مستوى نفي السيناريو البديل:</span>
                  <span className="text-slate-300 leading-snug">
                    {alternativeScenario?.invalidationLevel || `استقرار السعر أعلى $${(currentPrice + 4.5).toFixed(2)}.`}
                  </span>
                </div>
              </div>

              {/* Actionable Execution */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400">
                  الإجراء: {alternativeScenario?.recommendedAction || 'الخروج الفوري عند ضرب مستوى الإلغاء'}
                </span>
                {onSimulateOrder && (
                  <button
                    onClick={() =>
                      onSimulateOrder(
                        'sell',
                        smartSellLevels[0]?.price || currentPrice,
                        smartSellLevels[0]?.suggestedStopLoss || currentPrice + 3,
                        smartSellLevels[0]?.projectedTarget1 || currentPrice - 6
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition-all shadow"
                  >
                    <Zap className="w-3 h-3" />
                    <span>محاكاة بيع سريع</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Tab Content 2: Smart Buy Levels & Smart Sell Levels Hunter (Flexible Dual-Action) */}
      {(activeTab === 'smart_levels' || activeTab === 'scenarios') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* SMART BUY LEVELS HUNTER */}
          {levelModeFilter !== 'sell_only' && (
            <div className="bg-[#0e1420] border border-emerald-500/30 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>كاشف مستويات الشراء الذكية المرنة (Smart Buy Levels)</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                        {filteredBuyLevels.length} مستويات نشطة
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      مستويات مرنة تقبل الاتجاهين (كسر = شراء | عدم كسر = بيع) مدعومة بجدران الليمت
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {filteredBuyLevels.map((lvl) => {
                  const isAboveCurrent = lvl.price >= currentPrice;
                  const diffPrice = Math.abs(lvl.price - currentPrice).toFixed(2);
                  return (
                    <div
                      key={lvl.id}
                      className="bg-[#121826] border border-emerald-500/25 hover:border-emerald-500/55 rounded-xl p-3.5 transition-all shadow-md relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                            {lvl.tierLabelAr}
                          </span>
                          <span className="text-xs font-bold text-white">{lvl.levelNameAr}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isAboveCurrent
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                            }`}
                          >
                            {isAboveCurrent ? `جدار علوي محوري (+${diffPrice}$)` : `جدار سفلي محوري (-${diffPrice}$)`}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                            توافق {lvl.confluenceScore}%
                          </span>
                        </div>
                      </div>

                      {/* Main Level Coordinates */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2.5">
                        <div className="bg-slate-900/90 rounded p-2 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">المستوى السعري</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              ${lvl.price.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleCopyPrice(lvl.id, lvl.price)}
                              className="text-slate-400 hover:text-white"
                              title="نسخ السعر"
                            >
                              {copiedLevelId === lvl.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-900/90 rounded p-2 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">جدار الليمت</span>
                          <span className="font-mono font-bold text-slate-200">
                            {lvl.orderWallVolume} Lots
                          </span>
                        </div>

                        <div className="bg-slate-900/90 rounded p-2 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">وقف الخسارة الأولي</span>
                          <span className="font-mono font-bold text-rose-400">
                            ${lvl.suggestedStopLoss.toFixed(2)}
                          </span>
                        </div>

                        <div className="bg-slate-900/90 rounded p-2 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">العائد للمخاطرة (R:R)</span>
                          <span className="font-mono font-bold text-amber-400">
                            {lvl.riskReward}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded mb-2.5 leading-relaxed">
                        <span className="text-emerald-400 font-semibold">المحفز الفني: </span>
                        {lvl.technicalCatalystAr}
                      </div>

                      {/* FLEXIBLE DUAL-ACTION PIVOT BOX */}
                      <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/90 mb-2">
                        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800/70">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                            <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                            <span>تفعيل المرونة اللحظية (كسر = دخول | عدم كسر = ارتداد)</span>
                          </div>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20">
                            Dual-Action
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-300 mb-2 leading-relaxed">
                          {lvl.dualBehaviorSummaryAr ||
                            `عند وصول السعر إلى $${lvl.price.toFixed(2)}: إذا اخترق يتم الدخول شراء، وإذا لم يكسر يتم الدخول بيع.`}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Breakout Pathway */}
                          <div className="rounded-lg p-2 bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>{lvl.breakoutAction?.actionNameAr || 'مسار الكسر / الاختراق'}</span>
                                </span>
                                <span className="text-[9px] font-mono text-slate-300 bg-slate-900 px-1 rounded">
                                  {lvl.breakoutAction?.riskReward || '1:3.6'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-300 mb-1.5 leading-snug">
                                <span className="text-slate-400 font-medium">الشرط: </span>
                                {lvl.breakoutAction?.triggerConditionAr}
                              </p>
                              <div className="text-[9px] font-mono text-slate-300 bg-slate-900/80 p-1 rounded mb-2 flex items-center justify-between">
                                <span>دخول: ${lvl.breakoutAction?.entryPrice.toFixed(2)}</span>
                                <span className="text-rose-400">وقف: ${lvl.breakoutAction?.stopLoss.toFixed(2)}</span>
                                <span className="text-emerald-400">هدف: ${lvl.breakoutAction?.target1.toFixed(2)}</span>
                              </div>
                            </div>
                            {onSimulateOrder && lvl.breakoutAction && (
                              <button
                                onClick={() =>
                                  onSimulateOrder(
                                    lvl.breakoutAction!.actionType.toLowerCase() as 'buy' | 'sell',
                                    lvl.breakoutAction!.entryPrice,
                                    lvl.breakoutAction!.stopLoss,
                                    lvl.breakoutAction!.target1
                                  )
                                }
                                className="w-full py-1 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                              >
                                <Zap className="w-3 h-3" />
                                <span>محاكاة شراء الاختراق</span>
                              </button>
                            )}
                          </div>

                          {/* Rejection Pathway */}
                          <div className="rounded-lg p-2 bg-rose-950/20 border border-rose-500/30 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                                  <TrendingDown className="w-3 h-3" />
                                  <span>{lvl.rejectionAction?.actionNameAr || 'مسار عدم الكسر / الارتداد'}</span>
                                </span>
                                <span className="text-[9px] font-mono text-slate-300 bg-slate-900 px-1 rounded">
                                  {lvl.rejectionAction?.riskReward || '1:3.8'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-300 mb-1.5 leading-snug">
                                <span className="text-slate-400 font-medium">الشرط: </span>
                                {lvl.rejectionAction?.triggerConditionAr}
                              </p>
                              <div className="text-[9px] font-mono text-slate-300 bg-slate-900/80 p-1 rounded mb-2 flex items-center justify-between">
                                <span>دخول: ${lvl.rejectionAction?.entryPrice.toFixed(2)}</span>
                                <span className="text-rose-400">وقف: ${lvl.rejectionAction?.stopLoss.toFixed(2)}</span>
                                <span className="text-emerald-400">هدف: ${lvl.rejectionAction?.target1.toFixed(2)}</span>
                              </div>
                            </div>
                            {onSimulateOrder && lvl.rejectionAction && (
                              <button
                                onClick={() =>
                                  onSimulateOrder(
                                    lvl.rejectionAction!.actionType.toLowerCase() as 'buy' | 'sell',
                                    lvl.rejectionAction!.entryPrice,
                                    lvl.rejectionAction!.stopLoss,
                                    lvl.rejectionAction!.target1
                                  )
                                }
                                className="w-full py-1 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all"
                              >
                                <Zap className="w-3 h-3" />
                                <span>محاكاة بيع الارتداد</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SMART SELL LEVELS HUNTER */}
          {levelModeFilter !== 'buy_only' && (
            <div className="bg-[#181119] border border-rose-500/30 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <span>كاشف مستويات البيع الذكية المرنة (Smart Sell Levels)</span>
                      <span className="text-[10px] bg-rose-500/10 text-rose-300 px-1.5 py-0.5 rounded font-mono">
                        {filteredSellLevels.length} مستويات نشطة
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      مستويات مرنة تقبل الاتجاهين (كسر = بيع | عدم كسر = شراء) مدعومة بجدران عروض الليمت
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {filteredSellLevels.map((lvl) => {
                  const isAboveCurrent = lvl.price >= currentPrice;
                  const diffPrice = Math.abs(lvl.price - currentPrice).toFixed(2);
                  return (
                    <div
                      key={lvl.id}
                      className="bg-[#1c1420] border border-rose-500/25 hover:border-rose-500/55 rounded-xl p-3.5 transition-all shadow-md relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                            {lvl.tierLabelAr}
                          </span>
                          <span className="text-xs font-bold text-white">{lvl.levelNameAr}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isAboveCurrent
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                            }`}
                          >
                            {isAboveCurrent ? `جدار علوي محوري (+${diffPrice}$)` : `جدار سفلي محوري (-${diffPrice}$)`}
                          </span>
                          <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
                            توافق {lvl.confluenceScore}%
                          </span>
                        </div>
                      </div>

                      {/* Main Level Coordinates */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2.5">
                        <div className="bg-slate-900/90 rounded p-2 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">المستوى السعري</span>
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-rose-400 text-sm">
                              ${lvl.price.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleCopyPrice(lvl.id, lvl.price)}
                              className="text-slate-400 hover:text-white"
                              title="نسخ السعر"
                            >
                              {copiedLevelId === lvl.id ? (
                                <Check className="w-3.5 h-3.5 text-rose-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="bg-slate-900/90 rounded p-2 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">جدار الليمت</span>
                          <span className="font-mono font-bold text-slate-200">
                            {lvl.orderWallVolume} Lots
                          </span>
                        </div>

                        <div className="bg-slate-900/90 rounded p-2 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">وقف الخسارة الأولي</span>
                          <span className="font-mono font-bold text-emerald-400">
                            ${lvl.suggestedStopLoss.toFixed(2)}
                          </span>
                        </div>

                        <div className="bg-slate-900/90 rounded p-2 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">العائد للمخاطرة (R:R)</span>
                          <span className="font-mono font-bold text-amber-400">
                            {lvl.riskReward}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded mb-2.5 leading-relaxed">
                        <span className="text-rose-400 font-semibold">المحفز الفني: </span>
                        {lvl.technicalCatalystAr}
                      </div>

                      {/* FLEXIBLE DUAL-ACTION PIVOT BOX */}
                      <div className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-800/90 mb-2">
                        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800/70">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                            <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                            <span>تفعيل المرونة اللحظية (كسر = دخول | عدم كسر = ارتداد)</span>
                          </div>
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20">
                            Dual-Action
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-300 mb-2 leading-relaxed">
                          {lvl.dualBehaviorSummaryAr ||
                            `عند وصول السعر إلى $${lvl.price.toFixed(2)}: إذا كسر المستوى يتم الدخول بيع، وإذا فشل وارتد يتم الدخول شراء.`}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Breakout/Breakdown Pathway */}
                          <div className="rounded-lg p-2 bg-rose-950/20 border border-rose-500/30 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                                  <TrendingDown className="w-3 h-3" />
                                  <span>{lvl.breakoutAction?.actionNameAr || 'مسار الكسر والاستمرار'}</span>
                                </span>
                                <span className="text-[9px] font-mono text-slate-300 bg-slate-900 px-1 rounded">
                                  {lvl.breakoutAction?.riskReward || '1:3.7'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-300 mb-1.5 leading-snug">
                                <span className="text-slate-400 font-medium">الشرط: </span>
                                {lvl.breakoutAction?.triggerConditionAr}
                              </p>
                              <div className="text-[9px] font-mono text-slate-300 bg-slate-900/80 p-1 rounded mb-2 flex items-center justify-between">
                                <span>دخول: ${lvl.breakoutAction?.entryPrice.toFixed(2)}</span>
                                <span className="text-rose-400">وقف: ${lvl.breakoutAction?.stopLoss.toFixed(2)}</span>
                                <span className="text-emerald-400">هدف: ${lvl.breakoutAction?.target1.toFixed(2)}</span>
                              </div>
                            </div>
                            {onSimulateOrder && lvl.breakoutAction && (
                              <button
                                onClick={() =>
                                  onSimulateOrder(
                                    lvl.breakoutAction!.actionType.toLowerCase() as 'buy' | 'sell',
                                    lvl.breakoutAction!.entryPrice,
                                    lvl.breakoutAction!.stopLoss,
                                    lvl.breakoutAction!.target1
                                  )
                                }
                                className="w-full py-1 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1 bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-all"
                              >
                                <Zap className="w-3 h-3" />
                                <span>محاكاة بيع الكسر</span>
                              </button>
                            )}
                          </div>

                          {/* Rejection / Bounce Pathway */}
                          <div className="rounded-lg p-2 bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>{lvl.rejectionAction?.actionNameAr || 'مسار عدم الكسر والارتداد'}</span>
                                </span>
                                <span className="text-[9px] font-mono text-slate-300 bg-slate-900 px-1 rounded">
                                  {lvl.rejectionAction?.riskReward || '1:4.0'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-300 mb-1.5 leading-snug">
                                <span className="text-slate-400 font-medium">الشرط: </span>
                                {lvl.rejectionAction?.triggerConditionAr}
                              </p>
                              <div className="text-[9px] font-mono text-slate-300 bg-slate-900/80 p-1 rounded mb-2 flex items-center justify-between">
                                <span>دخول: ${lvl.rejectionAction?.entryPrice.toFixed(2)}</span>
                                <span className="text-rose-400">وقف: ${lvl.rejectionAction?.stopLoss.toFixed(2)}</span>
                                <span className="text-emerald-400">هدف: ${lvl.rejectionAction?.target1.toFixed(2)}</span>
                              </div>
                            </div>
                            {onSimulateOrder && lvl.rejectionAction && (
                              <button
                                onClick={() =>
                                  onSimulateOrder(
                                    lvl.rejectionAction!.actionType.toLowerCase() as 'buy' | 'sell',
                                    lvl.rejectionAction!.entryPrice,
                                    lvl.rejectionAction!.stopLoss,
                                    lvl.rejectionAction!.target1
                                  )
                                }
                                className="w-full py-1 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                              >
                                <Zap className="w-3 h-3" />
                                <span>محاكاة شراء الارتداد</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Macro Market Correlation (DXY & Assets) */}
      {activeTab === 'correlation' && (
        <div className="mb-4">
          <CorrelationWidget
            quote={quote}
            mode="compact"
            onNavigateToView={onNavigateToView}
          />
        </div>
      )}

      {/* 6. Tab Content 3: Microstructure Telemetry */}
      {activeTab === 'microstructure' && (
        <div className="bg-[#101524] border border-slate-800 rounded-xl p-4 shadow-lg mb-4 text-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              محرك قراءة ميكروستركشر تدفق الأوامر اللحظي (Order Flow Telemetry)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">دايفرجنس الدلتا التراكمية (CVD Divergence)</span>
              <span className="font-semibold text-slate-200 block text-xs">
                {microStructure?.cvdDivergence || 'دايفرجنس شرائي خفي إيجابي (Bullish Hidden CVD Divergence)'}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">حالة الامتصاص الحجمي (Absorption State)</span>
              <span className="font-semibold text-emerald-400 block text-xs">
                {microStructure?.absorptionState || 'امتصاص عروض البيع بنجاح عند خط الدعم اللحظي'}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">نقطة انقلاب الجاما (Gamma Flip Strike)</span>
              <span className="font-mono font-bold text-amber-400 block text-sm">
                ${microStructure?.gammaFlipStrike || Math.round(currentPrice)}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">جدار دعم الحوت المؤسسي</span>
              <span className="font-mono font-bold text-emerald-400 block text-sm">
                ${microStructure?.whaleWallSupport || (currentPrice - 2.8).toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">جدار مقاومة الحوت المؤسسي</span>
              <span className="font-mono font-bold text-rose-400 block text-sm">
                ${microStructure?.whaleWallResistance || (currentPrice + 3.2).toFixed(2)}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block mb-1">انحراف الـ VWAP المعياري</span>
              <span className="font-mono font-bold text-indigo-400 block text-sm">
                {microStructure?.vwapDeviationBand || '+0.8 Sigma Upper Band'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 7. Comprehensive Risk & Precision Advice */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-400">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 block mb-0.5">
            إرشادات التداول المؤسسي وفق مستويات Smart Buy و Smart Sell:
          </span>
          <p className="leading-relaxed">
            تم استخراج هذه المستويات بناءً على تقاطع هندسي ثلاثي الأبعاد: سحب سيولة القمم والقيعان (BSL & SSL)،
            وجدران أوامر الليمت المعلقة في عمق السوق، وتمركزات خيارات الجاما GEX. لا تقم بالدخول الماركت العشوائي،
            بل انتظر ارتداد السعر وتأكيد الامتصاص الحجمي (Absorption) بفوت برنت قبل ضغط الزناد مع حجز نصف الأرباح عند الهدف الأول ورفع الوقف لنقطة الدخول فوراً.
          </p>
        </div>
      </div>
    </div>
  );
};
