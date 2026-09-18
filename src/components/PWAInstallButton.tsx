import React, { useState } from 'react';
import { Download, Smartphone, Share2, CheckCircle2, X, Zap } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'floating' | 'nav';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showGenericGuide, setShowGenericGuide] = useState(false);

  // If already installed and running standalone, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowGenericGuide(true);
    }
  };

  const buttonContent = (
    <>
      <Download className="w-3.5 h-3.5 animate-bounce text-slate-950" />
      <span>تثبيت التطبيق</span>
    </>
  );

  return (
    <>
      {variant === 'nav' ? (
        <button
          onClick={handleInstallClick}
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 active:scale-95 transition-all"
          title="تثبيت التطبيق على جهازك للعمل بدون انقطاع وبأعلى كفاءة"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>تثبيت PWA</span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-[0_0_16px_rgba(245,158,11,0.35)] transition-all cursor-pointer active:scale-95"
          title="تثبيت التطبيق كمنصة مستقلة فائقة السرعة على هاتفك أو حاسوبك"
        >
          {buttonContent}
        </button>
      )}

      {/* iOS Safari Installation Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f1420] border border-amber-500/40 p-6 shadow-2xl text-right text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <span>تثبيت التطبيق على iPhone / iPad</span>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs leading-relaxed text-slate-300">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 text-xs">
                  1
                </span>
                <p>
                  اضغط على أيقونة <strong>المشاركة (Share)</strong> <Share2 className="w-3.5 h-3.5 inline text-sky-400" /> في شريط متصفح Safari أسفل الشاشة.
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 text-xs">
                  2
                </span>
                <p>
                  مرر القائمة لأسفل واختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 text-xs">
                  3
                </span>
                <p className="text-emerald-400">
                  اضغط <strong>"إضافة" (Add)</strong> بالأعلى لتثبيت التطبيق فوراً ليعمل بكامل الشاشة وبدون بطء.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              فهمت، شكراً
            </button>
          </div>
        </div>
      )}

      {/* Generic Android / Desktop Guide Modal */}
      {showGenericGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f1420] border border-amber-500/40 p-6 shadow-2xl text-right text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>تثبيت منصة التداول</span>
              </div>
              <button
                onClick={() => setShowGenericGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
              <p>
                لتثبيت المنصة كبرنامج مستقل فائق الكفاءة والسرعة:
              </p>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>في Google Chrome أو Edge:</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  اضغط على أيقونة التثبيت <Download className="w-3 h-3 inline text-amber-400" /> في شريط العنوان بالأعلى، أو افتح قائمة المتصفح (⋮) واختر <strong>"تثبيت التطبيق" (Install App)</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>على أجهزة أندرويد (Android):</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  اضغط على الثلاث نقاط (⋮) في أعلى المتصفح واختر <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGenericGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              تم
            </button>
          </div>
        </div>
      )}
    </>
  );
};
