import React, { useState } from "react";
import { Download, Share, PlusSquare, CheckCircle2, X, Smartphone } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  // If already running standalone as an installed PWA, hide the button
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>تطبيق مثبت</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 border border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all cursor-pointer select-none active:scale-95"
        title="تثبيت المنصة على جهازك كتطبيق أصلي سريع ومستقر"
      >
        <Download className="w-3.5 h-3.5 text-amber-950 stroke-[2.5]" />
        <span>تثبيت المنصة</span>
      </button>

      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-amber-500/40 rounded-xl p-5 max-w-md w-full shadow-2xl text-slate-200 text-right animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">تثبيت تطبيق Gold OrderFlow Pro</h3>
                  <p className="text-[11px] text-slate-400">تطبيق ويب تقدمي (PWA) فائق السرعة وخالي من الأخطاء</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p className="text-amber-300 font-medium">لتثبيت التطبيق على أجهزة iPhone / iPad عبر متصفح Safari:</p>
                <ol className="list-decimal list-inside space-y-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-400">1.</span>
                    <span>اضغط على زر المشاركة <Share className="inline w-3.5 h-3.5 mx-1 text-sky-400" /> في أسفل الشاشة.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-400">2.</span>
                    <span>مرر للأسفل واضغط على <strong className="text-white">"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong> <PlusSquare className="inline w-3.5 h-3.5 mx-1 text-emerald-400" />.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-400">3.</span>
                    <span>اضغط على <strong className="text-white">"إضافة" (Add)</strong> في أعلى الزاوية.</span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs leading-relaxed text-slate-300">
                <p className="text-amber-300 font-medium">لتثبيت التطبيق على أجهزة Android أو الحاسوب (Chrome / Edge):</p>
                <ol className="list-decimal list-inside space-y-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-400">1.</span>
                    <span>اضغط على قائمة المتصفح (⋮ الثلاث نقاط) في الزاوية العلوية أو شريط العناوين.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-400">2.</span>
                    <span>اختر <strong className="text-white">"تثبيت التطبيق" (Install App)</strong> أو "إضافة إلى الشاشة الرئيسية".</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-amber-400">3.</span>
                    <span>سيعمل التطبيق في نافذة مستقلة مع شارت الذهب اللحظي والأصوات والتنبيهات الكاملة.</span>
                  </li>
                </ol>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowInstructions(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
