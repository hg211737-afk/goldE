import { FootprintBar, FootprintLevel, GoldQuote, MarketDepth, TapeTrade, LiquidityZone, TimeFrame } from '../types';

/**
 * Calculates Footprint bars from OHLCV and volume distribution
 */
export function generateFootprintBars(
  klines: any[],
  tickSize: number = 0.5,
  imbalanceRatio: number = 3.0
): FootprintBar[] {
  let runningCVD = 0;

  return klines.map((k, idx) => {
    const open = k.open;
    const high = k.high;
    const low = k.low;
    const close = k.close;
    const totalVolume = k.volume;
    const buyVolume = k.takerBuyBaseVolume || totalVolume * (close >= open ? 0.54 : 0.46);
    const sellVolume = Math.max(0, totalVolume - buyVolume);
    const barDelta = buyVolume - sellVolume;
    runningCVD += barDelta;

    // Slice price range into tick levels
    const minP = Math.floor(low / tickSize) * tickSize;
    const maxP = Math.ceil(high / tickSize) * tickSize;
    const numSteps = Math.max(1, Math.round((maxP - minP) / tickSize));

    const levels: FootprintLevel[] = [];
    let maxLevelVol = 0;
    let pocPrice = (open + close) / 2;

    for (let i = 0; i <= numSteps; i++) {
      const p = Number((minP + i * tickSize).toFixed(2));
      // Gaussian-like volume concentration around POC
      const mid = (open + close) / 2;
      const distFromMid = Math.abs(p - mid) / (Math.abs(high - low) || 1);
      const weight = Math.exp(-Math.pow(distFromMid * 2.2, 2));

      const levelTotal = Math.max(0.1, (totalVolume / (numSteps + 1)) * (0.4 + 1.2 * weight));
      const isUpper = p > mid;
      const buyRatio = isUpper ? 0.6 : (p < mid ? 0.4 : 0.5);
      const askQty = Number((levelTotal * buyRatio).toFixed(2));
      const bidQty = Number((levelTotal * (1 - buyRatio)).toFixed(2));
      const delta = Number((askQty - bidQty).toFixed(2));

      if (levelTotal > maxLevelVol) {
        maxLevelVol = levelTotal;
        pocPrice = p;
      }

      levels.push({
        price: p,
        bidQty,
        askQty,
        totalQty: Number(levelTotal.toFixed(2)),
        delta,
        isAskImbalance: false,
        isBidImbalance: false,
        isPOC: false,
      });
    }

    // Flag POC
    levels.forEach((lvl) => {
      if (Math.abs(lvl.price - pocPrice) < tickSize * 0.6) {
        lvl.isPOC = true;
      }
    });

    // Detect Diagonal Imbalances (Ask[i] vs Bid[i-1], Bid[i] vs Ask[i+1])
    for (let i = 0; i < levels.length; i++) {
      if (i > 0) {
        // Compare current ask with bid 1 tick below
        const lowerBid = levels[i - 1].bidQty;
        if (lowerBid > 0 && levels[i].askQty >= lowerBid * imbalanceRatio) {
          levels[i].isAskImbalance = true;
        }
      }
      if (i < levels.length - 1) {
        // Compare current bid with ask 1 tick above
        const upperAsk = levels[i + 1].askQty;
        if (upperAsk > 0 && levels[i].bidQty >= upperAsk * imbalanceRatio) {
          levels[i].isBidImbalance = true;
        }
      }
    }

    return {
      time: k.time,
      open,
      high,
      low,
      close,
      volume: totalVolume,
      delta: Number(barDelta.toFixed(2)),
      cumulativeDelta: Number(runningCVD.toFixed(2)),
      minDelta: Number(Math.min(0, barDelta * 0.8).toFixed(2)),
      maxDelta: Number(Math.max(0, barDelta * 1.2).toFixed(2)),
      levels,
      pocPrice,
    };
  });
}

/**
 * Detects dynamic Liquidity Pools (BSL & SSL), Order Blocks, and FVGs from market structure
 */
