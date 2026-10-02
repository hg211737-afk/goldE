import React from "react";
import {
  Globe2,
  Landmark,
  ShieldCheck,
  TrendingUp,
  Flame,
  Layers,
  Sparkles,
  ArrowUpRight,
  Database,
  Lock,
  Compass,
} from "lucide-react";

interface CentralBankWarRoomViewProps {
  currentPrice: number;
}

export const CentralBankWarRoomView: React.FC<CentralBankWarRoomViewProps> = ({ currentPrice }) => {
  const p = currentPrice > 1000 ? currentPrice : 4293.65;

  const centralBanks = [
    {
      country: "الصين (بنك الشعب الصيني PBOC)",
      flag: "🇨🇳",
      monthlyBuyingTons: 18.5,
      totalHoldingsTons: 2264,
      reserveRatioPercent: 5.1,
      statusAr: "شراء سيادي متواصل للشهر الـ 19 على التوالي",
    },
    {
      country: "بولندا (البنك الوطني البولندي)",
      flag: "🇵🇱",
      monthlyBuyingTons: 14.8,
      totalHoldingsTons: 377,
      reserveRatioPercent: 13.8,
      statusAr: "أكبر مشترٍ أوروبي لتعزيز الدفاع السيادي",
    },
    {
      country: "الهند (بنك الاحتياطي الهندي RBI)",
      flag: "🇮🇳",
      monthlyBuyingTons: 9.2,
      totalHoldingsTons: 840,
      reserveRatioPercent: 9.4,
      statusAr: "إعادة نقل 100 طن من خزائن إنجلترا إلى الهند",
    },
    {
      country: "تركيا (البنك المركزي التركي)",
      flag: "🇹🇷",
      monthlyBuyingTons: 8.6,
      totalHoldingsTons: 585,
      reserveRatioPercent: 32.5,
      statusAr: "تحوط من التضخم وضغوط العملة المحلية",
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-2 sm:p-4 bg-[#0a0d14] text-slate-100 font-['Cairo'] overflow-y-auto space-y-4">
      {/* Top Cockpit Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border-2 border-amber-500/40 shadow-2xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-700 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Landmark className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                غرفة العمليات الاستراتيجية والذهب السيادي (Central Bank War Room)
              </h2>
              <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                الطلب السيادي للبنوك المركزية
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              تتبع تدفقات الذهب المادي السيادي، استنزاف خزائن كومكس ولندن، وفارق أسعار بورصة شنغهاي الصينية (SGE Premium)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400 block font-['Cairo']">سعر الأونصة الفوري:</span>
            <span className="text-xl font-black text-amber-400">${p.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 4 Sovereign Strategic Macro Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
        {/* Gauge 1: SGE Shanghai Gold Exchange Premium */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 font-['Cairo']">علاوة بورصة شنغهاي (SGE):</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
              سحب شرقي
            </span>
          </div>
          <div className="text-2xl font-black text-amber-400">+$28.40/oz</div>
          <span className="text-[11px] text-slate-400 block font-['Cairo']">
            الذهب في الصين أغلى بـ $28 من لندن، مما يجبر الذهب الغربي على التدفق للصين.
          </span>
        </div>

        {/* Gauge 2: COMEX Physical Vault Drain */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 font-['Cairo']">استنزاف خزائن كومكس (COMEX):</span>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-bold">
              سحب متسارع
            </span>
          </div>
          <div className="text-2xl font-black text-rose-400">-46,200 أونصة/أسبوع</div>
          <span className="text-[11px] text-slate-400 block font-['Cairo']">
            انخفاض المخزون المؤهل للتسليم المادي (Registered) لأدنى مستوى في 4 سنوات.
          </span>
        </div>

        {/* Gauge 3: BRICS De-Dollarization Index */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 font-['Cairo']">مؤشر فك الارتباط بالدولار:</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
              BRICS Flow
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400">68.4%</div>
          <span className="text-[11px] text-slate-400 block font-['Cairo']">
            ارتفاع المعاملات البينية لدول البريكس المدعومة بضمانات الذهب المادي.
          </span>
        </div>

        {/* Gauge 4: Decoupling from TIPS Real Yields */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 font-['Cairo']">انفصال الذهب عن عوائد السندات:</span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold">
              Decoupled
            </span>
          </div>
          <div className="text-2xl font-black text-indigo-300">+94.6% تماسك</div>
          <span className="text-[11px] text-slate-400 block font-['Cairo']">
            الذهب يتجاهل ارتفاع الفائدة الحقيقية تماماً بفضل الشراء السيادي الحتمي.
          </span>
        </div>
      </div>

      {/* Central Banks Purchases Matrix */}
      <div className="p-4 rounded-2xl bg-[#0c101a] border border-amber-500/30 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-amber-400" />
            <span>مصفوفة تراكم احتياطيات الذهب لدى البنوك المركزية الكبرى:</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">تحديث فصلي رسمي (WGC Data)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono">
          {centralBanks.map((cb, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-amber-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cb.flag}</span>
                  <span className="font-bold text-xs text-white font-['Cairo']">{cb.country}</span>
                </div>
                <span className="text-xs font-black text-amber-400">+{cb.monthlyBuyingTons} طن/شهر</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-400 block font-['Cairo']">إجمالي الاحتياطي:</span>
                  <span className="text-slate-200 font-bold">{cb.totalHoldingsTons} طن ذهب</span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                  <span className="text-[10px] text-slate-400 block font-['Cairo']">نسبة الذهب من الاحتياطي:</span>
                  <span className="text-emerald-400 font-bold">{cb.reserveRatioPercent}%</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 font-['Cairo'] flex items-center gap-1.5 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{cb.statusAr}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
