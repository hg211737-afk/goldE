import React from 'react';
import { MarketDepth } from '../types';
import { Layers } from 'lucide-react';

interface DomLadderProps {
  depth: MarketDepth;
  currentPrice: number;
  spread: number;
}

export const DomLadder: React.FC<DomLadderProps> = ({ depth, currentPrice, spread }) => {
  const maxQty = depth.maxQty || 1;

  return (
    <div className="flex flex-col h-full bg-[#111622] rounded-xl border border-slate-800/80 overflow-hidden select-none">
      {/* Header */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>عمق الأوامر (DOM Ladder)</span>
        </div>
        <div className="text-[11px] font-['JetBrains_Mono'] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
          سبريد: ${spread.toFixed(2)}
        </div>
      </div>

      {/* Table Column Headers */}
      <div className="grid grid-cols-3 px-3 py-1 bg-slate-900/50 border-b border-slate-800/60 text-[10px] text-slate-400 font-semibold font-['Cairo'] text-center">
        <span>السعر ($)</span>
        <span>الكمية (Lots)</span>
        <span>العمق التراكمي</span>
      </div>

      {/* Scrollable Ladder Area */}
      <div className="flex-1 overflow-y-auto font-['JetBrains_Mono'] text-xs divide-y divide-slate-800/30">
        {/* Asks (Sellers - descending order down towards current price) */}
        {depth.asks.slice(0, 10).reverse().map((ask, idx) => {
          const depthPercent = Math.min(100, (ask.qty / maxQty) * 100);
          return (
            <div key={`ask-${idx}`} className="relative grid grid-cols-3 px-3 py-1 items-center text-center hover:bg-rose-500/10 transition-colors">
              {/* Volume Bar Fill */}
              <div
                className="absolute inset-y-0 right-0 bg-rose-500/15 pointer-events-none transition-all"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="relative z-10 text-rose-400 font-semibold">${ask.price.toFixed(2)}</span>
              <span className="relative z-10 text-slate-200">{ask.qty.toFixed(2)}</span>
              <span className="relative z-10 text-slate-400 text-[11px]">{ask.total.toFixed(1)}</span>
            </div>
          );
        })}

        {/* Current Mid Price Spread Divider */}
        <div className="px-3 py-1.5 bg-amber-500/15 border-y border-amber-500/30 flex items-center justify-between text-xs font-bold text-amber-300">
          <span>السعر اللحظي:</span>
          <span>${currentPrice.toFixed(2)}</span>
        </div>

        {/* Bids (Buyers - descending order from current price downwards) */}
        {depth.bids.slice(0, 10).map((bid, idx) => {
          const depthPercent = Math.min(100, (bid.qty / maxQty) * 100);
          return (
            <div key={`bid-${idx}`} className="relative grid grid-cols-3 px-3 py-1 items-center text-center hover:bg-emerald-500/10 transition-colors">
              {/* Volume Bar Fill */}
              <div
                className="absolute inset-y-0 right-0 bg-emerald-500/15 pointer-events-none transition-all"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="relative z-10 text-emerald-400 font-semibold">${bid.price.toFixed(2)}</span>
              <span className="relative z-10 text-slate-200">{bid.qty.toFixed(2)}</span>
              <span className="relative z-10 text-slate-400 text-[11px]">{bid.total.toFixed(1)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