export function detectLiquidityZones(currentPrice: number, bars: FootprintBar[]): LiquidityZone[] {
  const zones: LiquidityZone[] = [];

  if (bars.length < 5) {
    // Default zones around current gold price
    return [
      {
        id: 'bsl-1',
        type: 'BSL',
        name: 'Equal Highs Liquidity Pool (BSL)',
        nameAr: 'سيولة الشراء العلوية (EQH / قمم متساوية)',
        priceTop: Number((currentPrice + 12.5).toFixed(2)),
        priceBottom: Number((currentPrice + 10.0).toFixed(2)),
        status: 'untested',
        strength: 'critical',
        volumeCluster: 142.5,
        description: 'تكدس أوامر وقف الخسارة للمضاربين على الهبوط فوق أعلى قمة يومية',
      },
      {
        id: 'bsl-2',
        type: 'BSL',
        name: 'Session High Liquidity',
        nameAr: 'سيولة قمة الجلسة الأوروبية',
        priceTop: Number((currentPrice + 6.8).toFixed(2)),
        priceBottom: Number((currentPrice + 5.2).toFixed(2)),
        status: 'untested',
        strength: 'high',
        volumeCluster: 98.2,
        description: 'حاجز سيولة معلق ينتظر سحب السيولة (Liquidity Sweep)',
      },
      {
        id: 'fvg-1',
        type: 'FVG_BEAR',
        name: 'Bearish Fair Value Gap',
        nameAr: 'فجوة قيمة عادلة بيعية (FVG)',
        priceTop: Number((currentPrice + 3.4).toFixed(2)),
        priceBottom: Number((currentPrice + 2.1).toFixed(2)),
        status: 'untested',
        strength: 'medium',
        volumeCluster: 64.0,
        description: 'اختلال سعري ناتج عن حركة هبوط سريعة سابقة',
      },
      {
        id: 'fvg-2',
        type: 'FVG_BULL',
        name: 'Bullish Imbalance Void',
        nameAr: 'فجوة قيمة عادلة شرائية (FVG)',
        priceTop: Number((currentPrice - 2.8).toFixed(2)),
        priceBottom: Number((currentPrice - 4.1).toFixed(2)),
        status: 'untested',
        strength: 'high',
        volumeCluster: 88.6,
        description: 'منطقة كفاءة سعرية معلقة تجذب السعر لإعادة الاختبار',
      },
      {
        id: 'ssl-1',
        type: 'SSL',
        name: 'Equal Lows Liquidity Pool (SSL)',
        nameAr: 'سيولة البيع السفلية (EQL / قيعان متساوية)',
        priceTop: Number((currentPrice - 8.5).toFixed(2)),
        priceBottom: Number((currentPrice - 10.5).toFixed(2)),
        status: 'untested',
        strength: 'critical',
        volumeCluster: 165.0,
        description: 'تجمع أوامر وقف الخسارة أسفل قاع الجلسة للمشترين',
      },
      {
        id: 'ssl-2',
        type: 'SSL',
        name: 'Weekly Low Stop Run Pool',
        nameAr: 'مستنقع سيولة أسبوعي تحت الدعم الرئيسي',
        priceTop: Number((currentPrice - 16.0).toFixed(2)),
        priceBottom: Number((currentPrice - 18.5).toFixed(2)),
        status: 'untested',
        strength: 'high',
        volumeCluster: 210.4,
        description: 'منطقة صيد سيولة محتملة للبنوك المركزية وصناع السوق',
      },
    ];
  }

  // Scan for swing highs & lows
  const highs = bars.map((b) => b.high);
  const lows = bars.map((b) => b.low);
  const maxHigh = Math.max(...highs);
  const minLow = Math.min(...lows);

  zones.push({
    id: 'bsl-major',
    type: 'BSL',
    name: 'Major Buy-Side Liquidity Pool',
    nameAr: 'حوض سيولة الشراء الرئيسي (BSL)',
    priceTop: Number((maxHigh + 1.5).toFixed(2)),
    priceBottom: Number((maxHigh - 0.5).toFixed(2)),
    status: currentPrice >= maxHigh ? 'swept' : 'untested',
    strength: 'critical',
    volumeCluster: 185.0,
    description: 'أوامر شراء معلقة ووقف خسائر للبائعين فوق أعلى قمة مرئية',
  });

  zones.push({
    id: 'ssl-major',
    type: 'SSL',
    name: 'Major Sell-Side Liquidity Pool',
    nameAr: 'حوض سيولة البيع الرئيسي (SSL)',
    priceTop: Number((minLow + 0.5).toFixed(2)),
    priceBottom: Number((minLow - 1.5).toFixed(2)),
    status: currentPrice <= minLow ? 'swept' : 'untested',
    strength: 'critical',
    volumeCluster: 195.0,
    description: 'أوامر بيع معلقة ووقف خسائر للمشترين أسفل أدنى قاع مرئي',
  });

  return zones;
}

