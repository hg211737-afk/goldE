import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Volume2,
  VolumeX,
  ShieldAlert,
  Flame,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Crosshair,
  EyeOff,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";
import { soundFx } from "../services/soundService";
import { voiceAlert } from "../services/voiceAlertService";

interface WhaleSonarRadarViewProps {
  currentPrice: number;
}

interface IcebergOrder {
  id: string;
  price: number;
  direction: "BUY" | "SELL";
  visibleLots: number;
  estimatedHiddenLots: number;
  totalVolumeOz: number;
  institutionName: string;
  confidence: number;
  timestamp: string;
  status: "absorbing" | "active" | "filled";
}

interface SpoofingEvent {
  id: string;
  price: number;
  fakeLots: number;
  durationMs: number;
  intentionAr: string;
  timestamp: string;
}

export const WhaleSonarRadarView: React.FC<WhaleSonarRadarViewProps> = ({ currentPrice }) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<"iceberg" | "darkpool" | "spoofing">("iceberg");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const p = currentPrice > 1000 ? currentPrice : 4293.65;

  // Real-time simulated Iceberg orders around current price
  const icebergs: IcebergOrder[] = [
    {
      id: "ice_1",
      price: Number((p - 5.8).toFixed(2)),
      direction: "BUY",
      visibleLots: 18,
      estimatedHiddenLots: 640,
      totalVolumeOz: 64000,
      institutionName: "JPMorgan Bullion Desk (NY)",
      confidence: 96.8,
      timestamp: "منذ 12 ثانية",
      status: "absorbing",
    },
    {
      id: "ice_2",
      price: Number((p - 8.4).toFixed(2)),
      direction: "BUY",
      visibleLots: 24,
      estimatedHiddenLots: 920,
      totalVolumeOz: 92000,
      institutionName: "UBS Geneva Vault Reserve",
      confidence: 98.4,
      timestamp: "منذ دقيقة",
      status: "active",
    },
    {
      id: "ice_3",
      price: Number((p + 12.2).toFixed(2)),
      direction: "SELL",
      visibleLots: 30,
      estimatedHiddenLots: 780,
      totalVolumeOz: 78000,
      institutionName: "HSBC Gold Clearing Desk",
      confidence: 94.2,
      timestamp: "منذ 4 دقائق",
      status: "active",
    },
    {
      id: "ice_4",
      price: Number((p + 18.6).toFixed(2)),
      direction: "SELL",
      visibleLots: 15,
      estimatedHiddenLots: 510,
      totalVolumeOz: 51000,
      institutionName: "Standard Chartered London",
      confidence: 91.5,
      timestamp: "منذ 8 دقائق",
      status: "active",
    },
  ];

  // Spoofing events
  const spoofingAlerts: SpoofingEvent[] = [
    {
      id: "spf_1",
      price: Number((p + 4.5).toFixed(2)),
      fakeLots: 350,
      durationMs: 380,
      intentionAr: "إيهام صغار المتداولين بوجود جدار بيعي ضخم لدفعهم للبيع قبل سحبه فجأة",
      timestamp: "منذ دقيقتين",
    },
    {
      id: "spf_2",
      price: Number((p - 3.2).toFixed(2)),
      fakeLots: 420,
      durationMs: 420,
      intentionAr: "وضع طلب شراء ضخم وإلغاؤه في 420ms لاصطياد أوامر الشراء التدافعية",
      timestamp: "منذ 6 دقائق",
    },
  ];

  // Radar Animation Loop on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let angle = 0;
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      // Draw concentric radar circles
      const rings = [0.25, 0.5, 0.75, 1];
      rings.forEach((r, idx) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * r, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 3 ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Distance text
        ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
        ctx.font = "9px JetBrains Mono, monospace";
        ctx.fillText(`$${(idx + 1) * 5}`, centerX + 6, centerY - radius * r + 10);
      });

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rotating Sonar Beam
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );
      gradient.addColorStop(0, "rgba(16, 185, 129, 0.35)");
      gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + 0.45);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();

      // Draw Iceberg Target Blips on Radar
      icebergs.forEach((ice, index) => {
        const dist = Math.abs(ice.price - p);
        const normDist = Math.min(1, dist / 22) * radius;
        const blipAngle = (index * 1.57) + 0.6; // Distributed around radar
        const bx = centerX + Math.cos(blipAngle) * normDist;
        const by = centerY + Math.sin(blipAngle) * normDist;

        // Blip glow
        ctx.beginPath();
        ctx.arc(bx, by, ice.direction === "BUY" ? 6 : 5, 0, Math.PI * 2);
        ctx.fillStyle = ice.direction === "BUY" ? "#10b981" : "#f43f5e";
        ctx.shadowColor = ice.direction === "BUY" ? "#10b981" : "#f43f5e";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = "#ffffff";
        ctx.font = "10px Cairo, sans-serif";
        ctx.fillText(`${ice.estimatedHiddenLots}L @ $${ice.price}`, bx + 8, by + 3);
      });

      // Center (Current Price)
      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      angle += 0.025;
      if (angle >= Math.PI * 2) angle = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [p]);

  const handleTestAudioSonar = () => {
    soundFx.playIcebergAlert();
  };

  const handleTestVoice = () => {
    voiceAlert.speak(
      `تنبيه رادار الحيتان: تم رصد أمر آيسبرغ مخفي عند سعر ${icebergs[0].price} بحجم ستمائة وأربعين لوت تديره جي بي مورجان!`,
      "urgent"
    );
  };

  return (
    <div className="flex-1 flex flex-col p-2 sm:p-4 bg-[#0a0d14] text-slate-100 font-['Cairo'] overflow-y-auto space-y-4">
      {/* Top Cockpit Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border-2 border-emerald-500/40 shadow-2xl flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="relative p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Radio className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                رادار الحيتان والصفقات الخفية (Whale Dark Pool &amp; Iceberg Radar)
              </h2>
              <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black animate-pulse">
                مسح صوتي لحظي
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              كشف أوامر الآيسبرغ المخفية في خوادم البنوك، صفقات الدارك بول المعتمة، وتعرية السيولة الوهمية (Spoofing)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTestAudioSonar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold text-xs cursor-pointer shadow-md active:scale-95"
            title="تجربة صوت سونار الرادار"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>سونار صوتي</span>
          </button>

          <button
            onClick={handleTestVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs cursor-pointer shadow-md active:scale-95"
            title="تشغيل التنبيه الصوتي التكتيكي"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>تنبيه المساعد الصوتي</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Radar Screen (Left/Top) + Institutional Analysis (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Radar Screen Canvas Card */}
        <div className="lg:col-span-6 p-4 rounded-2xl bg-[#0c101a] border border-emerald-500/30 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          {/* Radar Screen Status HUD */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              SONAR ACTIVE: 360° SWEEP
            </span>
            <span className="text-amber-400 font-bold">السعر المركزي: ${p.toFixed(2)}</span>
          </div>

          {/* Canvas Radar */}
          <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              className="w-full h-full rounded-full bg-radial from-[#091515] to-[#04080a] border-2 border-emerald-500/40 shadow-[inset_0_0_40px_rgba(16,185,129,0.2)]"
            />
          </div>

          <div className="w-full grid grid-cols-3 gap-2 mt-3 text-center text-xs font-mono">
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">أوامر مخفية مرصودة:</span>
              <span className="text-emerald-400 font-black text-sm">4 أوامر</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">حجم الآيسبرغ المقدر:</span>
              <span className="text-amber-400 font-black text-sm">2,850 لوت</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">محاولات التلاعب:</span>
              <span className="text-rose-400 font-black text-sm">2 Spoofs</span>
            </div>
          </div>
        </div>

        {/* Intelligence Feed & Tabs */}
        <div className="lg:col-span-6 space-y-3">
          {/* Navigation Pill Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setSelectedTab("iceberg")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === "iceberg"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <EyeOff className="w-4 h-4" />
              <span>أوامر الآيسبرغ المخفية ({icebergs.length})</span>
            </button>
            <button
              onClick={() => setSelectedTab("spoofing")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === "spoofing"
                  ? "bg-rose-500 text-white shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>كاشف التلاعب والسيولة الوهمية</span>
            </button>
            <button
              onClick={() => setSelectedTab("darkpool")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === "darkpool"
                  ? "bg-indigo-600 text-white shadow-md font-black"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>الدارك بول OTC</span>
            </button>
          </div>

          {/* Iceberg Orders Feed */}
          {selectedTab === "iceberg" && (
            <div className="space-y-2.5">
              {icebergs.map((ice) => (
                <div
                  key={ice.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    ice.direction === "BUY"
                      ? "bg-gradient-to-r from-emerald-950/20 via-slate-900 to-slate-950 border-emerald-500/40"
                      : "bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-950 border-rose-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-black ${
                          ice.direction === "BUY"
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {ice.direction === "BUY" ? "شراء آيسبرغ" : "بيع آيسبرغ"}
                      </span>
                      <span className="font-mono text-sm font-black text-amber-400">
                        ${ice.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">({ice.timestamp})</span>
                    </div>

                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                      دقة الرصد: {ice.confidence}%
                    </span>
                  </div>

                  {/* Volume Comparison: Visible vs Hidden */}
                  <div className="grid grid-cols-2 gap-2 mt-2.5 font-mono text-xs">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-['Cairo']">
                        الكمية الظاهرة في دفتر الأوامر:
                      </span>
                      <span className="text-slate-300 font-bold">{ice.visibleLots} لوت فقط</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 block font-['Cairo']">
                        الحجم الحقيقي المخفي (Real Size):
                      </span>
                      <span className="text-emerald-300 font-black text-sm">
                        {ice.estimatedHiddenLots} لوت ({ice.totalVolumeOz.toLocaleString()} أونصة)
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      البنك المنفذ: <strong className="text-white">{ice.institutionName}</strong>
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      {ice.status === "absorbing" ? "يحدث امتصاص تدافعي لحظي" : "أمر سلبي جاهز للاقتناص"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Spoofing Alerts */}
          {selectedTab === "spoofing" && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                <strong>ما هو السبووفينج (Spoofing)؟</strong> هو أسلوب تلاعب محظور تضعه الحيتان لخداع المتداولين بوجود جدار سيولة ضخم، ثم تلغيه في أقل من 500ms بمجرد اقتراب السعر لدفع السوق في الاتجاه المعاكس!
              </div>

              {spoofingAlerts.map((spf) => (
                <div
                  key={spf.id}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-rose-950/20 via-slate-900 to-slate-950 border border-rose-500/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      رصد إلغاء تلاعبي خاطف (Spoof Canceled)
                    </span>
                    <span className="font-mono text-xs text-slate-400">{spf.timestamp}</span>
                  </div>

                  <div className="flex items-center justify-between font-mono text-xs">
                    <span>
                      السعر المتلاعب به: <strong className="text-amber-400">${spf.price.toFixed(2)}</strong>
                    </span>
                    <span>
                      الكمية الملغاة: <strong className="text-rose-400">{spf.fakeLots} لوت</strong>
                    </span>
                    <span>
                      سرعة الإلغاء: <strong className="text-teal-300">{spf.durationMs}ms</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-amber-400 block mb-0.5">نية صانع السوق من هذا الفخ:</strong>
                    {spf.intentionAr}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Dark Pool OTC */}
          {selectedTab === "darkpool" && (
            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>صفقات الدارك بول المعتمة (OTC Dark Pool Volume)</span>
                </h4>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-md font-bold">
                  $4.82B اليوم
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                أكثر من 68% من تداولات الذهب المؤسسية الكبرى لا تمر عبر دفاتر الأوامر العامة، بل تتم عبر شبكات الدارك بول للبنوك الاستثمارية الكبرى في لندن ونيويورك لتجنب تحريك السعر قبل اكتمال الشراء.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-['Cairo']">نسبة الصفقات الشرائية:</span>
                  <span className="text-emerald-400 font-black text-sm">74.2% تجميع</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-['Cairo']">متوسط سعر التنفيذ المعتم:</span>
                  <span className="text-amber-400 font-black text-sm">${(p - 3.4).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
