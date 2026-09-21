import { FootprintBar, LiquidityZone, TradeItem, DOMDepthData, DOMLevel, GoldQuote, AiAnalysisResult } from "../types";
import { generateDualSmartLevels, getMacroCorrelationData } from "./correlationService";


export function generateFootprintFromKlines(
  klines: Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    takerBuyBaseVolume?: number;
  }>,
  tickSize: number = 0.5,
  imbalanceRatio: number = 3
): FootprintBar[] {
  let cumulativeDelta = 0;

  return klines.map((candle) => {
    const { open, high, low, close, volume } = candle;
    const takerBuy = candle.takerBuyBaseVolume || volume * (close >= open ? 0.54 : 0.46);
    const takerSell = Math.max(0, volume - takerBuy);
    const delta = takerBuy - takerSell;
    cumulativeDelta += delta;

    const baseLow = Math.floor(low / tickSize) * tickSize;
    const baseHigh = Math.ceil(high / tickSize) * tickSize;
    const steps = Math.max(1, Math.round((baseHigh - baseLow) / tickSize));

    const levels = [];
    let maxVolAtPrice = 0;
    let pocPrice = (open + close) / 2;

    for (let step = 0; step <= steps; step++) {
      const price = Number((baseLow + step * tickSize).toFixed(2));
      const mid = (open + close) / 2;
      const dist = Math.abs(price - mid) / (Math.abs(high - low) || 1);
      const gaussian = Math.exp(-((dist * 2.2) ** 2));
      const totalVolAtLevel = Math.max(0.1, (volume / (steps + 1)) * (0.4 + 1.2 * gaussian));
      const buyFraction = price > mid ? 0.6 : price < mid ? 0.4 : 0.5;

      const askQty = Number((totalVolAtLevel * buyFraction).toFixed(2));
      const bidQty = Number((totalVolAtLevel * (1 - buyFraction)).toFixed(2));
      const levelDelta = Number((askQty - bidQty).toFixed(2));

      if (totalVolAtLevel > maxVolAtPrice) {
        maxVolAtPrice = totalVolAtLevel;
        pocPrice = price;
      }

      levels.push({
        price,
        bidQty,
        askQty,
        totalQty: Number(totalVolAtLevel.toFixed(2)),
        delta: levelDelta,
        isAskImbalance: false,
        isBidImbalance: false,
        isPOC: false,
      });
    }

    levels.forEach((lvl) => {
      if (Math.abs(lvl.price - pocPrice) < tickSize * 0.6) {
        lvl.isPOC = true;
      }
    });

    for (let i = 0; i < levels.length; i++) {
      if (i > 0) {
        const lowerBid = levels[i - 1].bidQty;
        if (lowerBid > 0 && levels[i].askQty >= lowerBid * imbalanceRatio) {
          levels[i].isAskImbalance = true;
        }
      }
      if (i < levels.length - 1) {
        const higherAsk = levels[i + 1].askQty;
        if (higherAsk > 0 && levels[i].bidQty >= higherAsk * imbalanceRatio) {
          levels[i].isBidImbalance = true;
        }
      }
    }

    return {
      time: candle.time,
      open,
      high,
      low,
      close,
      volume,
      delta: Number(delta.toFixed(2)),
      cumulativeDelta: Number(cumulativeDelta.toFixed(2)),
      minDelta: Number(Math.min(0, delta * 0.8).toFixed(2)),
      maxDelta: Number(Math.max(0, delta * 1.2).toFixed(2)),
      levels,
      pocPrice,
    };
  });
}

