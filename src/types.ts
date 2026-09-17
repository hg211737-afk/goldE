export type TimeFrame = '1m' | '3m' | '5m' | '15m' | '1h' | '4h';

export type ChartViewMode = 'footprint' | 'heatmap' | 'cvd' | 'tradingview';

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

export interface FootprintLevel {
  price: number;
  bidQty: number;      // Aggressive Sell hitting bid
  askQty: number;      // Aggressive Buy lifting ask
  totalQty: number;
  delta: number;       // askQty - bidQty
  isAskImbalance: boolean; // Ask > Bid * ImbalanceRatio
  isBidImbalance: boolean; // Bid > Ask * ImbalanceRatio
  isPOC: boolean;      // Point of Control within the candle
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
  levels: FootprintLevel[];
  pocPrice: number;
}

export interface DepthLevel {
  price: number;
  qty: number;
  total: number;
  percent: number;
}

export interface MarketDepth {
  bids: DepthLevel[];
  asks: DepthLevel[];
  maxQty: number;
}

export interface TapeTrade {
  id: string;
  price: number;
  qty: number;
  side: 'buy' | 'sell';
  time: number;
  isWhale: boolean;
}

export type LiquidityType = 'BSL' | 'SSL' | 'FVG_BULL' | 'FVG_BEAR' | 'ORDER_BLOCK';

export interface LiquidityZone {
  id: string;
  type: LiquidityType;
  name: string;
  nameAr: string;
  priceTop: number;
  priceBottom: number;
  status: 'untested' | 'swept' | 'mitigated';
  strength: 'high' | 'medium' | 'critical';
  volumeCluster: number;
  description: string;
}

export interface AIAnalysisResult {
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

export interface TerminalSettings {
  imbalanceRatio: number;      // e.g. 3.0 (300%)
  tickSize: number;            // $0.50 or $1.00
  clusterMode: 'bidAsk' | 'delta' | 'volume';
  showImbalances: boolean;
  showPOC: boolean;
  soundAlerts: boolean;
  whaleThreshold: number;      // e.g. 5.0 lots
  heatmapIntensity: number;    // 1 to 5
}
