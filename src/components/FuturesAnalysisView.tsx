import React from "react";
import { Activity, TrendingUp, TrendingDown, DollarSign, BarChart2, ShieldAlert, Cpu } from "lucide-react";

interface FuturesAnalysisViewProps {
  currentPrice: number;
}

export const FuturesAnalysisView: React.FC<FuturesAnalysisViewProps> = ({ currentPrice }) => {
  // Simulated Gold Futures COMEX vs Spot metrics
  const futuresPrice = Number((currentPrice + 3.850).toFixed(3));
  const basisSpread = Number((futuresPrice - currentPrice).toFixed(3));
  const openInterest = 542850; // contracts
  const openInterestChange = "+12,450 (+2.35%)";
  const fundingRate = "+0.0125%";
  const annualizedBasis = "+4.2%";

  const contractMonths = [
    { code: "GCZ6 (Dec 2026)", price: Number((currentPrice + 4.200).toFixed(3)), volume: "184,250", oi: "310,400", premium: "+$4.20" },
    { code: "GCG7 (Feb 2027)", price: Number((currentPrice + 8.100).toFixed(3)), volume: "92,100", oi: "145,200", premium: "+$8.10" },
    { code: "GCJ7 (Apr 2027)", price: Number((currentPrice + 12.450).toFixed(3)), volume: "45,800", oi: "87,250", premium: "+$12.45" },
  ];

  const liquidationHeatmap = [
    { zone: "عقود بيع مكشوفة (Shorts Squeeze Zone)", threshold: Number((currentPrice + 12.500).toFixed(3)), volume: "$185M تصفية إجبارية", risk: "عالي جداً" },
    { zone: "مقاومة العقود الآجلة القريبة", threshold: Number((currentPrice + 5.200).toFixed(3)), volume: "$95M أوامر معلقة", risk: "متوسط" },
    { zone: "منطقة التعادل النقدي (Spot/Futures Basis)", threshold: Number((currentPrice).toFixed(3)), volume: "محايد", risk: "منخفض" },
    { zone: "دعم العقود الآجلة الرئيسية", threshold: Number((currentPrice - 6.500).toFixed(3)), volume: "$140M دعم صانع السوق", risk: "متوسط" },
    { zone: "تصفية عقود الشراء (Longs Wipeout Zone)", threshold: Number((currentPrice - 15.000).toFixed(3)), volume: "$240M جرس إنذار الهبوط", risk: "عالي جداً" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d111a] text-slate-100 overflow-y-auto p-3 sm:p-5 gap-4 font-['Cairo']">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#131b2e] border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <span>تحليل العقود الآجلة للذهب (Gold Futures & COMEX Analysis)</span>
            </h2>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded font-mono">
              COMEX & Perpetual Data
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            متابعة فروق الأسعار (Basis Spread) بين الفوري والآجل، تغير الفائدة المفتوحة (OI)، ومعدلات التمويل.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-lg font-['JetBrains_Mono']">
          <div>
            <span className="text-[10px] text-slate-400 block">سعر العقود الآجلة (COMEX)</span>
            <span className="text-indigo-400 font-bold">${futuresPrice.toFixed(3)}</span>
          </div>
          <div className="w-[1px] h-7 bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 block">الفرق (Basis)</span>
            <span className="text-emerald-400 font-bold">+{basisSpread.toFixed(3)} ($)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-[#131b2e] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 block mb-1">الفائدة المفتوحة الإجمالية (OI)</span>
          <div className="text-lg font-bold font-['JetBrains_Mono'] text-white">{openInterest.toLocaleString()} عقود</div>
          <span className="text-[11px] text-emerald-400 mt-1 block font-mono">{openInterestChange}</span>
        </div>
        <div className="bg-[#131b2e] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 block mb-1">معدل التمويل (Funding Rate)</span>
          <div className="text-lg font-bold font-['JetBrains_Mono'] text-emerald-400">{fundingRate}</div>
          <span className="text-[11px] text-slate-400 mt-1 block font-['Cairo']">مشترين العقود يدفعون للبائعين</span>
        </div>
        <div className="bg-[#131b2e] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 block mb-1">العلاوة السنوية (Annualized Basis)</span>
          <div className="text-lg font-bold font-['JetBrains_Mono'] text-amber-400">{annualizedBasis}</div>
          <span className="text-[11px] text-slate-400 mt-1 block font-['Cairo']">زخم مؤسسي إيجابي قوي</span>
        </div>
        <div className="bg-[#131b2e] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 block mb-1">حالة الرافعة المالية (Leverage)</span>
          <div className="text-lg font-bold font-['JetBrains_Mono'] text-indigo-400">متوسطة - عالية</div>
          <span className="text-[11px] text-slate-400 mt-1 block font-['Cairo']">احتمالية تصفيات مفاجئة</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Futures Contracts Curve */}
        <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-xl">
          <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>منحنى العقود الآجلة حسب أشهر الاستحقاق</span>
          </h3>

          <div className="space-y-2.5">
            {contractMonths.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800 font-['JetBrains_Mono'] text-xs">
                <div>
                  <span className="font-bold text-white block font-['Cairo']">{c.code}</span>
                  <span className="text-[11px] text-slate-400">Vol: {c.volume} | OI: {c.oi}</span>
                </div>
                <div className="text-right">
                  <span className="text-indigo-400 font-bold block">${c.price.toFixed(3)}</span>
                  <span className="text-emerald-400 text-[11px]">{c.premium}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liquidation Heatmap Zones */}
        <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-xl">
          <h3 className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>مستويات تصفية العقود الآجلة (Futures Liquidation Map)</span>
          </h3>

          <div className="space-y-2">
            {liquidationHeatmap.map((liq, idx) => {
              const isNear = Math.abs(liq.threshold - currentPrice) < 4;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-['JetBrains_Mono'] ${
                    isNear
                      ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-300"
                  }`}
                >
                  <div>
                    <span className="font-bold text-white block text-[11px] font-['Cairo']">{liq.zone}</span>
                    <span className="text-[11px] text-slate-400">${liq.threshold.toFixed(3)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold block text-[11px] font-['Cairo']">{liq.volume}</span>
                    <span className="text-[10px] text-slate-400">مخاطر: {liq.risk}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