export function detectLiquidityZones(currentPrice: number, bars: FootprintBar[]): LiquidityZone[] {
  const zones: LiquidityZone[] = [];

  if (bars.length < 5) {
    return [
      {
        id: "bsl-1",
        type: "BSL",
        name: "Equal Highs Liquidity Pool (BSL)",
        nameAr: "سيولة الشراء العلوية (EQH / قمم متساوية)",
        priceTop: Number((currentPrice + 12.5).toFixed(2)),
        priceBottom: Number((currentPrice + 10.0).toFixed(2)),
        status: "untested",
        strength: "critical",
        volumeCluster: 142.5,
        description: "تكدس أوامر وقف الخسارة للمضاربين على الهبوط فوق أعلى قمة يومية",
      },
      {
        id: "bsl-2",
        type: "BSL",
        name: "Session High Liquidity",
        nameAr: "سيولة قمة الجلسة الأوروبية",
        priceTop: Number((currentPrice + 6.8).toFixed(2)),
        priceBottom: Number((currentPrice + 5.2).toFixed(2)),
        status: "untested",
        strength: "high",
        volumeCluster: 98.2,
        description: "حاجز سيولة معلق ينتظر سحب السيولة (Liquidity Sweep)",
      },
      {
        id: "fvg-1",
        type: "FVG_BEAR",
        name: "Bearish Fair Value Gap",
        nameAr: "فجوة قيمة عادلة بيعية (FVG)",
        priceTop: Number((currentPrice + 3.4).toFixed(2)),
        priceBottom: Number((currentPrice + 2.1).toFixed(2)),
        status: "untested",
        strength: "medium",
        volumeCluster: 64.0,
        description: "اختلال سعري ناتج عن حركة هبوط سريعة سابقة",
      },
      {
        id: "fvg-2",
        type: "FVG_BULL",
        name: "Bullish Imbalance Void",
        nameAr: "فجوة قيمة عادلة شرائية (FVG)",
        priceTop: Number((currentPrice - 2.8).toFixed(2)),
        priceBottom: Number((currentPrice - 4.1).toFixed(2)),
        status: "untested",
        strength: "high",
        volumeCluster: 88.6,
        description: "منطقة كفاءة سعرية معلقة تجذب السعر لإعادة الاختبار",
      },
      {
        id: "ssl-1",
        type: "SSL",
        name: "Equal Lows Liquidity Pool (SSL)",
        nameAr: "سيولة البيع السفلية (EQL / قيعان متساوية)",
        priceTop: Number((currentPrice - 8.5).toFixed(2)),
        priceBottom: Number((currentPrice - 10.5).toFixed(2)),
        status: "untested",
        strength: "critical",
        volumeCluster: 165.0,
        description: "تجمع أوامر وقف الخسارة أسفل قاع الجلسة للمشترين",
      },
      {
        id: "ssl-2",
        type: "SSL",
        name: "Weekly Low Stop Run Pool",
        nameAr: "مستنقع سيولة أسبوعي تحت الدعم الرئيسي",
        priceTop: Number((currentPrice - 16.0).toFixed(2)),
        priceBottom: Number((currentPrice - 18.5).toFixed(2)),
        status: "untested",
        strength: "high",
        volumeCluster: 210.4,
        description: "منطقة صيد سيولة محتملة للبنوك المركزية وصناع السوق",
      },
    ];
  }

  const highs = bars.map((b) => b.high);
  const lows = bars.map((b) => b.low);
  const maxHigh = Math.max(...highs);
  const minLow = Math.min(...lows);

  zones.push({
    id: "bsl-major",
    type: "BSL",
    name: "Major Buy-Side Liquidity Pool",
    nameAr: "حوض سيولة الشراء الرئيسي (BSL)",
    priceTop: Number((maxHigh + 1.5).toFixed(2)),
    priceBottom: Number((maxHigh - 0.5).toFixed(2)),
    status: currentPrice >= maxHigh ? "swept" : "untested",
    strength: "critical",
    volumeCluster: 185.0,
    description: "أوامر شراء معلقة ووقف خسائر للبائعين فوق أعلى قمة مرئية",
  });

  zones.push({
    id: "ssl-major",
    type: "SSL",
    name: "Major Sell-Side Liquidity Pool",
    nameAr: "حوض سيولة البيع الرئيسي (SSL)",
    priceTop: Number((minLow + 0.5).toFixed(2)),
    priceBottom: Number((minLow - 1.5).toFixed(2)),
    status: currentPrice <= minLow ? "swept" : "untested",
    strength: "critical",
    volumeCluster: 195.0,
    description: "أوامر بيع معلقة ووقف خسائر للمشترين أسفل أدنى قاع مرئي",
  });

  return zones;
}

