// ==============================================================================
// 1. Polyglot Script Studio Types
// ==============================================================================

export type ProgrammingLanguage = 
  | 'python' 
  | 'javascript' 
  | 'typescript' 
  | 'bash' 
  | 'rust' 
  | 'go' 
  | 'c' 
  | 'cpp' 
  | 'sql' 
  | 'lua'
  | 'php'
  | 'ruby'
  | 'powershell';

export type FusionParadigm = 
  | 'subprocess_pipes' 
  | 'ffi_bindings' 
  | 'polyglot_single_file' 
  | 'pipeline_orchestration' 
  | 'microservice_ipc' 
  | 'shared_memory_wasm'
  | 'wasm_bridge';

export interface ScriptFile {
  id: string;
  filename: string;
  language: ProgrammingLanguage | string;
  isEntrypoint: boolean;
  fileRole: string;
  explanation: string;
  code: string;
}

export interface ExecutionGuide {
  prerequisites: string[];
  installCommands: string[];
  runCommand: string;
  expectedOutput: string;
  troubleshooting: string[];
}

export interface BenchmarkStats {
  speedGainVsPureScript: string;
  memoryFootprintEstimate: string;
  concurrencyModel: string;
  complexityRating: string;
}

export interface SimulatedLog {
  id: string;
  time: string;
  source: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'data';
  message: string;
}

export interface ScriptProject {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  languages: ProgrammingLanguage[] | string[];
  paradigm: FusionParadigm | string;
  prompt: string;
  createdAt: number;
  architectureSummary: string;
  dataFlowDiagram: string;
  communicationMechanism: string;
  files: ScriptFile[];
  executionGuide: ExecutionGuide;
  benchmarkStats: BenchmarkStats;
  simulatedLogs: SimulatedLog[];
}

export interface ScriptGenerationConfig {
  userPrompt: string;
  selectedLanguages: ProgrammingLanguage[];
  fusionParadigm: FusionParadigm;
  autoSelectLanguages: boolean;
  autoSelectParadigm: boolean;
  architectureTier: 'standard' | 'advanced' | 'enterprise' | 'extreme_high_performance';
  includeDockerfile: boolean;
  includeMakefile: boolean;
  includeErrorHandling: boolean;
  includeLogging: boolean;
  bilingualComments: boolean;
}

export interface PresetScript {
  id: string;
  titleAr: string;
  titleEn: string;
  badge: string;
  descriptionAr: string;
  languages: ProgrammingLanguage[];
  paradigm: FusionParadigm;
  prompt: string;
}

export interface LanguageInfo {
  id: ProgrammingLanguage;
  name: string;
  nameAr: string;
  color: string;
  badgeBg: string;
  icon: string;
  extension: string;
  category: 'Data' | 'Web' | 'Shell' | 'System' | 'Scripting';
}

export interface FusionParadigmInfo {
  id: FusionParadigm;
  name: string;
  nameAr: string;
  descriptionAr: string;
  descriptionEn: string;
  speedRating: number;
  complexityRating: number;
  iconName: string;
  bestUseCases: string[];
}

// ==============================================================================
// 2. Gold OrderFlow Pro Types
// ==============================================================================

export type Timeframe = "1m" | "3m" | "5m" | "15m" | "1h" | "4h";

export type ViewMode =
  | "footprint"
  | "heatmap"
  | "cvd"
  | "tradingview"
  | "optionflow"
  | "futures"
  | "marketprofile"
  | "signals";

export interface TpoLevelData {
  price: number;
  letters: string[];
  tpoCount: number;
  isPoc: boolean;
  isValueArea: boolean;
  isInitialBalance: boolean;
  isSinglePrint: boolean;
  volume: number;
}

export interface VwapBandsData {
  vwap: number;
  upper1: number;
  upper2: number;
  lower1: number;
  lower2: number;
  currentDeviation: number; // e.g. +1.42 sigma
  statusAr: string;
}

export interface AbsorptionTrapMetrics {
  trappedBuyersOz: number;
  trappedSellersOz: number;
  passiveAbsorptionRatio: number; // 0 to 100%
  dominantTrap: "trapped_buyers" | "trapped_sellers" | "neutral";
  trapSignalAr: string;
  trapAlertPrice: number;
  confluenceScore: number; // 0 - 100
}

export interface TpoMarketProfileReport {
  timestamp: number;
  vah: number; // Value Area High
  val: number; // Value Area Low
  poc: number; // Point of Control
  initialBalanceHigh: number;
  initialBalanceLow: number;
  initialBalanceRange: number;
  dayType: "Normal Day" | "Trend Day" | "Normal Variation Day" | "Neutral Day" | "Double Distribution";
  dayTypeAr: string;
  isPriceInValue: boolean;
  valueAreaPercent: number; // 70%
  poorHighDetected: boolean;
  poorLowDetected: boolean;
  poorHighPrice?: number;
  poorLowPrice?: number;
  singlePrints: { price: number; letter: string }[];
  vwapBands: VwapBandsData;
  absorption: AbsorptionTrapMetrics;
  auctionBiasAr: string;
  keyActionRecommendationAr: string;
  levels: TpoLevelData[];
}

