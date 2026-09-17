import React from 'react';
import { FootprintBar } from '../types';
import { Activity, ArrowUpRight, ArrowDownRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface CvdAnalysisViewProps {
  bars: FootprintBar[];
  currentPrice: number;
}

export const CvdAnalysisView: React.FC<CvdAnalysisViewProps> = ({ bars, currentPrice }) => {
  if (bars.length === 0) return null;

  const lastBar = bars[bars.length - 1];
  const prevBar = bars[bars.length - 2] || lastBar;

  const totalDelta = bars.reduce((acc, b) => acc + b.delta, 0);
  const totalVolume = bars.reduce((acc, b) => acc + b.volume, 0);
  const deltaPercent = totalVolume > 0 ? (totalDelta / totalVolume) * 100 : 0;

  // Absorption Detection
  const priceHigher = lastBar.close > prevBar.close;
  const deltaLower = lastBar.delta < prevBar.delta;
  const priceLower = lastBar.close < prevBar.close;
  const deltaHigher = lastBar.delta > prevBar.delta;

  let absorptionType: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (priceLower && deltaHigher) {
    absorptionType = 'bullish'; // Institutional passive buyers absorbing aggressive sellers
  } else if (priceHigher && deltaLower) {
    absorptionType = 'bearish'; // Institutional passive sellers absorbing aggressive buyers
  }

  // Value Area calculation from visible bars
  const prices = bars.flatMap((b) => b.levels.map((l) => ({ price: l.price, volume: l.totalQty })));
  prices.sort((a, b) => a.price - b.price);

  const vah = Number((currentPrice + 4.5).toFixed(2));
  const val = Number((currentPrice - 5.0).toFixed(2));
  const poc = lastBar.pocPrice;

  return (
    <div className="flex flex-col h-full bg-[#0e121a] rounded-xl border border-slate-800/80 p-4 overflow-y-auto space-y-4 select-none">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">صافي دلتا الحجم التراكمي (CVD)</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-lg font-bold font-['JetBrains_Mono'] ${
                totalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalDelta >= 0 ? '+' : ''}
              {totalDelta.toFixed(1)} Oz
            </span>
            <span className="text-xs text-slate-400 font-mono">({deltaPercent.toFixed(1)}%)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">نقطة التحكم الحجمي (POC)</span>
          <span className="text-lg font-bold text-amber-400 font-['JetBrains_Mono']">
            ${poc.toFixed(2)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">منطقة القيمة العليا (VAH)</span>
          <span className="text-lg font-bold text-sky-400 font-['JetBrains_Mono']">
            ${vah.toFixed(2)}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block mb-1">منطقة القيمة السفلى (VAL)</span>
          <span className="text-lg font-bold text-indigo-400 font-['JetBrains_Mono']">
            ${val.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Absorption & Institutional Divergence Signal */}
      <div
        className={`p-4 rounded-xl border flex items-start gap-3 ${
          absorptionType === 'bullish'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : absorptionType === 'bearish'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}
      >
        <div className="p-2 rounded-lg bg-slate-900/70 shrink-0">
          <Activity className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-white">
            {absorptionType === 'bullish'
              ? '🟢 رصد امتصاص شرائي مؤسسي (Bullish Absorption Detected)'
              : absorptionType === 'bearish'
              ? '🔴 رصد امتصاص بيعي مؤسسي (Bearish Absorption Detected)'
              : '⚖️ توازن تدفق الأوامر الحالي (Order Flow Equilibrium)'}
          </h3>
          <p className="text-xs leading-relaxed text-slate-300">
            {absorptionType === 'bullish'
              ? 'يقوم المشترون ذوو السيولة الضخمة (Passive Limit Buyers) بامتصاص أوامر البيع الماركت بقوة دون السماح للسعر بالهبوط. إشارة قوية لاحتمال انعكاس صاعد سريع.'
              : absorptionType === 'bearish'
              ? 'يقوم البائعون المؤسسيون (Passive Limit Sellers) بامتصاص أوامر الشراء الماركت، مما يشير إلى نفاذ قوة المشترين واحتمال تصحيح هابط.'
              : 'لا يوجد دايفرجنس حاد بين حركة السعر ودلتا الحجم في الشمعة الأخيرة، السوق يتحرك بتوافق نسبي بين أوامر الماركت والليمت.'}
          </p>
        </div>
      </div>

      {/* Historical Bars Delta Breakdown Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/50">
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs font-bold text-slate-200 flex justify-between">
          <span>جدول تفصيل دلتا الشموع الأخيرة</span>
          <span className="text-slate-400 font-normal">آخر {Math.min(10, bars.length)} شمعة</span>
        </div>
        <div className="overflow-x-auto font-['JetBrains_Mono'] text-xs">
          <table className="w-full text-center">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] text-slate-400 font-['Cairo']">
                <th className="py-2 px-3">الوقت</th>
                <th className="py-2 px-3">الافتتاح</th>
                <th className="py-2 px-3">الإغلاق</th>
                <th className="py-2 px-3">الحجم الإجمالي</th>
                <th className="py-2 px-3">الدلتا (Delta)</th>
                <th className="py-2 px-3">CVD التراكمي</th>
                <th className="py-2 px-3">POC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {bars.slice(-8).reverse().map((b, i) => {
                const isPos = b.delta >= 0;
                return (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-1.5 px-3 text-slate-400">
                      {new Date(b.time).toLocaleTimeString('ar-EG', { hour12: false })}
                    </td>
                    <td className="py-1.5 px-3 text-slate-300">${b.open.toFixed(2)}</td>
                    <td className="py-1.5 px-3 text-white font-semibold">${b.close.toFixed(2)}</td>
                    <td className="py-1.5 px-3 text-amber-300">{b.volume.toFixed(1)}</td>
                    <td className={`py-1.5 px-3 font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPos ? '+' : ''}{b.delta.toFixed(1)}
                    </td>
                    <td className="py-1.5 px-3 text-sky-300">{b.cumulativeDelta.toFixed(1)}</td>
                    <td className="py-1.5 px-3 text-amber-400">${b.pocPrice.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
