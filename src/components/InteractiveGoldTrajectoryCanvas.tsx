import React, { useState, useEffect, useRef } from "react";
import {
  Compass,
  TrendingUp,
  Target,
  Sparkles,
  Volume2,
  Clock,
  Layers,
  Zap,
  ArrowRight,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { soundFx } from "../services/soundService";
import { voiceAlert } from "../services/voiceAlertService";

interface Waypoint {
  id: number;
  label: string;
  subLabel: string;
  price: number;
  type: "start" | "sweep" | "bounce" | "breakout" | "tp1" | "tp2";
  timeWindow: string;
  expectedDelta: string;
  descriptionAr: string;
  probability: number;
}

interface InteractiveGoldTrajectoryCanvasProps {
  currentPrice: number;
  primaryDirection?: "BULLISH_EXPANSION" | "BEARISH_BREAKDOWN" | "RANGE_REVERSAL_BOUNCE" | string;
  reversalPrice: number;
  target1Price: number;
  target2Price: number;
}

export const InteractiveGoldTrajectoryCanvas: React.FC<InteractiveGoldTrajectoryCanvasProps> = ({
  currentPrice,
  primaryDirection,
  reversalPrice,
  target1Price,
  target2Price,
}) => {
  const [activeModel, setActiveModel] = useState<"smc" | "fib" | "orderflow">("smc");
  const [selectedWaypoint, setSelectedWaypoint] = useState<number>(2);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const p = currentPrice > 1000 ? currentPrice : 4293.65;
  const bounce = reversalPrice > 1000 ? reversalPrice : Number((p - 8.4).toFixed(2));
  const sweep = Number((bounce + 2.2).toFixed(2));
  const breakout = Number((p + 5.5).toFixed(2));
  const tp1 = target1Price > 1000 ? target1Price : Number((p + 16.5).toFixed(2));
  const tp2 = target2Price > 1000 ? target2Price : Number((p + 32.0).toFixed(2));

  // Dynamic waypoints based on model
  const waypoints: Waypoint[] = [
    {
      id: 0,
      label: "السعر اللحظي (الانطلاق)",
      subLabel: "Current Price Origin",
      price: p,
      type: "start",
      timeWindow: "الآن لحظياً",
      expectedDelta: "+15 Neutral",
      descriptionAr: "نقطة ارتكاز السعر اللحظي وبدء تشكل نمط فخ الإغراء اللحظي.",
      probability: 100,
    },
    {
      id: 1,
      label: "فخ الإغراء (Inducement Sweep)",
      subLabel: "Liquidity Grab Wave",
      price: sweep,
      type: "sweep",
      timeWindow: "خلال 10 - 20 دقيقة",
      expectedDelta: "-85 Heavy Sell",
      descriptionAr: "هبوط خاطف لاستدراج المتداولين الصغار للبيع قبل ابتلاع مراكزهم.",
      probability: 91.5,
    },
    {
      id: 2,
      label: "الجيب الذهبي (نقطة الارتداد الحتمي)",
      subLabel: "Golden Pocket 0.618 & VAL",
      price: bounce,
      type: "bounce",
      timeWindow: "خلال 25 - 40 دقيقة",
      expectedDelta: "+340 Absorption",
      descriptionAr: "تلاقي قاع بروفايل المزاد مع فيبوناتشي 0.618 وكتلة طلب غير مخترقة. ارتداد حتمي بالملي.",
      probability: 97.8,
    },
    {
      id: 3,
      label: "الكسر الهيكلي الصاعد (BOS Breakout)",
      subLabel: "Impulse Acceleration",
      price: breakout,
      type: "breakout",
      timeWindow: "خلال 45 - 60 دقيقة",
      expectedDelta: "+210 Buy Imbalance",
      descriptionAr: "اختراق قمة المزاد السابقة وتحول السوق لزخم اندفاعي متسارع.",
      probability: 89.2,
    },
    {
      id: 4,
      label: "المحطة الأولى (TP1 Primary Target)",
      subLabel: "EQH Liquidity Target",
      price: tp1,
      type: "tp1",
      timeWindow: "جلسة نيويورك النشطة",
      expectedDelta: "+480 Whale TP",
      descriptionAr: "اقتناص حوض سيولة القمم BSL المتراكمة وسقف الفاب المؤسسي.",
      probability: 92.4,
    },
    {
      id: 5,
      label: "التوسع النهائي (TP2 Expansion Target)",
      subLabel: "Macro High Vault Target",
      price: tp2,
      type: "tp2",
      timeWindow: "إغلاق نيويورك / أسبوعي",
      expectedDelta: "+620 Extreme Run",
      descriptionAr: "توسع تدافعي مدفوع بالشراء السيادي وانفجار الشورت سكويز.",
      probability: 78.6,
    },
  ];

  // Canvas Animation: Flight Path Curves & Animated Glowing Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particleProgress = 0;
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const padding = { top: 40, bottom: 50, left: 60, right: 60 };

      const minPrice = bounce - 4.0;
      const maxPrice = tp2 + 4.0;
      const priceRange = maxPrice - minPrice || 1;

      const getY = (val: number) => {
        const normalized = (val - minPrice) / priceRange;
        return h - padding.bottom - normalized * (h - padding.top - padding.bottom);
      };

      const getX = (idx: number) => {
        return padding.left + (idx / (waypoints.length - 1)) * (w - padding.left - padding.right);
      };

      // Draw Grid Lines & Prices
      const gridLevels = [bounce, p, breakout, tp1, tp2];
      gridLevels.forEach((lvl) => {
        const y = getY(lvl);
        ctx.beginPath();
        ctx.moveTo(padding.left - 20, y);
        ctx.lineTo(w - padding.right + 20, y);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
        ctx.font = "9px JetBrains Mono, monospace";
        ctx.fillText(`$${lvl.toFixed(1)}`, 8, y + 3);
      });

      // Draw Flight Path Trajectory Curve (Smooth Spline)
      ctx.beginPath();
      ctx.moveTo(getX(0), getY(waypoints[0].price));

      for (let i = 0; i < waypoints.length - 1; i++) {
        const x1 = getX(i);
        const y1 = getY(waypoints[i].price);
        const x2 = getX(i + 1);
        const y2 = getY(waypoints[i + 1].price);

        const cx1 = x1 + (x2 - x1) / 2;
        const cy1 = y1;
        const cx2 = x1 + (x2 - x1) / 2;
        const cy2 = y2;

        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
      }

      ctx.strokeStyle = "rgba(245, 158, 11, 0.85)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Draw Flight Path Fill Area under curve
      ctx.lineTo(getX(waypoints.length - 1), h - padding.bottom);
      ctx.lineTo(getX(0), h - padding.bottom);
      ctx.closePath();
      const fillGradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
      fillGradient.addColorStop(0, "rgba(245, 158, 11, 0.15)");
      fillGradient.addColorStop(1, "rgba(245, 158, 11, 0.0)");
      ctx.fillStyle = fillGradient;
      ctx.fill();

      // Draw Animated Flying Energy Particle along the trajectory
      const totalSegments = waypoints.length - 1;
      const currentSegment = Math.min(
        totalSegments - 1,
        Math.floor(particleProgress * totalSegments)
      );
      const segmentT = (particleProgress * totalSegments) % 1;

      const pX1 = getX(currentSegment);
      const pY1 = getY(waypoints[currentSegment].price);
      const pX2 = getX(currentSegment + 1);
      const pY2 = getY(waypoints[currentSegment + 1].price);

      const partX = pX1 + (pX2 - pX1) * segmentT;
      const partY = pY1 + (pY2 - pY1) * segmentT;

      ctx.beginPath();
      ctx.arc(partX, partY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Waypoint Beacons (Nodes)
      waypoints.forEach((wp, idx) => {
        const x = getX(idx);
        const y = getY(wp.price);
        const isSelected = selectedWaypoint === wp.id;

        // Outer Glow Ring
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 12 : 8, 0, Math.PI * 2);
        ctx.fillStyle =
          wp.type === "bounce"
            ? "rgba(16, 185, 129, 0.25)"
            : wp.type === "sweep"
            ? "rgba(244, 63, 94, 0.25)"
            : "rgba(245, 158, 11, 0.25)";
        ctx.fill();

        // Node Circle
        ctx.beginPath();
        ctx.arc(x, y, isSelected ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle =
          wp.type === "bounce"
            ? "#10b981"
            : wp.type === "sweep"
            ? "#f43f5e"
            : isSelected
            ? "#ffffff"
            : "#f59e0b";
        ctx.fill();

        // Node Price Label
        ctx.fillStyle = isSelected ? "#ffffff" : "rgba(226, 232, 240, 0.85)";
        ctx.font = isSelected ? "bold 11px JetBrains Mono, monospace" : "10px JetBrains Mono, monospace";
        ctx.fillText(`$${wp.price.toFixed(2)}`, x - 22, y - 14);

        // Step Name below
        ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
        ctx.font = "9px Cairo, sans-serif";
        ctx.fillText(`المحطة ${idx + 1}`, x - 14, h - padding.bottom + 18);
      });

      particleProgress += 0.0035;
      if (particleProgress >= 1) particleProgress = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [p, bounce, sweep, breakout, tp1, tp2, selectedWaypoint, waypoints]);

  const handleSpeakFlightPath = () => {
    soundFx.playSonarPing();
    const text = `الملاحة الصوتية لمسار الذهب: الاتجاه المؤسسي صاعد باحتمالية سبعة وتسعين في المائة. المسار المعتمد: ارتداد حتمي من نقطة الجيب الذهبي عند سعر ${bounce} دولار، يليه كسر هيكلي صاعد نحو المحطة الأولى عند ${tp1} دولار، ثم التوسع للهدف النهائي عند ${tp2} دولار!`;
    voiceAlert.speak(text, "urgent");
  };

  const currentWp = waypoints[selectedWaypoint] || waypoints[2];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c121e] via-[#090d15] to-[#0d161a] border-2 border-amber-500/40 shadow-2xl space-y-4 font-['Cairo'] text-xs">
      {/* Flight Control Cockpit Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                خارطة الملاحة الفضائية لمسار الذهب (Gold Trajectory Flight Path)
              </h3>
              <span className="text-[10px] bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 px-2 py-0.5 rounded-full font-black animate-pulse">
                دقة جراحية 97.8%
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              توجيه حركي تفاعلي متطور لمحطات الارتداد، وفخاخ الإغراء، والتوسع التدافعي خطوة بخطوة
            </p>
          </div>
        </div>

        {/* Model Selector & Audio Navigation */}
        <div className="flex items-center gap-2">
          {/* Methodology Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => {
                setActiveModel("smc");
                soundFx.playHudClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeModel === "smc"
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              هندسة السيولة SMC
            </button>
            <button
              onClick={() => {
                setActiveModel("fib");
                soundFx.playHudClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeModel === "fib"
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              فيبوناتشي 0.618
            </button>
            <button
              onClick={() => {
                setActiveModel("orderflow");
                soundFx.playHudClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeModel === "orderflow"
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              تدفق الأوامر والامتصاص
            </button>
          </div>

          <button
            onClick={handleSpeakFlightPath}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black text-xs cursor-pointer shadow-lg active:scale-95"
            title="الاستماع للملاحة الصوتية التكتيكية للمسار"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ملاحة صوتية للمسار</span>
          </button>
        </div>
      </div>

      {/* Interactive Visual Flight Path Canvas */}
      <div className="relative w-full h-[280px] sm:h-[320px] bg-slate-950/80 rounded-2xl border border-amber-500/25 overflow-hidden shadow-inner">
        {/* HUD Overlay Info */}
        <div className="absolute top-2.5 right-3 text-[10px] text-slate-400 font-mono z-10 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>TRAJECTORY BEACON ACTIVE: 6 WAYPOINTS</span>
        </div>

        <canvas
          ref={canvasRef}
          width={880}
          height={320}
          className="w-full h-full"
        />
      </div>

      {/* Waypoint Waystation Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {waypoints.map((wp) => (
          <button
            key={wp.id}
            onClick={() => {
              setSelectedWaypoint(wp.id);
              soundFx.playHudClick();
            }}
            className={`flex-1 min-w-[125px] p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
              selectedWaypoint === wp.id
                ? "bg-gradient-to-b from-amber-500/20 to-slate-900 border-amber-500 text-white shadow-md font-bold scale-[1.02]"
                : "bg-slate-950/60 border-slate-850 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-mono text-amber-400 font-bold">#{wp.id + 1}</span>
              <span className="text-emerald-400 font-mono">{wp.probability}%</span>
            </div>
            <span className="block text-xs font-black text-white mt-1 truncate">
              {wp.label.split(" (")[0]}
            </span>
            <span className="block text-xs font-mono text-amber-300 font-bold mt-0.5">
              ${wp.price.toFixed(2)}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Waypoint Surgical Inspection Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-[#101726] to-slate-950 border border-amber-500/40 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
              #{currentWp.id + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-white">{currentWp.label}</h4>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.2 rounded font-mono">
                  {currentWp.subLabel}
                </span>
              </div>
              <span className="text-[11px] text-amber-300 font-mono font-bold">
                السعر المستهدف: ${currentWp.price.toFixed(2)} • المسافة: ${(currentWp.price - p >= 0 ? "+" : "")}${(currentWp.price - p).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-right">
              <span className="text-[9px] text-slate-400 block font-['Cairo']">النافذة الزمنية:</span>
              <span className="text-teal-300 font-bold">{currentWp.timeWindow}</span>
            </div>
            <div className="px-2.5 py-1 bg-slate-900 rounded-lg border border-slate-800 text-right">
              <span className="text-[9px] text-slate-400 block font-['Cairo']">الدلتا المتوقعة:</span>
              <span className="text-emerald-400 font-bold">{currentWp.expectedDelta}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          <strong className="text-amber-400 block mb-0.5">التوجيه التكتيكي لهذه المحطة:</strong>
          {currentWp.descriptionAr}
        </p>
      </div>
    </div>
  );
};
