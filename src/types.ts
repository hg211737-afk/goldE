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
  | "signals"
  | "predictor"
  | "radar"
  | "montecarlo"
  | "warroom"
  | "ml_model"
  | "session_report"
  | "pre_news"
  | "bitcoin"
  | "xpl"
  | "crude_oil"
  | "zai";

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

export type SidebarTab = "pending_limits" | "liquidity" | "correlation" | "dom" | "tape";

export type MobileTab = "chart" | "pending_limits" | "liquidity" | "correlation" | "dom" | "tape";

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
  customClaudeApiKey?: string;
  claudeModel?: string;
  goldDataProvider?: "oanda_spot" | "binance_spot" | "binance_futures" | "tradingview";
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

  // Joint Dual-AI (Gemini + Claude) Audit & Approval System
  dualAiVerdict?: {
    geminiScore: number;
    geminiVerdictAr: string;
    claudeScore: number;
    claudeVerdictAr: string;
    consensusAgreement: number; // e.g. 98.6%
    isUnanimous: boolean;
    vetoTriggered: boolean;
    vetoReasonAr?: string;
    jointExecutionActionAr: string;
  };

  // Whale Radar Confluence (Whale Alert + Glassnode PAXG/XAUT + CME GC Futures + Icebergs)
  whaleRadarConfluence?: {
    alignmentScore: number; // e.g. 97.4%
    bias: "STRONG_ACCUMULATION_CONFIRMED" | "DISTRIBUTION_ALERT" | "NEUTRAL_HEDGE";
    biasLabelAr: string;
    whaleAlertHeadlineAr: string;
    glassnodeFlowHeadlineAr: string;
    cmeFuturesHeadlineAr: string;
    icebergShieldAr: string;
    totalWhaleVolumeUsd: string;
  };
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
  prediction?: GoldMovementPrediction;
  claudeAnalysis?: ClaudeAnalysisResult;
  confluenceMatrix?: ConfluenceMatrix;
  pendingLimitSetups?: InstitutionalPendingLimitSetup[];
  // Unified Super-Confluence AI Synthesis (All 5 Pillars Connected)
  superConfluenceSynthesis?: {
    whaleSonarAr: string;
    monteCarloProbAr: string;
    centralBankDrainAr: string;
    shortSqueezeThreatAr: string;
    masterSynthesisAr: string;
  };
}

export interface ConfluenceFactor {
  id: string;
  nameAr: string;
  category: "macro" | "tpo_auction" | "orderflow" | "smc_liquidity" | "fibonacci";
  signal: "bullish" | "bearish" | "neutral";
  signalAr: string;
  weight: number; // e.g. 20
  score: number; // e.g. 18.5
  detailAr: string;
  levelValue?: string;
  confirmed: boolean;
}

export interface ConfluenceMatrix {
  overallScore: number; // 0 - 100%
  grade: "S_TIER_CONFLUENCE" | "A_TIER_HIGH" | "B_TIER_MODERATE" | "LOW_CONFLUENCE";
  gradeAr: string;
  unifyingThesisAr: string;
  causalChainSteps: {
    stepNumber: number;
    titleAr: string;
    factorName: string;
    explanationAr: string;
    impactAr: string;
    status: "aligned" | "warning" | "divergent";
  }[];
  factors: ConfluenceFactor[];
  goldenConfluenceZone: {
    priceRange: string;
    centerPrice: number;
    confluentElements: string[];
    actionRecommendationAr: string;
    riskRewardRatio: string;
  };
}

export interface ClaudeAnalysisResult {
  engine: "claude";
  model: string;
  bias: string;
  biasAr: string;
  confidenceScore: number;
  summaryAr: string;
  marketStructureAr: string;
  liquidityInducementAr: string;
  reversalPointAr: string;
  targetDestinationAr: string;
  keyLevels: {
    bounceLevel: string;
    rejectionLevel: string;
    target1: string;
    target2: string;
    invalidation: string;
  };
  tradeSetup: {
    action: "BUY" | "SELL" | "WAIT";
    entryZone: string;
    stopLoss: string;
    takeProfit1: string;
    takeProfit2: string;
    riskReward: string;
    rationaleAr: string;
  };
  keyAdvice: string;
  timestamp: number;
  // Advanced Liquidity Intelligence (SMC & Pools)
  liquidityIntelligence?: {
    bslPoolLevel: string;
    sslPoolLevel: string;
    fvgImbalanceZone: string;
    inducementTrapLevel: string;
    marketState: "Discount_Zone" | "Premium_Zone" | "Equilibrium";
    liquidityCycleStageAr: string;
  };
  // High-Impact News & Macro Catalysts
  newsIntelligence?: {
    upcomingEventsAr: string[];
    sentimentImpactAr: string;
    volatilityRiskLevel: "High Volatility" | "Moderate" | "Extreme Shock Risk";
    catalystThesisAr: string;
  };
  // Market Sessions & Killzone Timing
  sessionIntelligence?: {
    activeSessionAr: string;
    killzoneStatusAr: string;
    judasSwingAr: string;
    silverBulletTimeWindowAr: string;
    asianRangeRaidStatusAr: string;
  };
  // Unified Super-Confluence AI Synthesis (All 5 Pillars Connected)
  superConfluenceSynthesis?: {
    whaleSonarAr: string;
    monteCarloProbAr: string;
    centralBankDrainAr: string;
    shortSqueezeThreatAr: string;
    masterSynthesisAr: string;
  };
}