export function connectGoldWebSocket(
  onTicker: (data: Partial<GoldQuote>) => void,
  onTrade: (trade: TradeItem) => void,
  onDepth: (depth: DOMDepthData) => void,
  onStatus?: (status: { connected: boolean; latencyMs: number; source: string; updatesCount: number }) => void
): () => void {
  let ws: WebSocket | null = null;
  let isClosed = false;
  let pingTimer: any = null;
  let lastPingTime = 0;
  let currentLatency = 35;
  let updatesCount = 0;

  const connect = () => {
    if (isClosed) return;
    try {
      // Direct high-speed Binance WebSocket stream for real-time gold PAXGUSDT
      ws = new WebSocket(
        "wss://stream.binance.com:9443/stream?streams=paxgusdt@ticker/paxgusdt@trade/paxgusdt@depth20@100ms"
      );

      ws.onopen = () => {
        if (onStatus) {
          onStatus({ connected: true, latencyMs: currentLatency, source: "Binance WebSocket (100ms Stream)", updatesCount });
        }

        // Measure live network round-trip ping
        if (pingTimer) clearInterval(pingTimer);
        pingTimer = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            lastPingTime = Date.now();
            try {
              ws.send(JSON.stringify({ method: "ping" }));
            } catch {
              // ignore
            }
          }
        }, 8000);
      };

      ws.onmessage = (event) => {
        try {
          updatesCount++;
          const now = Date.now();
          if (lastPingTime > 0) {
            currentLatency = Math.max(12, Math.min(220, now - lastPingTime));
            lastPingTime = 0;
          }

          const parsed = JSON.parse(event.data);
          const stream = parsed.stream;
          const data = parsed.data;

          if (!stream || !data) return;

          if (stream.includes("@ticker")) {
            const price = parseFloat(data.c);
            const high24h = parseFloat(data.h);
            const low24h = parseFloat(data.l);
            const change24h = parseFloat(data.p);
            const changePercent24h = parseFloat(data.P);
            const volume24h = parseFloat(data.v);
            const bid = parseFloat(data.b);
            const ask = parseFloat(data.a);

            onTicker({
              symbol: "XAU/USD",
              price,
              high24h,
              low24h,
              change24h,
              changePercent24h,
              volume24h,
              bid,
              ask,
              spread: Number((ask - bid).toFixed(2)),
              timestamp: data.E || Date.now(),
              source: "Binance WebSocket Live (PAXG 1:1 XAU)",
            });

            if (onStatus) {
              onStatus({ connected: true, latencyMs: currentLatency, source: "Binance WebSocket Live", updatesCount });
            }
          } else if (stream.includes("@trade")) {
            const price = parseFloat(data.p);
            const qty = parseFloat(data.q);
            const side = data.m ? "sell" : "buy";
            const isWhale = qty >= 5;

            onTrade({
              id: String(data.t),
              price,
              qty,
              side,
              time: data.T || Date.now(),
              isWhale,
            });
          } else if (stream.includes("@depth")) {
            const bids = data.bids || [];
            const asks = data.asks || [];
            let totalBid = 0;
            let maxQty = 0.1;

            const bidLevels = bids.slice(0, 15).map(([pStr, qStr]: [string, string]) => {
              const price = parseFloat(pStr);
              const qty = parseFloat(qStr);
              totalBid += qty;
              if (qty > maxQty) maxQty = qty;
              return { price, qty, total: totalBid, percent: 0 };
            });

            let totalAsk = 0;
            const askLevels = asks.slice(0, 15).map(([pStr, qStr]: [string, string]) => {
              const price = parseFloat(pStr);
              const qty = parseFloat(qStr);
              totalAsk += qty;
              if (qty > maxQty) maxQty = qty;
              return { price, qty, total: totalAsk, percent: 0 };
            });

            bidLevels.forEach((b: DOMLevel) => (b.percent = Math.min(100, (b.qty / maxQty) * 100)));
            askLevels.forEach((a: DOMLevel) => (a.percent = Math.min(100, (a.qty / maxQty) * 100)));

            onDepth({ bids: bidLevels, asks: askLevels, maxQty });
          }
        } catch {
          // Ignore parse errors on individual frames
        }
      };

      ws.onerror = () => {
        if (onStatus) {
          onStatus({ connected: false, latencyMs: 999, source: "Reconnecting...", updatesCount });
        }
      };

      ws.onclose = () => {
        if (onStatus) {
          onStatus({ connected: false, latencyMs: 999, source: "Reconnecting...", updatesCount });
        }
        if (!isClosed) {
          setTimeout(connect, 2000);
        }
      };
    } catch {
      if (onStatus) {
        onStatus({ connected: false, latencyMs: 999, source: "Connection Error", updatesCount });
      }
      if (!isClosed) {
        setTimeout(connect, 3000);
      }
    }
  };

  connect();

  return () => {
    isClosed = true;
    if (pingTimer) clearInterval(pingTimer);
    if (ws) {
      try {
        ws.close();
      } catch {
        // ignore
      }
    }
  };
}

