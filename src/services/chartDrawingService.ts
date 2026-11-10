import { ChartDrawing, ChartDrawingPoint, FootprintBar, DualSmartLevel, LiquidityZone } from "../types";

const DRAWINGS_STORAGE_KEY = "gold_orderflow_footprint_drawings_v1";

export const DEFAULT_COLORS = {
  support: "#10b981",    // Emerald green
  resistance: "#f43f5e", // Rose red
  trendline: "#38bdf8",  // Sky blue
  aiTrendline: "#a855f7",// Purple/Violet for AI
  aiSupport: "#059669",  // Deep emerald
  aiResistance: "#e11d48",// Deep rose
  poc: "#f59e0b",        // Amber
};

/**
 * Load saved drawings from browser localStorage
 */
export function loadDrawingsFromStorage(): ChartDrawing[] {
  try {
    const raw = localStorage.getItem(DRAWINGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (d) =>
          d &&
          typeof d.id === "string" &&
          (d.type === "trendline" || d.type === "support" || d.type === "resistance") &&
          Array.isArray(d.points)
      );
    }
  } catch (err) {
    console.warn("Failed to load chart drawings from localStorage:", err);
  }
  return [];
}

/**
 * Save drawings array into localStorage
 */
export function saveDrawingsToStorage(drawings: ChartDrawing[]): boolean {
  try {
    localStorage.setItem(DRAWINGS_STORAGE_KEY, JSON.stringify(drawings));
    return true;
  } catch (err) {
    console.warn("Failed to save chart drawings to localStorage:", err);
    return false;
  }
}

/**
 * Factory for manual Support level
 */
