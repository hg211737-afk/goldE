import React from "react";
import { Layers } from "lucide-react";
import { DOMDepthData } from "../types";

interface DomLadderProps {
  depth: DOMDepthData;
  currentPrice: number;
  spread: number;
}

export const DomLadder: React.FC<DomLadderProps> = ({ depth, currentPrice, spread }) => {
  const maxQty = depth.maxQty || 1;

  return (
    <div className="flex flex-col h-full bg-[#111622] rounded-xl border border-slate-800/80 overflow-hidden select-none">
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>عمق الأوامر (DOM Ladder)</span>
        </div>
        <div className="text-[11px] font-['JetBrains_Mono'] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
          سبريد: ${spread.toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-3 px-3 py-1 bg-slate-900/50 border-b border-slate-800/60 text-[10px] text-slate-400 font-semibold font-['Cairo'] text-center">
        <span>السعر ($)</span>
        <span>الكمية (Lots)</span>
        <span>العمق التراكمي</span>
      </div>

      <div className="flex-1 overflow-y-auto font-['JetBrains_Mono'] text-xs divide-y divide-slate-800/30">
        {depth.asks
          .slice(0, 10)
          .reverse()
          .map((item, idx) => {
            const widthPct = Math.min(100, (item.qty / maxQty) * 100);
            return (
              <div
                key={`ask-${idx}`}
                className="relative grid grid-cols-3 px-3 py-1 items-center text-center hover:bg-rose-500/10 transition-colors"
              >
                <div
                  className="absolute inset-y-0 right-0 bg-rose-500/15 pointer-events-none transition-all"
                  style={{ width: `${widthPct}%` }}
                />
                <span className="relative z-10 text-rose-400 font-semibold">${item.price.toFixed(2)}</span>
                <span className="relative z-10 text-slate-200">{item.qty.toFixed(2)}</span>
                <span className="relative z-10 text-slate-400 text-[11px]">{item.total.toFixed(1)}</span>
              </div>
            );
          })}

        <div className="px-3 py-1.5 bg-amber-500/15 border-y border-amber-500/30 flex items-center justify-between text-xs font-bold text-amber-300">
          <span>السعر اللحظي:</span>
          <span>${currentPrice.toFixed(2)}</span>
        </div>

        {depth.bids.slice(0, 10).map((item, idx) => {
          const widthPct = Math.min(100, (item.qty / maxQty) * 100);
          return (
            <div
              key={`bid-${idx}`}
              className="relative grid grid-cols-3 px-3 py-1 items-center text-center hover:bg-emerald-500/10 transition-colors"
            >
              <div
                className="absolute inset-y-0 right-0 bg-emerald-500/15 pointer-events-none transition-all"
                style={{ width: `${widthPct}%` }}
              />
              <span className="relative z-10 text-emerald-400 font-semibold">${item.price.toFixed(2)}</span>
              <span className="relative z-10 text-slate-200">{item.qty.toFixed(2)}</span>
              <span className="relative z-10 text-slate-400 text-[11px]">{item.total.toFixed(1)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
