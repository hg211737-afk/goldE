import React from 'react';
import { FuturesFlowData, GoldQuote } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Clock,
  ShieldAlert,
  BarChart3,
  Percent,
  Crosshair,
} from 'lucide-react';

interface FuturesFlowViewProps {
  futuresData: FuturesFlowData;
  quote: GoldQuote;
}

export const FuturesFlowView: React.FC<FuturesFlowViewProps> = ({
  futuresData,
  quote,
}) => {
  const isPriceAboveVWAP = quote.price >= futuresData.vwap;
  const isOIIncreasing = futuresData.oiChangePercent24h >= 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0e14] overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 font-['Cairo'] text-slate-100 select-none">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {/* Open Interest */}
        <div className="p-3 bg-[#111622] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>الفائدة المفتوحة (OI)</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1">
            <span className="text-lg sm:text-xl font-bold font-['JetBrains_Mono'] text-white">
              {futuresData.openInterestOz.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 mr-1">أوقية</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px]">
            <span
              className={`font-bold font-['JetBrains_Mono'] ${
                isOIIncreasing ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isOIIncreasing ? '+' : ''}
              {futuresData.oiChangePercent24h}%
            </span>
            <span className="text-slate-500 text-[10px]">خلال 24h</span>
          </div>
        </div>

        {/* Funding Rate */}
        <div className="p-3 bg-[#111622] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>معدل التمويل (Funding)</span>
            <Percent className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-1">
            <span
              className={`text-lg sm:text-xl font-bold font-['JetBrains_Mono'] ${
                futuresData.fundingRate >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {futuresData.fundingRate > 0 ? '+' : ''}
              {futuresData.fundingRate}%
            </span>
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
            <span>التسوية القادمة:</span>
            <span className="font-mono text-amber-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {futuresData.nextFundingCountdown}
            </span>
          </div>
        </div>

        {/* Long / Short Ratio */}
        <div className="p-3 bg-[#111622] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>نسبة الشراء/البيع (L/S)</span>
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg sm:text-xl font-bold font-['JetBrains_Mono'] text-amber-300">
              {futuresData.longShortRatio}
            </span>
            <span className="text-[10px] text-slate-400">معامل</span>
          </div>
          <div className="mt-1.5 space-y-1">
            <div className="w-full h-1.5 bg-slate-800 rounded-full flex overflow-hidden">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${futuresData.longAccountPercent}%` }}
              ></div>
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${futuresData.shortAccountPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono">
              <span className="text-emerald-400">{futuresData.longAccountPercent}% شراء</span>
              <span className="text-rose-400">{futuresData.shortAccountPercent}% بيع</span>
            </div>
          </div>
        </div>

        {/* Liquidations 24h */}
        <div className="p-3 bg-[#111622] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>تصفيات العقود (24h Liq)</span>
            <Flame className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-1 space-y-1 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-rose-400">Longs:</span>
              <span className="font-bold text-white">
                ${(futuresData.totalLongLiquidations24hUsd / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400">Shorts:</span>
              <span className="font-bold text-white">
                ${(futuresData.totalShortLiquidations24hUsd / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            تفوق تصفية البائعين (Short Squeeze Pressure)
          </div>
        </div>
      </div>

      {/* VWAP & Deviation Bands Institutional Anchor */}
      <div className="p-3 sm:p-4 bg-[#111622] rounded-xl border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">
              المتوسط المرجح بحجم التداول ومستويات الانحراف (Session VWAP Bands)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">تموضع السعر:</span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-bold ${
                isPriceAboveVWAP
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {isPriceAboveVWAP ? 'أعلى الـ VWAP (صعودي)' : 'أسفل الـ VWAP (هبوطي)'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 font-['JetBrains_Mono'] text-center">
          <div className="p-2 rounded-lg bg-slate-900/90 border border-rose-900/30">
            <span className="text-[10px] text-rose-400 block font-['Cairo']">سقف الانحراف +2σ</span>
            <span className="text-xs sm:text-sm font-bold text-rose-300">
              ${futuresData.vwapBandUpper2}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/90 border border-rose-800/20">
            <span className="text-[10px] text-rose-300/80 block font-['Cairo']">مقاومة +1σ</span>
            <span className="text-xs sm:text-sm font-bold text-rose-200">
              ${futuresData.vwapBandUpper1}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/40 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-amber-300 block font-['Cairo'] font-bold">
              متوسط VWAP المركزي
            </span>
            <span className="text-sm sm:text-base font-bold text-amber-300">
              ${futuresData.vwap}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/90 border border-emerald-800/20">
            <span className="text-[10px] text-emerald-300/80 block font-['Cairo']">دعم -1σ</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-200">
              ${futuresData.vwapBandLower1}
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/90 border border-emerald-900/30">
            <span className="text-[10px] text-emerald-400 block font-['Cairo']">قاع الانحراف -2σ</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-300">
              ${futuresData.vwapBandLower2}
            </span>
          </div>
        </div>
      </div>

      {/* Liquidation Clusters & Squeeze Heatmap */}
      <div className="p-3 sm:p-4 bg-[#111622] rounded-xl border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-bold text-white">
              أحواض تصفية العقود الآجلة ومناطق السكويز (Liquidation Squeeze Map)
            </span>
          </div>
          <span className="text-xs text-amber-400 font-mono">
            السعر اللحظي: ${quote.price.toFixed(2)}
          </span>
        </div>

        <div className="space-y-2.5">
          {futuresData.liquidationClusters.map((cluster, idx) => {
            const isShortSqueeze = cluster.type === 'short_liq';
            const dist = (cluster.price - quote.price).toFixed(2);
            return (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isShortSqueeze ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500 animate-pulse'
                    }`}
                  ></span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-['JetBrains_Mono'] font-bold text-white text-sm">
                        ${cluster.price.toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isShortSqueeze
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {isShortSqueeze ? 'تصفية شورت (Short Liq Pool)' : 'تصفية لونغ (Long Liq Pool)'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({Number(dist) > 0 ? `+${dist}` : dist}$)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{cluster.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-left font-['JetBrains_Mono']">
                    <span className="text-xs font-bold text-amber-300 block">
                      {cluster.estimatedVolumeOz.toLocaleString()} Oz
                    </span>
                    <span className="text-[10px] text-slate-400 font-['Cairo']">حجم العقود المتوقعة</span>
                  </div>
                  <div className="w-14 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${isShortSqueeze ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${cluster.intensity}%` }}
                    ></div>
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