export type ZaiDecisionState = "ACTIVE_GRADE_A_SETUP" | "WAIT_FOR_KEY_ZONE";

export interface ZaiAnalysisResult {
  engine: "z.ai";
  version: "v2.8 Quantum Institutional";
  currentPrice: number;
  timestamp: number;
  decisionState: ZaiDecisionState;
  decisionHeadlineAr: string;
  decisionSubheadAr: string;
  confidenceScore: number;
  marketPhaseAr: string;
  
  // Grade-A Trade (when active)
  activeTradeSetup?: {
    direction: "BUY" | "SELL";
    orderType: "BUY LIMIT" | "SELL LIMIT" | "BUY NOW" | "SELL NOW";
    entryPrice: number;
    entryRange: { min: number; max: number };
    stopLoss: number;
    slPips: number;
    slRationaleAr: string;
    tp1: number;
    tp2: number;
    tp3: number;
    riskReward: string;
    mtCommand: string;
    thesisAr: string;
  };

  // Waiting Zone Guidance (when price is not in ideal sweet spot)
  waitingZoneGuidance?: {
    recommendedZoneNameAr: string;
    targetZoneRange: { min: number; max: number };
    idealBouncePrice: number;
    distanceFromCurrentPriceDollars: number;
    distancePips: number;
    expectedActionUponArrival: "BUY" | "SELL";
    whyWaitAr: string;
    requiredConfirmationsAr: string[];
    contingencyWarningAr: string;
  };

  // Deep Tool Confluence Breakdown (Built on App Tools)
  toolConfluence: {
    footprintOrderFlow: {
      statusAr: string;
      deltaScore: string;
      imbalanceVerdictAr: string;
    };
    marketProfileTpo: {
      statusAr: string;
      pocLocationAr: string;
      valVahProximityAr: string;
    };
    whaleRadar: {
      statusAr: string;
      bullionTransfersAr: string;
      cmeFuturesAlignmentAr: string;
      glassnodeFlowAr: string;
    };
    reversalPredictor: {
      statusAr: string;
      fibGoldenPocketAr: string;
    };
    macroDxy: {
      statusAr: string;
      dollarCorrelationAr: string;
    };
  };

  voiceBriefingAr: string;
}

export interface ReversalPivotZone {
  id: string;
  type: "bullish_bounce" | "bearish_rejection";
  nameAr: string;
  price: number;
  priceRange: { min: number; max: number };
  distancePips: number;
  probabilityPercent: number; // e.g. 88%
  strength: "ultra_high" | "high" | "moderate";
  expectedReactionDollars: number; // e.g. +$18.50
  confluenceReasonsAr: string[];
  technicalRationaleAr: string;
  invalidationPrice: number;
  targetPrice: number;
  riskReward: string;
}

export interface TrajectoryStep {
  stepNumber: number;
  titleAr: string;
  actionAr: string;
  price: number;
  priceLabel: string;
  timeframeEstAr: string;
  descriptionAr: string;
  type: "current" | "approach" | "reversal_bounce" | "expansion_tp1" | "final_tp2";
}

export interface GoldMovementPrediction {
  timestamp: number;
  currentPrice: number;
  primaryDirection: "BULLISH_EXPANSION" | "BEARISH_BREAKDOWN" | "RANGE_REVERSAL_BOUNCE";
  primaryDirectionAr: string;
  directionConfidence: number; // 0 - 100%
  expectedMovePips: number;
  expectedMoveDollars: number;
  timeframeHorizonAr: string;

  // Answers: أين سيذهب الذهب؟
  targetMagnets: {
    primaryTarget: { price: number; distancePips: number; labelAr: string; reasonAr: string };
    secondaryTarget: { price: number; distancePips: number; labelAr: string; reasonAr: string };
    extremeExtension: { price: number; distancePips: number; labelAr: string; reasonAr: string };
  };

  // Answers: من أين سيرتد الذهب؟
  reversalPivots: {
    bullishBounce: ReversalPivotZone;
    bearishRejection: ReversalPivotZone;
    deepLiquiditySpring?: ReversalPivotZone;
  };

  // Projected Step-by-Step Path
  trajectorySteps: TrajectoryStep[];

  // Fibonacci Confluence Engine
  fibLevels: {
    swingHigh: number;
    swingLow: number;
    fib0382: number;
    fib0500: number;
    fib0618: number; // Golden Pocket
    fib0650: number; // Golden Pocket upper
    fib0786: number;
    ext1272: number;
    ext1618: number;
  };

  marketCycleStatusAr: string;
  catalystInsightAr: string;
  bestActionAr: string;
  aiDeepForecast?: string;
}

export interface InstitutionalPendingLimitSetup {
  id: string;
  orderType: "BUY LIMIT" | "SELL LIMIT";
  titleAr: string;
  badgeAr: string; // e.g. "صفقة معلقة مضمونة A++"
  probabilityScore: number; // e.g. 98.8%
  
  // Pending Limit Details
  limitPrice: number;
  currentPrice: number;
  distanceDollars: number; // e.g. $7.25
  distancePips: number; // e.g. 72.5
  approachStatus: "waiting" | "approaching" | "near_entry";
  approachProgressPercent: number; // 0 - 100%
  
  // Stop Loss & Safety
  stopLoss: number;
  slDistanceDollars: number;
  slDistancePips: number;
  slRationaleAr: string;
  
