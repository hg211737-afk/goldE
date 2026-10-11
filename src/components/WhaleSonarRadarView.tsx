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
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Building2,
  DollarSign,
  Clock,
  Filter,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { soundFx } from "../services/soundService";
import { voiceAlert } from "../services/voiceAlertService";

interface WhaleSonarRadarViewProps {
  currentPrice: number;
}

export type WhaleRadarTab =
  | "whale_alert"
  | "glassnode_gold"
  | "cme_futures"
  | "iceberg"
  | "spoofing"
  | "darkpool";

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

// 1. Whale Alert Interface (Instant Big Move Alerts)
export interface InstantWhaleAlert {
  id: string;
  asset: "GOLD (XAU/USD)" | "PAXG" | "XAUT" | "CME_GC";
  amountUsd: string;
  quantityLotsOrOz: string;
  source: string;
  destination: string;
  action: "ACCUMULATION_BUY" | "DISTRIBUTION_SELL" | "VAULT_TRANSFER" | "BLOCK_SETTLE";
  impact: "BULLISH_SUPPLY_SHOCK" | "BEARISH_DUMP_RISK" | "NEUTRAL_HEDGE";
  timestamp: string;
  timeAgo: string;
  analysisAr: string;
  tier: "MEGA_WHALE" | "SOVEREIGN_FUND" | "TIER1_BANK";
}

// 2. Glassnode Digital Gold Flow Interface
export interface DigitalGoldFlow {
  token: "PAXG" | "XAUT";
  name: string;
  netflow24hOz: number;
  netflowDirection: "OUTFLOW_BULLISH" | "INFLOW_BEARISH";
  exchangeReserveOz: number;
  activeWhaleWallets: number;
  largeTxCount24h: number;
  sentimentSignal: "تجميع عنيف وسحب للمحافظ الباردة" | "إيداعات بيعية محتملة" | "استقرار مؤسسي";
  recentTransfers: Array<{
    id: string;
    txHash: string;
    amountOz: number;
    valueUsd: string;
    direction: "WITHDRAWAL_COLD_WALLET" | "DEPOSIT_EXCHANGE";
    from: string;
    to: string;
    timeAgo: string;
  }>;
}

// 3. CME Group Futures (GC) Block Trades & Open Interest
export interface CmeFuturesWhaleData {
  contract: string;
  activeMonth: string;
  currentFuturesPrice: number;
  openInterestTotal: string;
  openInterestChange24h: string;
  institutionalBias: "توسع مراكز الشراء الصافية (Net Long Expansion)" | "تغطية شورت مؤسسية" | "تثبيت تحوطات";
  cotLargeSpeculatorsNetLots: number;
  cotCommercialHedgersNetLots: number;
  recentBlockTrades: Array<{
    id: string;
    timeAgo: string;
    price: number;
    lots: number;
    valueUsd: string;
    side: "BUY_BLOCK" | "SELL_BLOCK";
    institution: string;
    clearingHouse: string;
    marketImpactAr: string;
  }>;
}

