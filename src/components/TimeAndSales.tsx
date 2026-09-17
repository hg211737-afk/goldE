import React, { useState } from 'react';
import { TapeTrade } from '../types';
import { Radio, Filter, Zap } from 'lucide-react';

interface TimeAndSalesProps {
  trades: TapeTrade[];
}

export const TimeAndSales: React.FC<TimeAndSalesProps> = ({ trades }) => {
  const [onlyWhales, setOnlyWhales] = useState(false);

  const displayedTrades = onlyWhales ? trades.filter((t) => t.isWhale) : trades;

  return (
    <div className="flex flex-col h-full bg-[#111622] rounded-xl border border-slate-800/80 overflow-hidden select-none">
      {/* Header */}
      <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>شريط الصفقات (Time & Sales)</span>
        </div>

        {/* Whale Filter Toggle */}
        <button
          onClick={() => setOnlyWhales((prev) => !prev)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
            onlyWhales
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="تصفية وإظهار صفقات الحيتان الكبيرة فقط (>= 5 Lots)"
        >
          <Filter className="w-3 h-3" />
          <span>الحيتان فقط</span>
        </button>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-4 px-3 py-1 bg-slate-900/50 border-b border-slate-800/60 text-[10px] text-slate-400 font-semibold font-['Cairo'] text-center">
        <span>الوقت</span>
        <span>السعر ($)</span>
        <span>الحجم (Oz)</span>
        <span>الطرف المبادر</span>
      </div>

      {/* Trades Stream */}
      <div className="flex-1 overflow-y-auto font-['JetBrains_Mono'] text-xs divide-y divide-slate-800/30">
        {displayedTrades.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs font-['Cairo']">
            في انتظار وصول صفقات جديدة...
          </div>
        ) : (
          displayedTrades.slice(0, 30).map((t) => {
            const isBuy = t.side === 'buy';
            return (
              <div
                key={t.id}
                className={`grid grid-cols-4 px-3 py-1 items-center text-center text-[11px] transition-colors ${
                  t.isWhale ? 'bg-amber-500/10 font-bold' : isBuy ? 'hover:bg-emerald-500/5' : 'hover:bg-rose-500/5'
                }`}
              >
                <span className="text-slate-400 text-[10px]">
                  {new Date(t.time).toLocaleTimeString('en-GB', { hour12: false })}
                </span>
                <span className={`font-semibold ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${t.price.toFixed(2)}
                </span>
                <span className="text-slate-200 flex items-center justify-center gap-1">
                  {t.qty.toFixed(2)}
                  {t.isWhale && (
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 rounded">
                      حوت
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-bold ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isBuy ? 'شراء عنيف' : 'بيع عنيف'}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