export type SidebarTab = "liquidity" | "correlation" | "dom" | "tape";

export type MobileTab = "chart" | "liquidity" | "correlation" | "dom" | "tape";

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
  customGeminiApiKey?: string;
  aiModel?: string;
  goldDataProvider?: "binance_spot" | "binance_futures" | "tradingview";
  streamSpeed?: "realtime" | "fast" | "normal";
}

export interface SmartDualScenario {
  action: "BUY" | "SELL";
  titleAr: string;
  conditionAr: string;
  triggerCondition: string;
  entryZone: string;
  takeProfit1: string;
  takeProfit2: string;
  stopLoss: string;
  riskReward: string;
  rationaleAr: string;
  probabilityScore: number;
}

export interface DualSmartLevel {
  id: string;
  levelPrice: number;
  levelType: "upper_buy" | "lower_sell";
  titleAr: string;
  badgeLabel: string;
  distanceFromPrice: number;
  distancePips: number;
  isAboveCurrent: boolean;
  volumeClusterEstimated: number;
  descriptionAr: string;
  // Scenario 1: On break / breach
  breakScenario: SmartDualScenario;
  // Scenario 2: On rejection / bounce
  bounceScenario: SmartDualScenario;
}

export interface CorrelationAsset {
  symbol: string;
  name: string;
  nameAr: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  correlationCoef: number; // e.g. -0.91 for DXY, +0.88 for Silver
  correlationType: "inverse" | "direct";
  goldImpact: "bullish" | "bearish" | "neutral";
  impactDescriptionAr: string;
  historicalTrend: number[];
}

export interface MacroCorrelationReport {
  timestamp: number;
  alignmentScore: number; // 0 - 100
  overallSentiment: "bullish_tailwinds" | "bearish_headwinds" | "mixed_divergence";
  overallSentimentAr: string;
  dxyAnalysisAr: string;
  divergenceDetected: boolean;
  divergenceAlertAr?: string;
  assets: CorrelationAsset[];
  institutionalAdviceAr: string;
}

export interface TradeOutcomeRecord {
  id: string;
  timestamp: number;
  setupType: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  outcome: "win" | "loss" | "breakeven";
  profitPips: number;
  aiConfidence: number;
  notes?: string;
}

export interface SniperTpTarget {
  price: number;
  distancePips: number;
  closeVolumePercent: number; // e.g. 50%
  labelAr: string;
  instructionAr: string;
}

export interface SniperPrecisionSetup {
  id: string;
  orderType: "BUY LIMIT" | "SELL LIMIT" | "BUY STOP" | "SELL STOP" | "MARKET BUY" | "MARKET SELL";
  direction: "BUY" | "SELL";
  grade: "A+ Institutional Sniper" | "A High Probability" | "B Scalp Rejection";
  qualityScore: number; // 0 - 100
  titleAr: string;
  confluencePoints: string[];
  
  // Exact Execution Parameters down to the cent
  optimalEntryPrice: number;
  entryZoneRange: { min: number; max: number };
  exactTriggerConditionAr: string;
  
  // Exact Stop Loss
  exactStopLoss: number;
  slDistancePips: number;
  slStructuralRationaleAr: string;
  
  // Multi-tier targets
  tp1: SniperTpTarget;
  tp2: SniperTpTarget;
  tp3: SniperTpTarget;
  
  riskRewardRatio: string;
  riskRewardValue: number;
  
  // Capital Management & Lot Sizing
  recommendedLotPer1000: number; // e.g. 0.05 lot per $1000
  maxRiskPercent: number; // e.g. 1.5%
  
  // Invalidation & Session
  invalidationLevel: number;
  invalidationConditionAr: string;
  bestSessionWindowAr: string;
  
  // Copyable MT4/MT5 signal command
  mtCommand: string;
  status: "active" | "triggered" | "tp1_hit" | "tp2_hit" | "cancelled";
  timestamp: number;
}

export interface AiAnalysisResult {
  bias: string;
  confidenceScore: number;
  summary: string;
  liquidityAnalysis: string;
  orderFlowInsight: string;
  dualSmartLevels?: {
    upperLevel: DualSmartLevel;
    lowerLevel: DualSmartLevel;
  };
  macroCorrelation?: {
    dxyImpact: string;
    macroAlignment: string;
    silverConfirmation: string;
  };
  setup: {
    type: string;
    entryZone: string;
    stopLoss: string;
    takeProfit1: string;
    takeProfit2: string;
    riskRewardRatio: string;
  };
  sniperSetup?: SniperPrecisionSetup;
  keyAdvice: string;
  learningStats?: {
    totalRecorded: number;
    winRate: number;
    adaptiveAdjustmentAr: string;
  };
  marketProfile?: TpoMarketProfileReport;
}

