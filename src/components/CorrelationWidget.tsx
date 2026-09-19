import React, { useState, useMemo } from 'react';
import { GoldQuote, MacroCorrelationAnalysis, CorrelatedAsset } from '../types';
import { getMacroCorrelationAnalysis } from '../services/correlationService';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Compass,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Zap,
  Info,
  ShieldAlert,
  Percent,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface CorrelationWidgetProps {
  quote: GoldQuote;
  mode?: 'full' | 'compact';
  onNavigateToView?: (view: string) => void;
}

export const CorrelationWidget: React.FC<CorrelationWidgetProps> = ({
  quote,
  mode = 'full',
  onNavigateToView,
}) => {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'CURRENCY' | 'YIELD' | 'COMMODITY' | 'VOLATILITY'>('ALL');
  const [selectedAsset, setSelectedAsset] = useState<string | null>('DXY');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const correlationData: MacroCorrelationAnalysis = useMemo(() => {
    return getMacroCorrelationAnalysis(quote);
  }, [quote]);

  const filteredAssets = useMemo(() => {
    if (filterCategory === 'ALL') return correlationData.assets;
    return correlationData.assets.filter((a) => a.category === filterCategory);
  }, [correlationData, filterCategory]);

  const activeAssetObj = useMemo(() => {
    return correlationData.assets.find((a) => a.symbol === selectedAsset) || correlationData.assets[0];
  }, [correlationData, selectedAsset]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className={`flex flex-col h-full bg-[#0a0d14] text-slate-100 overflow-y-auto ${mode === 'compact' ? 'p-3' : 'p-3 sm:p-5'}`}>
      {/* 1. Header Bar with Alignment Gauge */}
      <div className="bg-[#101522] border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-500" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  رادار ترابط الأسواق ومؤشر الدولار (Macro Correlation Engine)
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  مؤسسي DXY & Macro
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تحليل العلاقات العكسية والطردية مع الدولار والسندات والفضة لتعزيز دقة قرارات التداول
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleManualRefresh}
              className={`p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all ${
                isRefreshing ? 'animate-spin text-amber-400' : ''
              }`}
              title="تحديث بيانات الترابط"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {onNavigateToView && mode === 'compact' && (
              <button
                onClick={() => onNavigateToView('correlation')}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>فتح المصفوفة الكاملة</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Macro Sentiment & Gold Tailwinds Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">التوافق الكلي لصعود الذهب</span>
              <span className="text-xs font-bold text-white block mt-0.5">
                {correlationData.overallBiasAr}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-xl font-black font-mono ${
                correlationData.overallGoldAlignmentScore >= 60 ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {correlationData.overallGoldAlignmentScore}%
              </span>
              <span className="text-[10px] text-slate-400 block">توافق إيجابي</span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">مؤشر ضغط الدولار (DXY Drag)</span>
              <span className="text-xs font-bold text-white block mt-0.5">
                {correlationData.assets[0]?.changePercent24h < 0 ? 'ضعف الدولار يطلق صعود الذهب' : 'قوة الدولار تضغط على القمم'}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-lg font-black font-mono ${
                correlationData.assets[0]?.changePercent24h < 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {correlationData.assets[0]?.price}
              </span>
              <span className={`text-[10px] block font-mono font-bold ${
                correlationData.assets[0]?.changePercent24h < 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {correlationData.assets[0]?.changePercent24h > 0 ? '+' : ''}{correlationData.assets[0]?.changePercent24h}%
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">عوائد سندات الخزانة US10Y</span>
              <span className="text-xs font-bold text-white block mt-0.5">
                {correlationData.assets[1]?.changePercent24h < 0 ? 'عائد بديل منخفض (إيجابي)' : 'عائد متصاعد (سلبي)'}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-lg font-black font-mono ${
                correlationData.assets[1]?.changePercent24h < 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {correlationData.assets[1]?.price}%
              </span>
              <span className={`text-[10px] block font-mono font-bold ${
                correlationData.assets[1]?.changePercent24h < 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {correlationData.assets[1]?.changePercent24h > 0 ? '+' : ''}{correlationData.assets[1]?.changePercent24h}%
              </span>
            </div>
          </div>
        </div>

        {/* Divergence Alert Banner if any */}
        {correlationData.divergenceAlert && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 text-xs text-amber-200">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-semibold leading-relaxed">{correlationData.divergenceAlert}</span>
          </div>
        )}
      </div>

      {/* 2. Institutional Macro Summary Banner */}
      <div className="bg-[#121724] border border-slate-800 rounded-xl p-3.5 mb-4 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300 block mb-0.5">خلاصة تدفقات السيولة الدولية وتأثيرها على الذهب XAU/USD:</span>
          <p className="text-slate-300">{correlationData.institutionalSummaryAr}</p>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
        {[
          { id: 'ALL', label: 'كافة الأصول المرتبطة (All)' },
          { id: 'CURRENCY', label: 'مؤشر الدولار والعملات (DXY & EUR)' },
          { id: 'YIELD', label: 'عوائد السندات (US10Y)' },
          { id: 'COMMODITY', label: 'السلع والفضة (Silver & Oil)' },
          { id: 'VOLATILITY', label: 'مؤشرات التقلب (VIX)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterCategory === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. Correlated Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-4">
        {filteredAssets.map((asset) => {
          const isSelected = selectedAsset === asset.symbol;
          const isInverse = asset.correlationCoeff < 0;
          const isPositiveChange = asset.changePercent24h >= 0;

          return (
            <motion.div
              key={asset.symbol}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedAsset(asset.symbol)}
              className={`bg-[#111624] rounded-2xl p-4 border transition-all cursor-pointer relative overflow-hidden shadow-sm ${
                isSelected
                  ? 'border-amber-500/60 ring-1 ring-amber-500/40 shadow-amber-500/10'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              {/* Asset Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                    asset.symbol === 'DXY'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : asset.symbol === 'US10Y'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : asset.symbol === 'XAG/USD'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-slate-800 text-amber-400 border border-slate-700'
                  }`}>
                    {asset.symbol.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-white">{asset.symbol}</h4>
                      <span className="text-[10px] text-slate-400">({asset.nameAr})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block">{asset.name}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-base text-white">
                    {asset.category === 'CURRENCY' && asset.symbol === 'EUR/USD'
                      ? asset.price.toFixed(4)
                      : asset.category === 'YIELD'
                      ? `${asset.price.toFixed(2)}%`
                      : asset.price.toFixed(2)}
                  </div>
                  <div className={`flex items-center justify-end gap-0.5 text-xs font-mono font-bold ${
                    isPositiveChange ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {isPositiveChange ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    <span>{isPositiveChange ? '+' : ''}{asset.changePercent24h}%</span>
                  </div>
                </div>
              </div>

              {/* Sparkline Visual Simulation */}
              <div className="h-8 w-full my-2 flex items-end gap-1 px-1">
                {asset.sparkline.map((val, idx) => {
                  const min = Math.min(...asset.sparkline);
                  const max = Math.max(...asset.sparkline);
                  const range = max - min || 1;
                  const heightPercent = Math.max(15, Math.min(100, Math.round(((val - min) / range) * 100)));
                  return (
                    <div
                      key={idx}
                      className={`flex-1 rounded-xs transition-all ${
                        isPositiveChange ? 'bg-emerald-500/40 hover:bg-emerald-400' : 'bg-rose-500/40 hover:bg-rose-400'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                      title={`القيمة: ${val}`}
                    />
                  );
                })}
              </div>

              {/* Correlation Strength Indicator */}
              <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 mb-2.5">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400">معامل الارتباط بالذهب:</span>
                  <span className={`font-mono font-bold ${
                    isInverse ? 'text-rose-400' : 'text-emerald-400'
                  }`}>
                    r = {asset.correlationCoeff > 0 ? `+${asset.correlationCoeff}` : asset.correlationCoeff}
                  </span>
                </div>

                {/* Meter Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                  {isInverse ? (
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                      style={{ width: `${Math.abs(asset.correlationCoeff) * 100}%` }}
                    />
                  ) : (
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${Math.abs(asset.correlationCoeff) * 100}%` }}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] mt-1 text-slate-400">
                  <span>{asset.correlationLabelAr}</span>
                  <span>وزن مؤسسي {asset.institutionalWeight}%</span>
                </div>
              </div>

              {/* Institutional Signal Badge */}
              <div className="mb-2">
                <span className={`inline-block text-[11px] px-2 py-0.5 rounded-lg font-bold ${
                  asset.divergenceSignal === 'BULLISH_LEAD'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : asset.divergenceSignal === 'ANOMALOUS_DECOUPLING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : asset.divergenceSignal === 'BEARISH_PRESSURE'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {asset.divergenceSignalAr}
                </span>
              </div>

              {/* Institutional Insight Snippet */}
              <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                {asset.institutionalInsightAr}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* 5. Deep Dive on Active Selected Asset (Especially DXY) */}
      {activeAssetObj && (
        <div className="bg-[#121828] border-2 border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
                {activeAssetObj.symbol}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>التحليل المؤسسي المعمق لعلاقة الذهب بـ {activeAssetObj.nameAr}</span>
                  <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-mono">
                    Weight: {activeAssetObj.institutionalWeight}%
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  كيف تؤثر حركة {activeAssetObj.symbol} على مسارات السيولة واختراق مستويات الذهب اللحظية
                </p>
              </div>
            </div>

            <div className="text-left font-mono">
              <span className="text-lg font-black text-white">{activeAssetObj.price}</span>
              <span className={`block text-xs font-bold ${
                activeAssetObj.changePercent24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {activeAssetObj.changePercent24h >= 0 ? '+' : ''}{activeAssetObj.changePercent24h}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3 text-xs">
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
              <span className="text-amber-400 font-bold block mb-1">
                قاعدة الترابط المؤسسي (Institutional Rule of Thumb):
              </span>
              <p className="text-slate-300 leading-relaxed">
                {activeAssetObj.correlationCoeff < 0
                  ? `علاقة عكسية بنسبة ${Math.abs(activeAssetObj.correlationCoeff * 100)}%: عندما يهبط ${activeAssetObj.symbol}، تنتقل السيولة فورياً نحو شراء الذهب لتجنب تراجع القوة الشرائية للدولار.`
                  : `علاقة طردية بنسبة ${Math.abs(activeAssetObj.correlationCoeff * 100)}%: صعود ${activeAssetObj.symbol} يعطي دعماً مباشراً لمسار صعود الذهب ويعزز الثقة في استمرار الحركة.`}
              </p>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-1">
                التطبيق الميداني في قرارات التداول (Trade Execution Guidance):
              </span>
              <p className="text-slate-300 leading-relaxed">
                {activeAssetObj.symbol === 'DXY'
                  ? 'إذا وصل الذهب إلى مستوى شراء ذكي (Smart Buy Level) بالتزامن مع اصطدام مؤشر الدولار DXY بمقاومة أو جدار بيعي، فإن احتمالية نجاح صفقة الشراء ترتفع إلى أكثر من 85%.'
                  : activeAssetObj.symbol === 'US10Y'
                  ? 'راقب كسر عوائد 10 سنوات لمستويات الدعم، فالكسر يعطي دفعة انفجارية فورية لصفقات الشراء السريعة في الذهب.'
                  : 'استخدم حركة هذا الأصل لتأكيد ما إذا كان صعود الذهب حقيقياً ومدعوماً بالسيولة الشاملة أم مجرد تصفية وهمية.'}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                تنبيه التداول: لا تتداول الذهب بمعزل عن مؤشر الدولار DXY، فالصناديق الكبرى تبرمج خوارزمياتها HFT على الفروق اللحظية بينهما.
              </span>
            </div>
            {onNavigateToView && (
              <button
                onClick={() => onNavigateToView('scenarios')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shrink-0 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>الربط مع مستويات الشراء والبيع الذكية</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
