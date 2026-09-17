import React, { useState, useEffect, useCallback } from 'react';
import {
  GoldQuote,
  MarketDepth,
  TapeTrade,
  FootprintBar,
  LiquidityZone,
  TimeFrame,
  ChartViewMode,
  TerminalSettings,
  AIAnalysisResult,
} from './types';
import {
  generateFootprintBars,
  detectLiquidityZones,
  setupMarketSocket,
  fetchDirectBinanceSnapshot,
} from './services/marketService';
import { fetchOrderFlowAnalysis } from './services/aiService';
import { Header } from './components/Header';
import { FootprintChart } from './components/FootprintChart';
import { LiquidityHeatmap } from './components/LiquidityHeatmap';
import { TradingViewWidget } from './components/TradingViewWidget';
import { CvdAnalysisView } from './components/CvdAnalysisView';
import { DomLadder } from './components/DomLadder';
import { TimeAndSales } from './components/TimeAndSales';
import { LiquidityZonesList } from './components/LiquidityZonesList';
import { AiAnalysisModal } from './components/AiAnalysisModal';
import { SettingsModal } from './components/SettingsModal';
import {
  Layers,
  Radio,
  Bell,
  Sparkles,
  ShieldAlert,
  Flame,
  Activity,
  Maximize2,
} from 'lucide-react';

