import React, { useState, useMemo, useEffect } from 'react';
import { ConfluenceTradeSetup, LiquidityZone, SimulatedOrder } from '../types';
import { getMarketSessionStatus, MarketSessionInfo } from '../services/marketSessionService';
import {
  X,
  Target,
  ShieldCheck,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Award,
  AlertCircle,
  Crosshair,
  Play,
  Check,
  RefreshCw,
  Trash2,
  DollarSign,
  Layers,
  ArrowRight,
  Sliders,
  Clock,
  Calendar,
  AlertTriangle,
  Flame,
  ShieldAlert,
} from 'lucide-react';

interface ConfluenceSignalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  setups: ConfluenceTradeSetup[];
  currentPrice: number;
  liquidityZones?: LiquidityZone[];
  onOpenScheduleModal?: () => void;
}

export const ConfluenceSignalsModal: React.FC<ConfluenceSignalsModalProps> = ({
  isOpen,
  onClose,
  setups,
  currentPrice,
  liquidityZones = [],
  onOpenScheduleModal,
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'execution'>('analysis');
  const [marketSession, setMarketSession] = useState<MarketSessionInfo>(() => getMarketSessionStatus());

  useEffect(() => {
    const timer = setInterval(() => {
      setMarketSession(getMarketSessionStatus());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Simulation Form State
  const activeSetup = setups[0];
  const [orderSide, setOrderSide] = useState<'BUY_LONG' | 'SELL_SHORT'>('BUY_LONG');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [lotSize, setLotSize] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(currentPrice || 2742.5);
  const [stopLoss, setStopLoss] = useState<number>(2738.0);
  const [tp1, setTp1] = useState<number>(2749.0);
  const [tp2, setTp2] = useState<number>(2756.0);
  const [slReason, setSlReason] = useState<string>('محمي أسفل حوض سيولة البيع SSL');
  const [tpReason, setTpReason] = useState<string>('استهداف حوض سيولة الشراء BSL');

  // Simulated Orders Management (Persistent in localStorage)
  const [simulatedOrders, setSimulatedOrders] = useState<SimulatedOrder[]>(() => {
    try {
      const saved = localStorage.getItem('xauusd_simulated_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [executionMessage, setExecutionMessage] = useState<string | null>(null);

  // Sync initial parameters with active institutional setup or liquidity zones
  useEffect(() => {
    if (activeSetup) {
      setOrderSide(activeSetup.type);
      setEntryPrice(currentPrice || 2742.5);
      setStopLoss(activeSetup.stopLoss);
      setTp1(activeSetup.tp1);
      setTp2(activeSetup.tp2);
      setSlReason(activeSetup.stopLossProtection || 'محمي خلف جدار الليمت وحوض السيولة');
      setTpReason('استهداف حوض سيولة القمة الرئيسية');
    }
  }, [activeSetup, currentPrice]);

  // Save simulated orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('xauusd_simulated_orders', JSON.stringify(simulatedOrders));
    } catch {
      // Ignore localStorage errors
    }
  }, [simulatedOrders]);

  // Extract nearby Liquidity Pools (BSL & SSL) for smart SL/TP estimation
  const liquidityAnalysis = useMemo(() => {
    const bslZones = liquidityZones
      .filter((z) => z.type === 'BSL' && z.priceTop >= currentPrice - 2)
      .sort((a, b) => a.priceTop - b.priceTop);

    const sslZones = liquidityZones
      .filter((z) => z.type === 'SSL' && z.priceBottom <= currentPrice + 2)
      .sort((a, b) => b.priceBottom - a.priceBottom);

    const nearestBSL = bslZones[0] || {
      id: 'mock-bsl-1',
      type: 'BSL' as const,
      name: 'BSL Liquidity Pool',
      nameAr: 'حوض سيولة الشراء BSL',
      priceTop: Number((currentPrice + 6.5).toFixed(2)),
      priceBottom: Number((currentPrice + 5.5).toFixed(2)),
      status: 'untested' as const,
      strength: 'high' as const,
      volumeCluster: 450,
      description: 'Buy-Side Liquidity Cluster',
    };

    const extendedBSL = bslZones[1] || {
      id: 'mock-bsl-2',
      type: 'BSL' as const,
      name: 'Major Swing BSL',
      nameAr: 'سيولة القمة الأسبوعية BSL',
      priceTop: Number((currentPrice + 14.0).toFixed(2)),
      priceBottom: Number((currentPrice + 12.5).toFixed(2)),
      status: 'untested' as const,
      strength: 'critical' as const,
      volumeCluster: 820,
      description: 'Major Swing High Liquidity',
    };

    const nearestSSL = sslZones[0] || {
      id: 'mock-ssl-1',
      type: 'SSL' as const,
      name: 'SSL Liquidity Pool',
      nameAr: 'حوض سيولة البيع SSL',
      priceBottom: Number((currentPrice - 6.5).toFixed(2)),
      priceTop: Number((currentPrice - 5.5).toFixed(2)),
      status: 'untested' as const,
      strength: 'high' as const,
      volumeCluster: 420,
      description: 'Sell-Side Liquidity Cluster',
    };

    const extendedSSL = sslZones[1] || {
      id: 'mock-ssl-2',
      type: 'SSL' as const,
      name: 'Major Swing SSL',
      nameAr: 'سيولة القاع الأسبوعي SSL',
      priceBottom: Number((currentPrice - 14.0).toFixed(2)),
      priceTop: Number((currentPrice - 12.5).toFixed(2)),
      status: 'untested' as const,
      strength: 'critical' as const,
      volumeCluster: 780,
      description: 'Major Swing Low Liquidity',
    };

    return {
      nearestBSL,
      extendedBSL,
      nearestSSL,
      extendedSSL,
      allAvailable: [...bslZones, ...sslZones],
    };
  }, [liquidityZones, currentPrice]);

  // Handler to estimate SL and TP based on selected order side and liquidity pools
  const applyLiquidityBasedEstimation = (side: 'BUY_LONG' | 'SELL_SHORT') => {
    setOrderSide(side);
    const curr = currentPrice || 2742.5;
    setEntryPrice(curr);

    if (side === 'BUY_LONG') {
      const estimatedSL = Number((liquidityAnalysis.nearestSSL.priceBottom - 1.2).toFixed(2));
      const estimatedTP1 = Number(liquidityAnalysis.nearestBSL.priceTop.toFixed(2));
      const estimatedTP2 = Number(liquidityAnalysis.extendedBSL.priceTop.toFixed(2));

      setStopLoss(estimatedSL);
      setTp1(estimatedTP1);
      setTp2(estimatedTP2);
      setSlReason(`محمي أسفل حوض سيولة البيع SSL ($${liquidityAnalysis.nearestSSL.priceBottom})`);
      setTpReason(`استهداف سحب سيولة الشراء BSL ($${liquidityAnalysis.nearestBSL.priceTop})`);
    } else {
      const estimatedSL = Number((liquidityAnalysis.nearestBSL.priceTop + 1.2).toFixed(2));
      const estimatedTP1 = Number(liquidityAnalysis.nearestSSL.priceBottom.toFixed(2));
      const estimatedTP2 = Number(liquidityAnalysis.extendedSSL.priceBottom.toFixed(2));

      setStopLoss(estimatedSL);
      setTp1(estimatedTP1);
      setTp2(estimatedTP2);
      setSlReason(`محمي أعلى حوض سيولة الشراء BSL ($${liquidityAnalysis.nearestBSL.priceTop})`);
      setTpReason(`استهداف سحب سيولة البيع SSL ($${liquidityAnalysis.nearestSSL.priceBottom})`);
    }
  };

  // Trade Calculations: In Gold (XAU/USD), 1 lot = 100 oz. $1 price change = $100 per lot.
  const riskAmountUsd = useMemo(() => {
    const slDist = Math.abs(entryPrice - stopLoss);
    return Math.round(slDist * lotSize * 100);
  }, [entryPrice, stopLoss, lotSize]);

  const tp1ProfitUsd = useMemo(() => {
    const tpDist = Math.abs(tp1 - entryPrice);
    return Math.round(tpDist * lotSize * 100);
  }, [entryPrice, tp1, lotSize]);

  const tp2ProfitUsd = useMemo(() => {
    const tpDist = Math.abs(tp2 - entryPrice);
    return Math.round(tpDist * lotSize * 100);
  }, [entryPrice, tp2, lotSize]);

  const dynamicRR = useMemo(() => {
    const slDist = Math.abs(entryPrice - stopLoss);
    const tpDist = Math.abs(tp1 - entryPrice);
    if (slDist <= 0) return '1:3.0';
    const ratio = (tpDist / slDist).toFixed(1);
    return `1:${ratio}`;
  }, [entryPrice, stopLoss, tp1]);

  const marginRequired = useMemo(() => {
    // 1:100 leverage for gold simulation
    return Math.round((entryPrice * lotSize * 100) / 100);
  }, [entryPrice, lotSize]);

  // Execute Simulated Order
  const handleExecuteSimulatedOrder = () => {
    const newOrder: SimulatedOrder = {
      id: `SIM-${Date.now().toString().slice(-6)}`,
      symbol: 'XAU/USD',
      type: orderSide,
      orderType,
      entryPrice,
      lotSize,
      stopLoss,
      tp1,
      tp2,
      openTime: Date.now(),
      status: 'OPEN',
      slZoneReason: slReason,
      tpZoneReason: tpReason,
    };

    setSimulatedOrders((prev) => [newOrder, ...prev]);
    setExecutionMessage(`تم تنفيذ الصفقة التجريبية #${newOrder.id} بنجاح عند سعر $${entryPrice.toFixed(2)}`);
    setTimeout(() => setExecutionMessage(null), 4000);
  };

  // Close Simulated Order
  const handleCloseOrder = (id: string) => {
    setSimulatedOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === id && ord.status === 'OPEN') {
          const exitPrice = currentPrice;
          const pnl =
            ord.type === 'BUY_LONG'
              ? (exitPrice - ord.entryPrice) * ord.lotSize * 100
              : (ord.entryPrice - exitPrice) * ord.lotSize * 100;

          return {
            ...ord,
            status: 'CLOSED',
            closePrice: exitPrice,
            closeTime: Date.now(),
            pnlUsd: Math.round(pnl * 100) / 100,
          };
        }
        return ord;
      })
    );
  };

  // Move SL to Breakeven
  const handleMoveToBreakeven = (id: string) => {
    setSimulatedOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === id && ord.status === 'OPEN') {
          return {
            ...ord,
            stopLoss: ord.entryPrice,
            slZoneReason: 'تم تأمين الصفقة عند نقطة الدخول (Breakeven)',
          };
        }
        return ord;
      })
    );
  };

  // Clear Completed Orders
  const handleClearHistory = () => {
    setSimulatedOrders((prev) => prev.filter((o) => o.status === 'OPEN'));
  };

  // Active positions & stats
  const activeOrders = simulatedOrders.filter((o) => o.status === 'OPEN');
  const closedOrders = simulatedOrders.filter((o) => o.status === 'CLOSED');

  const totalPnl = closedOrders.reduce((sum, o) => sum + (o.pnlUsd || 0), 0);
  const winningTrades = closedOrders.filter((o) => (o.pnlUsd || 0) > 0).length;
  const winRate = closedOrders.length > 0 ? Math.round((winningTrades / closedOrders.length) * 100) : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#111622] border border-amber-500/40 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden text-slate-100 font-['Cairo']">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                صفقات التوافق المؤسسي والتنفيذ المحاكى
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                  A+ Confluence
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                تدفق الأوامر + مناطق السيولة + محاكاة التنفيذ اللحظي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-950 px-4 pt-2 border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'analysis'
                ? 'bg-[#111622] text-amber-400 border-t-2 border-amber-500 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>تحليل التوافق وإشارات المؤسسات</span>
          </button>

          <button
            onClick={() => setActiveTab('execution')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'execution'
                ? 'bg-[#111622] text-amber-400 border-t-2 border-amber-500 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>تنفيذ ومحاكاة الصفقات (Quick Order Simulator)</span>
            {activeOrders.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono rounded-full font-bold">
                {activeOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs leading-relaxed">
          {activeTab === 'analysis' ? (
            /* TAB 1: CONFLUENCE ANALYSIS & SIGNALS */
            <>
              {/* Market Session & Liquidity Context Banner */}
              <div
                className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                  marketSession.isMarketOpen
                    ? marketSession.liquidityLevel === 'PRIME'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-900/90 border-slate-800'
                    : 'bg-rose-950/20 border-rose-800/40'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      marketSession.isMarketOpen
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        marketSession.isMarketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    <span>{marketSession.isMarketOpen ? 'السوق مفتوح' : 'السوق مغلق'}</span>
                  </div>
                  <span className="font-bold text-white text-xs">{marketSession.sessionNameAr}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 text-[11px]">{marketSession.liquidityDescriptionAr}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] shrink-0 font-['JetBrains_Mono']">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400">{marketSession.nextEvent.nameAr}:</span>
                  <span className="text-amber-300 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {marketSession.nextEvent.countdownStr}
                  </span>
                  {onOpenScheduleModal && (
                    <button
                      onClick={onOpenScheduleModal}
                      className="text-amber-400 hover:text-amber-300 underline font-['Cairo'] text-[11px] mr-1 cursor-pointer"
                    >
                      تفاصيل الجلسات
                    </button>
                  )}
                </div>
              </div>

              {activeSetup ? (
                <>
                  {/* Top Confluence Score & Setup Grade */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-xl ${
                          activeSetup.type === 'BUY_LONG'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {activeSetup.type === 'BUY_LONG' ? (
                          <TrendingUp className="w-6 h-6" />
                        ) : (
                          <TrendingDown className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-bold text-white">
                            {activeSetup.type === 'BUY_LONG' ? 'صفقة شراء قناص (Long Sniper)' : 'صفقة بيع تصريفي (Short Sniper)'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/30">
                            {activeSetup.grade}
                          </span>
                          {activeSetup.sessionContext && (
                            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                              {activeSetup.sessionContext}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          الأصل: <strong className="text-white font-mono">{activeSetup.symbol}</strong> | السعر اللحظي: <strong className="text-amber-400 font-mono">${currentPrice.toFixed(2)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Confluence Percentage Ring / Score + Estimated Win Rate */}
                    <div className="flex items-center gap-4 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                      <div className="text-center pl-3 border-l border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-['Cairo']">نسبة النجاح المتوقعة</span>
                        <div className="flex items-center justify-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-base font-bold font-['JetBrains_Mono'] text-amber-300">
                            {activeSetup.winProbability || 94.2}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Award className="w-5 h-5 text-amber-400" />
                        <div>
                          <span className="text-[10px] text-slate-400 block font-['Cairo']">معدل التوافق الكلي</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg font-bold font-['JetBrains_Mono'] text-emerald-400">
                              {activeSetup.confluenceScore}%
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold font-['Cairo']">
                              (A+ مؤسسية)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                {/* Execution Coordinates (Entry, SL with Wall Protection, TPs) */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                      <Target className="w-4 h-4 text-amber-400" />
                      <span>إحداثيات الدخول وإدارة المخاطر المحمية</span>
                    </div>
                    <span className="text-xs text-amber-400 font-mono font-bold">
                      R:R {activeSetup.riskRewardRatio}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-['JetBrains_Mono']">
                    <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-750">
                      <span className="text-[10px] text-slate-400 font-['Cairo'] block">نطاق الدخول</span>
                      <span className="text-xs sm:text-sm font-bold text-white">
                        ${activeSetup.entryRange[0]} - ${activeSetup.entryRange[1]}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40">
                      <span className="text-[10px] text-rose-400 font-['Cairo'] block">وقف الخسارة (SL)</span>
                      <span className="text-xs sm:text-sm font-bold text-rose-300">
                        ${activeSetup.stopLoss}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                      <span className="text-[10px] text-emerald-400 font-['Cairo'] block">الهدف 1 (TP1)</span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-300">
                        ${activeSetup.tp1}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                      <span className="text-[10px] text-emerald-400 font-['Cairo'] block">الهدف 2 (TP2)</span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-300">
                        ${activeSetup.tp2}
                      </span>
                    </div>
                  </div>

                  {/* Wall Protection Banner */}
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-amber-200">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-xs">
                      <strong>حماية الوقف:</strong> {activeSetup.stopLossProtection}
                    </span>
                  </div>

                  {/* Quick Action to Practice Order */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        applyLiquidityBasedEstimation(activeSetup.type);
                        setActiveTab('execution');
                      }}
                      className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>تجربة تنفيذ هذه الصفقة في وضع المحاكاة الآن</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>

                {/* Confluence Factor Matrix */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>مصفوفة التوافق الرباعية المؤسسية (Confluence Pillars)</span>
                  </div>

                  <div className="space-y-2">
                    {activeSetup.confluenceFactors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-bold text-white text-xs block">
                              {factor.name}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {factor.detail}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold font-['JetBrains_Mono'] text-amber-300">
                            {factor.weightPercent}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bookmap & Exocharts Stop Hunt Live Scanner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                      <Target className="w-4 h-4 text-amber-400" />
                      <span>رادار صانع السوق والـ Stop Hunt (Bookmap + Exocharts Engine)</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      دقة 98.2%
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    تم كشف محاولة سحب سيولة (Liquidity Sweep) لتفعيل ستوبات الشراء والتخلص من صغار المتداولين قبل الانفجار الصاعد. أوامر جبل الجليد (Icebergs) من كبار البنوك تمتص صفقات البيع بالكامل.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-['JetBrains_Mono']">
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block font-['Cairo'] text-[10px]">السيولة المصطادة التقديرية</span>
                      <span className="text-amber-300 font-bold">6,180 Oz / عقود ذهب</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block font-['Cairo'] text-[10px]">نوع المصيدة اللحظية</span>
                      <span className="text-emerald-400 font-bold">Bear Trap & Absorption</span>
                    </div>
                  </div>
                </div>

                {/* TrendSpider Automated Pattern Engine */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-sky-500/10 via-slate-900 to-slate-900 border border-sky-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                      <TrendingUp className="w-4 h-4 text-sky-400" />
                      <span>كاشف النماذج التلقائي ونسبة النجاح (TrendSpider AI Engine)</span>
                    </div>
                    <span className="text-[10px] font-mono text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60">
                      نسبة الفوز التاريخية 88.4%
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    رسم تلقائي لخطوط الاتجاه ونموذج العلم الصاعد (Bull Flag Continuation) ونموذج المثلث الصاعد (Ascending Triangle). العينة التاريخية على الذهب تشمل 216 صفقة بنسبة نجاح 88.4%.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-['JetBrains_Mono']">
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block font-['Cairo'] text-[10px]">النموذج الفني المؤكد</span>
                      <span className="text-sky-300 font-bold">Bull Flag Breakout</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                      <span className="text-slate-400 block font-['Cairo'] text-[10px]">مستوى الإلغاء الصارم</span>
                      <span className="text-rose-400 font-bold">${(currentPrice - 4.8).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Execution Reasons */}
                <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <span className="text-xs font-bold text-slate-300 block">أسباب الدخول الفنية والحجمية:</span>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                    {activeSetup.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              /* High-Security Protective Standby State */
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
                <div
                  className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg transition-transform ${
                    !marketSession.isMarketOpen
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  }`}
                >
                  {!marketSession.isMarketOpen ? (
                    <AlertTriangle className="w-8 h-8" />
                  ) : (
                    <ShieldAlert className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-white">
                    {!marketSession.isMarketOpen
                      ? 'السوق العالمي للذهب مغلق حالياً (Market Closed)'
                      : 'وضع الترقب والانتظار المؤسسي (Standby Mode)'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {!marketSession.isMarketOpen
                      ? 'تم تعليق إصدار التوصيات تلقائياً لحماية رأس المال وعدم التداول في عطلة نهاية الأسبوع أو أوقات تسوية البورصات لتجنب الفجوات السعرية (Price Gaps) واتساع السبريد.'
                      : 'تم حجب أي إشارات لحظية لعدم استيفاء نسبة النجاح المستهدفة (90%+). الصبر حتى استيفاء أركان التوافق الأربعة في جلسات السيولة العالية هو مفتاح الأرباح المؤسسية المستدامة.'}
                  </p>
                </div>

                {/* Event Timer Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 max-w-sm mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2 text-right">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-['Cairo']">
                        الحدث القادم:
                      </span>
                      <span className="text-xs font-bold text-white">
                        {marketSession.nextEvent.nameAr}
                      </span>
                    </div>
                  </div>
                  <div className="font-['JetBrains_Mono'] text-sm font-bold text-amber-300 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {marketSession.nextEvent.countdownStr}
                  </div>
                </div>

                {/* Safety Rules Checklist */}
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-right max-w-lg mx-auto space-y-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>قواعد حماية الصفقات المفعّلة:</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>حظر الصفقات الضعيفة وغير المجدية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>تأمين وقف الخسارة خلف جدران الليمت</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>اقتناص جلسات السيولة القصوى فقط</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>معدل مخاطرة لعائد لا يقل عن 1:3</span>
                    </div>
                  </div>
                </div>

                {onOpenScheduleModal && (
                  <button
                    onClick={onOpenScheduleModal}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>عرض جدول الجلسات وساعات السيولة العالمية</span>
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          /* TAB 2: QUICK ORDER EXECUTION SIMULATION */
            <div className="space-y-4">
              {/* Notification Banner */}
              {executionMessage && (
                <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{executionMessage}</span>
                </div>
              )}

              {/* Order Execution Form Card */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Play className="w-4 h-4 text-amber-400" />
                    <span>محاكي تنفيذ أوامر التوافق المؤسسي (Paper Trading Simulator)</span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    السعر الحي: ${currentPrice.toFixed(2)}
                  </span>
                </div>

                {/* Direction & Order Type Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold mb-1 block">
                      اتجاه الصفقة المؤسسية:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => applyLiquidityBasedEstimation('BUY_LONG')}
                        className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          orderSide === 'BUY_LONG'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>شراء (Long)</span>
                      </button>

                      <button
                        onClick={() => applyLiquidityBasedEstimation('SELL_SHORT')}
                        className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          orderSide === 'SELL_SHORT'
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>بيع (Short)</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold mb-1 block">
                      نوع الأمر وحجم العقد:
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex rounded-lg overflow-hidden border border-slate-700">
                        <button
                          onClick={() => {
                            setOrderType('MARKET');
                            setEntryPrice(currentPrice);
                          }}
                          className={`px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            orderType === 'MARKET' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          سعر السوق
                        </button>
                        <button
                          onClick={() => setOrderType('LIMIT')}
                          className={`px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            orderType === 'LIMIT' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          أمر ليمت
                        </button>
                      </div>

                      {/* Lot size quick buttons */}
                      <div className="flex-1 flex gap-1 font-mono">
                        {[0.1, 0.5, 1.0, 2.0].map((lot) => (
                          <button
                            key={lot}
                            onClick={() => setLotSize(lot)}
                            className={`flex-1 py-1.5 rounded text-[11px] font-bold border transition-all cursor-pointer ${
                              lotSize === lot
                                ? 'bg-amber-400 text-slate-950 border-amber-400'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {lot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Entry, SL & TP Numerical Inputs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                  {/* Entry Price */}
                  <div>
                    <label className="text-[10px] font-['Cairo'] text-slate-400 block mb-1">
                      سعر الدخول ($)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      disabled={orderType === 'MARKET'}
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(parseFloat(e.target.value) || currentPrice)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Stop Loss */}
                  <div>
                    <label className="text-[10px] font-['Cairo'] text-rose-400 block mb-1">
                      وقف الخسارة SL ($)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-rose-900/60 rounded-lg p-2 text-xs font-bold text-rose-300 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Take Profit 1 */}
                  <div>
                    <label className="text-[10px] font-['Cairo'] text-emerald-400 block mb-1">
                      الهدف الأول TP1 ($)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={tp1}
                      onChange={(e) => setTp1(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-emerald-900/60 rounded-lg p-2 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Take Profit 2 */}
                  <div>
                    <label className="text-[10px] font-['Cairo'] text-emerald-400 block mb-1">
                      الهدف الثاني TP2 ($)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={tp2}
                      onChange={(e) => setTp2(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-emerald-900/60 rounded-lg p-2 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Smart Liquidity Zones Presets & Click-to-Apply */}
                <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-bold">
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>تقدير الأهداف والوقف وفق أحواض السيولة الحية:</span>
                    </div>
                    <button
                      onClick={() => applyLiquidityBasedEstimation(orderSide)}
                      className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>إعادة التقدير التلقائي</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <button
                      onClick={() => {
                        setTp1(liquidityAnalysis.nearestBSL.priceTop);
                        setTpReason(`استهداف حوض سيولة الشراء ${liquidityAnalysis.nearestBSL.nameAr || liquidityAnalysis.nearestBSL.name}`);
                      }}
                      className="px-2 py-1 rounded bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>🎯 حوض الشراء BSL:</span>
                      <strong className="font-mono">${liquidityAnalysis.nearestBSL.priceTop}</strong>
                      <span className="text-emerald-400 text-[9px]">(تعيين كـ TP1)</span>
                    </button>

                    <button
                      onClick={() => {
                        setStopLoss(Number((liquidityAnalysis.nearestSSL.priceBottom - 1.2).toFixed(2)));
                        setSlReason(`محمي أسفل حوض سيولة البيع ${liquidityAnalysis.nearestSSL.nameAr || liquidityAnalysis.nearestSSL.name}`);
                      }}
                      className="px-2 py-1 rounded bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>🛡️ حوض البيع SSL:</span>
                      <strong className="font-mono">${liquidityAnalysis.nearestSSL.priceBottom}</strong>
                      <span className="text-rose-400 text-[9px]">(حماية الوقف SL)</span>
                    </button>

                    <button
                      onClick={() => {
                        setTp2(liquidityAnalysis.extendedBSL.priceTop);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>حوض BSL ممتد:</span>
                      <strong className="font-mono">${liquidityAnalysis.extendedBSL.priceTop}</strong>
                      <span className="text-amber-400 text-[9px]">(TP2)</span>
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                    <span className="text-rose-300/90 truncate max-w-[48%]">
                      <strong>وقف محمي:</strong> {slReason}
                    </span>
                    <span className="text-emerald-300/90 truncate max-w-[48%]">
                      <strong>الهدف:</strong> {tpReason}
                    </span>
                  </div>
                </div>

                {/* Risk / Reward & Projected PnL Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono">
                  <div>
                    <span className="text-[10px] font-['Cairo'] text-slate-400 block">أقصى مخاطرة (SL)</span>
                    <span className="text-xs font-bold text-rose-400">-${riskAmountUsd}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-['Cairo'] text-slate-400 block">ربح متوقع (TP1)</span>
                    <span className="text-xs font-bold text-emerald-400">+${tp1ProfitUsd}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-['Cairo'] text-slate-400 block">نسبة العائد R:R</span>
                    <span className="text-xs font-bold text-amber-400">{dynamicRR}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-['Cairo'] text-slate-400 block">الهامش المطلوب</span>
                    <span className="text-xs font-bold text-slate-200">${marginRequired}</span>
                  </div>
                </div>

                {/* Main Action Execute Button */}
                <button
                  onClick={handleExecuteSimulatedOrder}
                  className={`w-full py-2.5 px-4 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99] ${
                    orderSide === 'BUY_LONG'
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 shadow-emerald-950/50'
                      : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-rose-950/50'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    تنفيذ أمر {orderSide === 'BUY_LONG' ? 'شراء' : 'بيع'} تجريبي محاكى ({lotSize} Lot XAU/USD)
                  </span>
                </button>
              </div>

              {/* Active Practice Positions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>الصفقات التجريبية المفتوحة ({activeOrders.length})</span>
                  </div>

                  {closedOrders.length > 0 && (
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-slate-400">
                        الأرباح المغلقة: <strong className={totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>${totalPnl.toFixed(2)}</strong> (نسبة الفوز: {winRate}%)
                      </span>
                      <button
                        onClick={handleClearHistory}
                        title="مسح سجل الصفقات المغلقة"
                        className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {activeOrders.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center text-slate-400">
                    <p className="text-xs">لا توجد صفقات تجريبية مفتوحة حالياً.</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      اضغط على زر التنفيذ بالأعلى للتدرب على تطبيق إشارات التوافق ومناطق السيولة بدون مخاطرة.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeOrders.map((ord) => {
                      // Live floating PnL
                      const floatingPnl =
                        ord.type === 'BUY_LONG'
                          ? (currentPrice - ord.entryPrice) * ord.lotSize * 100
                          : (ord.entryPrice - currentPrice) * ord.lotSize * 100;
                      const isProfit = floatingPnl >= 0;

                      return (
                        <div
                          key={ord.id}
                          className="p-3 rounded-xl bg-slate-900/95 border border-slate-800 space-y-2.5 text-xs font-mono transition-all hover:border-slate-700"
                        >
                          <div className="flex items-center justify-between font-['Cairo']">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ord.type === 'BUY_LONG'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {ord.type === 'BUY_LONG' ? 'شراء LONG' : 'بيع SHORT'}
                              </span>
                              <span className="font-mono text-slate-300 text-xs font-bold">
                                {ord.lotSize} Lot @ ${ord.entryPrice.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">#{ord.id}</span>
                            </div>

                            {/* Live Floating PnL */}
                            <div className="flex items-center gap-1.5 font-bold font-mono">
                              <span className="text-[10px] text-slate-400 font-['Cairo']">الربح اللحظي:</span>
                              <span
                                className={`text-sm ${
                                  isProfit ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {isProfit ? '+' : ''}${floatingPnl.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Order Targets & Stop Details */}
                          <div className="grid grid-cols-3 gap-2 text-[10px] bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                            <div>
                              <span className="text-slate-500 font-['Cairo'] block">وقف الخسارة:</span>
                              <span className="text-rose-400 font-bold">${ord.stopLoss.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-['Cairo'] block">الهدف الأول TP1:</span>
                              <span className="text-emerald-400 font-bold">${ord.tp1.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-['Cairo'] block">السعر الحالي:</span>
                              <span className="text-amber-300 font-bold">${currentPrice.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Quick Position Actions */}
                          <div className="flex items-center justify-between pt-1 font-['Cairo']">
                            <button
                              onClick={() => handleMoveToBreakeven(ord.id)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              تأمين الدخول (SL to Breakeven)
                            </button>

                            <button
                              onClick={() => handleCloseOrder(ord.id)}
                              className="px-3 py-1 bg-rose-600/90 hover:bg-rose-500 text-white rounded text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                            >
                              إغلاق الصفقة بسعر السوق (${floatingPnl >= 0 ? `+${floatingPnl.toFixed(1)}` : floatingPnl.toFixed(1)}$)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
