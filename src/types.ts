export type TimeFrame = '1m' | '3m' | '5m' | '15m' | '1h' | '4h';

export type ChartViewMode =
  | 'footprint'
  | 'heatmap'
  | 'futures'
  | 'options'
  | 'clusters'
  | 'cvd'
  | 'tradingview';

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
  vwap?: number;
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

// === 1. Futures Flow Types ===
export interface LiquidationCluster {
  price: number;
  type: 'long_liq' | 'short_liq';
  estimatedVolumeOz: number;
  intensity: number; // 0-100%
  description: string;
}

export interface FuturesFlowData {
  openInterestOz: number;
  oiChangePercent24h: number;
  fundingRate: number;              // e.g. +0.012%
  predictedFundingRate: number;
  nextFundingCountdown: string;
  longAccountPercent: number;       // e.g. 58.4%
  shortAccountPercent: number;      // e.g. 41.6%
  longShortRatio: number;           // e.g. 1.40
  totalLongLiquidations24hUsd: number;
  totalShortLiquidations24hUsd: number;
  vwap: number;
  vwapBandUpper1: number;
  vwapBandLower1: number;
  vwapBandUpper2: number;
  vwapBandLower2: number;
  liquidationClusters: LiquidationCluster[];
  futuresCvdTrend: 'Aggressive Long Accumulation' | 'Short Squeeze Pressure' | 'Passive Absorption' | 'Distribution';
}

// === 2. Options Flow Types ===
export interface OptionStrikeData {
  strike: number;
  callOI: number;
  putOI: number;
  callVolume: number;
  putVolume: number;
  netGex: number; // Gamma Exposure in $M
}

export interface OptionSweepTrade {
  id: string;
  timestamp: number;
  strike: number;
  expiration: string;
  contractType: 'CALL' | 'PUT';
  action: 'SWEEP' | 'BLOCK' | 'SPLIT';
  sentiment: 'BULLISH' | 'BEARISH';
  premiumUsd: number;
  contracts: number;
  impliedVolatility: number;
  spotPriceAtTrade: number;
  underlyingGoldEqOz: number;
}

export interface OptionsFlowData {
  putCallRatio: number;              // e.g. 0.68
  pcrSentiment: 'شديد الإيجابية (Bullish)' | 'محايد (Neutral)' | 'سلبي حذر (Bearish)';
  maxPainStrike: number;             // e.g. 2740.00
  totalCallOpenInterest: number;
  totalPutOpenInterest: number;
  netGammaExposure: number;          // e.g. +$184M (Positive gamma = Low volatility pinning, Negative gamma = High volatility explosive breakout)
  gammaRegime: 'Positive Gamma (Pinning/Mean Reversion)' | 'Negative Gamma (High Volatility/Breakout)';
  callResistanceWall: number;        // Call wall (dealers short call hedge)
  putSupportFloor: number;           // Put floor (dealers short put hedge)
  strikes: OptionStrikeData[];
  institutionalSweeps: OptionSweepTrade[];
}

// === 3. Order Clusters & Limit Walls ===
export interface OrderCluster {
  id: string;
  type: 'BUY_WALL' | 'SELL_WALL' | 'HVN' | 'LVN';
  priceLow: number;
  priceHigh: number;
  centerPrice: number;
  totalLots: number;
  estimatedValueUsd: number;
  strength: 'CRITICAL' | 'STRONG' | 'MODERATE';
  distanceUsd: number;
  pipsDistance: number;
  isAboveCurrentPrice: boolean;
  orderCount: number;
  description: string;
}

// === 4. High-Precision Confluence Signal Engine ===
export interface ConfluenceFactor {
  name: string;
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  weightPercent: number;
  detail: string;
}

export interface ConfluenceTradeSetup {
  id: string;
  symbol: string;
  type: 'BUY_LONG' | 'SELL_SHORT';
  grade: 'A+ المؤسسية الفائقة' | 'A عالية الاحتمالية' | 'B جيدة';
  confluenceScore: number; // 0 to 100
  winProbability: number; // estimated historical win rate % e.g. 94.5%
  sessionContext?: string; // e.g. Golden Overlap / London Session
  liquidityTier?: 'PRIME' | 'HIGH' | 'MODERATE';
  entryRange: [number, number];
  stopLoss: number;
  stopLossProtection: string;
  tp1: number;
  tp2: number;
  tp3: number;
  riskRewardRatio: string;
  status: 'ACTIVE' | 'TRIGGERED' | 'WAITING_RETEST';
  reasons: string[];
  confluenceFactors: ConfluenceFactor[];
  timestamp: number;
}

