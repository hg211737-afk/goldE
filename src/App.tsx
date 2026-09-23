import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Activity,
  Flame,
  Globe2,
  Layers,
  Radio,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  AppSettings,
  DOMDepthData,
  FootprintBar,
  GoldQuote,
  LiquidityZone,
  MobileTab,
  SidebarTab,
  Timeframe,
  TradeItem,
  ViewMode,
  AiAnalysisResult,
} from "./types";
import {
  connectGoldWebSocket,
  detectLiquidityZones,
  fetchBinanceGoldDirect,
  generateFootprintFromKlines,
  analyzeOrderFlowWithGemini,
} from "./services/goldService";
import {
  getMacroCorrelationData,
  generateDualSmartLevels,
} from "./services/correlationService";
import { Header } from "./components/Header";
import { MarketSessionWidget } from "./components/MarketSessionWidget";
import { FootprintChart } from "./components/FootprintChart";
import { LiquidityHeatmap } from "./components/LiquidityHeatmap";
import { CvdAnalysisView } from "./components/CvdAnalysisView";
import { TradingViewWidget } from "./components/TradingViewWidget";
import { OptionFlowView } from "./components/OptionFlowView";
import { FuturesAnalysisView } from "./components/FuturesAnalysisView";
import { MarketProfileView } from "./components/MarketProfileView";
import { SniperSignalsView } from "./components/SniperSignalsView";
import { LiquidityZonesList } from "./components/LiquidityZonesList";
import { DomLadder } from "./components/DomLadder";
import { TimeAndSales } from "./components/TimeAndSales";
import { CorrelationWidget } from "./components/CorrelationWidget";
import { AiAnalysisModal } from "./components/AiAnalysisModal";
import { SettingsModal } from "./components/SettingsModal";
import { OfflineNotice } from "./components/OfflineNotice";

