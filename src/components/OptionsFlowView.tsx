import React from 'react';
import { OptionsFlowData, GoldQuote } from '../types';
import {
  Compass,
  Zap,
  Shield,
  Layers,
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';

interface OptionsFlowViewProps {
  optionsData: OptionsFlowData;
  quote: GoldQuote;
}

export const OptionsFlowView: React.FC<OptionsFlowViewProps> = ({
  optionsData,
  quote,
}) => {
  const isPcrBullish = optionsData.putCallRatio < 0.75;
  const isPositiveGamma = optionsData.netGammaExposure >= 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0e14] overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 font-['Cairo'] text-slate-100 select-none">
      {/* Quick Option Flow KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        {/* Put / Call Ratio */}
        <div className="p-3 bg-[#111622] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>نسبة خيارات البيع/الشراء (PCR)</span>
            <Compass className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold font-['JetBrains_Mono'] text-white">
              {optionsData.putCallRatio}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px]">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isPcrBullish
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {optionsData.pcrSentiment}
            </span>
          </div>
        </div>

        {/* Max Pain Strike */}
        <div className="p-3 bg-[#111622] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>سعر الألم الأقصى (Max Pain)</span>
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="mt-1">
            <span className="text-xl sm:text-2xl font-bold font-['JetBrains_Mono'] text-amber-300">
              ${optionsData.maxPainStrike.toFixed(2)}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
            <span>فارق السعر:</span>
            <span className="font-mono text-white">
              {(quote.price - optionsData.maxPainStrike).toFixed(2)}$
            </span>
          </div>
        </div>

        {/* Net Gamma Exposure (GEX) */}
        <div className="p-3 bg-[#111622] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>تعرض الجاما الصافي (Net GEX)</span>
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-1">
            <span
              className={`text-xl sm:text-2xl font-bold font-['JetBrains_Mono'] ${
                isPositiveGamma ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositiveGamma ? '+' : ''}
              {optionsData.netGammaExposure}M$
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate" title={optionsData.gammaRegime}>
            {isPositiveGamma ? 'جاما موجبة (تثبيت السعر ومقاومة التقلب)' : 'جاما سالبة (انفجار سعري متسارع)'}
          </div>
        </div>

        {/* Call Wall & Put Floor */}
        <div className="p-3 bg-[#111622] rounded-xl border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>جدار المقاومة والأرضية</span>
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 space-y-1 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-rose-400">Call Wall:</span>
              <span className="font-bold text-white">${optionsData.callResistanceWall}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400">Put Floor:</span>
              <span className="font-bold text-white">${optionsData.putSupportFloor}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            حدود التحوط الإجبارية للبنوك وصناع السوق
          </div>
        </div>
      </div>

      {/* Institutional Sweeps & Blocks Real-Time Feed */}
      <div className="p-3 sm:p-4 bg-[#111622] rounded-xl border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">
              رادار صفقات الأوبشن المؤسسية الكبرى (Smart Money Sweeps & Blocks)
            </span>
          </div>
          <span className="text-xs text-amber-400 font-mono">COMEX Gold Options</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium pb-2">
                <th className="py-2 pr-2">النوع والسترايك</th>
                <th className="py-2">تاريخ الانتهاء</th>
                <th className="py-2">طريقة التنفيذ</th>
                <th className="py-2">العلاوة المدفوعة</th>
                <th className="py-2">كمية العقود</th>
                <th className="py-2 pl-2">الانحياز</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-['JetBrains_Mono']">
              {optionsData.institutionalSweeps.map((trade) => {
                const isCall = trade.contractType === 'CALL';
                return (
                  <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isCall
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {trade.contractType}
                        </span>
                        <span className="text-white">${trade.strike}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-300 text-xs font-['Cairo']">
                      {trade.expiration}
                    </td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-bold">
                        {trade.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-emerald-400 font-bold">
                      ${(trade.premiumUsd / 1000).toFixed(0)}k
                    </td>
                    <td className="py-2.5 text-slate-200">
                      {trade.contracts.toLocaleString()}
                    </td>
                    <td className="py-2.5 pl-2 font-['Cairo']">
                      <span
                        className={`flex items-center gap-1 text-[11px] font-bold ${
                          trade.sentiment === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {trade.sentiment === 'BULLISH' ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {trade.sentiment === 'BULLISH' ? 'صعودي مؤسسي' : 'تحوط هبوطي'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strike Chain & GEX Distribution */}
      <div className="p-3 sm:p-4 bg-[#111622] rounded-xl border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-bold text-white">
              توزيع الفائدة المفتوحة والجاما عبر سلم السترايكات (Strike Chain Ladder)
            </span>
          </div>
          <span className="text-xs text-slate-400">
            السعر اللحظي: <strong className="text-amber-400 font-mono">${quote.price.toFixed(2)}</strong>
          </span>
        </div>

        <div className="space-y-1.5 font-['JetBrains_Mono'] text-xs">
          {optionsData.strikes.map((st) => {
            const isAtOrNearSpot = Math.abs(st.strike - quote.price) < 3.0;
            const isCallWall = st.strike === optionsData.callResistanceWall;
            const isPutFloor = st.strike === optionsData.putSupportFloor;
            const isMaxPain = st.strike === optionsData.maxPainStrike;

            return (
              <div
                key={st.strike}
                className={`p-2 rounded-lg flex items-center justify-between border transition-all ${
                  isAtOrNearSpot
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-xs'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                {/* Put OI side */}
                <div className="flex items-center gap-2 w-1/3">
                  <span className="text-rose-400 font-bold text-xs">
                    {st.putOI.toLocaleString()}
                  </span>
                  <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden flex justify-end">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (st.putOI / 2500) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Center Strike with Tags */}
                <div className="flex items-center justify-center gap-2 px-2">
                  <span
                    className={`font-bold text-sm ${
                      isAtOrNearSpot ? 'text-amber-300' : 'text-white'
                    }`}
                  >
                    ${st.strike}
                  </span>
                  {isCallWall && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-['Cairo']">
                      Call Wall
                    </span>
                  )}
                  {isPutFloor && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-['Cairo']">
                      Put Floor
                    </span>
                  )}
                  {isMaxPain && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-['Cairo']">
                      Max Pain
                    </span>
                  )}
                </div>

                {/* Call OI side */}
                <div className="flex items-center gap-2 w-1/3 justify-end">
                  <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (st.callOI / 2500) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs">
                    {st.callOI.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
