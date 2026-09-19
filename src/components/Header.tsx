import React, { useEffect, useState } from 'react';
import { GoldQuote, TimeFrame, ChartViewMode } from '../types';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  SlidersHorizontal,
  Flame,
  Layers,
  LineChart,
  Radio,
  Clock,
  ShieldAlert,
  RefreshCw,
  Maximize2,
  Minimize2,
  Radar,
  Sparkles,
  Globe,
} from 'lucide-react';

interface HeaderProps {
  quote: GoldQuote;
  timeframe: TimeFrame;
  onTimeframeChange: (tf: TimeFrame) => void;
  viewMode: ChartViewMode;
  onViewModeChange: (mode: ChartViewMode) => void;
  onOpenAiModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenConfluenceModal?: () => void;
  onOpenMarketSessionsModal?: () => void;
  onRefresh?: () => void;
  isAiLoading: boolean;
  activeLiquidityCount: number;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  quote,
  timeframe,
  onTimeframeChange,
  viewMode,
  onViewModeChange,
  onOpenAiModal,
  onOpenSettingsModal,
  onOpenConfluenceModal,
  onOpenMarketSessionsModal,
  onRefresh,
  isAiLoading,
  activeLiquidityCount,
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const [prevPrice, setPrevPrice] = useState(quote.price);
  const [tickDirection, setTickDirection] = useState<'up' | 'down' | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (quote.price > prevPrice) {
      setTickDirection('up');
    } else if (quote.price < prevPrice) {
      setTickDirection('down');
    }
    const timer = setTimeout(() => setTickDirection(null), 800);
    setPrevPrice(quote.price);
    return () => clearTimeout(timer);
  }, [quote.price]);

  const handleManualRefresh = () => {
    if (onRefresh) {
      setIsRefreshing(true);
      onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  useEffect(() => {
    if (quote.price > prevPrice) {
      setTickDirection('up');
    } else if (quote.price < prevPrice) {
      setTickDirection('down');
    }
    const timer = setTimeout(() => setTickDirection(null), 800);
    setPrevPrice(quote.price);
    return () => clearTimeout(timer);
  }, [quote.price]);

  const isPositive = quote.change24h >= 0;

  return (
    <header className="bg-[#111622] border-b border-slate-800/80 px-4 py-2.5 text-slate-200 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left / Primary: Brand & Live Price */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Asset Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold shadow-sm">
              <span className="text-sm font-['JetBrains_Mono']">Au</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 font-['JetBrains_Mono']">
                  XAU/USD
                  <span className="text-xs font-normal text-amber-400/90 font-['Cairo'] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    الذهب الفوري
                  </span>
                </h1>
                <div className="flex items-center gap-1.5">
                  <div
                    title={quote.source || 'بث تدفق الأوامر الحي'}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="hidden sm:inline">بث حي فوري</span>
                    {quote.source && (
                      <span className="hidden md:inline text-[9px] text-slate-400 border-r border-slate-700 pr-1.5 mr-1">
                        {quote.source.includes('Binance') ? 'Binance' : quote.source.includes('CoinGecko') ? 'CoinGecko' : 'سحابي'}
                      </span>
                    )}
                  </div>
                  {onRefresh && (
                    <button
                      onClick={handleManualRefresh}
                      disabled={isRefreshing}
                      title="تحديث البيانات وإعادة الاتصال بالخادم"
                      className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Order Flow & Liquidity Terminal</p>
            </div>
          </div>

          {/* Live Price Display with Tick Flasher */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 font-['JetBrains_Mono'] ${
              tickDirection === 'up'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : tickDirection === 'down'
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'bg-slate-900/90 border-slate-750 text-white'
            }`}
          >
            <div className="text-xl sm:text-2xl font-bold tracking-tight">
              ${quote.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex flex-col text-[11px] leading-tight">
              <span className={`font-semibold flex items-center ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 ml-0.5" /> : <TrendingDown className="w-3 h-3 ml-0.5" />}
                {isPositive ? '+' : ''}
                {quote.changePercent24h.toFixed(2)}%
              </span>
              <span className="text-slate-400">
                {isPositive ? '+' : ''}${quote.change24h.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Bid / Ask / Spread */}
          <div className="hidden md:flex items-center gap-3 text-xs bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-lg font-['JetBrains_Mono']">
            <div>
              <span className="text-slate-400 text-[10px] block">طلب (Bid)</span>
              <span className="text-emerald-400 font-semibold">${quote.bid.toFixed(2)}</span>
            </div>
            <div className="w-[1px] h-6 bg-slate-800"></div>
            <div>
              <span className="text-slate-400 text-[10px] block">عرض (Ask)</span>
              <span className="text-rose-400 font-semibold">${quote.ask.toFixed(2)}</span>
            </div>
            <div className="w-[1px] h-6 bg-slate-800"></div>
            <div>
              <span className="text-slate-400 text-[10px] block">سبريد (Spread)</span>
              <span className="text-amber-300 font-medium">${quote.spread.toFixed(2)}</span>
            </div>
          </div>

          {/* 24h Stats */}
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 text-[10px] block">أعلى 24h</span>
              <span className="font-['JetBrains_Mono'] text-white">${quote.high24h.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">أدنى 24h</span>
              <span className="font-['JetBrains_Mono'] text-white">${quote.low24h.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Center / Right Controls: Timeframe & View Modes */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Timeframe Buttons with smooth layout animation */}
          <div className="relative flex items-center bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-1 shadow-inner">
            {(['1m', '3m', '5m', '15m', '1h', '4h'] as TimeFrame[]).map((tf) => {
              const isActive = timeframe === tf;
              return (
                <motion.button
                  key={tf}
                  onClick={() => onTimeframeChange(tf)}
                  whileTap={{ scale: 0.94 }}
                  className={`relative px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors font-['JetBrains_Mono'] cursor-pointer z-10 ${
                    isActive ? 'text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTfPill"
                      className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                    />
                  )}
                  <span>{tf}</span>
                </motion.button>
              );
            })}
          </div>

          {/* View Mode Switchers - World-Class Animated Tab Bar */}
          <div className="relative flex items-center bg-slate-950/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-1 overflow-x-auto max-w-full shadow-inner scrollbar-none">
            {[
              {
                id: 'scenarios' as ChartViewMode,
                label: 'السيناريو والمستويات الذكية',
                icon: Radar,
                badge: 'AI',
                title: 'رادار السيناريوهات المتطورة ومستويات الشراء والبيع الذكية Smart Buy & Sell',
                isFeatured: true,
              },
              {
                id: 'footprint' as ChartViewMode,
                label: 'فوت برنت',
                icon: Layers,
                title: 'شارت تدفق الأوامر الفوت برنت - Bid x Ask Imbalances',
              },
              {
                id: 'futures' as ChartViewMode,
                label: 'فيوتشر فلو',
                icon: Activity,
                badge: 'OI',
                title: 'تحليل تدفق عقود الفيوتشرز، الفائدة المفتوحة ومعدل التمويل والتصفيات',
              },
              {
                id: 'options' as ChartViewMode,
                label: 'أوبشن فلو',
                icon: Radio,
                badge: 'GEX',
                title: 'تحليل تدفق عقود الخيارات (Options Flow)، الجاما GEX وسعر الألم الأقصى',
              },
              {
                id: 'clusters' as ChartViewMode,
                label: 'تجمع الأوردرات',
                icon: Flame,
                badge: 'جدران',
                title: 'كاشف مناطق تجمع الأوردرات وجدران الليمت المعلقة',
              },
              {
                id: 'heatmap' as ChartViewMode,
                label: 'هيت ماب',
                icon: Activity,
                title: 'الخريطة الحرارية لعمق السيولة وحشود أوامر التصفية',
              },
              {
                id: 'cvd' as ChartViewMode,
                label: 'CVD',
                icon: TrendingUp,
                title: 'دلتا الحجم التراكمي وتدفق الامتصاص المؤسسي',
              },
              {
                id: 'correlation' as ChartViewMode,
                label: 'ترابط الأسواق DXY',
                icon: Globe,
                badge: 'DXY',
                title: 'مصفوفة الارتباط الكلي: الذهب ومؤشر الدولار وعوائد السندات والعملات',
              },
              {
                id: 'tradingview' as ChartViewMode,
                label: 'تريدنج فيو',
                icon: LineChart,
                title: 'شارت تريدنج فيو المباشر للذهب',
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = viewMode === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onViewModeChange(item.id)}
                  whileTap={{ scale: 0.96 }}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer z-10 ${
                    isActive
                      ? item.isFeatured
                        ? 'text-slate-950 font-bold'
                        : 'text-white font-bold'
                      : item.isFeatured
                      ? 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-900/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                  title={item.title}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeViewTabPill"
                      className={`absolute inset-0 rounded-lg shadow-md -z-10 ${
                        item.isFeatured
                          ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 shadow-amber-500/20'
                          : 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 shadow-blue-600/25'
                      }`}
                      transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 ${isActive && !item.isFeatured ? 'text-blue-200' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold transition-colors ${
                        isActive
                          ? item.isFeatured
                            ? 'bg-slate-950/20 text-slate-950'
                            : 'bg-white/20 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* High-Precision Confluence Signals Trigger */}
          {onOpenConfluenceModal && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenConfluenceModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer active:scale-95"
              title="صفقات التوافق الرباعي عالية الدقة"
            >
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
              <span>صفقات A+ مؤسسية</span>
            </motion.button>
          )}

          {/* AI Institutional Scenario & Analysis Trigger */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onOpenAiModal}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-[0_0_18px_rgba(245,158,11,0.35)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="كشف السيناريو والتحليل المؤسسي الفائق بأحدث تقنيات الذكاء الاصطناعي"
          >
            <Cpu className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>كشف السيناريو والذكاء</span>
          </motion.button>

          {/* Market Sessions & Liquidity Button */}
          {onOpenMarketSessionsModal && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenMarketSessionsModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium text-xs transition-all cursor-pointer"
              title="أوقات الجلسات العالمية ومستويات السيولة وساعات افتتاح السوق"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">الجلسات والسيولة</span>
            </motion.button>
          )}

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="إعدادات الأوردر فلو والفوت برنت"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Full Screen Chart Workspace Toggle */}
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                isFullScreen
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                  : 'bg-slate-900/90 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-amber-400'
              }`}
              title={isFullScreen ? 'إلغاء وضع ملء الشاشة واستعادة اللوحات (Esc)' : 'وضع ملء الشاشة للشارت (إخفاء القوائم والأشرطة)'}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span className="text-xs hidden md:inline font-bold">إنهاء ملء الشاشة</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span className="text-xs hidden md:inline">ملء الشاشة</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
