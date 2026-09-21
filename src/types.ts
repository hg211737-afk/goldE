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

export type ViewMode = "footprint" | "heatmap" | "cvd" | "tradingview" | "optionflow" | "futures";

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
  keyAdvice: string;
  learningStats?: {
    totalRecorded: number;
    winRate: number;
    adaptiveAdjustmentAr: string;
  };
}