export function createSupportDrawing(
  price: number,
  time: number = Date.now(),
  color: string = DEFAULT_COLORS.support,
  customLabel?: string
): ChartDrawing {
  const roundedPrice = Number(price.toFixed(2));
  return {
    id: `sup-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: "support",
    points: [{ price: roundedPrice, time }],
    price: roundedPrice,
    color,
    lineWidth: 1.5,
    lineStyle: "solid",
    label: customLabel || `دعم يدوي: $${roundedPrice.toFixed(2)}`,
    source: "manual",
    createdAt: Date.now(),
  };
}

/**
 * Factory for manual Resistance level
 */
export function createResistanceDrawing(
  price: number,
  time: number = Date.now(),
  color: string = DEFAULT_COLORS.resistance,
  customLabel?: string
): ChartDrawing {
  const roundedPrice = Number(price.toFixed(2));
  return {
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: "resistance",
    points: [{ price: roundedPrice, time }],
    price: roundedPrice,
    color,
    lineWidth: 1.5,
    lineStyle: "solid",
    label: customLabel || `مقاومة يدوية: $${roundedPrice.toFixed(2)}`,
    source: "manual",
    createdAt: Date.now(),
  };
}

/**
 * Factory for Trendline (2 points: price & time)
 */
export function createTrendlineDrawing(
  p1: ChartDrawingPoint,
  p2: ChartDrawingPoint,
  color: string = DEFAULT_COLORS.trendline,
  customLabel?: string,
  isAi: boolean = false
): ChartDrawing {
  return {
    id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: "trendline",
    points: [
      { price: Number(p1.price.toFixed(2)), time: p1.time },
      { price: Number(p2.price.toFixed(2)), time: p2.time },
    ],
    color,
    lineWidth: isAi ? 2 : 1.5,
    lineStyle: isAi ? "dashed" : "solid",
    label: customLabel || (isAi ? "خط اتجاه الذكاء الاصطناعي (AI Trendline)" : "خط اتجاه يدوي (Trendline)"),
    source: isAi ? "ai" : "manual",
    createdAt: Date.now(),
  };
}

/**
 * Auto-generate technical levels and trendlines based on AI Analysis & Order Flow
 */
export function generateAiAnalysisDrawings(
  currentPrice: number,
  bars: FootprintBar[],
  dualLevels?: { upperLevel?: DualSmartLevel; lowerLevel?: DualSmartLevel },
  liquidityZones?: LiquidityZone[]
): ChartDrawing[] {
  const aiDrawings: ChartDrawing[] = [];
  const now = Date.now();

  // 1. AI Major Resistance from Dual Level or Recent Swings
  let aiResPrice = dualLevels?.upperLevel?.levelPrice;
  if (!aiResPrice && bars.length > 0) {
    const highs = bars.map((b) => b.high);
    aiResPrice = Math.max(...highs);
  }
  if (!aiResPrice) aiResPrice = currentPrice + 6.5;
  aiResPrice = Number(aiResPrice.toFixed(2));

  aiDrawings.push({
    id: `ai-res-${now}`,
    type: "resistance",
    points: [{ price: aiResPrice, time: now }],
    price: aiResPrice,
    color: "#f43f5e",
    lineWidth: 2,
    lineStyle: "dashed",
    label: `مقاومة الذكاء الاصطناعي (AI Resistance): $${aiResPrice.toFixed(2)}`,
    source: "ai",
    createdAt: now,
  });

  // 2. AI Major Support from Dual Level or Recent Swings
  let aiSupPrice = dualLevels?.lowerLevel?.levelPrice;
  if (!aiSupPrice && bars.length > 0) {
    const lows = bars.map((b) => b.low);
    aiSupPrice = Math.min(...lows);
  }
  if (!aiSupPrice) aiSupPrice = currentPrice - 6.5;
  aiSupPrice = Number(aiSupPrice.toFixed(2));

  aiDrawings.push({
    id: `ai-sup-${now}`,
    type: "support",
    points: [{ price: aiSupPrice, time: now }],
    price: aiSupPrice,
    color: "#10b981",
    lineWidth: 2,
    lineStyle: "dashed",
    label: `دعم الذكاء الاصطناعي (AI Support): $${aiSupPrice.toFixed(2)}`,
    source: "ai",
    createdAt: now + 1,
  });

  // 3. AI Dynamic Trendline connecting swings in bars
  if (bars.length >= 4) {
    // Determine overall trend bias
    const firstBar = bars[0];
    const lastBar = bars[bars.length - 1];
    const isUptrend = lastBar.close >= firstBar.open;

    if (isUptrend) {
      // Find two prominent swing lows
      const half = Math.floor(bars.length / 2);
      const firstHalfLows = bars.slice(0, half).map((b, i) => ({ price: b.low, time: b.time }));
      const secondHalfLows = bars.slice(half).map((b, i) => ({ price: b.low, time: b.time }));

      const lowest1 = firstHalfLows.reduce((prev, curr) => (curr.price < prev.price ? curr : prev), firstHalfLows[0]);
      const lowest2 = secondHalfLows.reduce((prev, curr) => (curr.price < prev.price ? curr : prev), secondHalfLows[0]);

      aiDrawings.push({
        id: `ai-tl-bull-${now}`,
        type: "trendline",
        points: [
          { price: Number(lowest1.price.toFixed(2)), time: lowest1.time },
          { price: Number(lowest2.price.toFixed(2)), time: lowest2.time },
        ],
        color: "#8b5cf6",
        lineWidth: 2,
        lineStyle: "dashed",
        label: "خط اتجاه صاعد ذكي (AI Bullish Trendline)",
        source: "ai",
        createdAt: now + 2,
      });
    } else {
      // Find two prominent swing highs
      const half = Math.floor(bars.length / 2);
      const firstHalfHighs = bars.slice(0, half).map((b) => ({ price: b.high, time: b.time }));
      const secondHalfHighs = bars.slice(half).map((b) => ({ price: b.high, time: b.time }));

      const highest1 = firstHalfHighs.reduce((prev, curr) => (curr.price > prev.price ? curr : prev), firstHalfHighs[0]);
      const highest2 = secondHalfHighs.reduce((prev, curr) => (curr.price > prev.price ? curr : prev), secondHalfHighs[0]);

      aiDrawings.push({
        id: `ai-tl-bear-${now}`,
        type: "trendline",
        points: [
          { price: Number(highest1.price.toFixed(2)), time: highest1.time },
          { price: Number(highest2.price.toFixed(2)), time: highest2.time },
        ],
        color: "#ec4899",
        lineWidth: 2,
        lineStyle: "dashed",
        label: "خط اتجاه هابط ذكي (AI Bearish Trendline)",
        source: "ai",
        createdAt: now + 2,
      });
    }
  }

  // 4. Equilibrium / Institutional Pivot Level
  const eqPrice = Number(((aiResPrice + aiSupPrice) / 2).toFixed(2));
  aiDrawings.push({
    id: `ai-eq-${now}`,
    type: "support",
    points: [{ price: eqPrice, time: now }],
    price: eqPrice,
    color: "#f59e0b",
    lineWidth: 1.5,
    lineStyle: "dotted",
    label: `نقطة التوازن المؤسسية (AI Equilibrium): $${eqPrice.toFixed(2)}`,
    source: "ai",
    createdAt: now + 3,
  });

  return aiDrawings;
}
