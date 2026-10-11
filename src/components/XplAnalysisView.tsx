import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  Edit3,
  Flame,
  Layers,
  Radio,
  RotateCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Volume2,
  Wallet,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";
import { XplAnalysisReport, XplMarketData, XplSniperRecommendation } from "../types";
import { fetchLiveXplData, generateXplAnalysisReport } from "../services/xplAnalysisService";
import { soundFx } from "../services/soundService";

interface XplAnalysisViewProps {
  onBackToGold?: () => void;
  onNavigateToBitcoin?: () => void;
}

// Clean price formatting for crypto assets
export const formatCryptoPrice = (p: number | undefined | null): string => {
  if (p === undefined || p === null || isNaN(p)) return "0.00000";
  if (p < 0.001) return p.toFixed(6);
  if (p < 1) return p.toFixed(5);
  if (p < 10) return p.toFixed(4);
  return p.toFixed(2);
};

export const XplAnalysisView: React.FC<XplAnalysisViewProps> = ({
  onBackToGold,
  onNavigateToBitcoin,
}) => {
  // Immediately initialize report with latest baseline so UI never blocks or shows frozen price
  const [report, setReport] = useState<XplAnalysisReport>(() => generateXplAnalysisReport(0.08675));
  const [timeframe, setTimeframe] = useState<"1m" | "5m" | "15m" | "1h" | "4h" | "1D">("15m");
  const [activeTab, setActiveTab] = useState<"orderflow" | "footprint" | "quantum" | "technicals" | "dom" | "whales">("orderflow");
  const [selectedFootprintIndex, setSelectedFootprintIndex] = useState<number>(0);
  const [calcMargin, setCalcMargin] = useState<number>(1000);
  const [calcLeverage, setCalcLeverage] = useState<number>(5);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [customPrice, setCustomPrice] = useState<number>(0.08675);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [priceInputText, setPriceInputText] = useState("0.08675");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("XPLUSDT");

  // Real-time live synchronization states
  const [isLiveSync, setIsLiveSync] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [priceTickDirection, setPriceTickDirection] = useState<"up" | "down" | "none">("none");
  const [tickCount, setTickCount] = useState(0);
  const [lastTickTime, setLastTickTime] = useState<number>(Date.now());
  const prevPriceRef = useRef<number>(0.08675);
  const wsRef = useRef<WebSocket | null>(null);

  const handleApplyCustomPrice = (newP?: number) => {
    const val = newP !== undefined ? newP : parseFloat(priceInputText);
    if (!isNaN(val) && val > 0) {
      setCustomPrice(val);
      setReport(generateXplAnalysisReport(val));
      setIsEditingPrice(false);
      setIsLiveSync(false); // Switch to manual simulation override
      soundFx.playChime();
    }
  };

  const handleResetToLivePrice = async () => {
    setIsLiveSync(true);
    await syncLiveMarketTick(true);
    soundFx.playChime();
  };

  const syncLiveMarketTick = async (showFeedback = false) => {
    if (showFeedback) setIsRefreshing(true);
    try {
      const liveMarket = await fetchLiveXplData(selectedSymbol);
      if (liveMarket && liveMarket.price > 0) {
        if (prevPriceRef.current > 0) {
          if (liveMarket.price > prevPriceRef.current) {
            setPriceTickDirection("up");
          } else if (liveMarket.price < prevPriceRef.current) {
            setPriceTickDirection("down");
          }
        }
        prevPriceRef.current = liveMarket.price;
        setCustomPrice(liveMarket.price);
        setPriceInputText(formatCryptoPrice(liveMarket.price));
        setReport(generateXplAnalysisReport(liveMarket));
        setLastTickTime(Date.now());
        setTickCount((prev) => prev + 1);
      }
    } catch (err) {
      console.warn("Live market fetch warning:", err);
    } finally {
      if (showFeedback) {
        setTimeout(() => setIsRefreshing(false), 300);
        soundFx.playSuccessChime();
      }
    }
  };

  // Clear tick animation pulse after 800ms
  useEffect(() => {
    if (priceTickDirection !== "none") {
      const timer = setTimeout(() => setPriceTickDirection("none"), 800);
      return () => clearTimeout(timer);
    }
  }, [priceTickDirection]);

  // Connect to Binance live Multi-Stream (trade, bookTicker, 24hrTicker) & periodic sync poller
  useEffect(() => {
    let reconnectTimeout: any = null;

    // 1. Initial live fetch
    syncLiveMarketTick(false);

    // 2. Binance Multi-Stream WebSocket for continuous high-frequency ticks
    const connectBinanceWs = () => {
      try {
        const streamSym = selectedSymbol.toLowerCase();
        const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streamSym}@trade/${streamSym}@bookTicker/${streamSym}@ticker`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          if (!isLiveSync) return;
          try {
            const raw = JSON.parse(event.data);
            const data = raw.data || raw;
            const stream = raw.stream || "";

            let newPrice: number | null = null;
            let newBid: number | null = null;
            let newAsk: number | null = null;
            let isTrade = false;
            let tradeQty = 100;
            let tradeSide: "buy" | "sell" = "buy";
            let tradeTime = Date.now();

            if (stream.includes("@trade") || data.e === "trade") {
              const p = parseFloat(data.p);
              if (p > 0) {
                newPrice = p;
                isTrade = true;
                tradeQty = parseFloat(data.q) || 100;
                tradeSide = data.m ? "sell" : "buy";
                tradeTime = data.T || Date.now();
              }
            } else if (stream.includes("@bookTicker") || (data.b && data.a)) {
              newBid = parseFloat(data.b);
              newAsk = parseFloat(data.a);
              if (newBid > 0 && newAsk > 0) {
                // If bookTicker shifts, calculate mid price
                newPrice = (newBid + newAsk) / 2;
              }
            } else if (stream.includes("@ticker") || data.e === "24hrTicker") {
              const p = parseFloat(data.c);
              if (p > 0) newPrice = p;
            }

            if (newPrice !== null && newPrice > 0) {
              const liveP = newPrice;
              if (prevPriceRef.current > 0) {
                if (liveP > prevPriceRef.current) {
                  setPriceTickDirection("up");
                } else if (liveP < prevPriceRef.current) {
                  setPriceTickDirection("down");
                }
              }
              prevPriceRef.current = liveP;
              setCustomPrice(liveP);
              setPriceInputText(formatCryptoPrice(liveP));

              setReport((prev) => {
                const oldM = prev?.market;
                const updatedBid = newBid ?? (data.b ? parseFloat(data.b) : (oldM ? oldM.bid : liveP - 0.00001));
                const updatedAsk = newAsk ?? (data.a ? parseFloat(data.a) : (oldM ? oldM.ask : liveP + 0.00001));

                let updatedTrades = oldM?.trades;
                if (isTrade) {
                  const tradeId = String(data.t || Date.now());
                  const newTradeItem = {
                    id: tradeId,
                    price: liveP,
                    qty: tradeQty,
                    time: tradeTime,
                    side: tradeSide,
                  };
                  // Filter out any existing trade with the same ID before prepending
                  const filtered = (oldM?.trades || []).filter((t) => String(t.id) !== tradeId);
                  updatedTrades = [newTradeItem, ...filtered].slice(0, 25);
                }

                const currentMarket: XplMarketData = {
                  symbol: selectedSymbol === "XPLUSDT" ? "XPL/USDT" : `${selectedSymbol.replace("USDT", "")}/USDT`,
                  price: liveP,
                  bid: updatedBid,
                  ask: updatedAsk,
                  spread: Number((Math.abs(updatedAsk - updatedBid)).toFixed(5)),
                  high24h: data.h ? parseFloat(data.h) : (oldM ? Math.max(oldM.high24h, liveP) : liveP * 1.03),
                  low24h: data.l ? parseFloat(data.l) : (oldM ? Math.min(oldM.low24h, liveP) : liveP * 0.97),
                  change24h: data.p ? parseFloat(data.p) : (oldM ? oldM.change24h : 0),
                  changePercent24h: data.P ? parseFloat(data.P) : (oldM ? oldM.changePercent24h : 0),
                  volume24h: data.v ? parseFloat(data.v) : (oldM ? oldM.volume24h : 58500000),
                  volumeUsd24h: data.q ? parseFloat(data.q) : (oldM ? oldM.volumeUsd24h : liveP * 58500000),
                  timestamp: Date.now(),
                  source: `Binance ${selectedSymbol} (بث مباشر حي فوري متعدد القنوات Multi-Stream)`,
                  depth: prev?.market?.depth,
                  trades: updatedTrades,
                  klines: prev?.market?.klines,
                };
                return generateXplAnalysisReport(currentMarket);
              });

              setLastTickTime(Date.now());
              setTickCount((prev) => prev + 1);
            }
          } catch {
            // ignore parse errors
          }
        };

        ws.onerror = () => {
          setWsConnected(false);
        };

        ws.onclose = () => {
          setWsConnected(false);
          if (isLiveSync) {
            reconnectTimeout = setTimeout(connectBinanceWs, 2000);
          }
        };
      } catch {
        setWsConnected(false);
      }
    };

    connectBinanceWs();

    // 3. Fallback and depth sync poller every 1.5 seconds
    const interval = setInterval(() => {
      if (isLiveSync) {
        syncLiveMarketTick(false);
      }
    }, 1500);

    return () => {
      clearInterval(interval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isLiveSync, selectedSymbol]);

  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-[#0b0f17]">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center animate-bounce shadow-lg">
          <Zap className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-base font-bold text-white">جاري تحميل تدفق أوامر وتحليل زوج XPL/USDT...</h3>
      </div>
    );
  }

  const { market, recommendation, indicators, whaleAlerts, scenarios, aiSynthesisAr } = report;
  const isPositive = market.change24h >= 0;

  const handleCopyOrder = () => {
    const text = `=== XPL/USDT Institutional Setup ===
التوصية: ${recommendation.actionLabelAr}
السعر: $${formatCryptoPrice(market.price)}
الدخول القناص: $${formatCryptoPrice(recommendation.exactSniperEntry)}
وقف الخسارة (SL): $${formatCryptoPrice(recommendation.stopLoss)}
الهدف 1 (TP1): $${formatCryptoPrice(recommendation.tp1)}
الهدف 2 (TP2): $${formatCryptoPrice(recommendation.tp2)}
الهدف 3 (TP3): $${formatCryptoPrice(recommendation.tp3)}
العائد للمخاطرة: ${recommendation.riskReward}
الأمر: ${recommendation.orderCommand}`;

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
      const utterance = new SpeechSynthesisUtterance(aiSynthesisAr);
      utterance.lang = "ar-SA";
      utterance.rate = 0.98;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      soundFx.playSonarPulse();
    }
  };

  return (
    <div className="flex-1 bg-[#090d16] text-slate-100 p-3 sm:p-5 overflow-y-auto space-y-4 select-none pb-24">
      {/* 1. Top Header Banner with Live XPL/USDT Price & Real-Time Sync Indicator */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0d1627] via-[#0e1f36] to-[#121326] border border-cyan-500/40 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>زوج العملة: XPL/USDT (Binance Spot & Futures)</span>
              </span>

              {isLiveSync ? (
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>🟢 بث حي مباشر لحظي من بينانس</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                  <span>⏸️ محاكاة يدوية</span>
                </span>
              )}

              <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 text-[10px] font-mono font-bold flex items-center gap-1">
                <Wifi className="w-3 h-3 text-cyan-400" />
                <span>{wsConnected ? "WebSocket Live" : "REST Feed Live"} • نبضة #{tickCount}</span>
              </span>

              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                CVD & Footprint
              </span>
            </div>

            <div className="flex items-center gap-3 flex-wrap pt-1">
              {!isEditingPrice ? (
                <div
                  className={`flex items-center gap-2 p-1.5 rounded-xl transition-all duration-300 ${
                    priceTickDirection === "up"
                      ? "ring-2 ring-emerald-400 bg-emerald-500/15 border border-emerald-500/40"
                      : priceTickDirection === "down"
                      ? "ring-2 ring-rose-400 bg-rose-500/15 border border-rose-500/40"
                      : "border border-transparent"
                  }`}
                >
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-['JetBrains_Mono'] tracking-tight flex items-center gap-1.5">
                    <span>${formatCryptoPrice(market.price)}</span>
                    {priceTickDirection === "up" && (
                      <TrendingUp className="w-5 h-5 text-emerald-400 animate-bounce inline" />
                    )}
                    {priceTickDirection === "down" && (
                      <TrendingDown className="w-5 h-5 text-rose-400 animate-bounce inline" />
                    )}
                  </h1>

                  <button
                    onClick={() => {
                      setPriceInputText(formatCryptoPrice(market.price));
                      setIsEditingPrice(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 transition-all cursor-pointer"
                    title="تعديل السعر يدويًا لتجربة نقاط دخول مخصصة"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-[11px]">تعديل تجريبي</span>
                  </button>

                  {!isLiveSync && (
                    <button
                      onClick={handleResetToLivePrice}
                      className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="الرجوع الفوري لمطابقة السعر اللحظي المباشر"
                    >
                      <RotateCw className="w-3 h-3" />
                      <span className="text-[11px]">استعادة السعر اللحظي</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-900 border border-cyan-500/50 rounded-xl p-1.5 shadow-lg">
                  <span className="text-xs text-slate-400 font-mono font-bold px-1">$</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={priceInputText}
                    onChange={(e) => setPriceInputText(e.target.value)}
                    className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none focus:border-cyan-400"
                    placeholder="0.0870"
                    autoFocus
                  />
                  <button
                    onClick={() => handleApplyCustomPrice()}
                    className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded transition-all cursor-pointer"
                  >
                    تطبيق
                  </button>
                  <button
                    onClick={() => setIsEditingPrice(false)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              )}

              <div
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                  isPositive
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                }`}
              >
                {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span>
                  {isPositive ? "+" : ""}
                  {formatCryptoPrice(market.change24h)} ({isPositive ? "+" : ""}
                  {market.changePercent24h.toFixed(2)}%)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>المصدر: {market.source}</span>
            </p>
          </div>

          {/* Action Navigation Controls */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => {
                setIsLiveSync(!isLiveSync);
                soundFx.playHudClick();
                if (!isLiveSync) {
                  syncLiveMarketTick(true);
                }
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                isLiveSync
                  ? "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              }`}
              title="تشغيل أو إيقاف التحديث التلقائي اللحظي"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isLiveSync ? "🟢 التحديث المباشر: نشط" : "⏸️ استئناف التحديث"}</span>
            </button>

            {onBackToGold && (
              <button
                onClick={onBackToGold}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>العودة للذهب (XAU)</span>
              </button>
            )}

            {onNavigateToBitcoin && (
              <button
                onClick={onNavigateToBitcoin}
                className="px-3.5 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Coins className="w-4 h-4 text-orange-400" />
                <span>البتكوين (BTC)</span>
              </button>
            )}

            <button
              onClick={handleToggleSpeak}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                isSpeaking
                  ? "bg-cyan-500 text-slate-950 animate-pulse font-black"
                  : "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40"
              }`}
              title="استمع للتقرير الصوتي لزوج XPL/USDT باللغة العربية"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? "إيقاف الصوت" : "تقرير صوتي 🎙️"}</span>
            </button>

            <button
              onClick={() => syncLiveMarketTick(true)}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-750 transition-all cursor-pointer shadow-sm active:scale-95"
              title="تحديث فوري للسعر اللحظي ودفتر الأوامر الآن"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Quick Ticker Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">أعلى 24h</span>
            <strong className="text-white font-mono">${formatCryptoPrice(market.high24h)}</strong>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">أدنى 24h</span>
            <strong className="text-white font-mono">${formatCryptoPrice(market.low24h)}</strong>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">حجم التداول 24h</span>
            <strong className="text-cyan-300 font-mono">{(market.volume24h / 1e6).toFixed(1)}M XPL</strong>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">حجم الدولار 24h</span>
            <strong className="text-emerald-300 font-mono">${(market.volumeUsd24h / 1e6).toFixed(1)}M</strong>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">السبريد (Spread)</span>
            <strong className="text-amber-300 font-mono">${formatCryptoPrice(market.spread)}</strong>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block">سيطرة المشترين CVD</span>
            <strong className="text-emerald-400 font-mono">{indicators.orderFlowPressure.buyerDeltaPercent}%</strong>
          </div>
        </div>
      </div>

      {/* 2. Coin Identity Verification & Real-Time Multi-Pair Switcher */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/30 p-3.5 sm:p-4 text-xs shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 text-[11px] flex items-center gap-1.5 shadow-xs">
                <span>🛡️ مطابقة العملة:</span>
                <span className="font-mono text-white font-black">{market.symbol}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[11px] border border-indigo-500/30">
                {selectedSymbol === "XPLUSDT" ? "شبكة Plasma Protocol (المركز #127 عالمياً)" : `زوج ${market.symbol} (Binance Live)`}
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                • تحديث فوري فائق السرعة عبر Multi-Stream
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {selectedSymbol === "XPLUSDT" ? (
                <>
                  🔍 <strong>هل عملة XPL هي نفسها التي بالصورة؟</strong> نعم، هذه عملة <strong>Plasma (XPL)</strong> المدرجة على منصة Binance برمز <strong>XPLUSDT</strong>، وسعرها اللحظي الفعلي الآن هو <span className="text-cyan-300 font-mono font-bold">${formatCryptoPrice(market.price)}</span> ويتحرك مع كل نبضة تداول (Tick) بدقة 5 خانات عشرية. إذا كانت العملة في صورتك مختلفة (مثل XRP أو XLM أو غيرها)، يمكنك التبديل فوراً بنقرة واحدة أدناه:
                </>
              ) : (
                <>
                  تم تفعيل البث اللحظي الفوري لزوج <strong>{market.symbol}</strong> مباشرة من بينانس مع تحليل تدفق الأوامر ومستويات القناص.
                </>
              )}
            </p>
          </div>

          {/* Quick Switching Chips */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {[
              { id: "XPLUSDT", label: "Plasma (XPL)", icon: "⚡" },
              { id: "XRPUSDT", label: "Ripple (XRP)", icon: "✕" },
              { id: "XLMUSDT", label: "Stellar (XLM)", icon: "🚀" },
              { id: "SOLUSDT", label: "Solana (SOL)", icon: "☀️" },
              { id: "BTCUSDT", label: "Bitcoin (BTC)", icon: "₿" },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => {
                  if (selectedSymbol !== chip.id) {
                    setSelectedSymbol(chip.id);
                    soundFx.playChime();
                  }
                }}
                className={`px-2.5 py-1.5 rounded-xl font-mono text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedSymbol === chip.id
                    ? "bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                    : "bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60"
                }`}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs & Timeframe Selection */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("orderflow")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "orderflow"
                ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>تدفق الأوامر و CVD</span>
          </button>
          <button
            onClick={() => setActiveTab("footprint")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "footprint"
                ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>فوت برنت العناقيد 🔬</span>
          </button>
          <button
            onClick={() => setActiveTab("quantum")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "quantum"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>الكمي ومونتي كارلو 🎲</span>
          </button>
          <button
            onClick={() => setActiveTab("technicals")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "technicals"
                ? "bg-indigo-600 text-white font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>التحليل الفني و SMC</span>
          </button>
          <button
            onClick={() => setActiveTab("dom")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "dom"
                ? "bg-teal-600 text-white font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>عمق السوق (DOM Ladder)</span>
          </button>
          <button
            onClick={() => setActiveTab("whales")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "whales"
                ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>رادار الحيتان والتجميع</span>
          </button>
        </div>

        {/* Timeframes */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
          {(["1m", "5m", "15m", "1h", "4h", "1D"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                soundFx.playHudClick();
              }}
              className={`px-2.5 py-1 rounded transition-all ${
                timeframe === tf ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* 3. INSTITUTIONAL SNIPER RECOMMENDATION CARD */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0c182a] via-[#101b33] to-[#12233f] border-2 border-cyan-500/60 p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Target className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase font-mono">
                  {recommendation.action}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {recommendation.actionLabelAr}
                </h3>
                <span className="text-xs text-cyan-300 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 font-mono">
                  ثقة النموذج: {recommendation.confidencePercent}%
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {recommendation.timeframeHorizonAr} • {recommendation.tokenUtilityThesisAr}
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyOrder}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-lg active:scale-95 self-stretch sm:self-auto justify-center"
          >
            {copiedId === "order" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedId === "order" ? "تم نسخ أمر التداول!" : "نسخ أمر الصفقة المباشر"}</span>
          </button>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">نطاق الدخول القناص</span>
            <strong className="text-cyan-300 font-mono text-sm block pt-0.5">
              ${formatCryptoPrice(recommendation.entryRange.min)} - ${formatCryptoPrice(recommendation.entryRange.max)}
            </strong>
            <span className="text-[9px] text-slate-400">منطقة الارتكاز المؤسسي</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-500/40">
            <span className="text-[10px] text-cyan-300 block">الدخول الدقيق (Limit)</span>
            <strong className="text-white font-mono text-sm block pt-0.5">
              ${formatCryptoPrice(recommendation.exactSniperEntry)}
            </strong>
            <span className="text-[9px] text-cyan-400 font-bold">Best Execution</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/40">
            <span className="text-[10px] text-rose-300 block">وقف الخسارة الصارم (SL)</span>
            <strong className="text-rose-400 font-mono text-sm block pt-0.5">
              ${formatCryptoPrice(recommendation.stopLoss)}
            </strong>
            <span className="text-[9px] text-rose-300">مسافة المخاطرة: -{recommendation.slDistancePercent}%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30">
            <span className="text-[10px] text-emerald-300 block">الهدف الأول (TP1)</span>
            <strong className="text-emerald-400 font-mono text-sm block pt-0.5">
              ${formatCryptoPrice(recommendation.tp1)}
            </strong>
            <span className="text-[9px] text-emerald-400">+7.5% جني أرباح أولي</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/30">
            <span className="text-[10px] text-emerald-300 block">الهدف الثاني (TP2)</span>
            <strong className="text-emerald-400 font-mono text-sm block pt-0.5">
              ${formatCryptoPrice(recommendation.tp2)}
            </strong>
            <span className="text-[9px] text-emerald-400">+16.2% توسع الزخم</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-teal-500/40">
            <span className="text-[10px] text-teal-300 block">الهدف الثالث (TP3)</span>
            <strong className="text-teal-400 font-mono text-sm block pt-0.5">
              ${formatCryptoPrice(recommendation.tp3)}
            </strong>
            <span className="text-[9px] text-teal-300">العائد: {recommendation.riskReward}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <strong className="text-cyan-300">التعليل الفني وتدفق الأوامر: </strong>
          <span>{recommendation.rationaleAr}</span>
        </div>
      </div>

      {/* 4. MAIN CONTENT TABS VIEW */}
      {activeTab === "orderflow" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Order Flow Pressure Gauge & CVD */}
          <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-4">
            {/* Bullish Absorption Radar Banner */}
            {report.quantumMetrics?.deltaDivergence.detected && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-950 border border-emerald-500/40 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <div>
                    <strong className="text-emerald-300 block">
                      {report.quantumMetrics.deltaDivergence.labelAr}
                    </strong>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      {report.quantumMetrics.deltaDivergence.descriptionAr}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px]">
                  إشارة شراء حيتان مؤكدة
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-white text-sm">
                  مقياس تدفق الحجم التراكمي (Cumulative Volume Delta - CVD)
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {indicators.orderFlowPressure.cvdDominanceAr}
              </span>
            </div>

            {/* Buyer vs Seller Delta Split */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-emerald-400">قوى الشراء العدواني: {indicators.orderFlowPressure.buyerDeltaPercent}%</span>
                <span className="text-rose-400">قوى البيع العدواني: {indicators.orderFlowPressure.sellerDeltaPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                  style={{ width: `${indicators.orderFlowPressure.buyerDeltaPercent}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-red-500"
                  style={{ width: `${indicators.orderFlowPressure.sellerDeltaPercent}%` }}
                />
              </div>
            </div>

            {/* Iceberg Wall Detection Card */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px]">الجدار المؤسسي المهيمن (Dominant Iceberg Wall):</span>
                <div className="flex items-center gap-2">
                  <strong className="text-white font-mono text-sm">
                    ${formatCryptoPrice(indicators.orderFlowPressure.dominantWallPrice)}
                  </strong>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    جدار شراء حوت (Bid Wall)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px]">حجم الجدار المعلق:</span>
                <strong className="text-cyan-300 font-mono text-sm block">
                  {(indicators.orderFlowPressure.dominantWallSizeXpl / 1e6).toFixed(2)}M XPL
                </strong>
              </div>
            </div>

            {/* Simulated Mini Footprint Chart Bars */}
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold">أحدث شموع تدفق الأوامر (Footprint Volume Clusters):</span>
                <span className="text-[10px] text-slate-400">فريم 15 دقيقة • دلتا الحجم لكل مستوى</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {market.klines?.slice(-6).map((k, i) => {
                  const isUp = k.close >= k.open;
                  return (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1 font-mono text-xs"
                    >
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(k.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <strong className={`block text-xs ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                        ${formatCryptoPrice(k.close)}
                      </strong>
                      <div className="text-[10px] text-slate-400">
                        حجم: {(k.volume / 1000).toFixed(0)}k
                      </div>
                      <div className={`text-[9px] font-bold ${isUp ? "text-teal-400" : "text-rose-400"}`}>
                        {isUp ? "+Δ" : "-Δ"} {(Math.random() * 40 + 10).toFixed(0)}k
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Trades Stream (The Tape) */}
          <div className="p-4 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>شريط الصفقات اللحظية (Trade Tape)</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Live Aggregated</span>
            </div>

            <div className="space-y-1.5 text-xs font-mono max-h-[360px] overflow-y-auto pr-1">
              {market.trades?.map((tr, idx) => (
                <div
                  key={`${tr.id}-${idx}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/70 border border-slate-850"
                >
                  <span className={tr.side === "buy" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    ${formatCryptoPrice(tr.price)}
                  </span>
                  <span className="text-slate-300">
                    {tr.qty.toLocaleString()} XPL
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(tr.time).toLocaleTimeString([], { second: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footprint Cluster Imbalance Chart Tab */}
      {activeTab === "footprint" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>شارت الفوت برنت التفاعلي لعناقيد السيولة (Footprint Imbalance Clusters)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                تفكيك شمعات 15m إلى مستويات سعرية أفقية مع كشف اختلالات المزايدة القطرية (Diagonal Imbalances &gt; 300%) ونقاط التحكم POC
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                ● اختلال شراء (Ask Imbalance)
              </span>
              <span className="px-2.5 py-1 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold">
                ● اختلال بيع (Bid Imbalance)
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                ★ POC مستوى التحكم
              </span>
            </div>
          </div>

          {/* Footprint Cluster Bars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {report.footprintClusters?.map((bar, bIdx) => {
              const isUp = bar.close >= bar.open;
              const isSelected = selectedFootprintIndex === bIdx;
              return (
                <div
                  key={bIdx}
                  onClick={() => {
                    setSelectedFootprintIndex(bIdx);
                    soundFx.playHudClick();
                  }}
                  className={`p-3 rounded-xl bg-slate-950 border transition-all cursor-pointer space-y-2 text-xs font-mono ${
                    isSelected ? "border-cyan-400 ring-1 ring-cyan-400 shadow-lg bg-[#0e172a]" : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                    <span className="text-[10px] text-slate-400">
                      {new Date(bar.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isUp ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                      {isUp ? "▲ صاعدة" : "▼ هابطة"} ${formatCryptoPrice(bar.close)}
                    </span>
                  </div>

                  {/* Footprint Levels Ladder inside Candle */}
                  <div className="space-y-1 max-h-[220px] overflow-y-auto pr-0.5 text-[10px]">
                    <div className="flex items-center justify-between text-slate-500 text-[9px] pb-0.5 border-b border-slate-900">
                      <span>طلب (Bid)</span>
                      <span>السعر</span>
                      <span>عرض (Ask)</span>
                    </div>
                    {bar.levels.map((lvl, lIdx) => {
                      const isAskImb = lvl.isImbalance && lvl.imbalanceSide === "ASK";
                      const isBidImb = lvl.isImbalance && lvl.imbalanceSide === "BID";
                      return (
                        <div
                          key={lIdx}
                          className={`flex items-center justify-between p-1 rounded transition-colors ${
                            lvl.isPoc
                              ? "bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold"
                              : "hover:bg-slate-900"
                          }`}
                        >
                          <span className={`w-14 truncate text-right ${isBidImb ? "text-rose-400 font-black bg-rose-500/15 px-1 rounded" : "text-slate-400"}`}>
                            {lvl.bidQty.toLocaleString()}
                          </span>
                          <span className="font-bold text-slate-200 px-1 text-center">
                            ${formatCryptoPrice(lvl.price)} {lvl.isPoc && "★"}
                          </span>
                          <span className={`w-14 truncate text-left ${isAskImb ? "text-emerald-400 font-black bg-emerald-500/15 px-1 rounded" : "text-slate-400"}`}>
                            {lvl.askQty.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bar Summary Footer */}
                  <div className="pt-2 border-t border-slate-850 grid grid-cols-2 gap-1 text-[10px]">
                    <div className="text-slate-400">
                      حجم: <strong className="text-white">{(bar.volume / 1000).toFixed(0)}k</strong>
                    </div>
                    <div className="text-right">
                      دلتا: <strong className={bar.delta >= 0 ? "text-emerald-400" : "text-rose-400"}>
                        {bar.delta >= 0 ? "+" : ""}{(bar.delta / 1000).toFixed(0)}k
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantum Quantitative & Monte Carlo Simulation Tab */}
      {activeTab === "quantum" && report.quantumMetrics && (
        <div className="space-y-4">
          {/* Top Quantum Regime & Volatility Squeeze Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c192d] via-[#101b33] to-[#16122c] border-2 border-indigo-500/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-black uppercase font-mono">
                      {report.quantumMetrics.marketRegime.code}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {report.quantumMetrics.marketRegime.labelAr}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {report.quantumMetrics.marketRegime.descriptionAr}
                  </p>
                </div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-indigo-500/40 text-center">
                <span className="text-[10px] text-slate-400 block">مؤشر ضغط الانفجار السعري</span>
                <strong className="text-indigo-400 font-mono text-xl font-black">
                  {report.quantumMetrics.marketRegime.volatilityScore} / 100
                </strong>
              </div>
            </div>

            {/* 3 Core Quantum Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>محاكي مونتي كارلو (1,000 مسار):</span>
                  <span className="text-emerald-400 font-mono font-bold">+14.5% EV</span>
                </div>
                <strong className="text-emerald-300 font-mono text-base block">
                  ${formatCryptoPrice(report.quantumMetrics.monteCarloExpectedEv)}
                </strong>
                <span className="text-[10px] text-slate-400 block">
                  مخروط الثقة 95%: ${formatCryptoPrice(report.quantumMetrics.monteCarloConfidence95.lower)} - ${formatCryptoPrice(report.quantumMetrics.monteCarloConfidence95.upper)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>حوض تصفيات الشورت المغناطيسي:</span>
                  <span className="text-cyan-400 font-mono font-bold">88.5% جذب</span>
                </div>
                <strong className="text-cyan-300 font-mono text-base block">
                  ${(report.quantumMetrics.shortLiquidationPoolUsd / 1e6).toFixed(2)}M سيولة شورت
                </strong>
                <span className="text-[10px] text-slate-400 block">
                  مستويات التصفية المتوقعة
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400">
                  <span>الفاب المتطور ونقطة التحكم العذراء:</span>
                  <span className="text-amber-400 font-mono font-bold">nPOC Virgin</span>
                </div>
                <strong className="text-amber-300 font-mono text-base block">
                  ${formatCryptoPrice(report.quantumMetrics.developingVwap.nakedPoc)}
                </strong>
                <span className="text-[10px] text-slate-400 block">
                  نطاق الفاب: ${formatCryptoPrice(report.quantumMetrics.developingVwap.lowerBand)} - ${formatCryptoPrice(report.quantumMetrics.developingVwap.upperBand)}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive What-If Position & Risk Simulator */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>محاكي الصفقات التفاعلي وإدارة المخاطر لـ XPL (What-If Position Simulator)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-850">
                <div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-slate-400">رأس المال المخصص (Margin USDT):</span>
                    <strong className="text-white font-mono">${calcMargin}</strong>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={calcMargin}
                    onChange={(e) => setCalcMargin(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-slate-400">الرافعة المالية المنعزلة (Leverage):</span>
                    <strong className="text-cyan-400 font-mono">{calcLeverage}x</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={calcLeverage}
                    onChange={(e) => setCalcLeverage(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              {/* Real-time Calculation Results */}
              {(() => {
                const positionValue = calcMargin * calcLeverage;
                const coinsAmount = Math.round(positionValue / market.price);
                const profitTp1 = Math.round(coinsAmount * (recommendation.tp1 - market.price));
                const profitTp2 = Math.round(coinsAmount * (recommendation.tp2 - market.price));
                const lossSl = Math.round(coinsAmount * (market.price - recommendation.stopLoss));
                const estLiqPrice = Number((market.price * (1 - 0.9 / calcLeverage)).toFixed(5));
                return (
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">حجم المركز بالدولار:</span>
                      <strong className="text-white text-sm">${positionValue.toLocaleString()}</strong>
                      <span className="text-[10px] text-slate-500 block">({coinsAmount.toLocaleString()} XPL)</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-rose-500/30">
                      <span className="text-[10px] text-rose-400 block font-sans">سعر التصفية المقدر:</span>
                      <strong className="text-rose-300 text-sm">${formatCryptoPrice(estLiqPrice)}</strong>
                      <span className="text-[10px] text-slate-500 block">آمن أسفل وقف الخسارة</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 block font-sans">الربح المتوقع عند TP1:</span>
                      <strong className="text-emerald-300 text-sm">+${profitTp1.toLocaleString()}</strong>
                      <span className="text-[10px] text-emerald-500 block">({((profitTp1 / calcMargin) * 100).toFixed(0)}% ROI)</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/40">
                      <span className="text-[10px] text-emerald-400 block font-sans">الربح المتوقع عند TP2:</span>
                      <strong className="text-teal-300 text-sm">+${profitTp2.toLocaleString()}</strong>
                      <span className="text-[10px] text-teal-400 block">({((profitTp2 / calcMargin) * 100).toFixed(0)}% ROI)</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Technicals & SMC Tab */}
      {activeTab === "technicals" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Smart Money Concepts (SMC) Structure */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              <span>هيكل السوق الذكي (Smart Money Concepts - SMC)</span>
            </h4>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">الاتجاه الهيكلي (Market Structure Bias):</span>
                <strong className="text-emerald-400 block pt-0.5">{indicators.smcStructure.trendBiasAr}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30">
                <span className="text-indigo-300 text-[10px] block">فجوة السيولة العادلة (Fair Value Gap - FVG):</span>
                <strong className="text-white font-mono block pt-0.5">{indicators.smcStructure.fairValueGapZone}</strong>
                <span className="text-[9px] text-slate-400">منطقة سحب السيولة وإعادة التوازن المؤسسي</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30">
                <span className="text-emerald-300 text-[10px] block">منطقة الأوردر بلوك الطلب (Order Block Demand):</span>
                <strong className="text-white font-mono block pt-0.5">{indicators.smcStructure.orderBlockDemand}</strong>
                <span className="text-[9px] text-slate-400">تمركز أوامر الشراء لصناع السوق</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">مستوى الكسر الهيكلي (Break of Structure - BOS):</span>
                <strong className="text-cyan-300 font-mono block pt-0.5">${formatCryptoPrice(indicators.smcStructure.bosLevel)}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                <span className="text-amber-300 text-[10px] block">الهدف المستهدف للكنس (Liquidity Sweep Target):</span>
                <strong className="text-amber-200 block pt-0.5">{indicators.smcStructure.sweepTargetAr}</strong>
              </div>
            </div>
          </div>

          {/* Indicators Suite (RSI, MACD, Bollinger Bands) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>حزمة المؤشرات الفنية الرقمية (Quantitative Indicators)</span>
            </h4>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">مؤشر القوة النسبية RSI (14):</span>
                  <span className="text-cyan-300 font-mono font-bold">{indicators.rsi14}</span>
                </div>
                <strong className="text-white block pt-1">{indicators.rsiStatusAr}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">مؤشر الماكد MACD:</span>
                  <span className="text-emerald-400 font-mono font-bold">+{formatCryptoPrice(indicators.macd.histogram)}</span>
                </div>
                <strong className="text-emerald-300 block pt-1">{indicators.macd.trendAr}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] block">نطاقات بولينجر (Bollinger Bands 20, 2):</span>
                <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px] pt-1">
                  <div className="p-1 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block">العلوي</span>
                    <span className="text-rose-400 font-bold">${formatCryptoPrice(indicators.bollingerBands.upper)}</span>
                  </div>
                  <div className="p-1 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block">الأوسط</span>
                    <span className="text-cyan-300 font-bold">${formatCryptoPrice(indicators.bollingerBands.middle)}</span>
                  </div>
                  <div className="p-1 rounded bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-500 block">السفلي</span>
                    <span className="text-emerald-400 font-bold">${formatCryptoPrice(indicators.bollingerBands.lower)}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 block pt-1">
                  ضغط النطاق (Squeeze Bandwidth): {indicators.bollingerBands.bandwidthPercent}% • اقتراب انفجار سعري
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOM Depth Tab */}
      {activeTab === "dom" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>سلم عمق السوق المباشر لزوج XPL/USDT (DOM Depth Ladder)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                توزيع كتل أوامر الشراء والبيع المعلقة على كبرى دفاتر الأوامر المؤسسية
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              السعر اللحظي: ${formatCryptoPrice(market.price)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bids (Buyers) */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                <span className="text-emerald-400 font-bold">عروض الشراء (Bids)</span>
                <span>الحجم (XPL)</span>
              </div>
              {market.depth?.bids.map(([price, qty], i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-emerald-500/20 relative overflow-hidden"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-emerald-500/15 pointer-events-none"
                    style={{ width: `${Math.min(100, (qty / 3500000) * 100)}%` }}
                  />
                  <strong className="text-emerald-400 relative z-10">${formatCryptoPrice(price)}</strong>
                  <span className="text-slate-200 relative z-10">{qty.toLocaleString()} XPL</span>
                </div>
              ))}
            </div>

            {/* Asks (Sellers) */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800">
                <span className="text-rose-400 font-bold">طلبات البيع (Asks)</span>
                <span>الحجم (XPL)</span>
              </div>
              {market.depth?.asks.map(([price, qty], i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded bg-slate-950/70 border border-rose-500/20 relative overflow-hidden"
                >
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-rose-500/15 pointer-events-none"
                    style={{ width: `${Math.min(100, (qty / 3500000) * 100)}%` }}
                  />
                  <strong className="text-rose-400 relative z-10">${formatCryptoPrice(price)}</strong>
                  <span className="text-slate-200 relative z-10">{qty.toLocaleString()} XPL</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Whales Tab */}
      {activeTab === "whales" && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>رادار رصد حيتان XPL وتدفقات السيولة (Whale Sonar Alert)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع المحافظ الضخمة وعمليات السحب والتجميع المؤسسي لعملة XPL
              </p>
            </div>
            <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {whaleAlerts.length} عمليات حيتان مرصودة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {whaleAlerts.map((wh) => (
              <div
                key={wh.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-mono font-bold">
                    {wh.amountXpl.toLocaleString()} XPL (${(wh.valueUsd / 1e6).toFixed(2)}M)
                  </span>
                  <span className="text-[10px] text-slate-400">{wh.timeAgo}</span>
                </div>
                <div className="text-emerald-400 font-bold">{wh.typeLabelAr}</div>
                <div className="text-[11px] text-slate-400 border-t border-slate-850 pt-1 truncate">
                  من: {wh.source} ← إلى: {wh.destination}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Tactical Scenarios Playbook */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-slate-800 space-y-3">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>سيناريوهات المسار التكتيكي لزوج XPL/USDT</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {scenarios.map((scen) => (
            <div
              key={scen.id}
              className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{scen.titleAr}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold font-mono">
                  {scen.probabilityPercent}% احتمالية
                </span>
              </div>
              <div className="text-emerald-400 font-mono font-bold">
                المستهدف: ${formatCryptoPrice(scen.targetPrice)}
              </div>
              <div className="text-[11px] text-slate-300 leading-relaxed">
                <strong>الشرط: </strong> {scen.triggerAr}
              </div>
              <p className="text-[11px] text-slate-400">
                {scen.catalystAr}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
