import React from 'react';
import { OrderCluster, GoldQuote, MarketDepth } from '../types';
import {
  ShieldAlert,
  Layers,
  ShieldCheck,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react';

interface OrderClustersViewProps {
  clusters: OrderCluster[];
  quote: GoldQuote;
  depth: MarketDepth;
}

export const OrderClustersView: React.FC<OrderClustersViewProps> = ({
  clusters,
  quote,
  depth,
}) => {
  const buyWalls = clusters.filter((c) => c.type === 'BUY_WALL');
  const sellWalls = clusters.filter((c) => c.type === 'SELL_WALL');
  const hvnClusters = clusters.filter((c) => c.type === 'HVN');

  const totalBuyLots = buyWalls.reduce((sum, c) => sum + c.totalLots, 0);
  const totalSellLots = sellWalls.reduce((sum, c) => sum + c.totalLots, 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0e14] overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 font-['Cairo'] text-slate-100 select-none">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        {/* Buy Limit Walls */}
        <div className="p-3 bg-[#111622] rounded-xl border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">إجمالي جدران الشراء (Buy Walls)</span>
            <span className="text-xl font-bold font-['JetBrains_Mono'] text-emerald-400">
              {totalBuyLots.toFixed(1)} لوت
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
              ~${((totalBuyLots * quote.price) / 1000000).toFixed(1)}M قيمة معلقة
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Current Price Anchor */}
        <div className="p-3 bg-[#111622] rounded-xl border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">السعر اللحظي المتداول</span>
            <span className="text-xl font-bold font-['JetBrains_Mono'] text-amber-300">
              ${quote.price.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              السبريد: <strong className="font-mono text-white">${quote.spread}</strong>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Target className="w-5 h-5" />
          </div>
        </div>

        {/* Sell Limit Walls */}
        <div className="p-3 bg-[#111622] rounded-xl border border-rose-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">إجمالي جدران البيع (Sell Walls)</span>
            <span className="text-xl font-bold font-['JetBrains_Mono'] text-rose-400">
              {totalSellLots.toFixed(1)} لوت
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
              ~${((totalSellLots * quote.price) / 1000000).toFixed(1)}M عروض صد
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Detected Limit Walls and Clusters Detail */}
      <div className="p-3 sm:p-4 bg-[#111622] rounded-xl border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">
              مناطق التجمع الحجمي وجدران السيولة المعلقة (Order Book Clusters)
            </span>
          </div>
          <span className="text-xs text-slate-400">
            مرتبة حسب القرب من السعر الحالي
          </span>
        </div>

        <div className="space-y-2.5">
          {clusters.map((cluster) => {
            const isBuy = cluster.type === 'BUY_WALL';
            const isSell = cluster.type === 'SELL_WALL';
            const isHVN = cluster.type === 'HVN';

            return (
              <div
                key={cluster.id}
                className={`p-3 rounded-xl border transition-all ${
                  isBuy
                    ? 'bg-emerald-950/10 border-emerald-800/40 hover:border-emerald-500/50'
                    : isSell
                    ? 'bg-rose-950/10 border-rose-800/40 hover:border-rose-500/50'
                    : 'bg-amber-950/10 border-amber-800/40 hover:border-amber-500/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isBuy
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isSell
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {isBuy ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : isSell ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-['JetBrains_Mono'] font-bold text-base text-white">
                          ${cluster.centerPrice.toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            isBuy
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isSell
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {isBuy ? 'جدار شراء (Buy Wall)' : isSell ? 'جدار بيع (Sell Wall)' : 'تجمع حجمي (HVN POC)'}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            cluster.strength === 'CRITICAL'
                              ? 'bg-rose-500/30 text-rose-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          قوة {cluster.strength}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{cluster.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 font-['JetBrains_Mono'] text-xs">
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] font-['Cairo'] block">حجم التجمع</span>
                      <span className="font-bold text-amber-300 text-sm">
                        {cluster.totalLots} لوت
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] font-['Cairo'] block">المسافة</span>
                      <span className="font-bold text-white">
                        {cluster.distanceUsd}$ ({cluster.pipsDistance} Pip)
                      </span>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="text-slate-400 text-[10px] font-['Cairo'] block">القيمة التقديرية</span>
                      <span className="font-bold text-emerald-400">
                        ${(cluster.estimatedValueUsd / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