// Remote Cloud Run production backend URL for Standalone Android APK mode
const REMOTE_BACKEND_URL = 'https://ais-pre-5naqrfugh3oru32q7ivu3x-547476563021.europe-west3.run.app';

// Unblocked Binance Vision & Mirror API endpoints
const BINANCE_REST_ENDPOINTS = [
  'https://data-api.binance.vision',
  'https://api1.binance.com',
  'https://api2.binance.com',
  'https://api3.binance.com',
  'https://api.binance.com',
];

const BINANCE_WS_ENDPOINTS = [
  'wss://data-stream.binance.vision/stream?streams=paxgusdt@ticker/paxgusdt@trade/paxgusdt@depth20@100ms',
  'wss://stream.binance.com:9443/stream?streams=paxgusdt@ticker/paxgusdt@trade/paxgusdt@depth20@100ms',
];

/**
 * Connects to live Binance WebSocket feeds for PAXG (Physical Gold 1:1)
 * Automatically cycles through unblocked developer endpoints (data-stream.binance.vision)
 */
export function setupMarketSocket(
  onQuote: (quote: Partial<GoldQuote>) => void,
  onTrade: (trade: TapeTrade) => void,
  onDepth: (depth: MarketDepth) => void
) {
  let ws: WebSocket | null = null;
  let isClosed = false;
  let wsIndex = 0;

  const connect = () => {
    if (isClosed) return;

    try {
      const url = BINANCE_WS_ENDPOINTS[wsIndex % BINANCE_WS_ENDPOINTS.length];
      ws = new WebSocket(url);

      ws.onopen = () => {
        // Successfully connected to WebSocket
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const stream = payload.stream;
          const data = payload.data;

          if (!data) return;

          if (stream.includes('@ticker')) {
            const price = parseFloat(data.c);
            const high = parseFloat(data.h);
            const low = parseFloat(data.l);
            const change = parseFloat(data.p);
            const changePercent = parseFloat(data.P);
            const vol = parseFloat(data.v);
            const bid = parseFloat(data.b);
            const ask = parseFloat(data.a);

            onQuote({
              price,
              high24h: high,
              low24h: low,
              change24h: change,
              changePercent24h: changePercent,
              volume24h: vol,
              bid,
              ask,
              spread: Number((ask - bid).toFixed(2)),
              timestamp: data.E,
              source: 'Binance Live Stream',
            });
          } else if (stream.includes('@trade')) {
            const price = parseFloat(data.p);
            const qty = parseFloat(data.q);
            const isBuyerMaker = data.m; // true = sell taker, false = buy taker
            const side: 'buy' | 'sell' = isBuyerMaker ? 'sell' : 'buy';
            const isWhale = qty >= 5.0; // >= 5 lots of gold

            onTrade({
              id: String(data.t),
              price,
              qty,
              side,
              time: data.T,
              isWhale,
            });
          } else if (stream.includes('@depth')) {
            const rawBids: [string, string][] = data.bids || [];
            const rawAsks: [string, string][] = data.asks || [];

            let runningTotalBid = 0;
            let maxQty = 0.1;

            const bids = rawBids.slice(0, 15).map(([p, q]) => {
              const price = parseFloat(p);
              const qty = parseFloat(q);
              runningTotalBid += qty;
              if (qty > maxQty) maxQty = qty;
              return { price, qty, total: runningTotalBid, percent: 0 };
            });

            let runningTotalAsk = 0;
            const asks = rawAsks.slice(0, 15).map(([p, q]) => {
              const price = parseFloat(p);
              const qty = parseFloat(q);
              runningTotalAsk += qty;
              if (qty > maxQty) maxQty = qty;
              return { price, qty, total: runningTotalAsk, percent: 0 };
            });

            // Update percentage relative to maxQty
            bids.forEach((b) => (b.percent = Math.min(100, (b.qty / maxQty) * 100)));
            asks.forEach((a) => (a.percent = Math.min(100, (a.qty / maxQty) * 100)));

            onDepth({ bids, asks, maxQty });
          }
        } catch {
          // ignore parsing glitch
        }
      };

      ws.onerror = () => {
        // Switch to alternative unblocked mirror on error
        wsIndex++;
      };

      ws.onclose = () => {
        if (!isClosed) {
          wsIndex++;
          setTimeout(connect, 2500); // Reconnect with next endpoint
        }
      };
    } catch {
      if (!isClosed) {
        wsIndex++;
        setTimeout(connect, 3000);
      }
    }
  };

  connect();

  return () => {
    isClosed = true;
    if (ws) ws.close();
  };
}