  // Multi-target Take Profits
  tp1: {
    price: number;
    profitPips: number;
    profitDollars: number;
    descriptionAr: string;
  };
  tp2: {
    price: number;
    profitPips: number;
    profitDollars: number;
    descriptionAr: string;
  };
  tp3: {
    price: number;
    profitPips: number;
    profitDollars: number;
    descriptionAr: string;
  };
  
  riskRewardRatio: string; // e.g. "1 : 4.5"
  
  // Why this limit setup is guaranteed / ultra high probability (أسباب الضمان المؤسسي)
  guaranteeReasonSummaryAr: string;
  confluencePillars: {
    pillar: string;
    descriptionAr: string;
  }[];
  institutionalOrderBlockZone: string;
  
  // MT4 / MT5 copyable order string
  mtCommand: string;
  validitySessionAr: string;
  timestamp: number;

  // Joint Dual-AI Audit & Approval
  dualAiVerdict?: {
    geminiScore: number;
    claudeScore: number;
    consensusAgreement: number;
    isUnanimous: boolean;
    auditBadgeAr: string;
    geminiAnalysisAr: string;
    claudeAnalysisAr: string;
  };
}

// ==============================================================================
// 3. 10-Year 15M Gold Machine Learning Types (LSTM + XGBoost + OpenAI Engine)
// ==============================================================================

export interface GoldMlInputs {
  currentPrice: number;
  smc: {
    orderBlock: "bullish_ob" | "bearish_ob" | "neutral";
    fvgStatus: "unmitigated_discount" | "unmitigated_premium" | "mitigated";
    sweepType: "SSL_sweep" | "BSL_sweep" | "none";
    chochDetected: boolean;
    bosDetected: boolean;
  };
  dxy: {
    price: number;
    change15m: number;
    correlationBeta: number;
    trend: "bearish" | "bullish" | "neutral";
  };
  rsi: {
    value: number;
    divergence: "bullish_regular" | "bearish_regular" | "bullish_hidden" | "bearish_hidden" | "none";
    slope: "rising" | "falling" | "flat";
  };
  news: {
    redFolderUpcoming: boolean;
    eventNameAr: string;
    minutesToEvent: number;
    sentimentScore: number;
    geopoliticalRisk: number;
  };
  session: {
    currentSession: "London Open" | "NY AM Silver Bullet" | "NY PM" | "Asia" | "Off-Session";
    killzoneActive: boolean;
    timeUtc: string;
  };
}

export interface FeatureImportanceItem {
  feature: string;
  featureAr: string;
  weightPercent: number;
  impact: "bullish" | "bearish" | "neutral";
  detailAr: string;
}

export interface TenYearEraPerformance {
  era: string;
  years: string;
  marketRegimeAr: string;
  candles15mCount: number;
  winRatePercent: number;
  profitFactor: number;
}

export interface GoldMlPredictionResult {
  winProbabilityPercent: number;
  lstmProbability: number;
  xgboostProbability: number;
  openAiSynthesizedScore: number;
  recommendedAction: "BUY" | "SELL" | "HOLD";
  actionGrade: "A++ Institutional Machine Learning" | "A High Probability" | "B Scalp Rejection";
  confidenceScore: number;
  expectedValueR: number;
  riskRewardRatio: string;
  featureImportance: FeatureImportanceItem[];
  lstmMetrics: {
    sequenceLength: number;
    hiddenUnits: number;
    memoryCellActivation: number;
    loss: number;
    valAccuracy: number;
  };
  xgboostMetrics: {
    treesEvaluated: number;
    maxDepth: number;
    learningRate: number;
    giniImpurity: number;
    topSplits: string[];
  };
  tenYearBacktest: {
    totalHistorical15mCandles: number;
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    maxDrawdownPercent: number;
    sharpeRatio: number;
    eraAccuracies: TenYearEraPerformance[];
  };
  tradeSetup: {
    entry: number;
    entryRange: { min: number; max: number };
    stopLoss: number;
    slDistancePips: number;
    tp1: number;
    tp2: number;
    tp3: number;
    mtCommand: string;
    rationaleAr: string;
  };
  reasoningAr: string;
  aiEngine: "OpenAI GPT-4o + LSTM + XGBoost" | "Gemini 2.5 + LSTM + XGBoost" | "Ensemble ML Engine" | string;
  openAiStatus?: {
    used: boolean;
    verifiedRealKey?: boolean;
    model?: string;
    latencyMs?: number;
    errorAr?: string;
    quotaExceeded?: boolean;
    fallbackToGemini?: boolean;
  };
  timestamp: number;
}

export interface OpenAiVerificationResult {
  valid: boolean;
  status: "connected" | "invalid_key" | "quota_exceeded" | "forbidden" | "missing_key" | "invalid_format" | "network_error" | "error";
  messageAr: string;
  statusCode?: number;
  latencyMs?: number;
  activeModel?: string;
  chatVerified?: boolean;
  modelsAvailable?: string[];
  testResponseSnippet?: string;
  maskedKey?: string;
  rawError?: string;
  fallbackAvailable?: boolean;
  quotaExceeded?: boolean;
  timestamp?: number;
}

export interface OpenAiLiveTestResult {
  success: boolean;
  text?: string;
  model?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  latencyMs?: number;
  errorAr?: string;
  statusCode?: number;
  quotaExceeded?: boolean;
  fallbackUsed?: boolean;
  timestamp?: number;
}

