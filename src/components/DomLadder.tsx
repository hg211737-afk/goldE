import React, { useState, useEffect, useMemo } from 'react';
import { MarketDepth } from '../types';
import {
  Layers,
  Zap,
  SlidersHorizontal,
  Flame,
  TrendingUp,
  TrendingDown,
  Info,
  Check,
} from 'lucide-react';

interface DomLadderProps {
  depth: MarketDepth;
  currentPrice: number;
  spread: number;
  imbalanceThreshold?: number;
  onThresholdChange?: (threshold: number) => void;
}

export const DomLadder: React.FC<DomLadderProps> = ({
  depth,
  currentPrice,
  spread,
  imbalanceThreshold = 3.0,
  onThresholdChange,
}) => {
  // User-defined imbalance ratio threshold (defaulting to prop or 3.0)
  const [localThreshold, setLocalThreshold] = useState<number>(imbalanceThreshold);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [highlightEnabled, setHighlightEnabled] = useState<boolean>(true);

  // Synchronize when prop changes
  useEffect(() => {
    if (imbalanceThreshold !== undefined && imbalanceThreshold !== localThreshold) {
      setLocalThreshold(imbalanceThreshold);
    }
  }, [imbalanceThreshold]);

  const handleUpdateThreshold = (val: number) => {
    const clamped = Math.max(1.5, Math.min(8.0, Number(val.toFixed(2))));
    setLocalThreshold(clamped);
    if (onThresholdChange) {
      onThresholdChange(clamped);
    }
  };

  const maxQty = depth.maxQty || 1;
  const displayAsks = useMemo(() => depth.asks.slice(0, 10), [depth.asks]);
  const displayBids = useMemo(() => depth.bids.slice(0, 10), [depth.bids]);

  // Calculate imbalance for Asks and Bids compared to equivalent depth levels
  const analyzedAsks = useMemo(() => {
    return displayAsks.map((ask, idx) => {
      const opposingBid = displayBids[idx];
      const opposingBidQty = opposingBid ? opposingBid.qty : 0.01;
      const ratio = ask.qty / Math.max(opposingBidQty, 0.05);
      const isImbalanced = highlightEnabled && ratio >= localThreshold && ask.qty >= 0.5;
      return {
        ...ask,
        originalIndex: idx,
        opposingBidQty,
        ratio,
        isImbalanced,
      };
    });
  }, [displayAsks, displayBids, highlightEnabled, localThreshold]);

  const analyzedBids = useMemo(() => {
    return displayBids.map((bid, idx) => {
      const opposingAsk = displayAsks[idx];
      const opposingAskQty = opposingAsk ? opposingAsk.qty : 0.01;
      const ratio = bid.qty / Math.max(opposingAskQty, 0.05);
      const isImbalanced = highlightEnabled && ratio >= localThreshold && bid.qty >= 0.5;
      return {
        ...bid,
        originalIndex: idx,
        opposingAskQty,
        ratio,
        isImbalanced,
      };
    });
  }, [displayBids, displayAsks, highlightEnabled, localThreshold]);

  // Aggregate stats
  const totalAskQty = useMemo(() => displayAsks.reduce((sum, a) => sum + a.qty, 0), [displayAsks]);
  const totalBidQty = useMemo(() => displayBids.reduce((sum, b) => sum + b.qty, 0), [displayBids]);
  const totalBookQty = totalAskQty + totalBidQty;
  const bidRatioPct = totalBookQty > 0 ? Math.round((totalBidQty / totalBookQty) * 100) : 50;
  const askRatioPct = 100 - bidRatioPct;

  const imbalancedAsksCount = analyzedAsks.filter((a) => a.isImbalanced).length;
  const imbalancedBidsCount = analyzedBids.filter((b) => b.isImbalanced).length;

  return (
    <div className="flex flex-col h-full bg-[#111622] rounded-xl border border-slate-800/80 overflow-hidden select-none">
      {/* Top Header */}
      <div className="px-3 py-2 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-slate-200 truncate">عمق الأوامر (DOM)</span>
          {highlightEnabled && (imbalancedBidsCount > 0 || imbalancedAsksCount > 0) && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] text-amber-300 font-mono font-bold">
              <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              {imbalancedBidsCount + imbalancedAsksCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Imbalance Threshold Config Trigger */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            title="تعديل عتبة اختلال الأوامر"
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
              showConfig || highlightEnabled
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>عتبة {localThreshold.toFixed(1)}x</span>
            <SlidersHorizontal className="w-2.5 h-2.5 opacity-70" />
          </button>

          {/* Spread Badge */}
          <div className="text-[10px] font-['JetBrains_Mono'] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            سبريد ${spread.toFixed(2)}
          </div>
        </div>
      </div>

      {/* User-Defined Imbalance Configuration Drawer */}
      {showConfig && (
        <div className="p-2.5 bg-slate-950/90 border-b border-amber-500/30 text-xs text-slate-200 animate-in slide-in-from-top duration-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-[11px] text-amber-200">
                عتبة اكتساح الأوامر (Order Imbalance Threshold)
              </span>
            </div>
            <button
              onClick={() => setHighlightEnabled(!highlightEnabled)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                highlightEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {highlightEnabled ? 'التمييز: مفعّل ✓' : 'التمييز: معطّل'}
            </button>
          </div>

          {/* Quick Preset Buttons & Step Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">النسب المسبقة:</span>
            {[2.0, 2.5, 3.0, 4.0, 5.0].map((preset) => (
              <button
                key={preset}
                onClick={() => handleUpdateThreshold(preset)}
                className={`flex-1 py-1 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  localThreshold === preset
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {preset.toFixed(1)}x
              </button>
            ))}
          </div>

          {/* Precision Slider & Fine Tuning */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={() => handleUpdateThreshold(localThreshold - 0.25)}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono font-bold text-slate-300 cursor-pointer"
              title="تقليل العتبة"
            >
              -0.25
            </button>
            <input
              type="range"
              min="1.5"
              max="6.0"
              step="0.25"
              value={localThreshold}
              onChange={(e) => handleUpdateThreshold(parseFloat(e.target.value))}
              className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <button
              onClick={() => handleUpdateThreshold(localThreshold + 0.25)}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-mono font-bold text-slate-300 cursor-pointer"
              title="زيادة العتبة"
            >
              +0.25
            </button>
            <span className="font-mono text-xs font-bold text-amber-400 w-12 text-center">
              {localThreshold.toFixed(2)}x
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-900/60 px-2 py-1 rounded border border-slate-800/80">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              ▲ {imbalancedBidsCount} مستوى شراء كاسح
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-bold">
              ▼ {imbalancedAsksCount} مستوى بيع كاسح
            </span>
          </div>
        </div>
      )}

      {/* Table Column Headers */}
      <div className="grid grid-cols-3 px-3 py-1 bg-slate-900/50 border-b border-slate-800/60 text-[10px] text-slate-400 font-semibold font-['Cairo'] text-center">
        <span>السعر ($)</span>
        <span>الكمية (Lots)</span>
        <span>العمق والضغط</span>
      </div>

      {/* Scrollable Ladder Area */}
      <div className="flex-1 overflow-y-auto font-['JetBrains_Mono'] text-xs divide-y divide-slate-800/30">
        {/* Asks (Sellers - descending order down towards current price) */}
        {analyzedAsks.reverse().map((ask) => {
          const depthPercent = Math.min(100, (ask.qty / maxQty) * 100);
          return (
            <div
              key={`ask-${ask.price}`}
              className={`relative grid grid-cols-3 px-3 py-1.5 items-center text-center transition-all ${
                ask.isImbalanced
                  ? 'bg-gradient-to-r from-rose-950/70 via-rose-900/40 to-transparent border-r-4 border-rose-500 shadow-[inset_0_0_12px_rgba(244,63,94,0.2)] font-bold'
                  : 'hover:bg-rose-500/10'
              }`}
            >
              {/* Volume Bar Fill */}
              <div
                className={`absolute inset-y-0 right-0 pointer-events-none transition-all ${
                  ask.isImbalanced
                    ? 'bg-gradient-to-l from-rose-500/30 to-rose-600/50'
                    : 'bg-rose-500/15'
                }`}
                style={{ width: `${depthPercent}%` }}
              />

              {/* Price Column */}
              <div className="relative z-10 flex items-center justify-center gap-1">
                <span className={`font-semibold ${ask.isImbalanced ? 'text-rose-300 underline decoration-rose-500/80 underline-offset-2' : 'text-rose-400'}`}>
                  ${ask.price.toFixed(2)}
                </span>
              </div>

              {/* Quantity Column */}
              <div className="relative z-10 flex items-center justify-center gap-1">
                <span className={ask.isImbalanced ? 'text-white font-black' : 'text-slate-200'}>
                  {ask.qty.toFixed(2)}
                </span>
              </div>

              {/* Depth / Imbalance Indicator Column */}
              <div className="relative z-10 flex items-center justify-center gap-1 text-[11px]">
                {ask.isImbalanced ? (
                  <span
                    title={`ضغط بيع عدواني: حجم العرض (${ask.qty.toFixed(1)}) يفوق الطلب المقابل (${ask.opposingBidQty.toFixed(1)}) بـ ${ask.ratio.toFixed(1)} أضعاف`}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-rose-900/90 text-rose-200 font-bold border border-rose-500/80 shadow-xs animate-pulse text-[10px]"
                  >
                    <Flame className="w-2.5 h-2.5 text-rose-400" />
                    <span>{ask.ratio.toFixed(1)}x بيع</span>
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">{ask.total.toFixed(1)}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Current Mid Price Spread Divider */}
        <div className="px-3 py-1.5 bg-amber-500/15 border-y border-amber-500/30 flex items-center justify-between text-xs font-bold text-amber-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span>السعر اللحظي:</span>
          </div>
          <span className="font-mono text-sm font-black text-amber-200">${currentPrice.toFixed(2)}</span>
        </div>

        {/* Bids (Buyers - descending order from current price downwards) */}
        {analyzedBids.map((bid) => {
          const depthPercent = Math.min(100, (bid.qty / maxQty) * 100);
          return (
            <div
              key={`bid-${bid.price}`}
              className={`relative grid grid-cols-3 px-3 py-1.5 items-center text-center transition-all ${
                bid.isImbalanced
                  ? 'bg-gradient-to-r from-emerald-950/70 via-emerald-900/40 to-transparent border-r-4 border-emerald-500 shadow-[inset_0_0_12px_rgba(16,185,129,0.2)] font-bold'
                  : 'hover:bg-emerald-500/10'
              }`}
            >
              {/* Volume Bar Fill */}
              <div
                className={`absolute inset-y-0 right-0 pointer-events-none transition-all ${
                  bid.isImbalanced
                    ? 'bg-gradient-to-l from-emerald-500/30 to-emerald-600/50'
                    : 'bg-emerald-500/15'
                }`}
                style={{ width: `${depthPercent}%` }}
              />

              {/* Price Column */}
              <div className="relative z-10 flex items-center justify-center gap-1">
                <span className={`font-semibold ${bid.isImbalanced ? 'text-emerald-300 underline decoration-emerald-500/80 underline-offset-2' : 'text-emerald-400'}`}>
                  ${bid.price.toFixed(2)}
                </span>
              </div>

              {/* Quantity Column */}
              <div className="relative z-10 flex items-center justify-center gap-1">
                <span className={bid.isImbalanced ? 'text-white font-black' : 'text-slate-200'}>
                  {bid.qty.toFixed(2)}
                </span>
              </div>

              {/* Depth / Imbalance Indicator Column */}
              <div className="relative z-10 flex items-center justify-center gap-1 text-[11px]">
                {bid.isImbalanced ? (
                  <span
                    title={`ضغط شراء عدواني: حجم الطلب (${bid.qty.toFixed(1)}) يفوق العرض المقابل (${bid.opposingAskQty.toFixed(1)}) بـ ${bid.ratio.toFixed(1)} أضعاف`}
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-900/90 text-emerald-200 font-bold border border-emerald-500/80 shadow-xs animate-pulse text-[10px]"
                  >
                    <Flame className="w-2.5 h-2.5 text-emerald-400" />
                    <span>{bid.ratio.toFixed(1)}x شراء</span>
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">{bid.total.toFixed(1)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Order Flow Pressure Gauge Footer */}
      <div className="p-2 bg-slate-900/95 border-t border-slate-800/90 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1 text-emerald-400 font-bold font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>طلب: {totalBidQty.toFixed(1)} ({bidRatioPct}%)</span>
          </div>
          <span className="text-slate-400 font-bold">
            {bidRatioPct >= 60 ? (
              <span className="text-emerald-400 flex items-center gap-0.5 font-['Cairo']">
                🔥 سيطرة المشترين
              </span>
            ) : askRatioPct >= 60 ? (
              <span className="text-rose-400 flex items-center gap-0.5 font-['Cairo']">
                ⚡ سيطرة البائعين
              </span>
            ) : (
              <span className="text-amber-400/80 font-['Cairo']">توازن نسبي</span>
            )}
          </span>
          <div className="flex items-center gap-1 text-rose-400 font-bold font-mono">
            <span>عرض: {totalAskQty.toFixed(1)} ({askRatioPct}%)</span>
            <TrendingDown className="w-3 h-3" />
          </div>
        </div>

        {/* Dual Color Pressure Progress Bar */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
            style={{ width: `${bidRatioPct}%` }}
          />
          <div
            className="h-full bg-gradient-to-l from-rose-600 to-rose-400 transition-all duration-300"
            style={{ width: `${askRatioPct}%` }}
          />
        </div>
      </div>
    </div>
  );
};
