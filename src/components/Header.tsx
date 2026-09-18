import React, { useEffect, useState } from 'react';
import { GoldQuote, TimeFrame, ChartViewMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
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
          {/* Timeframe Buttons */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
            {(['1m', '3m', '5m', '15m', '1h', '4h'] as TimeFrame[]).map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all font-['JetBrains_Mono'] ${
                  timeframe === tf
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* View Mode Switchers */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 overflow-x-auto max-w-full">
            <button
              onClick={() => onViewModeChange('footprint')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                viewMode === 'footprint'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="شارت تدفق الأوامر الفوت برنت - Bid x Ask Imbalances"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>فوت برنت</span>
            </button>

            <button
              onClick={() => onViewModeChange('futures')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                viewMode === 'futures'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="تحليل تدفق عقود الفيوتشرز، الفائدة المفتوحة ومعدل التمويل والتصفيات"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>فيوتشر فلو</span>
            </button>

            <button
              onClick={() => onViewModeChange('options')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                viewMode === 'options'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="تحليل تدفق عقود الخيارات (Options Flow)، الجاما GEX وسعر الألم الأقصى"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>أوبشن فلو</span>
            </button>

            <button
              onClick={() => onViewModeChange('clusters')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                viewMode === 'clusters'
                  ? 'bg-rose-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="كاشف مناطق تجمع الأوردرات وجدران الليمت المعلقة"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>تجمع الأوردرات</span>
            </button>

            <button
              onClick={() => onViewModeChange('heatmap')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                viewMode === 'heatmap'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="الخريطة الحرارية لعمق السيولة وحشود أوامر التصفية"
            >
              <span>هيت ماب</span>
            </button>

            <button
              onClick={() => onViewModeChange('cvd')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                viewMode === 'cvd'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="دلتا الحجم التراكمي وتدفق الامتصاص المؤسسي"
            >
              <span>CVD</span>
            </button>

            <button
              onClick={() => onViewModeChange('tradingview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-all whitespace-nowrap ${
                viewMode === 'tradingview'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="شارت تريدنج فيو المباشر للذهب"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تريدنج فيو</span>
            </button>
          </div>

          {/* High-Precision Confluence Signals Trigger */}
          {onOpenConfluenceModal && (
            <button
              onClick={onOpenConfluenceModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer active:scale-95"
              title="صفقات التوافق الرباعي عالية الدقة"
            >
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping"></span>
              <span>صفقات A+ مؤسسية</span>
            </button>
          )}

          {/* AI Institutional Scenario & Analysis Trigger */}
          <button
            onClick={onOpenAiModal}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-[0_0_18px_rgba(245,158,11,0.35)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            title="كشف السيناريو والتحليل المؤسسي الفائق بأحدث تقنيات الذكاء الاصطناعي"
          >
            <Cpu className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>كشف السيناريو والذكاء</span>
          </button>

          {/* In-App PWA Install Prompt Button */}
          <PWAInstallButton variant="header" />

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