export function App() {
  const [quote, setQuote] = useState<GoldQuote>({
    symbol: "XAU/USD",
    price: 4360.00,
    bid: 4359.75,
    ask: 4360.25,
    spread: 0.50,
    high24h: 4385.00,
    low24h: 4340.00,
    change24h: 18.50,
    changePercent24h: 0.42,
    volume24h: 5840.0,
    timestamp: Date.now(),
    source: "BINANCE:PAXGUSDT (XAU/USD Live Spot Gold)",
  });

  const [depth, setDepth] = useState<DOMDepthData>({ bids: [], asks: [], maxQty: 25 });
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>("5m");
  const [viewMode, setViewMode] = useState<ViewMode>("footprint");
  const [footprintBars, setFootprintBars] = useState<FootprintBar[]>([]);
  const [liquidityZones, setLiquidityZones] = useState<LiquidityZone[]>([]);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("liquidity");
  const [settings, setSettings] = useState<AppSettings>(() => {
    let savedKey = "";
    let savedModel = "gemini-2.5-flash";
    try {
      if (typeof window !== "undefined") {
        savedKey = localStorage.getItem("gold_orderflow_gemini_key") || "";
        savedModel = localStorage.getItem("gold_orderflow_ai_model") || "gemini-2.5-flash";
      }
    } catch {
      // ignore
    }
    return {
      imbalanceRatio: 3,
      tickSize: 0.5,
      clusterMode: "bidAsk",
      showImbalances: true,
      showPOC: true,
      soundAlerts: true,
      whaleThreshold: 5,
      heatmapIntensity: 3,
      customGeminiApiKey: savedKey,
      aiModel: savedModel,
      goldDataProvider: "binance_spot",
      streamSpeed: "realtime",
    };
  });

  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    latencyMs: number;
    source: string;
    updatesCount: number;
  }>({
    connected: true,
    latencyMs: 32,
    source: "Binance WebSocket Live (100ms Stream)",
    updatesCount: 0,
  });
  const [feedKey, setFeedKey] = useState<number>(0);

  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("chart");
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  const dualLevels = useMemo(() => {
    return generateDualSmartLevels(quote.price, liquidityZones);
  }, [quote.price, liquidityZones]);

  const macroReport = useMemo(() => {
    return getMacroCorrelationData(quote.price);
  }, [quote.price]);

  const audioCtxRef = React.useRef<AudioContext | null>(null);

  const playSweepSound = useCallback(() => {
    if (settings.soundAlerts && typeof window !== "undefined") {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;

        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch {
        // AudioContext may be restricted by autoplay policy
      }
    }
  }, [settings.soundAlerts]);

  const liquidityZonesRef = React.useRef<LiquidityZone[]>([]);
  liquidityZonesRef.current = liquidityZones;

  const settingsRef = React.useRef<AppSettings>(settings);
  settingsRef.current = settings;

  const playSweepSoundRef = React.useRef(playSweepSound);
  playSweepSoundRef.current = playSweepSound;

  const pollMarketData = useCallback(async () => {
    let data: any = null;
    try {
      const res = await fetch(`/api/gold/live?symbol=PAXGUSDT&interval=${timeframe}`);
      if (res.ok) {
        data = await res.json();
      }
    } catch {
      // Fallback to direct client fetch
    }

    if (!data || !data.price) {
      data = await fetchBinanceGoldDirect(timeframe);
    }

    if (data) {
      try {
        if (data.price !== undefined && data.price !== null) {
          const rawPrice = typeof data.price === "number" ? data.price : parseFloat(data.price);
          if (!isNaN(rawPrice) && rawPrice > 0) {
            setQuote((prev) => ({
              ...prev,
              symbol: "XAU/USD",
              price: rawPrice,
              bid: data.bid !== undefined ? (typeof data.bid === "number" ? data.bid : parseFloat(data.bid)) : (rawPrice - 0.25),
              ask: data.ask !== undefined ? (typeof data.ask === "number" ? data.ask : parseFloat(data.ask)) : (rawPrice + 0.25),
              spread: data.spread !== undefined ? (typeof data.spread === "number" ? data.spread : parseFloat(data.spread)) : 0.5,
              high24h: data.high24h !== undefined ? (typeof data.high24h === "number" ? data.high24h : parseFloat(data.high24h)) : (rawPrice * 1.02),
              low24h: data.low24h !== undefined ? (typeof data.low24h === "number" ? data.low24h : parseFloat(data.low24h)) : (rawPrice * 0.98),
              change24h: data.change24h !== undefined ? (typeof data.change24h === "number" ? data.change24h : parseFloat(data.change24h)) : prev.change24h,
              changePercent24h: data.changePercent24h !== undefined ? (typeof data.changePercent24h === "number" ? data.changePercent24h : parseFloat(data.changePercent24h)) : prev.changePercent24h,
              volume24h: data.volume24h !== undefined ? (typeof data.volume24h === "number" ? data.volume24h : parseFloat(data.volume24h)) : prev.volume24h,
              timestamp: data.timestamp || Date.now(),
              source: data.source || prev.source,
            }));
          }
        }

        if (data.depth && data.depth.bids && data.depth.asks) {
          let runningBid = 0;
          let maxQ = 1;
          const bids = data.depth.bids.map(([p, q]: [number, number]) => {
            runningBid += q;
            if (q > maxQ) maxQ = q;
            return { price: p, qty: q, total: runningBid, percent: 0 };
          });

          let runningAsk = 0;
          const asks = data.depth.asks.map(([p, q]: [number, number]) => {
            runningAsk += q;
            if (q > maxQ) maxQ = q;
            return { price: p, qty: q, total: runningAsk, percent: 0 };
          });

          bids.forEach((b: any) => (b.percent = (b.qty / maxQ) * 100));
          asks.forEach((a: any) => (a.percent = (a.qty / maxQ) * 100));
          setDepth({ bids, asks, maxQty: maxQ });
        }

        if (data.trades && Array.isArray(data.trades) && data.trades.length > 0) {
          setTrades((prev) => {
            const mapped = data.trades.map((t: any) => ({
              id: t.id,
              price: t.price,
              qty: t.qty,
              side: t.side || (t.isBuyerMaker ? "sell" : "buy"),
              time: t.time,
              isWhale: t.qty >= settingsRef.current.whaleThreshold,
            }));
            const combined = [...mapped, ...prev];
            return Array.from(new Map(combined.map((x) => [x.id, x])).values()).slice(0, 50);
          });
        }

        if (data.klines && Array.isArray(data.klines) && data.klines.length > 0) {
          const bars = generateFootprintFromKlines(
            data.klines,
            settingsRef.current.tickSize,
            settingsRef.current.imbalanceRatio
          );
          setFootprintBars(bars);
          setLiquidityZones(detectLiquidityZones(data.price || 4360.0, bars));
        }
      } catch (err) {
        console.error("Failed to parse market snapshot:", err);
      }
    }
  }, [timeframe]);

  useEffect(() => {
    pollMarketData();
    const timer = setInterval(pollMarketData, 2000);

    const handleResume = () => {
      pollMarketData();
      setFeedKey((k) => k + 1);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleResume();
      }
    };

    window.addEventListener("online", handleResume);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener("online", handleResume);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [pollMarketData, feedKey]);

  useEffect(() => {
    const disconnect = connectGoldWebSocket(
      (newTicker) => {
        setQuote((prev) => {
          const updated = { ...prev, ...newTicker };
          const p = updated.price;

          // Dynamically reflect tick on the last active footprint bar
          setFootprintBars((prevBars) => {
            if (!prevBars || prevBars.length === 0) return prevBars;
            const lastIndex = prevBars.length - 1;
            const last = prevBars[lastIndex];
            const updatedLast = {
              ...last,
              close: p,
              high: Math.max(last.high, p),
              low: Math.min(last.low, p),
              volume: Number((last.volume + 0.2).toFixed(1)),
            };
            const copy = [...prevBars];
            copy[lastIndex] = updatedLast;
            return copy;
          });

          const zones = liquidityZonesRef.current;
          zones.forEach((z) => {
            if (z.status === "untested") {
              if (z.type === "BSL" && updated.price >= z.priceTop) {
                z.status = "swept";
                setAlertBanner(
                  `🚨 تم صيد وسحب سيولة الشراء العلوية للذهب (BSL Sweep) عند $${updated.price.toFixed(2)}!`
                );
                playSweepSoundRef.current();
                setTimeout(() => setAlertBanner(null), 7000);
              } else if (z.type === "SSL" && updated.price <= z.priceBottom) {
                z.status = "swept";
                setAlertBanner(
                  `🚨 تم صيد وسحب سيولة البيع السفلية للذهب (SSL Sweep) عند $${updated.price.toFixed(2)}!`
                );
                playSweepSoundRef.current();
                setTimeout(() => setAlertBanner(null), 7000);
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
      },
      (status) => {
        setConnectionStatus(status);
      },
      "PAXGUSDT"
    );

    return () => disconnect();
  }, [feedKey]);

  const handleTriggerAiAnalysis = async () => {
    setIsAiLoading(true);
    setIsAiModalOpen(true);
    try {
      const lastBar = footprintBars[footprintBars.length - 1];
      const bslLevels = liquidityZones.filter((z) => z.type === "BSL").map((z) => `$${z.priceTop}`);
      const sslLevels = liquidityZones.filter((z) => z.type === "SSL").map((z) => `$${z.priceBottom}`);
      const fvgLevels = liquidityZones
        .filter((z) => z.type.includes("FVG"))
        .map((z) => `$${z.priceBottom} - $${z.priceTop}`);

      const result = await analyzeOrderFlowWithGemini({
        currentPrice: quote.price,
        delta: lastBar ? `${lastBar.delta >= 0 ? "+" : ""}${lastBar.delta.toFixed(1)} Oz` : "+18.5",
        cvdTrend: lastBar && lastBar.delta >= 0 ? "Bullish Absorption" : "Bearish Pressure",
        footprintImbalance: `اختلال تدفق أوامر عند $${(quote.price - 0.5).toFixed(2)} بنسبة ${
          settings.imbalanceRatio * 100
        }%`,
        bslLevels: bslLevels.length ? bslLevels : [`$${(quote.price + 8).toFixed(2)}`, `$${(quote.price + 15).toFixed(2)}`],
        sslLevels: sslLevels.length ? sslLevels : [`$${(quote.price - 8).toFixed(2)}`, `$${(quote.price - 15).toFixed(2)}`],
        pocPrice: lastBar ? `$${lastBar.pocPrice.toFixed(2)}` : `$${(quote.price - 0.5).toFixed(2)}`,
        fvgZones: fvgLevels.length ? fvgLevels : [`$${(quote.price - 2).toFixed(2)} - $${(quote.price + 2).toFixed(2)}`],
        timeframe,
        customApiKey: settings.customGeminiApiKey,
        preferredModel: settings.aiModel,
      });

      setAiAnalysis(result);
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] h-auto lg:h-[100dvh] w-full overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[#0a0d14] text-slate-100 font-['Cairo'] select-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <OfflineNotice />
      <Header
        quote={quote}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenAiModal={handleTriggerAiAnalysis}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        isAiLoading={isAiLoading}
        activeLiquidityCount={liquidityZones.filter((z) => z.status === "untested").length}
        connectionStatus={connectionStatus}
        hasCustomApiKey={Boolean(settings.customGeminiApiKey && settings.customGeminiApiKey.trim())}
        onRefresh={() => {
          pollMarketData();
          setFeedKey((k) => k + 1);
        }}
      />
      
      <MarketSessionWidget />

      {alertBanner && (
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white px-4 py-1.5 text-xs font-bold text-center flex items-center justify-center gap-2 animate-bounce select-none shadow-md">
          <ShieldAlert className="w-4 h-4 text-yellow-300" />
          <span>{alertBanner}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden p-1.5 sm:p-3 gap-1.5 sm:gap-3">
        <main
          className={`flex-1 flex flex-col min-h-[460px] sm:min-h-[520px] lg:min-h-0 lg:h-full overflow-hidden ${
            mobileTab === "chart" ? "flex" : "hidden lg:flex"
          }`}
        >
          {viewMode === "footprint" && (
            <FootprintChart
              bars={footprintBars}
              currentPrice={quote.price}
              liquidityZones={liquidityZones}
              settings={settings}
              dualLevels={dualLevels}
            />
          )}
          {viewMode === "heatmap" && (
            <LiquidityHeatmap
              currentPrice={quote.price}
              liquidityZones={liquidityZones}
              depth={depth}
            />
          )}
          {viewMode === "cvd" && (
            <CvdAnalysisView bars={footprintBars} currentPrice={quote.price} />
          )}
          {viewMode === "optionflow" && (
            <OptionFlowView currentPrice={quote.price} />
          )}
          {viewMode === "futures" && (
            <FuturesAnalysisView currentPrice={quote.price} />
          )}
          {viewMode === "marketprofile" && (
            <MarketProfileView currentPrice={quote.price} bars={footprintBars} />
          )}
          {viewMode === "signals" && (
            <SniperSignalsView
              currentPrice={quote.price}
              bars={footprintBars}
              liquidityZones={liquidityZones}
              onRefresh={handleTriggerAiAnalysis}
              isAiLoading={isAiLoading}
            />
          )}
          {viewMode === "tradingview" && <TradingViewWidget timeframe={timeframe} />}
        </main>

        <aside
          className={`w-full lg:w-80 xl:w-96 flex flex-col shrink-0 bg-[#111622] rounded-xl border border-slate-800/80 overflow-hidden min-h-[460px] lg:min-h-0 ${
            mobileTab === "chart" ? "hidden lg:flex lg:h-full" : "flex flex-1 h-full"
          }`}
        >
          <div className="flex items-center bg-slate-900 border-b border-slate-800 p-1 gap-0.5">
            <button
              onClick={() => {
                setSidebarTab("liquidity");
                setMobileTab("liquidity");
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                mobileTab === "liquidity" || sidebarTab === "liquidity"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>السيولة</span>
            </button>
            <button
              onClick={() => {
                setSidebarTab("correlation");
                setMobileTab("correlation");
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                mobileTab === "correlation" || sidebarTab === "correlation"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title="ارتباط الذهب بمؤشر الدولار DXY والعملات والسلع"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>DXY ماكرو</span>
            </button>
            <button
              onClick={() => {
                setSidebarTab("dom");
                setMobileTab("dom");
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                mobileTab === "dom" || sidebarTab === "dom"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>عمق DOM</span>
            </button>
            <button
              onClick={() => {
                setSidebarTab("tape");
                setMobileTab("tape");
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                mobileTab === "tape" || sidebarTab === "tape"
                  ? "bg-amber-500 text-slate-950 shadow-xs"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>الصفقات</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {(mobileTab === "liquidity" || (mobileTab === "chart" && sidebarTab === "liquidity")) && (
              <LiquidityZonesList
                zones={liquidityZones}
                currentPrice={quote.price}
                dualLevels={dualLevels}
                onOpenDualLevelsModal={() => setIsAiModalOpen(true)}
              />
            )}
            {(mobileTab === "correlation" || (mobileTab === "chart" && sidebarTab === "correlation")) && (
              <CorrelationWidget
                report={macroReport}
                goldPrice={quote.price}
                onRefresh={handleTriggerAiAnalysis}
              />
            )}
            {(mobileTab === "dom" || (mobileTab === "chart" && sidebarTab === "dom")) && (
              <DomLadder depth={depth} currentPrice={quote.price} spread={quote.spread} />
            )}
            {(mobileTab === "tape" || (mobileTab === "chart" && sidebarTab === "tape")) && (
              <TimeAndSales trades={trades} />
            )}
          </div>

          <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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

      <nav className="lg:hidden bg-[#111622] border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around z-40 select-none pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]">
        <button
          onClick={() => setMobileTab("chart")}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
            mobileTab === "chart"
              ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>الشارت</span>
        </button>
        <button
          onClick={() => {
            setMobileTab("liquidity");
            setSidebarTab("liquidity");
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
            mobileTab === "liquidity"
              ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>السيولة</span>
        </button>
        <button
          onClick={() => {
            setMobileTab("correlation");
            setSidebarTab("correlation");
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
            mobileTab === "correlation"
              ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>DXY ماكرو</span>
        </button>
        <button
          onClick={() => {
            setMobileTab("dom");
            setSidebarTab("dom");
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
            mobileTab === "dom"
              ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>عمق DOM</span>
        </button>
        <button
          onClick={() => {
            setMobileTab("tape");
            setSidebarTab("tape");
          }}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
            mobileTab === "tape"
              ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>الصفقات</span>
        </button>
        <button
          onClick={handleTriggerAiAnalysis}
          className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-yellow-600 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Flame className="w-4 h-4" />
          <span>الذكاء</span>
        </button>
      </nav>

      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        analysis={aiAnalysis}
        isLoading={isAiLoading}
        onRefresh={handleTriggerAiAnalysis}
        currentPrice={quote.price}
        macroReport={macroReport}
        onOpenSettings={() => {
          setIsAiModalOpen(false);
          setIsSettingsModalOpen(true);
        }}
        activeModel={settings.aiModel || "gemini-2.5-flash"}
        hasCustomKey={Boolean(settings.customGeminiApiKey && settings.customGeminiApiKey.trim())}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((s) => ({ ...s, ...newVals }))}
        connectionStatus={connectionStatus}
        onResyncFeed={() => {
          setFeedKey((k) => k + 1);
          pollMarketData();
        }}
      />
    </div>
  );
}

export default App;