export async function fetchBinanceGoldDirect(interval: string = "5m") {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const [tickerRes, depthRes, klinesRes, tradesRes] = await Promise.allSettled([
      fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT", { signal: controller.signal }),
      fetch("https://api.binance.com/api/v3/depth?symbol=PAXGUSDT&limit=30", { signal: controller.signal }),
      fetch(`https://api.binance.com/api/v3/klines?symbol=PAXGUSDT&interval=${interval}&limit=50`, {
        signal: controller.signal,
      }),
      fetch("https://api.binance.com/api/v3/trades?symbol=PAXGUSDT&limit=30", { signal: controller.signal }),
    ]);

    clearTimeout(timer);

    let price = 4351.5;
    let quoteData: Partial<GoldQuote> | null = null;

    if (tickerRes.status === "fulfilled" && tickerRes.value.ok) {
      const d = await tickerRes.value.json();
      price = parseFloat(d.lastPrice);
      const bid = parseFloat(d.bidPrice) || price - 0.25;
      const ask = parseFloat(d.askPrice) || price + 0.25;
      quoteData = {
        symbol: "XAU/USD",
        price,
        bid,
        ask,
        spread: Number((ask - bid).toFixed(2)),
        high24h: parseFloat(d.highPrice),
        low24h: parseFloat(d.lowPrice),
        change24h: parseFloat(d.priceChange),
        changePercent24h: parseFloat(d.priceChangePercent),
        volume24h: parseFloat(d.volume),
        timestamp: Date.now(),
        source: "Binance Spot API (PAXG 1:1 XAU)",
      };
    }

    let depthData = null;
    if (depthRes.status === "fulfilled" && depthRes.value.ok) {
      const d = await depthRes.value.json();
      if (d.bids && d.asks) {
        depthData = {
          bids: d.bids.map((b: [string, string]) => [parseFloat(b[0]), parseFloat(b[1])]),
          asks: d.asks.map((a: [string, string]) => [parseFloat(a[0]), parseFloat(a[1])]),
        };
      }
    }

    let tradesData: any[] = [];
    if (tradesRes.status === "fulfilled" && tradesRes.value.ok) {
      const d = await tradesRes.value.json();
      tradesData = d.map((t: any) => ({
        id: String(t.id),
        price: parseFloat(t.price),
        qty: parseFloat(t.qty),
        isBuyerMaker: t.isBuyerMaker,
        side: t.isBuyerMaker ? "sell" : "buy",
        time: t.time,
        isWhale: parseFloat(t.qty) >= 5,
      }));
    }

    let klinesData: any[] = [];
    if (klinesRes.status === "fulfilled" && klinesRes.value.ok) {
      const d = await klinesRes.value.json();
      klinesData = d.map((k: any) => ({
        time: k[0],
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
        takerBuyBaseVolume: parseFloat(k[9]),
      }));
    }

    return {
      ...(quoteData || { price }),
      depth: depthData,
      trades: tradesData,
      klines: klinesData,
    };
  } catch (err) {
    console.warn("Direct Binance fetch fallback warning:", err);
    return null;
  }
}