// ==============================================================================
// 4. Session Performance Report Types
// ==============================================================================

export type TradingSessionKey = "london" | "new_york" | "asian";

export interface SingleSessionStats {
  sessionKey: TradingSessionKey;
  sessionName: string;
  sessionNameAr: string;
  hoursUtc: string;
  colorAccent: string;
  totalSweeps: number;
  winningSweeps: number;
  losingSweeps: number;
  winRatePercent: number;
  profitFactor: number;
  grossProfitR: number;
  grossLossR: number;
  avgReactionPips: number;
  avgRiskReward: string;
  sslWinRate: number;
  bslWinRate: number;
  judasWinRate: number;
  bestSetupAr: string;
  tacticalAdviceAr: string;
  rating: string;
  liquidityCharacteristicsAr: string;
}

export interface DetectedSweepItem {
  id: string;
  timestamp: number;
  timeFormatted: string;
  session: TradingSessionKey;
  sessionNameAr: string;
  sweepType: "SSL" | "BSL" | "JUDAS" | "ASIAN_RANGE" | string;
  sweepTypeLabelAr: string;
  sweptPrice: number;
  reactionPrice: number;
  targetPrice: number;
  invalidationPrice: number;
  outcome: "win" | "loss";
  reactionPips: number;
  riskRewardAchieved: number;
  volumeLots: number;
  notesAr: string;
}

export interface SessionPerformanceReportData {
  calculatedAt: number;
  dateRange: string;
  totalSweepsAnalyzed: number;
  overallWinRate: number;
  overallProfitFactor: number;
  london: SingleSessionStats;
  newYork: SingleSessionStats;
  asian: SingleSessionStats;
  recentSweeps: DetectedSweepItem[];
  keyFindingsAr: string[];
  bestSessionToTradeAr: string;
}

// ==============================================================================
// 5. Pre-News Predictive Analysis Types (XAU/USD High-Impact Events & Liquidity Traps)
// ==============================================================================

export type MacroEventCode =
  | "CPI"
  | "NFP"
  | "FOMC"
  | "PPI"
  | "RETAIL_SALES"
  | "PCE"
  | "GDP"
  | "UNEMPLOYMENT";

export type PreNewsBias =
  | "BULLISH_GOLD"
  | "BEARISH_GOLD"
  | "VOLATILITY_EXPANSION"
  | "JUDAS_SWEEP";

export interface PreNewsScenario {
  id: string;
  nameAr: string;
  conditionAr: string;
  direction: "LONG" | "SHORT" | "STRADDLE_BREAK";
  expectedGoldMovePips: number;
  targetPrice: number;
  tp2Price: number;
  sniperEntryPrice: number;
  invalidationStopPrice: number;
  probabilityPercent: number;
  actionRecommendationAr: string;
  riskRewardRatio: string;
}

export interface PreNewsLiquidityTarget {
  levelPrice: number;
  type: "BSL_POOL" | "SSL_POOL" | "FVG_IMBALANCE" | "ICEBERG_WALL";
  typeLabelAr: string;
  descriptionAr: string;
  estimatedVolumeLots: number;
  distancePips: number;
  probabilitySweptPercent: number;
}

export interface HighImpactMacroEvent {
  id: string;
  titleAr: string;
  titleEn: string;
  code: MacroEventCode;
  country: "US" | "EU" | "GLOBAL";
  impact: "CRITICAL" | "HIGH";
  scheduledTime: number;
  timeFormatted: string;
  countdownMinutes: number;
  previous: string;
  forecast: string;
  actual?: string | null;
  unit: string;
  historicalVolatilityPips: number;
  dxyInverseSensitivity: number; // e.g. -0.89
  biasBeforeNews: PreNewsBias;
  biasConfidencePercent: number;
  institutionalPreNewsSentiment: "ACCUMULATION" | "DISTRIBUTION" | "EQUILIBRIUM" | "TRAP_BUILDING";
  sentimentLabelAr: string;
  preNewsConsolidation: {
    rangeHigh: number;
    rangeLow: number;
    rangeWidthPips: number;
    pivotPrice: number;
  };
  liquidityTargets: PreNewsLiquidityTarget[];
  scenarios: PreNewsScenario[];
  historicalTrackRecord: {
    releasesAnalyzed: number;
    setupWinRatePercent: number;
    avgFirst5MinPips: number;
    judasFakeoutRatePercent: number;
    historicalBehaviorSummaryAr: string;
  };
  institutionalTrapWarningAr: string;
  safeTradingWindowAr: string;
  aiSynthesisAr: string;
  aiEngineUsed: string;
}

export interface PreNewsPredictiveReport {
  generatedAt: number;
  currentGoldPrice: number;
  dxyPrice: number;
  dxyChange15m: number;
  featuredEvent: HighImpactMacroEvent;
  upcomingEvents: HighImpactMacroEvent[];
  overallPreNewsMarketStateAr: string;
  goldenRulesForNewsTradingAr: string[];
}

// ==============================================================================
// 6. Bitcoin (BTC/USD) Institutional Analytics & Sniper Recommendations Types
// ==============================================================================

export interface BitcoinMarketData {
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
  volumeUsd24h: number;
  fundingRate: number; // e.g. +0.0085%
  annualizedFundingPercent: number; // e.g. +9.3%
  openInterestBtc: number; // e.g. 524,000 BTC
  openInterestUsd: number; // e.g. $48.2B
  timestamp: number;
  source: string;
}