export interface MarketScenario {
  name: string;
  nameAr: string;
  probability: number; // e.g. 75%
  type: 'PRIMARY' | 'ALTERNATIVE';
  thesis: string;
  triggerCondition: string; // شرط التفعيل اللحظي
  invalidationLevel: string; // مستوى الإلغاء ونفي السيناريو
  targetPathway: string[]; // مسار السعر المتوقع خطوة بخطوة
  recommendedAction: string;
}

export interface AIAnalysisResult {
  bias: string;
  confidenceScore: number;
  summary: string;
  liquidityAnalysis: string;
  orderFlowInsight: string;
  futuresFlowInsight?: string;
  optionsFlowInsight?: string;
  orderClustersInsight?: string;
  volumeProfileInsight?: string;
  // Advanced Scenario Detection:
  primaryScenario?: MarketScenario;
  alternativeScenario?: MarketScenario;
  scenarioAnalysisDetails?: string;
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
  manualPriceOffset: number;   // Calibration offset in USD (e.g. +1635.73 to bridge PAXG to live gold spot)
  priceCalibrationMode: 'auto_spot' | 'paxg_pure' | 'custom_offset'; // Alignment mode
  minConfluenceScore: number;  // Filtering threshold: only show 100% / A+ ultra-strict setups
  enforceMarketHoursOnly: boolean; // Do not issue signals when gold market is closed or weekend
  onlyHighLiquiditySessions: boolean; // Restrict signals to high volume sessions (London, NY, Overlap)
  strictHighWinRateOnly: boolean; // Suppress any setup if estimated win rate is below 90%
}

// === TrendSpider & Bookmap / Exocharts Institutional Engine Types ===
export interface TrendSpiderPattern {
  id: string;
  name: string;
  nameAr: string;
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  historicalWinRate: number; // e.g. 88.5%
  sampleSize: number; // e.g. 142 historical trades in gold
  status: 'CONFIRMED' | 'FORMING' | 'BREAKOUT';
  keyLevel: number;
  targetPrice: number;
  invalidationPrice: number;
  description: string;
}

export interface BookmapStopHuntSignal {
  id: string;
  type: 'BULL_TRAP_STOP_RUN' | 'BEAR_TRAP_STOP_RUN' | 'ICEBERG_ABSORPTION' | 'SPOOF_LIQUIDITY_PULL';
  titleAr: string;
  priceLevel: number;
  volumeSweptOz: number;
  smartMoneyAction: string;
  trappedTraders: 'LONG_RETAIL' | 'SHORT_RETAIL';
  certaintyScore: number; // e.g. 98%
  timestamp: number;
}

// === 5. Mock Order Simulation Types ===
export interface SimulatedOrder {
  id: string;
  symbol: string;
  type: 'BUY_LONG' | 'SELL_SHORT';
  orderType: 'MARKET' | 'LIMIT';
  entryPrice: number;
  lotSize: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  openTime: number;
  status: 'OPEN' | 'CLOSED';
  closePrice?: number;
  closeTime?: number;
  pnlUsd?: number;
  slZoneReason?: string;
  tpZoneReason?: string;
}

export interface SimulatedTradeStats {
  totalTrades: number;
  winRate: number;
  totalPnlUsd: number;
  activePositions: number;
}

// === 6. Volume Profile (Fixed Range) Types ===
export interface VolumeProfileLevel {
  price: number;
  volume: number;
  bidVolume: number;
  askVolume: number;
  delta: number;
  percentage: number;
  isPOC: boolean;      // Point of Control (Highest Volume Node)
  isVAH: boolean;      // Value Area High boundary
  isVAL: boolean;      // Value Area Low boundary
  isInValueArea: boolean; // Inside 70% Value Area
  nodeType: 'HVN' | 'LVN' | 'NORMAL'; // High Volume Node vs Low Volume Node
}

export interface VolumeProfileData {
  rangeType: 'SESSION' | 'FIXED_VISIBLE' | 'LAST_20' | 'LAST_10';
  pocPrice: number;
  pocVolume: number;
  vahPrice: number;    // Value Area High (70% value area)
  valPrice: number;    // Value Area Low
  totalVolume: number;
  totalDelta: number;
  totalBuyVolume: number;
  totalSellVolume: number;
  levels: VolumeProfileLevel[];
  hvnNodes: VolumeProfileLevel[]; // High Volume Nodes (Support/Resistance levels)
  lvnNodes: VolumeProfileLevel[]; // Low Volume Nodes (Fast travel / Slippage zones)
  summaryText: string;
}