export default function App() {
  // Live Quote State
  const [quote, setQuote] = useState<GoldQuote>({
    symbol: 'XAU/USD',
    price: 2742.60,
    bid: 2742.35,
    ask: 2742.75,
    spread: 0.40,
    high24h: 2758.10,
    low24h: 2731.50,
    change24h: 11.10,
    changePercent24h: 0.41,
    volume24h: 38492.4,
    timestamp: Date.now(),
    source: 'Binance PAXG (Gold Spot 1:1)',
  });

  // Market Depth & Trades State
  const [depth, setDepth] = useState<MarketDepth>({
    bids: [],
    asks: [],
    maxQty: 25,
  });
  const [trades, setTrades] = useState<TapeTrade[]>([]);

  // Timeframe and View Mode
  const [timeframe, setTimeframe] = useState<TimeFrame>('5m');
  const [viewMode, setViewMode] = useState<ChartViewMode>('footprint');

  // Footprint Bars & Liquidity Zones
  const [bars, setBars] = useState<FootprintBar[]>([]);
  const [liquidityZones, setLiquidityZones] = useState<LiquidityZone[]>([]);

  // Sidebar Tabs: 'dom' | 'tape' | 'liquidity'
  const [sidebarTab, setSidebarTab] = useState<'dom' | 'tape' | 'liquidity'>('liquidity');

  // Terminal Settings
  const [settings, setSettings] = useState<TerminalSettings>({
    imbalanceRatio: 3.0,
    tickSize: 0.5,
    clusterMode: 'bidAsk',
    showImbalances: true,
    showPOC: true,
    soundAlerts: true,
    whaleThreshold: 5.0,
    heatmapIntensity: 3,
  });

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Mobile Bottom Navigation Tab State (for Phone/APK view)
  const [mobileTab, setMobileTab] = useState<'chart' | 'liquidity' | 'dom' | 'tape'>('chart');

  // Liquidity Sweep Alert Banner
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  // Play subtle web audio notification chime
  const playSweepChime = useCallback(() => {
    if (!settings.soundAlerts) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // AudioContext might be restricted until user interacts
    }
  }, [settings.soundAlerts]);

  // Initial load and periodic polling with automatic APK/Direct fallback
  const fetchMarketSnapshot = useCallback(async () => {
    let data: any = null;

    try {
      const res = await fetch(`/api/gold/live?interval=${timeframe}`);
      if (res.ok) {
        data = await res.json();
      }
    } catch {
      // If backend is not running (e.g. mobile APK standalone mode)
    }

    if (!data || !data.price) {
      // Direct Binance fallback for Android APK and offline/standalone mode
      data = await fetchDirectBinanceSnapshot(timeframe);
    }

    if (!data) return;

    try {
      if (data.price) {
        setQuote((prev) => ({
          ...prev,
          price: data.price,
          bid: data.bid || data.price - 0.2,
          ask: data.ask || data.price + 0.2,
          spread: data.spread || 0.4,
          high24h: data.high24h || data.price + 15,
          low24h: data.low24h || data.price - 15,
          change24h: data.change24h || 0,
          changePercent24h: data.changePercent24h || 0,
          volume24h: data.volume24h || 1200,
          timestamp: data.timestamp || Date.now(),
        }));
      }

      if (data.depth && data.depth.bids && data.depth.asks) {
        let runningTotalBid = 0;
        let maxQty = 1;
        const bids = data.depth.bids.map(([p, q]: [number, number]) => {
          runningTotalBid += q;
          if (q > maxQty) maxQty = q;
          return { price: p, qty: q, total: runningTotalBid, percent: 0 };
        });

        let runningTotalAsk = 0;
        const asks = data.depth.asks.map(([p, q]: [number, number]) => {
          runningTotalAsk += q;
          if (q > maxQty) maxQty = q;
          return { price: p, qty: q, total: runningTotalAsk, percent: 0 };
        });

        bids.forEach((b: any) => (b.percent = (b.qty / maxQty) * 100));
        asks.forEach((a: any) => (a.percent = (a.qty / maxQty) * 100));

        setDepth({ bids, asks, maxQty });
      }

      if (data.trades && Array.isArray(data.trades) && data.trades.length > 0) {
        setTrades((prev) => {
          const newTrades = data.trades.map((t: any) => ({
            id: t.id,
            price: t.price,
            qty: t.qty,
            side: t.side || (t.isBuyerMaker ? 'sell' : 'buy'),
            time: t.time,
            isWhale: t.qty >= settings.whaleThreshold,
          }));
          const combined = [...newTrades, ...prev];
          const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
          return unique.slice(0, 50);
        });
      }

      if (data.klines && Array.isArray(data.klines) && data.klines.length > 0) {
        const generatedBars = generateFootprintBars(
          data.klines,
          settings.tickSize,
          settings.imbalanceRatio
        );
        setBars(generatedBars);
        setLiquidityZones(detectLiquidityZones(data.price || quote.price, generatedBars));
      }
    } catch (err) {
      console.error('Failed to parse gold market snapshot:', err);
    }
  }, [timeframe, settings.tickSize, settings.imbalanceRatio, settings.whaleThreshold]);

  useEffect(() => {
    fetchMarketSnapshot();
    const interval = setInterval(fetchMarketSnapshot, 3500);
    return () => clearInterval(interval);
  }, [fetchMarketSnapshot]);

  // Live WebSocket listener for real-time ticks
  useEffect(() => {
    const cleanup = setupMarketSocket(
      (newQuote) => {
        setQuote((prev) => {
          const updated = { ...prev, ...newQuote };
          // Check if price swept any liquidity zone
          liquidityZones.forEach((z) => {
            if (z.status === 'untested') {
              if (z.type === 'BSL' && updated.price >= z.priceTop) {
                z.status = 'swept';
                setActiveAlert(`🚨 تم صيد وسحب سيولة الشراء العلوية (BSL Sweep) عند $${updated.price.toFixed(2)}!`);
                playSweepChime();
                setTimeout(() => setActiveAlert(null), 7000);
              } else if (z.type === 'SSL' && updated.price <= z.priceBottom) {
                z.status = 'swept';
                setActiveAlert(`🚨 تم صيد وسحب سيولة البيع السفلية (SSL Sweep) عند $${updated.price.toFixed(2)}!`);
                playSweepChime();
                setTimeout(() => setActiveAlert(null), 7000);
              }
            }
          });
          return updated;
        });
      },
      (newTrade) => {
        setTrades((prev) => [newTrade, ...prev.slice(0, 49)]);
      },
      (newDepth) => {
        setDepth(newDepth);
      }
    );

    return () => cleanup();
  }, [liquidityZones, playSweepChime]);

  // Trigger Gemini AI Order Flow Analysis
  const handleTriggerAiAnalysis = async () => {
    setIsAiLoading(true);
    setIsAiModalOpen(true);
    try {
      const lastBar = bars[bars.length - 1];
      const bslLevels = liquidityZones.filter((z) => z.type === 'BSL').map((z) => `$${z.priceTop}`);
      const sslLevels = liquidityZones.filter((z) => z.type === 'SSL').map((z) => `$${z.priceBottom}`);
      const fvgZones = liquidityZones.filter((z) => z.type.includes('FVG')).map((z) => `$${z.priceBottom} - $${z.priceTop}`);

      const result = await fetchOrderFlowAnalysis({
        currentPrice: quote.price,
        delta: lastBar ? `${lastBar.delta >= 0 ? '+' : ''}${lastBar.delta.toFixed(1)} Oz` : '+18.5',
        cvdTrend: lastBar && lastBar.delta >= 0 ? 'Bullish Absorption' : 'Bearish Pressure',
        footprintImbalance: `اختلال تدفق أوامر عند $${(quote.price - 0.5).toFixed(2)} بنسبة ${settings.imbalanceRatio * 100}%`,
        bslLevels: bslLevels.length ? bslLevels : ['$2748.50', '$2754.00'],
        sslLevels: sslLevels.length ? sslLevels : ['$2736.20', '$2730.00'],
        pocPrice: lastBar ? `$${lastBar.pocPrice.toFixed(2)}` : `$${(quote.price - 0.5).toFixed(2)}`,
        fvgZones: fvgZones.length ? fvgZones : ['$2738.00 - $2739.50'],
        timeframe,
      });

      setAiAnalysis(result);
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0d14] text-slate-100 font-['Cairo']">
      {/* Top Header */}
      <Header
        quote={quote}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAiModal={handleTriggerAiAnalysis}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isAiLoading={isAiLoading}
        activeLiquidityCount={liquidityZones.filter((z) => z.status === 'untested').length}
      />

      {/* Real-time Liquidity Sweep Alert Banner */}
      {activeAlert && (
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce select-none shadow-md">
          <ShieldAlert className="w-4 h-4 text-yellow-300" />
          <span>{activeAlert}</span>
        </div>
      )}

      {/* Main Workspace Body: Adaptive for Mobile APK and Desktop */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-1.5 sm:p-3 gap-1.5 sm:gap-3">
        {/* Primary Chart Area (Visible when mobileTab === 'chart' on mobile, or always on desktop) */}
        <main
          className={`flex-1 flex flex-col h-full min-h-[300px] overflow-hidden ${
            mobileTab === 'chart' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {viewMode === 'footprint' && (
            <FootprintChart
              bars={bars}
              currentPrice={quote.price}
              liquidityZones={liquidityZones}
              settings={settings}
            />
          )}

          {viewMode === 'heatmap' && (
            <LiquidityHeatmap
              currentPrice={quote.price}
              liquidityZones={liquidityZones}
              depth={depth}
            />
          )}

          {viewMode === 'cvd' && (
            <CvdAnalysisView
              bars={bars}
              currentPrice={quote.price}
            />
          )}

          {viewMode === 'tradingview' && (
            <TradingViewWidget timeframe={timeframe} />
          )}
        </main>

        {/* Sidebar Panel: On desktop shown alongside chart. On mobile, shown when user selects liquidity, dom, or tape */}
        <aside
          className={`w-full lg:w-80 xl:w-96 flex flex-col shrink-0 bg-[#111622] rounded-xl border border-slate-800/80 overflow-hidden ${
            mobileTab !== 'chart' ? 'flex flex-1 h-full' : 'hidden lg:flex lg:h-full'
          }`}
        >
          {/* Sidebar Tab Selector */}
          <div className="flex items-center bg-slate-900 border-b border-slate-800 p-1">
            <button
              onClick={() => {
                setSidebarTab('liquidity');
                setMobileTab('liquidity');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                (mobileTab === 'liquidity' || sidebarTab === 'liquidity')
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>رادار السيولة</span>
            </button>

            <button
              onClick={() => {
                setSidebarTab('dom');
                setMobileTab('dom');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                (mobileTab === 'dom' || sidebarTab === 'dom')
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>عمق DOM</span>
            </button>

            <button
              onClick={() => {
                setSidebarTab('tape');
                setMobileTab('tape');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                (mobileTab === 'tape' || sidebarTab === 'tape')
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>الصفقات الحية</span>
            </button>
          </div>

          {/* Active Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            {(mobileTab === 'liquidity' || (mobileTab === 'chart' && sidebarTab === 'liquidity')) && (
              <LiquidityZonesList zones={liquidityZones} currentPrice={quote.price} />
            )}

            {(mobileTab === 'dom' || (mobileTab === 'chart' && sidebarTab === 'dom')) && (
              <DomLadder depth={depth} currentPrice={quote.price} spread={quote.spread} />
            )}

            {(mobileTab === 'tape' || (mobileTab === 'chart' && sidebarTab === 'tape')) && (
              <TimeAndSales trades={trades} />
            )}
          </div>

          {/* Bottom Quick AI Bias Widget */}
          <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] text-slate-300">
                تدفق الأوامر: <strong className="text-amber-400 font-mono">XAU/USD</strong>
              </span>
            </div>
            <button
              onClick={handleTriggerAiAnalysis}
              className="text-[11px] text-amber-300 hover:text-amber-200 font-bold underline cursor-pointer"
            >
              تقرير الذكاء الاصطناعي ←
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Dock Navigation (Native App Feel for APK testing) */}
      <nav className="lg:hidden bg-[#111622] border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around z-40 select-none pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]">
        <button
          onClick={() => setMobileTab('chart')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold transition-all ${
            mobileTab === 'chart'
              ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الشارت</span>
        </button>

        <button
          onClick={() => {
            setMobileTab('liquidity');
            setSidebarTab('liquidity');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold transition-all ${
            mobileTab === 'liquidity'
              ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>السيولة</span>
        </button>

        <button
          onClick={() => {
            setMobileTab('dom');
            setSidebarTab('dom');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold transition-all ${
            mobileTab === 'dom'
              ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>عمق DOM</span>
        </button>

        <button
          onClick={() => {
            setMobileTab('tape');
            setSidebarTab('tape');
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-semibold transition-all ${
            mobileTab === 'tape'
              ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>الصفقات</span>
        </button>

        <button
          onClick={handleTriggerAiAnalysis}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-yellow-600 shadow-sm transition-all active:scale-95"
        >
          <Flame className="w-4 h-4" />
          <span>الذكاء</span>
        </button>
      </nav>

      {/* AI Analysis Modal */}
      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        analysis={aiAnalysis}
        isLoading={isAiLoading}
        onRefresh={handleTriggerAiAnalysis}
        currentPrice={quote.price}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
      />
    </div>
  );
}