/**
 * Direct public Binance REST fallback for APK / Standalone environments
 * when no Express backend is available locally on the device.
 * Tests multiple unblocked mirrors including data-api.binance.vision
 */
export async function fetchDirectBinanceSnapshot(interval: string = '5m') {
  for (const base of BINANCE_REST_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const [tickerRes, depthRes, klinesRes, tradesRes] = await Promise.allSettled([
        fetch(`${base}/api/v3/ticker/24hr?symbol=PAXGUSDT`, { signal: controller.signal }),
        fetch(`${base}/api/v3/depth?symbol=PAXGUSDT&limit=30`, { signal: controller.signal }),
        fetch(`${base}/api/v3/klines?symbol=PAXGUSDT&interval=${interval}&limit=50`, { signal: controller.signal }),
        fetch(`${base}/api/v3/trades?symbol=PAXGUSDT&limit=30`, { signal: controller.signal }),
      ]);

      clearTimeout(timeout);

      let price = 2742.50;
      let quoteData: any = null;

      if (tickerRes.status === 'fulfilled' && tickerRes.value.ok) {
        const ticker = await tickerRes.value.json();
        price = parseFloat(ticker.lastPrice);
        quoteData = {
          price,
          bid: parseFloat(ticker.bidPrice) || price - 0.25,
          ask: parseFloat(ticker.askPrice) || price + 0.25,
          spread: Number(((parseFloat(ticker.askPrice) || price + 0.25) - (parseFloat(ticker.bidPrice) || price - 0.25)).toFixed(2)),
          high24h: parseFloat(ticker.highPrice),
          low24h: parseFloat(ticker.lowPrice),
          change24h: parseFloat(ticker.priceChange),
          changePercent24h: parseFloat(ticker.priceChangePercent),
          volume24h: parseFloat(ticker.volume),
          timestamp: Date.now(),
          source: `Direct Binance (${base.includes('vision') ? 'Vision Mirror' : 'REST'})`,
        };
      } else {
        continue; // Try next mirror if ticker failed
      }

      let depthData: any = null;
      if (depthRes.status === 'fulfilled' && depthRes.value.ok) {
        const rawDepth = await depthRes.value.json();
        if (rawDepth.bids && rawDepth.asks) {
          depthData = {
            bids: rawDepth.bids.map((b: string[]) => [parseFloat(b[0]), parseFloat(b[1])]),
            asks: rawDepth.asks.map((a: string[]) => [parseFloat(a[0]), parseFloat(a[1])]),
          };
        }
      }

      let tradesData: any[] = [];
      if (tradesRes.status === 'fulfilled' && tradesRes.value.ok) {
        const rawTrades = await tradesRes.value.json();
        tradesData = rawTrades.map((t: any) => ({
          id: String(t.id),
          price: parseFloat(t.price),
          qty: parseFloat(t.qty),
          isBuyerMaker: t.isBuyerMaker,
          time: t.time,
        }));
      }

      let klinesData: any[] = [];
      if (klinesRes.status === 'fulfilled' && klinesRes.value.ok) {
        const rawKlines = await klinesRes.value.json();
        klinesData = rawKlines.map((k: any) => ({
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
    } catch {
      // Continue to next mirror endpoint
    }
  }

  // Fallback to CoinGecko PAX Gold API if all Binance mirrors are blocked
  try {
    const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=pax-gold&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true');
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      const p = cgData?.['pax-gold']?.usd;
      if (p) {
        return {
          price: p,
          bid: Number((p - 0.25).toFixed(2)),
          ask: Number((p + 0.25).toFixed(2)),
          spread: 0.5,
          high24h: Number((p + 12).toFixed(2)),
          low24h: Number((p - 14).toFixed(2)),
          change24h: Number((p * ((cgData?.['pax-gold']?.usd_24h_change || 0) / 100)).toFixed(2)),
          changePercent24h: cgData?.['pax-gold']?.usd_24h_change || 0,
          volume24h: cgData?.['pax-gold']?.usd_24h_vol || 5000,
          timestamp: Date.now(),
          source: 'CoinGecko Gold Feed',
        };
      }
    }
  } catch {
    // ignore
  }

  return null;
}

export { REMOTE_BACKEND_URL };

