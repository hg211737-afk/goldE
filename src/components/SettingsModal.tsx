import React, { useState } from "react";
import {
  SlidersVertical,
  X,
  Key,
  Radio,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Cpu,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { AppSettings } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  connectionStatus?: {
    connected: boolean;
    latencyMs: number;
    source: string;
    updatesCount: number;
  };
  onResyncFeed?: () => void;
}

type TabType = "ai" | "feed" | "orderflow";

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  connectionStatus,
  onResyncFeed,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("ai");
  const [apiKeyInput, setApiKeyInput] = useState(settings.customGeminiApiKey || "");
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState<string>("");

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    onUpdateSettings({ customGeminiApiKey: trimmed });
    try {
      localStorage.setItem("gold_orderflow_gemini_key", trimmed);
    } catch {
      // ignore
    }
  };

  const handleTestApiKey = async () => {
    setTestStatus("testing");
    setTestMessage("جاري فحص الاتصال بنموذج الذكاء الاصطناعي...");
    try {
      const res = await fetch("/api/gemini/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKeyInput.trim() || settings.customGeminiApiKey || "",
          model: settings.aiModel || "gemini-3.6-flash",
        }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setTestStatus("success");
        setTestMessage(data.message || "تم التحقق من المفتاح بنجاح! جاهز للتحليل اللحظي.");
        handleSaveApiKey();
      } else {
        setTestStatus("error");
        setTestMessage(data.message || "فشل التحقق من المفتاح، يرجى التأكد من صحة المفتاح.");
      }
    } catch (err: any) {
      setTestStatus("error");
      setTestMessage("تعذر الاتصال بخادم الفحص: " + (err?.message || "خطأ في الشبكة"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0e131f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-['Cairo'] max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <SlidersVertical className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">إعدادات المنصة والذكاء الاصطناعي</h2>
              <p className="text-[11px] text-slate-400">تخصيص مزود أسعار الذهب اللحظية ومفتاح API للتحليل المؤسسي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-1 border-b border-slate-800/80 bg-slate-950/40 text-xs">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "ai"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>مفتاح الذكاء الاصطناعي (Gemini API)</span>
            {settings.customGeminiApiKey && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("feed")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "feed"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>سعر الذهب اللحظي (Live Feed)</span>
          </button>

          <button
            onClick={() => setActiveTab("orderflow")}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === "orderflow"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>أبعاد الفوت برنت (OrderFlow)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* TAB 1: AI GEMINI API */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-amber-300">ربط مفتاح الذكاء الاصطناعي بتطبيقك</p>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      قم بإدخال مفتاح Gemini API الخاص بك ليقوم التطبيق بتحليل شموع الفوت برنت وتدفق الأوامر للذهب وسحب السيولة (BSL/SSL) بشكل فوري ومباشر دون حدود للاستخدام.
                    </p>
                  </div>
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>مفتاح Gemini API الشخصي:</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
                  >
                    <span>الحصول على مفتاح مجاني</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => {
                      setApiKeyInput(e.target.value);
                      setTestStatus("idle");
                    }}
                    placeholder="AIzaSy..."
                    className="w-full pl-24 pr-10 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <div className="absolute right-3 text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <div className="absolute left-2.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                      title={showKey ? "إخفاء" : "إظهار"}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {apiKeyInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setApiKeyInput("");
                          onUpdateSettings({ customGeminiApiKey: "" });
                          localStorage.removeItem("gold_orderflow_gemini_key");
                          setTestStatus("idle");
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-red-400 cursor-pointer"
                      >
                        مسح
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions & Test Key */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={handleTestApiKey}
                    disabled={testStatus === "testing"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-sm"
                  >
                    {testStatus === "testing" ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري فحص المفتاح...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>فحص واختبار المفتاح</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSaveApiKey}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
                  >
                    حفظ في التطبيق
                  </button>

                  {settings.customGeminiApiKey && (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 mr-auto">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>مفتاحك الشخصي محفوظ ونشط</span>
                    </span>
                  )}
                </div>

                {/* Test Feedback */}
                {testStatus === "success" && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-start gap-2 animate-in fade-in duration-150">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{testMessage}</span>
                  </div>
                )}

                {testStatus === "error" && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] flex items-start gap-2 animate-in fade-in duration-150">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{testMessage}</span>
                  </div>
                )}
              </div>

              {/* Model Selection */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <label className="text-slate-300 font-semibold block">نموذج الذكاء الاصطناعي المفضل للتحليل:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash", desc: "الأحدث وفائق السرعة (موصى به)" },
                    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "نموذج مستقر وعالي الدقة" },
                    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", desc: "استجابة سريعة لبيانات السوق" },
                    { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", desc: "كفاءة عالية وموثوقة" },
                  ].map((m) => {
                    const isSelected = (settings.aiModel || "gemini-3.6-flash") === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onUpdateSettings({ aiModel: m.id })}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-400 text-amber-300 shadow-sm"
                            : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        <div className="font-mono font-bold text-xs">{m.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE GOLD FEED */}
          {activeTab === "feed" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-bold text-xs text-white">حالة الاتصال المباشر بأسعار الذهب:</span>
                  </div>
                  {onResyncFeed && (
                    <button
                      onClick={onResyncFeed}
                      className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/20 transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>إعادة مزامنة البث</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-slate-500 text-[10px]">المزود الحالي</div>
                    <div className="text-emerald-400 font-bold truncate">Binance WS 100ms</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-slate-500 text-[10px]">زمن الاستجابة Ping</div>
                    <div className="text-amber-400 font-bold">
                      {connectionStatus?.latencyMs ? `${connectionStatus.latencyMs}ms` : "32ms"}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="text-slate-500 text-[10px]">تحديثات بالثانية</div>
                    <div className="text-cyan-400 font-bold">~10 Ticks/sec</div>
                  </div>
                </div>
              </div>

              {/* Provider Selection */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">اختر مصدر ومزود تدفق الأسعار:</label>
                <div className="space-y-2">
                  {[
                    {
                      id: "binance_spot",
                      name: "Binance Gold Spot (PAXG/USDT)",
                      badge: "بث WebSocket لحظي 100ms (الأسرع)",
                      desc: "مطابق لعقود أونصة الذهب الفيزيائي الفوري 1:1 XAU/USD مع عمق صفقات حي وتدفق فوري تكة بتكة.",
                    },
                    {
                      id: "binance_futures",
                      name: "Binance Futures (PAXGUSDT Perp)",
                      badge: "عقود الذهب الآجلة",
                      desc: "بيانات تداول السيولة العالية والمراكز الكبرى لصناع السوق والمؤسسات المالية.",
                    },
                    {
                      id: "tradingview",
                      name: "TradingView & OANDA XAUUSD Feed",
                      badge: "شارت المنصات العالمية",
                      desc: "الربط التفاعلي مع ويدجت TradingView المباشر لأسعار الذهب الفورية العالمية.",
                    },
                  ].map((prov) => {
                    const isSelected = (settings.goldDataProvider || "binance_spot") === prov.id;
                    return (
                      <button
                        key={prov.id}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            goldDataProvider: prov.id as any,
                          })
                        }
                        className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col gap-1 ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-400 text-white shadow-sm"
                            : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-xs text-white">{prov.name}</div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {prov.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{prov.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORDER FLOW SETTINGS */}
          {activeTab === "orderflow" && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  نسبة اختلال الحجم القطري (Diagonal Imbalance Ratio)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[2.5, 3, 4].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => onUpdateSettings({ imbalanceRatio: ratio })}
                      className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                        settings.imbalanceRatio === ratio
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {ratio * 100}%
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  النسبة التي يعتبر عندها تدفق الشراء أو البيع الماركت كاسحاً للطلب أو العرض المقابل.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  حجم التكة السعرية لتجميع الشموع (Tick Size)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[0.5, 1, 2].map((ts) => (
                    <button
                      key={ts}
                      onClick={() => onUpdateSettings({ tickSize: ts })}
                      className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                        settings.tickSize === ts
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      ${ts.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  حد صفقات الحيتان الكبيرة (Whale Orders Threshold)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((th) => (
                    <button
                      key={th}
                      onClick={() => onUpdateSettings({ whaleThreshold: th })}
                      className={`py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer ${
                        settings.whaleThreshold === th
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {th} Lots
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
                  <span className="text-slate-300 font-medium">تمييز اختلالات الشراء والبيع بالألوان</span>
                  <input
                    type="checkbox"
                    checked={settings.showImbalances}
                    onChange={(e) => onUpdateSettings({ showImbalances: e.target.checked })}
                    className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
                  <span className="text-slate-300 font-medium">إبراز نقطة التحكم في الحجم (POC Highlight)</span>
                  <input
                    type="checkbox"
                    checked={settings.showPOC}
                    onChange={(e) => onUpdateSettings({ showPOC: e.target.checked })}
                    className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 cursor-pointer">
                  <span className="text-slate-300 font-medium">تنبيهات صوتية عند اصطياد مناطق السيولة</span>
                  <input
                    type="checkbox"
                    checked={settings.soundAlerts}
                    onChange={(e) => onUpdateSettings({ soundAlerts: e.target.checked })}
                    className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>البيانات تُحفظ تلقائياً في متصفحك</span>
          </div>
          <button
            onClick={() => {
              handleSaveApiKey();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md"
          >
            تطبيق وحفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};
