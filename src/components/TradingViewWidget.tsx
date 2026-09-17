import React, { useEffect, useRef } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

interface TradingViewWidgetProps {
  timeframe: string;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  timeframe,
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Map timeframe to TradingView interval
  const getInterval = (tf: string) => {
    switch (tf) {
      case '1m': return '1';
      case '3m': return '3';
      case '5m': return '5';
      case '15m': return '15';
      case '1h': return '60';
      case '4h': return '240';
      default: return '5';
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: 'OANDA:XAUUSD',
          interval: getInterval(timeframe),
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'ar_AE',
          toolbar_bg: '#0f1420',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: 'tradingview_gold_chart',
          hide_side_toolbar: false,
          studies: ['Volume@tv-basicstudies', 'MAExp@tv-basicstudies'],
        });
      }
    };

    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [timeframe]);

  return (
    <div className="w-full h-full flex flex-col bg-[#0e121a] rounded-xl border border-slate-800/80 overflow-hidden">
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <span className="font-bold text-amber-400 font-['JetBrains_Mono']">
          OANDA:XAUUSD • Gold Spot Direct Feed
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden sm:inline">شارت تريدنج فيو المباشر مع أدوات التحليل الفني</span>
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className={`p-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                isFullScreen
                  ? 'text-amber-400 bg-amber-500/20 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
              title={isFullScreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة لشارت تريدنج فيو'}
            >
              {isFullScreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden md:inline">إنهاء ملء الشاشة</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden md:inline">ملء الشاشة</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <div id="tradingview_gold_chart" ref={containerRef} className="flex-1 w-full h-full min-h-[450px]" />
    </div>
  );
};
