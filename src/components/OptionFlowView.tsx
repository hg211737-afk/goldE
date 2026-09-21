import React from "react";
import { TrendingUp, TrendingDown, ShieldAlert, Zap, Layers, BarChart3, PieChart } from "lucide-react";

interface OptionFlowViewProps {
  currentPrice: number;
}

export const OptionFlowView: React.FC<OptionFlowViewProps> = ({ currentPrice }) => {
  // Option Flow data simulating institutional Gold (XAU) options activity
  const callVolume = 148250;
  const putVolume = 94100;
  const totalVol = callVolume + putVolume;
  const putCallRatio = (putVolume / callVolume).toFixed(2);
  const bullishSentiment = Math.round((callVolume / totalVol) * 100);

  const unusualBlocks = [
    { id: "opt-1", strike: Number((currentPrice + 15).toFixed(3)), expiry: "2026-10-30", type: "CALL", contracts: 12500, premium: "$4.85M", sentiment: "Bullish Sweep", institutional: "صانع سوق رئيسي (Goldman Sachs Desk)" },
    { id: "opt-2", strike: Number((currentPrice + 25).toFixed(3)), expiry: "2026-11-27", type: "CALL", contracts: 8400, premium: "$2.92M", sentiment: "Aggressive Buy", institutional: "صندوق تحوط كبيـر (Macro Hedge Fund)" },
    { id: "opt-3", strike: Number((currentPrice - 10).toFixed(3)), expiry: "2026-10-16", type: "PUT", contracts: 15200, premium: "$5.10M", sentiment: "Hedging Protection", institutional: "محفظة بنك مركزي / مؤسسي" },
    { id: "opt-4", strike: Number((currentPrice + 35).toFixed(3)), expiry: "2026-12-31", type: "CALL", contracts: 22000, premium: "$8.45M", sentiment: "Gamma Squeeze Target", institutional: "تكدس خيارات شراء بعيدة المدى" },
    { id: "opt-5", strike: Number((currentPrice - 20).toFixed(3)), expiry: "2026-10-16", type: "PUT", contracts: 9800, premium: "$3.15M", sentiment: "Bearish Put Block", institutional: "تأمين هبوطي قصير الأجل" },
  ];

  const gammaLevels = [
    { level: Number((currentPrice + 25).toFixed(3)), type: "Gamma Wall (مقاومة غاما)", volume: "عالية جداً", action: "كبح الصعود واختبار الارتداد" },
    { level: Number((currentPrice + 10).toFixed(3)), type: "Call Resistance (حاجز كول)", volume: "متوسطة", action: "مستوى جني ارباح للمضاربين" },
    { level: Number((currentPrice).toFixed(3)), type: "Max Pain Price (ألم الخيارات)", volume: "مرجعية", action: "نقطة التعادل السعري الأسبوعي" },
    { level: Number((currentPrice - 12).toFixed(3)), type: "Put Support (دعم بوت)", volume: "عالية", action: "دفاع قوي من صانع السوق" },
    { level: Number((currentPrice - 28).toFixed(3)), type: "Gamma Floor (أرضية غاما)", volume: "حرجة", action: "منطقة امتصاص سيولة هابطة" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d111a] text-slate-100 overflow-y-auto p-3 sm:p-5 gap-4 font-['Cairo']">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#131b2e] border border-slate-800 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>تحليل تدفق خيارات الذهب (Gold Options Flow & UOA)</span>
            </h2>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
              Professional Grade
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            رصد الصفقات الكبيرة المعلقة (Block Trades) وعقود الخيارات المؤسسية وحشود جدار الغاما (Gamma Walls).
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-lg font-['JetBrains_Mono']">
          <div>
            <span className="text-[10px] text-slate-400 block">نسبة بوت/كول (P/C Ratio)</span>
            <span className="text-amber-400 font-bold">{putCallRatio}</span>
          </div>
          <div className="w-[1px] h-7 bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 block">معنويات الخيارات</span>
            <span className="text-emerald-400 font-bold">{bullishSentiment}% صاعد (Bullish)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Call vs Put Ratio Bar */}
        <div className="bg-[#131b2e] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>توزيع أحجام عقود الكول مقابل البوت</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Total: {totalVol.toLocaleString()} عقود</span>
          </div>

          <div className="space-y-3 my-2">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-emerald-400 font-bold">عقود الشراء (Calls): {callVolume.toLocaleString()}</span>
                <span className="text-emerald-400">{bullishSentiment}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${bullishSentiment}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-rose-400 font-bold">عقود البيع (Puts): {putVolume.toLocaleString()}</span>
                <span className="text-rose-400">{100 - bullishSentiment}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${100 - bullishSentiment}%` }} />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2 bg-slate-900/60 p-2.5 rounded border border-slate-800">
            💡 ملاحظة تدفق الخيارات: هيمنة عقود الشراء (Calls) تشير إلى استعداد المؤسسات لاختراق مستويات المقاومة العليا للذهب برافعة مالية عالية.
          </p>
        </div>

        {/* Gamma Walls & Max Pain */}
        <div className="lg:col-span-2 bg-[#131b2e] border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>مستويات جدار الغاما (Gamma Walls) ونقطة الألم الأعظم (Max Pain)</span>
            </h3>
            <span className="text-[11px] text-indigo-400 font-mono">السعر الحالي: ${currentPrice.toFixed(3)}</span>
          </div>

          <div className="space-y-2">
            {gammaLevels.map((g, idx) => {
              const isCurrent = Math.abs(g.level - currentPrice) < 5;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-['JetBrains_Mono'] ${
                    isCurrent
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                      : "bg-slate-900/60 border-slate-800 text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white w-24">${g.level.toFixed(3)}</span>
                    <span className="text-[11px] text-slate-400 font-['Cairo']">{g.type}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-slate-400 hidden sm:inline font-['Cairo']">{g.action}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-200">{g.volume}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Unusual Options Activity Table */}
      <div className="bg-[#131b2e] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>صفقات الخيارات الكبيرة غير العادية (UOA Block Trades)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">تم رصد 5 صفقات مؤسسية ضخمة اليوم</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs font-['JetBrains_Mono']">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px]">
                <th className="p-2.5">سعر التنفيذ (Strike)</th>
                <th className="p-2.5">تاريخ الاستحقاق</th>
                <th className="p-2.5">النوع</th>
                <th className="p-2.5">عدد العقود</th>
                <th className="p-2.5">حجم الأقساط (Premium)</th>
                <th className="p-2.5 font-['Cairo']">طبيعة الصفقة والمؤسسة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {unusualBlocks.map((block) => (
                <tr key={block.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-2.5 font-bold text-white">${block.strike.toFixed(3)}</td>
                  <td className="p-2.5 text-slate-300">{block.expiry}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        block.type === "CALL"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {block.type}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-200">{block.contracts.toLocaleString()}</td>
                  <td className="p-2.5 text-amber-400 font-bold">{block.premium}</td>
                  <td className="p-2.5 text-slate-300 font-['Cairo']">
                    <span className="text-slate-200 font-semibold">{block.sentiment}</span>
                    <span className="text-slate-500 block text-[10px]">{block.institutional}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
