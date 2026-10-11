import React, { useState, useEffect } from "react";
import {
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  Cpu,
  Zap,
  ExternalLink,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Check,
  Play,
  ShieldCheck,
  X,
  Clock,
  Layers,
  Activity,
} from "lucide-react";
import { OpenAiVerificationResult, OpenAiLiveTestResult } from "../types";
import {
  verifyOpenAiApiKey,
  testOpenAiLiveAnalysis,
} from "../services/goldMlModelService";
import { soundFx } from "../services/soundService";

interface OpenAiKeyVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedKey: string;
  onSaveKey: (key: string, result?: OpenAiVerificationResult | null) => void;
  onClearKey: () => void;
  currentPrice: number;
}

export const OpenAiKeyVerificationModal: React.FC<OpenAiKeyVerificationModalProps> = ({
  isOpen,
  onClose,
  savedKey,
  onSaveKey,
  onClearKey,
  currentPrice,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(savedKey || "");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<OpenAiVerificationResult | null>(null);
  const [isTestingLive, setIsTestingLive] = useState<boolean>(false);
  const [liveTestResult, setLiveTestResult] = useState<OpenAiLiveTestResult | null>(null);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(savedKey || "");
      if (savedKey && !verificationResult) {
        // Auto-run verification check on open if saved key exists
        handleVerifyKey(savedKey);
      }
    }
  }, [isOpen, savedKey]);

  if (!isOpen) return null;

  const handleVerifyKey = async (keyToTest?: string) => {
    const key = (keyToTest !== undefined ? keyToTest : apiKeyInput).trim();
    if (!key) {
      setVerificationResult({
        valid: false,
        status: "missing_key",
        messageAr: "يرجى كتابة أو لصق مفتاح OpenAI API يبدأ بـ sk-...",
      });
      return;
    }

    setIsVerifying(true);
    setLiveTestResult(null);
    soundFx.playHudClick();

    try {
      const res = await verifyOpenAiApiKey(key);
      setVerificationResult(res);
      if (res.valid) {
        soundFx.playSuccessChime();
      } else {
        soundFx.playBeepError();
      }
    } catch {
      setVerificationResult({
        valid: false,
        status: "error",
        messageAr: "تعذر إتمام الفحص. تحقق من اتصال الإنترنت وخوادم التطبيق.",
      });
      soundFx.playBeepError();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRunLiveAnalysisTest = async () => {
    const key = apiKeyInput.trim();
    if (!key) return;

    setIsTestingLive(true);
    soundFx.playHudClick();

    try {
      const res = await testOpenAiLiveAnalysis(key, currentPrice);
      setLiveTestResult(res);
      if (res.success) {
        soundFx.playSuccessChime();
      } else {
        soundFx.playBeepError();
      }
    } catch {
      setLiveTestResult({
        success: false,
        errorAr: "فشل اختبار الاتصال بالخادم أثناء توليد التحليل الحي.",
      });
      soundFx.playBeepError();
    } finally {
      setIsTestingLive(false);
    }
  };

  const handleSaveAndApply = () => {
    soundFx.playSuccessChime();
    onSaveKey(apiKeyInput.trim(), verificationResult);
    onClose();
  };

  const handleClear = () => {
    soundFx.playHudClick();
    setApiKeyInput("");
    setVerificationResult(null);
    setLiveTestResult(null);
    onClearKey();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl bg-[#090d16] border-2 border-emerald-500/50 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col max-h-[92vh] overflow-hidden text-slate-100 font-['Cairo']">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#111927] via-[#0d1424] to-[#091b1f] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  فحص وتوثيق مفتاح OpenAI API الحقيقي
                </h2>
                <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  Live Verification
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                فحص أصالة المفتاح، والتأكد من نشاط الرصيد، وربطه بنموذج Machine Learning (10y Gold)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Key Input Section */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                مفتاح OpenAI Secret Key (يبدأ بـ sk-...):
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
                >
                  <span>الحصول على مفتاح من OpenAI</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setVerificationResult(null);
                  setLiveTestResult(null);
                }}
                placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full pl-24 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
              />

              <div className="absolute left-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title={showPassword ? "إخفاء المفتاح" : "إظهار المفتاح"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Diagnostic Verification Trigger */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVerifyKey()}
                  disabled={isVerifying || !apiKeyInput.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>جاري فحص المفتاح مع OpenAI...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-slate-950 fill-current" />
                      <span>فحص وتوثيق المفتاح الحقيقي الآن</span>
                    </>
                  )}
                </button>

                {apiKeyInput.trim() && (
                  <button
                    onClick={handleClear}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-colors"
                    title="حذف المفتاح وإلغاء الربط"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <span className="text-[11px] text-slate-400">
                يتم الفحص المباشر عبر خادم البروكسي الداخلي بدون كشف المفتاح للواجهة العامة.
              </span>
            </div>
          </div>

          {/* Verification Result Display */}
          {verificationResult && (
            <div
              className={`p-4 rounded-xl border animate-in fade-in transition-all ${
                verificationResult.valid
                  ? "bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                  : "bg-rose-950/30 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {verificationResult.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-sm font-bold ${
                          verificationResult.valid ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {verificationResult.valid
                          ? "مفتاح OpenAI حقيقي ومصادق عليه بنجاح 🟢"
                          : "فشل التحقق من المفتاح 🔴"}
                      </h4>
                      {verificationResult.latencyMs !== undefined && (
                        <span className="text-[10px] font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {verificationResult.latencyMs} ms
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {verificationResult.messageAr}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase font-mono ${
                    verificationResult.valid
                      ? "bg-emerald-400 text-slate-950"
                      : "bg-rose-400 text-slate-950"
                  }`}
                >
                  {verificationResult.status}
                </span>
              </div>

              {/* Verified Details Matrix */}
              {verificationResult.valid && (
                <div className="mt-3 pt-3 border-t border-emerald-500/30 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">النموذج النشط المستهدف:</span>
                    <strong className="text-emerald-400 font-mono">
                      {verificationResult.activeModel || "gpt-4o-mini"}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">حالة رصيد التوليد:</span>
                    <strong className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      نشط ومكتمل الصلاحية
                    </strong>
                  </div>

                  {verificationResult.modelsAvailable && verificationResult.modelsAvailable.length > 0 && (
                    <div className="col-span-full p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                      <span className="text-slate-400 block text-[10px]">
                        النماذج المعتمدة المكتشفة في حسابك:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {verificationResult.modelsAvailable.map((m, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-950 text-emerald-300 font-mono text-[10px] border border-emerald-500/30"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Troubleshooting Tips if Failed */}
              {!verificationResult.valid && (
                <div className="mt-3 pt-3 border-t border-rose-500/30 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>إرشادات حل المشكلة:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                    {verificationResult.status === "invalid_key" && (
                      <>
                        <li>تأكد من نسخ المفتاح كاملاً دون أي مسافات إضافية في البداية أو النهاية.</li>
                        <li>
                          تأكد أن المفتاح لم يتم حذفه من صفحة{" "}
                          <a
                            href="https://platform.openai.com/api-keys"
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-400 underline"
                          >
                            مفاتيح OpenAI API
                          </a>
                          .
                        </li>
                      </>
                    )}
                    {verificationResult.status === "quota_exceeded" && (
                      <>
                        <li className="text-amber-200">المفتاح حقيقي وصحيح، ولكن رصيد الائتمان (Credits) في حسابك على OpenAI هو 0 دولار.</li>
                        <li>
                          يمكنك إضافة رصيد مسبق الدفع في{" "}
                          <a
                            href="https://platform.openai.com/settings/organization/billing"
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-400 underline font-bold"
                          >
                            إعدادات الفوترة (OpenAI Billing)
                          </a>
                          ، أو الاعتماد مباشرة على المحرك المؤسسي المدمج المجاني.
                        </li>
                        <li className="pt-1 list-none">
                          <button
                            type="button"
                            onClick={() => {
                              handleClear();
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                            <span>تفعيل المحرك المؤسسي المدمج مجاناً (بدون مفتاح خارجي)</span>
                          </button>
                        </li>
                      </>
                    )}
                    {verificationResult.rawError && (
                      <li className="font-mono text-[10px] text-slate-400">
                        الخطأ التقني: {verificationResult.rawError}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Live Analysis Generation Test Section */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white">
                  اختبار التحليل المباشر مع شارت الذهب (Live Diagnostic Prompt):
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                السعر الحالي: ${currentPrice.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-slate-300">
              يقوم هذا الاختبار بإرسال طلب تحليل فوري إلى OpenAI باستخدام مفتاحك الحقيقي وعرض الرد الفعلي الصادر مباشرة للتأكد بنسبة 100% من نجاح الاستجابة.
            </p>

            <button
              onClick={handleRunLiveAnalysisTest}
              disabled={isTestingLive || !apiKeyInput.trim()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              {isTestingLive ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>جاري طلب تحليل حي من OpenAI...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                  <span>تجربة طلب تحليل حي للذهب الآن (Live Prompt)</span>
                </>
              )}
            </button>

            {liveTestResult && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    استجابة حية ومباشرة من خوادم OpenAI ({liveTestResult.model || "gpt-4o-mini"}):
                  </span>
                  {liveTestResult.latencyMs && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      زمن المعالجة: {liveTestResult.latencyMs} ms
                    </span>
                  )}
                </div>

                {liveTestResult.success ? (
                  <>
                    <p className="text-xs text-slate-100 leading-relaxed font-semibold bg-slate-950 p-3 rounded-lg border border-slate-800">
                      {liveTestResult.text}
                    </p>
                    {liveTestResult.usage && (
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span>توكنات الإدخال: {liveTestResult.usage.prompt_tokens}</span>
                        <span>توكنات التوليد: {liveTestResult.usage.completion_tokens}</span>
                        <span>الإجمالي: {liveTestResult.usage.total_tokens}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-rose-300 font-semibold bg-rose-950/30 p-2.5 rounded-lg border border-rose-800">
                    {liveTestResult.errorAr}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAndApply}
              disabled={!apiKeyInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>حفظ وربط المفتاح بنموذج 10y ML</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>الحالة الحالية:</span>
            <strong
              className={`font-bold ${
                verificationResult?.valid
                  ? "text-emerald-400"
                  : savedKey
                  ? "text-amber-400"
                  : "text-slate-400"
              }`}
            >
              {verificationResult?.valid
                ? "مفتاح حقيقي نشط وموثق"
                : savedKey
                ? "مفتاح مسجل (بحاجة لفحص)"
                : "غير مربوط (النموذج المحلي نشط)"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