export const WhaleSonarRadarView: React.FC<WhaleSonarRadarViewProps> = ({ currentPrice }) => {
  const [selectedTab, setSelectedTab] = useState<WhaleRadarTab>("whale_alert");
  const [whaleAssetFilter, setWhaleAssetFilter] = useState<string>("ALL");
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

  // 1. Whale Alert Data (Instant Big Moves)
  const whaleAlerts: InstantWhaleAlert[] = [
    {
      id: "wa_1",
      asset: "GOLD (XAU/USD)",
      amountUsd: "$142,800,000",
      quantityLotsOrOz: "33,260 أونصة (332 لوت)",
      source: "خزائن بنك التسويات الدولية (BIS Basel)",
      destination: "خزينة سبائك SPDR Gold Trust (GLD)",
      action: "ACCUMULATION_BUY",
      impact: "BULLISH_SUPPLY_SHOCK",
      timestamp: "10:14:22 UTC",
      timeAgo: "منذ دقيقتين",
      analysisAr: "نقلة سبائك سيادية ضخمة لسد طلب مؤسسي متزايد؛ سحب فيزيائي يقلص المعروض الفوري في لندن.",
      tier: "SOVEREIGN_FUND",
    },
    {
      id: "wa_2",
      asset: "PAXG",
      amountUsd: "$38,640,000",
      quantityLotsOrOz: "9,000 PAXG (~9,000 أونصة)",
      source: "محفظة ساخنة منصة Binance",
      destination: "محفظة باردة مؤسسية مشفرة (Multi-Sig Vault)",
      action: "ACCUMULATION_BUY",
      impact: "BULLISH_SUPPLY_SHOCK",
      timestamp: "10:08:45 UTC",
      timeAgo: "منذ 8 دقائق",
      analysisAr: "سحب حوت رقمي لكميات ضخمة من الذهب المرمز خارج المنصات، مؤشر Glassnode يظهر تجفيف سيولة البيع.",
      tier: "MEGA_WHALE",
    },
    {
      id: "wa_3",
      asset: "CME_GC",
      amountUsd: "$107,350,000",
      quantityLotsOrOz: "250 عقد ذهب آجل (GC Futures)",
      source: "Morgan Stanley Commodities Desk",
      destination: "صفقة بلوك خاصة عبر CME ClearPort",
      action: "BLOCK_SETTLE",
      impact: "BULLISH_SUPPLY_SHOCK",
      timestamp: "09:55:10 UTC",
      timeAgo: "منذ 21 دقيقة",
      analysisAr: "تنفيذ صفقة Block Trade بسعر السوق دون التأثير اللحظي على الدفتر، مما يمهد لانفجار سعري صاعد.",
      tier: "TIER1_BANK",
    },
    {
      id: "wa_4",
      asset: "XAUT",
      amountUsd: "$25,760,000",
      quantityLotsOrOz: "6,000 XAUT (Tether Gold)",
      source: "محفظة حوت (Whale 0x8a3...f1b)",
      destination: "خزينة سويسرية مؤمنة (Swiss Gold Custody)",
      action: "VAULT_TRANSFER",
      impact: "BULLISH_SUPPLY_SHOCK",
      timestamp: "09:42:01 UTC",
      timeAgo: "منذ 34 دقيقة",
      analysisAr: "استبدال توكنات الذهب بسبائك فيزيائية حقيقية مودعة في جبال الألب السويسرية.",
      tier: "MEGA_WHALE",
    },
    {
      id: "wa_5",
      asset: "GOLD (XAU/USD)",
      amountUsd: "$68,700,000",
      quantityLotsOrOz: "16,000 أونصة (160 لوت)",
      source: "Citigroup London Bullion Vault",
      destination: "حساب تسوية سري (Dark Pool Settlement)",
      action: "ACCUMULATION_BUY",
      impact: "BULLISH_SUPPLY_SHOCK",
      timestamp: "09:15:30 UTC",
      timeAgo: "منذ ساعة",
      analysisAr: "تمركز صامت لكبار البنوك عبر شبكة الدارك بول قبل جلسة نيويورك.",
      tier: "TIER1_BANK",
    },
  ];

  // 2. Glassnode Digital Gold Flow Data (PAXG & XAUT)
  const glassnodeData: DigitalGoldFlow[] = [
    {
      token: "PAXG",
      name: "Paxos Gold (PAXG)",
      netflow24hOz: -14250,
      netflowDirection: "OUTFLOW_BULLISH",
      exchangeReserveOz: 48920,
      activeWhaleWallets: 38,
      largeTxCount24h: 19,
      sentimentSignal: "تجميع عنيف وسحب للمحافظ الباردة",
      recentTransfers: [
        {
          id: "px_1",
          txHash: "0x4f8a...92bc",
          amountOz: 4500,
          valueUsd: "$19,320,000",
          direction: "WITHDRAWAL_COLD_WALLET",
          from: "Binance Exchange Vault",
          to: "Whale Cold Custody (0x91d...7a)",
          timeAgo: "منذ 15 دقيقة",
        },
        {
          id: "px_2",
          txHash: "0x12c4...e681",
          amountOz: 2800,
          valueUsd: "$12,020,000",
          direction: "WITHDRAWAL_COLD_WALLET",
          from: "Kraken Hot Wallet",
          to: "Whale Multi-Sig Reserve",
          timeAgo: "منذ 42 دقيقة",
        },
        {
          id: "px_3",
          txHash: "0x78ab...334f",
          amountOz: 1200,
          valueUsd: "$5,150,000",
          direction: "WITHDRAWAL_COLD_WALLET",
          from: "Uniswap V3 Liquidity Pool",
          to: "Arbitrage Hedging Fund",
          timeAgo: "منذ ساعتين",
        },
      ],
    },
    {
      token: "XAUT",
      name: "Tether Gold (XAUT)",
      netflow24hOz: -8900,
      netflowDirection: "OUTFLOW_BULLISH",
      exchangeReserveOz: 32400,
      activeWhaleWallets: 24,
      largeTxCount24h: 12,
      sentimentSignal: "تجميع عنيف وسحب للمحافظ الباردة",
      recentTransfers: [
        {
          id: "xa_1",
          txHash: "0x98ad...112e",
          amountOz: 3200,
          valueUsd: "$13,740,000",
          direction: "WITHDRAWAL_COLD_WALLET",
          from: "Bitfinex Cold Storage",
          to: "Family Office Vault",
          timeAgo: "منذ 28 دقيقة",
        },
        {
          id: "xa_2",
          txHash: "0x66ef...cc41",
          amountOz: 1950,
          valueUsd: "$8,370,000",
          direction: "WITHDRAWAL_COLD_WALLET",
          from: "OKX Hot Wallet",
          to: "Institutional Staking Pool",
          timeAgo: "منذ ساعة ونصف",
        },
      ],
    },
  ];

  // 3. CME Group Futures (GC) Whale Data
  const cmeData: CmeFuturesWhaleData = {
    contract: "GC (COMEX Gold Futures)",
    activeMonth: "عقد الشهر النشط (Front-Month Active)",
    currentFuturesPrice: Number((p + 1.8).toFixed(2)),
    openInterestTotal: "518,420 عقد (~51.8 مليون أونصة)",
    openInterestChange24h: "+14,850 عقد (توسع ملحوظ)",
    institutionalBias: "توسع مراكز الشراء الصافية (Net Long Expansion)",
    cotLargeSpeculatorsNetLots: 248600,
    cotCommercialHedgersNetLots: -289400,
    recentBlockTrades: [
      {
        id: "cme_b1",
        timeAgo: "منذ 9 دقائق",
        price: Number((p + 1.2).toFixed(2)),
        lots: 350,
        valueUsd: "$150,290,000",
        side: "BUY_BLOCK",
        institution: "Citadel Bullion Execution Desk",
        clearingHouse: "CME ClearPort Direct",
        marketImpactAr: "شراء صامت عبر صفقات البلوك لتفادي انزلاق الدفتر اللحظي.",
      },
      {
        id: "cme_b2",
        timeAgo: "منذ 25 دقيقة",
        price: Number((p + 0.8).toFixed(2)),
        lots: 220,
        valueUsd: "$94,460,000",
        side: "BUY_BLOCK",
        institution: "Bridgewater Macro Commodity Fund",
        clearingHouse: "Goldman Sachs Futures Clearing",
        marketImpactAr: "بناء مركز استباقي قبل صدور بيانات التضخم ومؤتمر الفيدرالي.",
      },
      {
        id: "cme_b3",
        timeAgo: "منذ 58 دقيقة",
        price: Number((p + 2.5).toFixed(2)),
        lots: 180,
        valueUsd: "$77,280,000",
        side: "SELL_BLOCK",
        institution: "Barrick Gold Hedging Desk",
        clearingHouse: "BofA Securities Clearing",
        marketImpactAr: "أوامر تحوط منتجين طبيعية لا تمثل ضغطاً مضاربياً بيعياً.",
      },
    ],
  };

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
        const blipAngle = index * 1.57 + 0.6; // Distributed around radar
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
    if (selectedTab === "glassnode_gold") {
      voiceAlert.speak(
        "تنبيه تدفقات الذهب الرقمي: جلاس نود ترصد سحب أربعة عشر ألف أونصة من منصات التداول للمحافظ الباردة، مما يعزز صعود الذهب الفوري!",
        "urgent"
      );
    } else if (selectedTab === "cme_futures") {
      voiceAlert.speak(
        `تنبيه عقود الذهب الكبيرة: تم رصد صفقة بلوك بقيمة مائة وخمسين مليون دولار في بورصة شيكاغو سي إم إي بسعر ${cmeData.recentBlockTrades[0].price}!`,
        "urgent"
      );
    } else {
      voiceAlert.speak(
        `تنبيه رادار الحيتان: تم رصد تحويل سبائك بقيمة مائة واثنين وأربعين مليون دولار لصالح صندوق إس بي دي آر جولد ترست!`,
        "urgent"
      );
    }
  };

  const filteredWhaleAlerts =
    whaleAssetFilter === "ALL"
      ? whaleAlerts
      : whaleAlerts.filter((w) => w.asset === whaleAssetFilter);

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
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white">
                رادار الحيتان الشامل (Whale Radar &amp; Institutional Sonar)
              </h2>
              <span className="text-[10px] bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black animate-pulse">
                نمسك الحوت قبل ما يحرك السوق
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              منظومة متكاملة: تنبيهات <strong className="text-amber-400">Whale Alert</strong> الفورية + تدفقات الذهب الرقمي <strong className="text-cyan-400">Glassnode (PAXG / XAUT)</strong> + عقود <strong className="text-emerald-400">CME Group Futures (GC)</strong> + أوامر الآيسبرغ والدارك بول
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

      {/* Navigation Switcher: The Pillars of Whale Tracking */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md">
        <button
          onClick={() => setSelectedTab("whale_alert")}
          className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedTab === "whale_alert"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Whale Alert الفوري</span>
        </button>

        <button
          onClick={() => setSelectedTab("glassnode_gold")}
          className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedTab === "glassnode_gold"
              ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Glassnode الذهب الرقمي</span>
        </button>

        <button
          onClick={() => setSelectedTab("cme_futures")}
          className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedTab === "cme_futures"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>عقود CME الكبيرة GC</span>
        </button>

        <button
          onClick={() => setSelectedTab("iceberg")}
          className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedTab === "iceberg"
              ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-black shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>أوامر الآيسبرغ المخفية</span>
        </button>

        <button
          onClick={() => setSelectedTab("spoofing")}
          className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedTab === "spoofing"
              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>كاشف التلاعب والسبووفينج</span>
        </button>

        <button
          onClick={() => setSelectedTab("darkpool")}
          className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            selectedTab === "darkpool"
              ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>الدارك بول OTC</span>
        </button>
      </div>

      {/* Main Grid: Radar Screen Canvas (Left) + Selected Whale Intelligence View (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Radar Screen Canvas Card */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-[#0c101a] border border-emerald-500/30 flex flex-col items-center justify-between relative overflow-hidden shadow-2xl">
          {/* Radar Screen Status HUD */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              SONAR ACTIVE: 360° SWEEP
            </span>
            <span className="text-amber-400 font-bold">الذهب اللحظي: ${p.toFixed(2)}</span>
          </div>

          {/* Canvas Radar */}
          <div className="relative w-full max-w-[380px] aspect-square flex items-center justify-center my-auto">
            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="w-full h-full rounded-full bg-radial from-[#091515] to-[#04080a] border-2 border-emerald-500/40 shadow-[inset_0_0_40px_rgba(16,185,129,0.2)]"
            />
          </div>

          {/* Radar Metrics Grid */}
          <div className="w-full grid grid-cols-3 gap-2 mt-3 text-center text-xs font-mono">
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">تحويلات الحيتان (24h):</span>
              <span className="text-amber-400 font-black text-sm">$382.7M</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">سحب الذهب الرقمي:</span>
              <span className="text-cyan-400 font-black text-sm">-23.1k oz</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-['Cairo']">عقود CME Block:</span>
              <span className="text-emerald-400 font-black text-sm">+750 لوت</span>
            </div>
          </div>
        </div>

        {/* Intelligence Feed Content (Right 7 Columns) */}
        <div className="lg:col-span-7 space-y-3">
          {/* TAB 1: Whale Alert - Instant Big Move Alerts */}
          {selectedTab === "whale_alert" && (
            <div className="space-y-3">
              {/* Pillar Header Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-yellow-950/30 border border-amber-500/40 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>رادار Whale Alert الفوري للتحويلات الكبرى</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    رصد التحويلات المليونية الفورية للسبائك والذهب الرقمي وصناديق التحوط قبل أن تنعكس على السعر
                  </p>
                </div>
                {/* Filter buttons */}
                <div className="flex items-center gap-1 text-[11px] bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <span className="text-slate-400 px-1 font-bold">تصفية:</span>
                  {(["ALL", "GOLD (XAU/USD)", "PAXG", "XAUT", "CME_GC"] as const).map((sym) => (
                    <button
                      key={sym}
                      onClick={() => setWhaleAssetFilter(sym)}
                      className={`px-2 py-0.5 rounded cursor-pointer font-bold ${
                        whaleAssetFilter === sym
                          ? "bg-amber-500 text-slate-950"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {sym === "ALL" ? "الكل" : sym}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed of Alerts */}
              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {filteredWhaleAlerts.map((wh, idx) => (
                  <div
                    key={`${wh.id}-${idx}`}
                    className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-[#0e1422] to-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                          {wh.asset}
                        </span>
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          {wh.amountUsd}
                        </span>
                        <span className="text-xs text-slate-300 font-bold">
                          ({wh.quantityLotsOrOz})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                          {wh.action === "ACCUMULATION_BUY"
                            ? "تجميع شرائي ضخم"
                            : wh.action === "BLOCK_SETTLE"
                            ? "تسوية صفقات بلوك"
                            : "نقلة فيزيائية"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{wh.timeAgo}</span>
                      </div>
                    </div>

                    {/* From -> To */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-['Cairo']">المصدر (From):</span>
                        <span className="text-rose-300 font-bold truncate block">{wh.source}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-['Cairo']">الوجهة (To):</span>
                        <span className="text-emerald-300 font-bold truncate block">{wh.destination}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-[#0c101a] p-2 rounded-lg border border-slate-800">
                      <strong className="text-amber-400">التشخيص الذكي: </strong>
                      {wh.analysisAr}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Glassnode - Digital Gold Flows (PAXG & XAUT) */}
          {selectedTab === "glassnode_gold" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/30 via-slate-900 to-teal-950/30 border border-cyan-500/40">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-black text-cyan-300 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-cyan-400" />
                      <span>تدفقات الذهب الرقمي من Glassnode (PAXG &amp; XAUT)</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      مراقبة تحركات الذهب المرمز On-Chain بين المنصات والمحافظ الباردة لكشف نية الحيتان
                    </p>
                  </div>
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-mono font-bold">
                    صافي السحب 24h: -23,150 أونصة
                  </span>
                </div>
              </div>

              {/* Cards for PAXG & XAUT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {glassnodeData.map((coin) => (
                  <div
                    key={coin.token}
                    className="p-4 rounded-xl bg-gradient-to-b from-[#0f172a] to-[#090d16] border border-cyan-500/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center font-black text-cyan-300 font-mono text-xs">
                          {coin.token}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{coin.name}</h4>
                          <span className="text-[10px] text-emerald-400 font-bold block">
                            {coin.sentimentSignal}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                        {coin.netflow24hOz.toLocaleString()} oz
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-['Cairo']">احتياطي المنصات:</span>
                        <span className="text-slate-200 font-bold">{coin.exchangeReserveOz.toLocaleString()} oz</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-['Cairo']">محافظ الحيتان النشطة:</span>
                        <span className="text-cyan-300 font-bold">{coin.activeWhaleWallets} محفظة</span>
                      </div>
                    </div>

                    {/* Recent Transfers */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-400 block">أحدث سحوبات الحيتان المرصودة:</span>
                      {coin.recentTransfers.map((tx, idx) => (
                        <div
                          key={`${tx.id}-${idx}`}
                          className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 rotate-180" />
                              سحب {tx.amountOz.toLocaleString()} أونصة
                            </span>
                            <span className="text-slate-400">{tx.timeAgo}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>القيمة: <strong className="text-white font-mono">{tx.valueUsd}</strong></span>
                            <span className="truncate max-w-[160px] text-cyan-400">{tx.to}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Explanatory Intelligence Banner */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong className="text-cyan-400 block mb-1">💡 كيف نستفيد من تدفقات الذهب الرقمي (Glassnode Signal)؟</strong>
                عندما تسحب الصناديق والمستثمرون الكبار كميات ضخمة من توكنات PAXG و XAUT خارج المنصات المركزية إلى المحافظ الباردة (Outflows)، فإن ذلك يدل على رغبة قاطعة في الاحتفاظ وتجميد المعروض، وعادة ما يسبق قفزات سعرية قوية في الذهب الفوري XAU/USD خلال 24 إلى 48 ساعة!
              </div>
            </div>
          )}

          {/* TAB 3: CME Group Futures (GC) */}
          {selectedTab === "cme_futures" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-teal-950/30 border border-emerald-500/40">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-black text-emerald-300 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      <span>عقود CME Group Futures الكبيرة (GC - Gold Futures)</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      تتبع صفقات البلوك المؤسسية الضخمة (Block Trades) والفائدة المفتوحة (Open Interest) في بورصة شيكاغو
                    </p>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-mono font-bold">
                    سعر الفيوتشرز: ${cmeData.currentFuturesPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* CME Macro Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-['Cairo']">إجمالي الفائدة المفتوحة (OI):</span>
                  <span className="text-amber-400 font-bold text-sm block mt-0.5">{cmeData.openInterestTotal}</span>
                  <span className="text-[10px] text-emerald-400 block mt-1">{cmeData.openInterestChange24h}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-['Cairo']">مراكز كبار المضاربين (COT):</span>
                  <span className="text-emerald-400 font-bold text-sm block mt-0.5">+{cmeData.cotLargeSpeculatorsNetLots.toLocaleString()} لوت</span>
                  <span className="text-[10px] text-slate-400 block mt-1 font-['Cairo']">صافي مراكز شرائية صاعدة</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-['Cairo']">الاتجاه المؤسسي لعقود GC:</span>
                  <span className="text-cyan-300 font-bold text-xs block mt-1 font-['Cairo'] leading-tight">
                    {cmeData.institutionalBias}
                  </span>
                </div>
              </div>

              {/* Real-time Block Trades List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>صفقات البلوك الضخمة المنفذة عبر CME ClearPort (Block Trades):</span>
                  <span className="text-[10px] text-slate-400 font-mono">تحديث لحظي</span>
                </h4>

                {cmeData.recentBlockTrades.map((bt, idx) => (
                  <div
                    key={`${bt.id}-${idx}`}
                    className="p-3 rounded-xl bg-gradient-to-r from-slate-900 via-[#0e1624] to-slate-950 border border-emerald-500/30 space-y-2"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-emerald-500 text-slate-950">
                          {bt.side === "BUY_BLOCK" ? "شراء بلوك مؤسسي" : "بيع تحوط"}
                        </span>
                        <span className="font-black text-amber-400">${bt.price.toFixed(2)}</span>
                        <span className="text-slate-300 font-bold">({bt.lots} عقد | {bt.valueUsd})</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{bt.timeAgo}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-['Cairo']">المؤسسة المنفذة:</span>
                        <span className="text-white font-bold">{bt.institution}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-['Cairo']">غرفة المقاصة:</span>
                        <span className="text-emerald-400 font-bold">{bt.clearingHouse}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 bg-[#0c101a] p-2 rounded-lg border border-slate-800 leading-relaxed">
                      <strong className="text-emerald-400">تأثير الصفقة: </strong>
                      {bt.marketImpactAr}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Iceberg Orders */}
          {selectedTab === "iceberg" && (
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-950/30 via-slate-900 to-emerald-950/30 border border-teal-500/40">
                <h3 className="text-sm font-black text-teal-300 flex items-center gap-1.5">
                  <EyeOff className="w-4 h-4 text-teal-400" />
                  <span>أوامر الآيسبرغ المخفية في خوادم البنوك (Hidden Iceberg Orders)</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  كشف الأوامر التي تعرض أحجاماً صغيرة للتداول بينما تخفي آلاف اللوتات خلف الكواليس
                </p>
              </div>

              {icebergs.map((ice, idx) => (
                <div
                  key={`${ice.id}-${idx}`}
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

          {/* TAB 5: Spoofing Alerts */}
          {selectedTab === "spoofing" && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
                <strong>ما هو السبووفينج (Spoofing)؟</strong> هو أسلوب تلاعب محظور تضعه الحيتان لخداع المتداولين بوجود جدار سيولة ضخم، ثم تلغيه في أقل من 500ms بمجرد اقتراب السعر لدفع السوق في الاتجاه المعاكس!
              </div>

              {spoofingAlerts.map((spf, idx) => (
                <div
                  key={`${spf.id}-${idx}`}
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

          {/* TAB 6: Dark Pool OTC */}
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
