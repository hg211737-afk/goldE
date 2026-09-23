import React from "react";
import {
  X,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { LiquidityZone } from "../types";

interface LiquidityExplainerModalProps {
  zone: LiquidityZone | null;
  currentPrice: number;
  onClose: () => void;
}

export const LiquidityExplainerModal: React.FC<LiquidityExplainerModalProps> = ({
  zone,
  currentPrice,
  onClose,
}) => {
  if (!zone) return null;

  const isBsl = zone.type === "BSL";
  const isSsl = zone.type === "SSL";
  const isFvg = zone.type.includes("FVG");

  const midPrice = (zone.priceTop + zone.priceBottom) / 2;
  const distDollars = currentPrice - midPrice;
  const isAboveCurrent = midPrice > currentPrice;
  const absDist = Math.abs(distDollars);
  const pips = (absDist * 10).toFixed(0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 font-['Cairo'] select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-[#0e131d] border border-slate-750 rounded-2xl shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl border ${
                isBsl
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-400"
                  : isSsl
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-400"
              }`}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  تفسير هيكل السوق المؤسسي (Market Structure Context)
                </h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border font-['JetBrains_Mono'] ${
                    isBsl
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : isSsl
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {zone.type}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {zone.nameAr} ({zone.name})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs sm:text-sm">
          {/* Top Live Zone Snapshot Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 font-['JetBrains_Mono']">
            <div>
              <span className="text-[10px] text-slate-400 block font-['Cairo']">نطاق المنطقة</span>
              <span className="font-bold text-amber-300 text-xs sm:text-sm">
                ${zone.priceBottom.toFixed(2)} - ${zone.priceTop.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-['Cairo']">المسافة الحالية</span>
              <span className="font-bold text-white text-xs sm:text-sm flex items-center gap-0.5">
                {isAboveCurrent ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                )}
                ${absDist.toFixed(2)} ({pips} pt)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-['Cairo']">حجم السيولة المقدر</span>
              <span className="font-bold text-indigo-300 text-xs sm:text-sm">
                {zone.volumeCluster} Lot
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-['Cairo']">حالة الاختبار</span>
              <span
                className={`font-bold text-xs sm:text-sm font-['Cairo'] ${
                  zone.status === "swept"
                    ? "text-rose-400"
                    : zone.status === "mitigated"
                    ? "text-slate-400"
                    : "text-emerald-400"
                }`}
              >
                {zone.status === "swept"
                  ? "تم السحب (Swept)"
                  : zone.status === "mitigated"
                  ? "تم التخفيف"
                  : "نشطة (Untested)"}
              </span>
            </div>
          </div>

          {/* Section 1: Why Was This Identified as BSL/SSL? */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <BookOpen className="w-4 h-4" />
              <span>
                1. لماذا تم تعريف هذه المنطقة كـ {isBsl ? "BSL (سيولة شراء علوية)" : isSsl ? "SSL (سيولة بيع سفلية)" : "FVG (فجوة سعرية)"}؟
              </span>
            </div>

            {isBsl && (
              <div className="space-y-2 text-slate-300 leading-relaxed text-xs">
                <p>
                  تم رصد هذه المنطقة عند <strong className="text-white">قمة سابقة رئيسية (Swing High)</strong> أو{" "}
                  <strong className="text-amber-300">قمم متساوية هندسية (Equal Highs - EQH)</strong> في هيكل السوق للذهب.
                </p>
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200">
                  <span className="font-bold block mb-1">📍 تكدس أوامر وقف الخسارة (Stop-Loss Orders Pool):</span>
                  المتداولون الكلاسيكيون الذين دخلوا في صفقات بيع (Shorts) وضعوا أوامر وقف الخسارة الخاصة بهم مباشرة فوق هذه القمة. في سوق العقود الفورية والآجلة، أمر وقف الخسارة لصفقة بيع يتحول إلى{" "}
                  <strong className="underline text-white">أمر شراء بسعر السوق (Buy Stop Order)</strong>.
                </div>
              </div>
            )}

            {isSsl && (
              <div className="space-y-2 text-slate-300 leading-relaxed text-xs">
                <p>
                  تم رصد هذه المنطقة عند <strong className="text-white">قاع تأرجح رئيسي سابق (Swing Low)</strong> أو{" "}
                  <strong className="text-amber-300">قيعان متساوية (Equal Lows - EQL)</strong> في حركة السعر.
                </p>
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                  <span className="font-bold block mb-1">📍 تكدس أوامر وقف الخسارة (Sell Stops Pool):</span>
                  المتداولون الذين قاموا بالشراء (Longs) وضعوا أوامر الحماية ووقف الخسارة أسفل هذا القاع. هذه الأوامر تمثل{" "}
                  <strong className="underline text-white">أوامر بيع معلقة بسعر السوق (Sell Stop Orders)</strong> تنتظر التفعيل.
                </div>
              </div>
            )}

            {isFvg && (
              <div className="space-y-2 text-slate-300 leading-relaxed text-xs">
                <p>
                  تم تحديد هذه المنطقة بسبب <strong className="text-white">اختلال حاد في توازن تدفق الأوامر (Imbalance)</strong> بين 3 شمعات متتالية، حيث لم تتداخل ذيول الشموع السابقة، مما خلف فراغاً سعرياً غير كفء يحتاج لإعادة الموازنة.
                </p>
              </div>
            )}
          </div>

          {/* Section 2: Smart Money & Institutional Intent */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
              <Zap className="w-4 h-4" />
              <span>2. سلوك ونوايا صناع السوق والسيولة الذكية (Institutional Intent)</span>
            </div>

            <div className="space-y-1.5 text-slate-300 leading-relaxed text-xs">
              {isBsl && (
                <p>
                  المؤسسات المالية وصناديق التحوط ذات السيولة الضخمة لا يمكنها بيع آلاف أونصات الذهب في مناطق عشوائية دون التسبب في هبوط السعر وإحداث انزلاق سعري مضر (Slippage). لذا تقوم بدفع السعر عمداً فوق هذه القمة لتفعيل أوامر الشراء (Buy Stops) للأفراد، مما يوفر لهم <strong className="text-amber-300">السيولة المقابلة لامتصاصها وتنفيذ صفقات بيعهم المؤسسية الكبرى</strong>.
                </p>
              )}

              {isSsl && (
                <p>
                  تحتاج البنوك وصناع السوق إلى شراء كميات هائلة من الذهب بأسعار خصم (Discount Price). لدخول عقود الشراء الكبرى، يدفعون السعر لكسر القاع وتفعيل أوامر البيع الإجبارية (Sell Stops)، فيقومون بامتصاص سيل أوامر البيع هذا وشراء الذهب بأسعار رخيصة قبل عكس الاتجاه للأعلى.
                </p>
              )}

              {isFvg && (
                <p>
                  تعمل الفجوة السعرية كمغناطيس سيولة يجذب السعر لملء الفراغ وإعادة التسعير العادل قبل استئناف الاتجاه المؤسسي الرئيسي.
                </p>
              )}
            </div>
          </div>

          {/* Section 3: Expected Scenarios & Trading Playbook */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>3. السيناريوهات الفنية المتوقعة عند وصول السعر للمنطقة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Scenario A: Sweep & Reverse */}
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-amber-500/20 space-y-1">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  أ) سيناريو السحب والانعكاس (Liquidity Sweep)
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  يخترق السعر المنطقة بذيل شمعة سريع (Wick) ثم يعود للإغلاق داخل النطاق، يعقبه تغير فوري في هيكل السوق الداخلي (CHoCH / MSS) وانعكاس قوي بالاتجاه المعاكس.
                </p>
              </div>

              {/* Scenario B: Expansion Breakout */}
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-indigo-500/20 space-y-1">
                <span className="font-bold text-indigo-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  ب) سيناريو الكسر والتوسع (Expansion / Trend Run)
                </span>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  يخترق السعر المنطقة بزخم حقيقي مع شمعة كاملة الاندفاع (Marubozu) مصحوبة بارتفاع حاد في دلتا الفوت برنت الموجبة، مستهدفاً حوض السيولة التالي.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Footprint & Order Flow Confirmation */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>دليل التحقق من شارت تدفق الأوامر (Footprint Checklist):</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-xs list-disc list-inside leading-relaxed">
              <li>
                راقب <strong className="text-white">الدلتا التراكمية (CVD)</strong>: إذا وصل السعر لقمة الـ BSL ولكن CVD بدأ ينخفض (Divergence)، فهذا يؤكد استنفاذ المشترين وحدوث سحب سيولة بيعي.
              </li>
              <li>
                افحص <strong className="text-white">نقطة التحكم (POC)</strong>: تمركز أعلى حجم تداول عند الحافة العلوية لقمة الشمعة مع دلتا سالبة يؤكد امتصاص البيع المؤسسي (Absorption).
              </li>
              <li>
                تحقق من <strong className="text-white">صفقات الحيتان في شريط الصفقات (Time &amp; Sales)</strong>: صفقات بيع كبيرة فوق 4 لوت تؤكد الارتداد.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Gold OrderFlow Pro • محرك تحليل السيولة وهيكل السوق الذكي
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer active:scale-95"
          >
            إغلاق التفسير
          </button>
        </div>
      </div>
    </div>
  );
};