export interface BitcoinOnChainMetrics {
  fearAndGreedIndex: number; // 0 - 100
  fearAndGreedLabelAr: string;
  mvrvZScore: number; // e.g. 2.14
  mvrvRegimeAr: string;
  minerOutflowStatusAr: string;
  exchangeReserveTrend: "outflow_accumulation" | "inflow_distribution" | "neutral";
  exchangeReserveTrendAr: string;
  whaleHoldingTrend: "aggressive_buying" | "steady" | "dumping";
  whaleHoldingTrendAr: string;
  cmeBasisPercent: number; // e.g. +7.4%
  cmeBasisRegimeAr: string;
  estimatedLongLiquidationsUsd: number;
  estimatedShortLiquidationsUsd: number;
}

export interface BitcoinSniperRecommendation {
  id: string;
  action: "STRONG_BUY" | "BUY" | "RANGE_SCALP" | "SELL" | "STRONG_SELL";
  actionLabelAr: string;
  confidencePercent: number;
  timeframe: string;
  entryRange: { min: number; max: number };
  exactSniperEntry: number;
  stopLoss: number;
  slDistanceDollars: number;
  tp1: number;
  tp2: number;
  tp3: number;
  riskReward: string;
  leverageAdviceAr: string;
  tradeTypeAr: string; // e.g. "Swing Institutional / سحب سيولة"
  rationaleAr: string;
  liquiditySweepTargetAr: string;
  orderCommand: string;
}

export interface BitcoinScenario {
  id: string;
  titleAr: string;
  triggerConditionAr: string;
  direction: "LONG" | "SHORT" | "CHOP";
  probabilityPercent: number;
  projectedTarget: number;
  riskReward: string;
  catalystAr: string;
}

export interface BitcoinCmeGapItem {
  id: string;
  gapRange: { min: number; max: number };
  midPrice: number;
  status: "OPEN" | "PARTIALLY_FILLED" | "TESTED";
  createdDate: string;
  distanceDollars: number;
  distancePercent: number;
  magneticFillProbability: number;
}

export interface BitcoinWhaleAlert {
  id: string;
  timestamp: number;
  timeAgo: string;
  amountBtc: number;
  valueUsd: number;
  type: "ACCUMULATION_OUTFLOW" | "EXCHANGE_INFLOW_ALERT" | "OTC_TRANSFER";
  typeLabelAr: string;
  source: string;
  destination: string;
  whaleWalletTier: "Mega Whale (>5k BTC)" | "Whale (>1k BTC)" | "Institutional Custody";
}

export type BitcoinNewsCategory = "ETF_FLOWS" | "MACRO_FED" | "REGULATION" | "MINERS" | "WHALES" | "LIQUIDATIONS";

export interface BitcoinNewsItem {
  id: string;
  titleAr: string;
  summaryAr: string;
  source: string;
  timeAgo: string;
  category: BitcoinNewsCategory;
  categoryLabelAr: string;
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  impactScore: number; // 1 - 10
  relatedPriceImpactAr: string;
  actionableTakeawayAr: string;
}

export interface BitcoinDropCatalyst {
  id: string;
  nameAr: string;
  sharePercent: number; // e.g. 35%
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  detailAr: string;
  metricBadge: string;
  institutionalActionAr: string;
}

export interface BitcoinDropDiagnostic {
  isDropping: boolean;
  overallDropReasonSummaryAr: string;
  dropMagnitudePercent: number;
  dropMagnitudeDollars: number;
  isHealthyCorrection: boolean;
  correctionRegimeAr: string;
  primaryCatalystAr: string;
  catalysts: BitcoinDropCatalyst[];
  reversalLevels: {
    primarySupport: number;
    institutionalDemandZone: string;
    capitulationWickTarget: number;
    invalidationBearTrend: number;
  };
  whaleAccumulationStatusAr: string;
  recoveryOutlookAr: string;
  dropAudioBriefingAr?: string;
  bounceProbabilityPercent?: number;
  expectedBounceTargetDollars?: number;
  minerCapitulationStatusAr?: string;
  historicalComparisonAr?: string;
}

export interface BitcoinFutureForecastToolItem {
  id: string;
  toolNameAr: string;
  category: "ORDER_FLOW" | "ON_CHAIN" | "DERIVATIVES" | "AI_ML" | "MACRO";
  signal: "STRONG_BULLISH" | "BULLISH" | "NEUTRAL" | "BEARISH";
  signalLabelAr: string;
  weightPercent: number; // e.g. 20%
  keyFindingAr: string;
  dataMetric: string; // e.g. "CVD +64% absorption"
}

export interface BitcoinFutureHorizonItem {
  horizon: "24H_48H" | "7_DAYS" | "30_DAYS";
  labelAr: string;
  direction: "UP" | "DOWN";
  probabilityPercent: number;
  expectedPriceTarget: number;
  expectedMovePercent: number;
  catalystDriverAr: string;
}

export interface BitcoinFutureForecast {
  verdict: "STRONG_BULLISH" | "BULLISH_REVERSAL" | "CONSOLIDATION" | "BEARISH_BREAKDOWN";
  verdictLabelAr: string;
  bullishProbabilityPercent: number; // e.g. 78%
  bearishProbabilityPercent: number; // e.g. 22%
  primaryDriverAr: string;
  invalidationPrice: number; // e.g. 76500
  institutionalConsensusAr: string;
  toolsMatrix: BitcoinFutureForecastToolItem[];
  horizons: BitcoinFutureHorizonItem[];
  projectedTrajectoryPath: {
    stageNumber: number;
    titleAr: string;
    targetPrice: number;
    timeframeAr: string;
    descriptionAr: string;
  }[];
  audioForecastBriefingAr: string;
}