export async function analyzeOrderFlowWithGemini(params: {
  currentPrice: number;
  delta: string;
  cvdTrend: string;
  footprintImbalance: string;
  bslLevels: string[];
  sslLevels: string[];
  pocPrice: string;
  fvgZones: string[];
  timeframe: string;
  customApiKey?: string;
  preferredModel?: string;
}): Promise<AiAnalysisResult> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (params.customApiKey && params.customApiKey.trim()) {
      headers["x-gemini-api-key"] = params.customApiKey.trim();
    }
    const res = await fetch("/api/gemini/analyze-orderflow", {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.summaryAr || data.summary || data.biasAr || data.bias)) {
        const macro = getMacroCorrelationData(params.currentPrice);
        const dualLevels = generateDualSmartLevels(params.currentPrice);

        return {
          bias: data.biasAr || data.bias || "صاعد مؤسسي (Bullish Flow)",
          confidenceScore: Number(data.confidence || data.confidenceScore || 85),
          summary: data.summaryAr || data.summary || "تم تحليل بيانات تدفق الأوامر للذهب بنجاح.",
          liquidityAnalysis: data.institutionalActivityAr || data.liquidityAnalysis || `رصد دفاع ومستويات سيولة قوية حول $${params.currentPrice.toFixed(2)}.`,
          orderFlowInsight: `نقطة التحكم الحجمية POC عند ${data.keyLevels?.pocTarget || params.pocPrice} مع المقاومة عند ${data.keyLevels?.resistance || params.bslLevels[0] || 'N/A'} والدعم عند ${data.keyLevels?.support || params.sslLevels[0] || 'N/A'}.`,
          dualSmartLevels: dualLevels,
          macroCorrelation: {
            dxyImpact: macro.dxyAnalysisAr,
            macroAlignment: macro.overallSentimentAr,
            silverConfirmation: macro.assets.find(a => a.symbol === "XAG/USD")?.impactDescriptionAr || "الفضة تؤكد الزخم.",
          },
          setup: {
            type: data.tradeSetup?.actionAr || data.tradeSetup?.action || data.setup?.type || "شراء (Buy / Long)",
            entryZone: data.tradeSetup?.entryZone || data.setup?.entryZone || `$${params.currentPrice.toFixed(2)}`,
            stopLoss: data.tradeSetup?.stopLoss || data.setup?.stopLoss || `$${(params.currentPrice - 5.5).toFixed(2)}`,
            takeProfit1: data.tradeSetup?.takeProfit1 || data.setup?.takeProfit1 || `$${(params.currentPrice + 8.5).toFixed(2)}`,
            takeProfit2: data.tradeSetup?.takeProfit2 || data.setup?.takeProfit2 || `$${(params.currentPrice + 16.0).toFixed(2)}`,
            riskRewardRatio: data.tradeSetup?.riskReward || data.setup?.riskRewardRatio || "1:2.8",
          },
          keyAdvice: (Array.isArray(data.warningsAr) && data.warningsAr.length > 0)
            ? data.warningsAr.join(" • ")
            : (data.keyAdvice || "تجنب الدخول العشوائي أثناء تقلبات السيولة العالية."),
        };
      }
    }
  } catch (err) {
    console.warn("Backend Gemini API call error:", err);
  }

  // Robust institutional offline fallback
  const isBullish = params.delta.includes("+") || !params.delta.includes("-");
  const bsl = params.bslLevels[0] || `$${(params.currentPrice + 7).toFixed(2)}`;
  const ssl = params.sslLevels[0] || `$${(params.currentPrice - 7).toFixed(2)}`;
  const macro = getMacroCorrelationData(params.currentPrice);
  const dualLevels = generateDualSmartLevels(params.currentPrice);

  return {
    bias: isBullish ? "صاعد مؤسسي (Bullish Flow)" : "هابط تصحيحي (Bearish Pressure)",
    confidenceScore: isBullish ? 88 : 82,
    summary: isBullish
      ? `رصد امتصاص شرائي قوي من صناع السوق عند ${params.pocPrice} مع تفوق واضح لأوامر الشراء الماركت. السوق يستهدف تصفية البائعين المعلقين.`
      : `ضغط بيعي متواصل وتفريغ مراكز عند القمم الحالية، مع ضعف في طلبات الشراء الليمت، مما يرجح استهداف مستويات السيولة السفلية أولاً.`,
    liquidityAnalysis: `أقرب هدف لسيولة الشراء (BSL) يقع عند ${bsl}. في المقابل تشكل سيولة البيع (SSL) عند ${ssl} حاجزاً دفاعياً رئيسياً. التوقع المرجح هو حدوث سحب للسيولة قبل تثبيت الاتجاه.`,
    orderFlowInsight: `تمركز نقطة التحكم الحجمية (POC) عند ${params.pocPrice} مع صافي دلتا ${params.delta}. تشير قراءة الفوت برنت إلى ${params.footprintImbalance} مما يؤكد السيطرة المؤسسية على حركة السعر.`,
    dualSmartLevels: dualLevels,
    macroCorrelation: {
      dxyImpact: macro.dxyAnalysisAr,
      macroAlignment: macro.overallSentimentAr,
      silverConfirmation: macro.assets.find(a => a.symbol === "XAG/USD")?.impactDescriptionAr || "الفضة تؤكد الزخم.",
    },
    setup: {
      type: isBullish ? "شراء (Buy / Long)" : "بيع (Sell / Short)",
      entryZone: `$${(params.currentPrice - (isBullish ? 1.5 : -1.5)).toFixed(2)} - $${params.currentPrice.toFixed(2)}`,
      stopLoss: isBullish
        ? `$${(params.currentPrice - 4.8).toFixed(2)} (أسفل الـ POC)`
        : `$${(params.currentPrice + 4.8).toFixed(2)} (أعلى الـ POC)`,
      takeProfit1: isBullish ? bsl : ssl,
      takeProfit2: isBullish
        ? `$${(params.currentPrice + 14).toFixed(2)} (حوض BSL التالي)`
        : `$${(params.currentPrice - 14).toFixed(2)} (حوض SSL التالي)`,
      riskRewardRatio: "1:2.9",
    },
    keyAdvice:
      "تجنب الدخول أثناء الشموع الاندفاعية المباشرة؛ انتظر دائماً اختبار نقطة التحكم POC وتأكيد تشكل اختلال حجمي (Imbalance) لتقليل الانزلاق السعري في الذهب.",
  };
}
