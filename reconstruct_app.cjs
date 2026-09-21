const fs = require("fs");
const path = require("path");

console.log("Starting gold orderflow reconstruction...");

// 1. types.ts
const typesCode = `export type Timeframe = "1m" | "3m" | "5m" | "15m" | "1h" | "4h";

export type ViewMode = "footprint" | "heatmap" | "cvd" | "tradingview";

export type SidebarTab = "liquidity" | "dom" | "tape";

export type MobileTab = "chart" | "liquidity" | "dom" | "tape";

export interface GoldQuote {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  spread: number;
  high24h: number;
  low24h: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  timestamp: number;
  source: string;
}

export interface PriceClusterLevel {
  price: number;
  bidQty: number;
  askQty: number;
  totalQty: number;
  delta: number;
  isAskImbalance: boolean;
  isBidImbalance: boolean;
  isPOC: boolean;
}

export interface FootprintBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  delta: number;
  cumulativeDelta: number;
  minDelta: number;
  maxDelta: number;
  levels: PriceClusterLevel[];
  pocPrice: number;
}

export interface LiquidityZone {
  id: string;
  type: "BSL" | "SSL" | "FVG_BULL" | "FVG_BEAR";
  name: string;
  nameAr: string;
  priceTop: number;
  priceBottom: number;
  status: "untested" | "swept" | "mitigated";
  strength: "critical" | "high" | "medium";
  volumeCluster: number;
  description: string;
}

export interface TradeItem {
  id: string;
  price: number;
  qty: number;
  side: "buy" | "sell";
  time: number;
  isWhale: boolean;
}

export interface DOMLevel {
  price: number;
  qty: number;
  total: number;
  percent: number;
}

export interface DOMDepthData {
  bids: DOMLevel[];
  asks: DOMLevel[];
  maxQty: number;
}

export interface AppSettings {
  imbalanceRatio: number;
  tickSize: number;
  clusterMode: "bidAsk" | "delta" | "volume";
  showImbalances: boolean;
  showPOC: boolean;
  soundAlerts: boolean;
  whaleThreshold: number;
  heatmapIntensity: number;
}

export interface AiAnalysisResult {
  bias: string;
  confidenceScore: number;
  summary: string;
  liquidityAnalysis: string;
  orderFlowInsight: string;
  setup: {
    type: string;
    entryZone: string;
    stopLoss: string;
    takeProfit1: string;
    takeProfit2: string;
    riskRewardRatio: string;
  };
  keyAdvice: string;
}
`;

fs.writeFileSync("src/types.ts", typesCode, "utf8");
console.log("Wrote src/types.ts");