export interface BitcoinAnalysisReport {
  generatedAt: number;
  market: BitcoinMarketData;
  onChain: BitcoinOnChainMetrics;
  recommendation: BitcoinSniperRecommendation;
  scenarios: BitcoinScenario[];
  cmeGaps: BitcoinCmeGapItem[];
  whaleAlerts: BitcoinWhaleAlert[];
  news: BitcoinNewsItem[];
  dropDiagnostics: BitcoinDropDiagnostic;
  futureForecast: BitcoinFutureForecast;
  quantumDerivatives?: BitcoinQuantumDerivatives;
  orderFlowPressure: {
    buyerDeltaPercent: number;
    sellerDeltaPercent: number;
    cvdDominanceAr: string;
    dominantWallPrice: number;
    dominantWallSizeBtc: number;
    wallType: "BID_SUPPORT_WALL" | "ASK_RESISTANCE_WALL";
  };
  macroCorrelation: {
    goldCorrelation30d: number; // e.g. +0.48
    nasdaqCorrelation30d: number; // e.g. +0.72
    dxyCorrelation30d: number; // e.g. -0.68
    digitalGoldThesisAr: string;
  };
  aiSynthesisAr: string;
}

// ==============================================================================
// XPL / USDT (Plasma / XProtocol Institutional Analysis)
// ==============================================================================

export interface XplMarketData {
  symbol: string; // "XPL/USDT"
  price: number;
  bid: number;
  ask: number;
  spread: number;
  high24h: number;
  low24h: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number; // in XPL
  volumeUsd24h: number; // in USDT
  timestamp: number;
  source: string;
  depth?: {
    bids: [number, number][];
    asks: [number, number][];
  };
  trades?: {
    id: string;
    price: number;
    qty: number;
    time: number;
    side: "buy" | "sell";
  }[];
  klines?: {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export interface XplSniperRecommendation {
  id: string;
  action: "STRONG_BUY" | "BUY_DIP" | "NEUTRAL_ACCUMULATE" | "SELL_PROFIT";
  actionLabelAr: string;
  confidencePercent: number;
  entryRange: { min: number; max: number };
  exactSniperEntry: number;
  stopLoss: number;
  slDistancePercent: number;
  tp1: number;
  tp2: number;
  tp3: number;
  riskReward: string;
  orderCommand: string;
  rationaleAr: string;
  timeframeHorizonAr: string;
  tokenUtilityThesisAr: string;
}

export interface XplTechnicalIndicators {
  rsi14: number;
  rsiStatusAr: string;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
    trendAr: string;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidthPercent: number;
  };
  smcStructure: {
    trendBiasAr: string;
    fairValueGapZone: string;
    orderBlockDemand: string;
    bosLevel: number;
    sweepTargetAr: string;
  };
  orderFlowPressure: {
    buyerDeltaPercent: number;
    sellerDeltaPercent: number;
    cvdDominanceAr: string;
    dominantWallPrice: number;
    dominantWallSizeXpl: number;
    wallType: "BID_SUPPORT_WALL" | "ASK_RESISTANCE_WALL";
  };
}

export interface XplWhaleAlert {
  id: string;
  timestamp: number;
  timeAgo: string;
  amountXpl: number;
  valueUsd: number;
  type: "ACCUMULATION_BUY" | "LIQUIDITY_ADD" | "WHALE_SWAP" | "STAKING_LOCK";
  typeLabelAr: string;
  source: string;
  destination: string;
}

export interface XplFootprintLevel {
  price: number;
  bidQty: number;
  askQty: number;
  isImbalance: boolean;
  imbalanceSide?: "BID" | "ASK";
  isPoc: boolean;
}

export interface XplFootprintClusterBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  pocPrice: number;
  volume: number;
  delta: number;
  cumulativeDelta: number;
  levels: XplFootprintLevel[];
}

export interface XplQuantumMetrics {
  deltaDivergence: {
    detected: boolean;
    type: "BULLISH_ABSORPTION" | "BEARISH_EXHAUSTION" | "NEUTRAL";
    labelAr: string;
    descriptionAr: string;
  };
  liquidationDensityScore: number;
  shortLiquidationPoolUsd: number;
  longLiquidationPoolUsd: number;
  monteCarloExpectedEv: number;
  monteCarloConfidence95: {
    lower: number;
    upper: number;
  };
  marketRegime: {
    code: "ACCUMULATION_SQUEEZE" | "RUNAWAY_TREND" | "RANGE_EXPANSION" | "STOP_HUNT";
    labelAr: string;
    descriptionAr: string;
    volatilityScore: number;
  };
  developingVwap: {
    vwap: number;
    upperBand: number;
    lowerBand: number;
    nakedPoc: number;
  };
}

export interface XplAnalysisReport {
  generatedAt: number;
  market: XplMarketData;
  recommendation: XplSniperRecommendation;
  indicators: XplTechnicalIndicators;
  whaleAlerts: XplWhaleAlert[];
  footprintClusters?: XplFootprintClusterBar[];
  quantumMetrics?: XplQuantumMetrics;
  scenarios: {
    id: string;
    titleAr: string;
    probabilityPercent: number;
    direction: "LONG" | "SHORT";
    targetPrice: number;
    triggerAr: string;
    catalystAr: string;
  }[];
  aiSynthesisAr: string;
}

export interface BitcoinQuantumDerivatives {
  optionsGex: {
    netGexMillions: number;
    regime: "POSITIVE_GAMMA" | "NEGATIVE_GAMMA";
    regimeLabelAr: string;
    maxPainPrice: number;
    callPutRatio: number;
    dealersHedgingDemandBtc: number;
    gammaSqueezeAcceleratorAr: string;
  };
  interactiveLiquidationTiers: {
    targetPrice: number;
    liqVolumeMillions: number;
    side: "SHORT_SQUEEZE" | "LONG_FLUSH";
    cascadeTriggerProbabilityPercent: number;
  }[];
  marketAuction: {
    sessionVwap: number;
    upperBand1Sigma: number;
    lowerBand1Sigma: number;
    valueAreaHigh: number;
    valueAreaLow: number;
    nakedPocs: number[];
  };
  orderFlowAbsorption: {
    isAbsorbing: boolean;
    absorptionSpeedBtcPerMin: number;
    regimeAr: string;
  };
}

// ==============================================================================
// 10. CRUDE OIL (WTI / CL / BRENT) ADVANCED INSTITUTIONAL ORDER FLOW TYPES
// ==============================================================================

export interface CrudeOilMarketData {
  symbol: string; // "CL (WTI Light Sweet Crude)"
  brentSymbol: string; // "BRENT Crude"
  price: number; // e.g. 74.85
  brentPrice: number; // e.g. 78.95
  brentWtiSpread: number; // e.g. 4.10
  bid: number;
  ask: number;
  spread: number;
  high24h: number;
  low24h: number;
  change24h: number;
  changePercent24h: number;
  volumeBarrels24h: number; // in barrels (e.g. 845,000 contracts = 845M barrels)
  openInterestContracts: number;
  termStructure: "BACKWARDATION" | "CONTANGO";
  termStructureSpreadPromptM1M2: number; // e.g. +0.72 $/bbl (Backwardation = bullish physical tightness)
  crackSpread321: number; // e.g. 21.40 $/bbl (refinery profit margin)
  impliedVolatilityOvxFoil: number; // CBOE Crude Oil Volatility Index (OVX) e.g. 32.4
  timestamp: number;
}

export interface CrudeOilFootprintClusterBar {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volumeBarrels: number;
  deltaBarrels: number;
  deltaPercent: number;
  pocPrice: number;
  clusters: {
    price: number;
    bidQty: number; // contracts
    askQty: number; // contracts
    delta: number;
    imbalanceBuy: boolean;
    imbalanceSell: boolean;
    isPoc: boolean;
  }[];
}

export interface CrudeOilDomLevel {
  price: number;
  bidContracts: number;
  askContracts: number;
  bidBarrels: number;
  askBarrels: number;
  isInstitutionalWall: boolean;
  wallType?: "OPEC_DEFENSE" | "COMMERCIAL_HEDGE" | "CTA_STOP_POOL";
}

export interface CrudeOilLiquidityZone {
  id: string;
  priceMin: number;
  priceMax: number;
  centerPrice: number;
  type: "MAGNETIC_POOL_BUY" | "MAGNETIC_POOL_SELL" | "OPEC_INTERVENTION_FLOOR" | "SPR_REFILL_ZONE" | "CTA_TRIGGER_LEVEL";
  volumeBarrelsTotal: number;
  strengthPercent: number;
  titleAr: string;
  descriptionAr: string;
}

export interface CrudeOilOptionsFlow {
  putCallRatio: number; // e.g. 0.74 (bullish bias)
  callWallPrice: number; // e.g. 78.00
  putWallPrice: number; // e.g. 70.00
  maxPainPrice: number; // e.g. 74.00
  netGammaGexMillions: number;
  gammaRegime: "LONG_GAMMA_STABILIZING" | "SHORT_GAMMA_VOLATILITY_EXPANSION";
  gammaRegimeAr: string;
  dominantStrikes: {
    strike: number;
    callOi: number;
    putOi: number;
    netGex: number;
    sentiment: "BULLISH" | "BEARISH" | "PIN";
  }[];
}

export interface CrudeOilCotReport {
  reportDate: string;
  commercialNetPosition: number; // producers/refiners (usually net short for hedging)
  managedMoneyNetPosition: number; // speculative hedge funds / CTAs
  managedMoneyLongs: number;
  managedMoneyShorts: number;
  commercialHedgingTrendAr: string;
  speculativeSentimentAr: string;
  openInterestTotal: number;
  weeklyShiftBarrels: number;
  cotSignal: "STRONG_BULLISH_REVERSAL" | "BULLISH_CONTINUATION" | "BEARISH_EXHAUSTION" | "NEUTRAL";
}

export interface CrudeOilMarketProfile {
  tpoLetters: {
    price: number;
    letters: string[];
    tpoCount: number;
    isPoc: boolean;
    isValueArea: boolean;
    isSinglePrint: boolean;
  }[];
  pocPrice: number;
  valueAreaHigh: number;
  valueAreaLow: number;
  initialBalanceHigh: number;
  initialBalanceLow: number;
  profileTypeAr: string;
}

export interface CrudeOilWarRoom {
  opecPlusPolicy: {
    stanceAr: string;
    quotaDisciplinePercent: number;
    saudiVoluntaryCutMbpd: number;
    nextOpecMeetingDate: string;
    priceFloorTargetUsd: number;
  };
  geopoliticalHotspots: {
    regionAr: string;
    riskScorePercent: number;
    statusAr: string;
    impactUsdPerBarrel: number;
  }[];
  sprRefillStatus: {
    currentSprLevelMbbl: number;
    maxCapacityMbbl: number;
    doeTargetBuyPriceUsd: number;
    buyingPaceMbpd: number;
    narrativeAr: string;
  };
  refineryCrackMargins: {
    crack321Usd: number;
    gasolineMarginUsd: number;
    dieselDistillateMarginUsd: number;
    utilizationRatePercent: number;
    signalAr: string;
  };
}

export interface CrudeOilEiaReport {
  nextReleaseDate: string;
  forecastCrudeChangeMbbl: number; // e.g. -2.4M barrels
  previousCrudeChangeMbbl: number; // e.g. +1.2M barrels
  apiCrudeInventoryMbbl: number; // e.g. -3.1M barrels (early indicator)
  cushingOklahomaInventoryMbbl: number; // delivery point hub
  cushingStorageCapacityPercent: number; // e.g. 52%
  usCrudeProductionMbpd: number; // e.g. 13.4 Mbpd (record high)
  strategicGuidanceAr: string;
  trapLikelihoodScorePercent: number;
}

export interface CrudeOilMonteCarlo {
  simulatedPathsCount: number; // 10,000
  horizonHours: number;
  expectedEvPrice: number;
  confidenceInterval95: {
    lower: number;
    upper: number;
  };
  probabilityRisePercent: number; // e.g. 74.2%
  probabilityFallPercent: number; // e.g. 25.8%
  tailRiskDownsideUsd: number;
  upsideCapTargetUsd: number;
  volatilityCone: { hour: number; upper95: number; lower95: number; mean: number }[];
}

export interface CrudeOilMlForecast {
  modelArchitecture: string; // "Hybrid CNN-LSTM + XGBoost + Macro Energy Transformers"
  trainedDataPoints: string; // "12 Years Minute-Level Tick & NYMEX Tick Database"
  prediction24h: {
    direction: "BULLISH_EXPANSION" | "BEARISH_CORRECTION" | "CONSOLIDATION";
    directionLabelAr: string;
    confidencePercent: number;
    targetPrice: number;
    expectedMovePercent: number;
  };
  prediction7d: {
    direction: "STRONG_BUY" | "STRONG_SELL" | "NEUTRAL";
    directionLabelAr: string;
    targetPrice: number;
    catalystAr: string;
  };
  featuresImportance: { featureAr: string; weightPercent: number }[];
}

export interface CrudeOilCvdMetrics {
  cumulativeDeltaBarrels: number;
  aggressiveBuyRatioPercent: number;
  absorptionDetected: boolean;
  absorptionTypeAr: string;
  divergenceStatus: "BULLISH_ABSORPTION_DIV" | "BEARISH_EXHAUSTION_DIV" | "NONE";
  divergenceNotesAr: string;
}

export interface CrudeOilWhaleAlert {
  id: string;
  timestamp: number;
  contracts: number;
  barrelsTotal: number;
  usdValueMillions: number;
  price: number;
  side: "BUY" | "SELL";
  venue: "NYMEX_PIT" | "ICE_LONDON" | "CME_CLEARPORT" | "OTC_SWAP";
  counterpartyAr: string;
  executionTypeAr: string;
}

export interface CrudeOilSniperRecommendation {
  tradeId: string;
  timestamp: number;
  symbol: string;
  direction: "LONG" | "SHORT";
  directionLabelAr: string;
  setupQualityScore: number; // 0-100 (e.g. 96)
  confidencePercent: number; // e.g. 88.5%
  entryZone: {
    ideal: number;
    min: number;
    max: number;
  };
  takeProfits: {
    tp1: number;
    tp1ContractsPercent: number;
    tp2: number;
    tp2ContractsPercent: number;
    tp3: number;
    tp3ContractsPercent: number;
  };
  stopLoss: {
    price: number;
    trailingOffset: number;
    invalidationReasonAr: string;
  };
  riskRewardRatio: string; // e.g. "1:3.8"
  timeHorizonAr: string;
  orderType: "LIMIT_PULLBACK_ENTRY" | "MARKET_MOMENTUM_BREAK";
  catalystsAr: string[];
  institutionalThesisAr: string;
  audioBriefingAr: string;
}

export interface CrudeOilAnalysisReport {
  generatedAt: number;
  marketData: CrudeOilMarketData;
  recommendation: CrudeOilSniperRecommendation;
  footprintBars: CrudeOilFootprintClusterBar[];
  domLevels: CrudeOilDomLevel[];
  liquidityZones: CrudeOilLiquidityZone[];
  optionsFlow: CrudeOilOptionsFlow;
  cotReport: CrudeOilCotReport;
  marketProfile: CrudeOilMarketProfile;
  warRoom: CrudeOilWarRoom;
  eiaReport: CrudeOilEiaReport;
  monteCarlo: CrudeOilMonteCarlo;
  mlForecast: CrudeOilMlForecast;
  cvdMetrics: CrudeOilCvdMetrics;
  whaleAlerts: CrudeOilWhaleAlert[];
  aiSynthesisAr: string;
}




