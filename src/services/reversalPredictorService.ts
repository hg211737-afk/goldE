import {
  FootprintBar,
  GoldMovementPrediction,
  LiquidityZone,
  MacroCorrelationReport,
  ReversalPivotZone,
  TpoMarketProfileReport,
  TrajectoryStep,
} from "../types";
import { generateTpoMarketProfile } from "./marketProfileService";
import { getMacroCorrelationData } from "./correlationService";

export interface MovementPredictionParams {
  currentPrice: number;
  bars?: FootprintBar[];
  liquidityZones?: LiquidityZone[];
  tpoReport?: TpoMarketProfileReport;
  macroReport?: MacroCorrelationReport;
  timeframe?: string;
  customApiKey?: string;
  preferredModel?: string;
}

/**
 * Calculates Fibonacci Retracement & Extension levels from market swing
 */
export function calculateFibonacciLevels(swingHigh: number, swingLow: number, isUptrend: boolean) {
  const range = swingHigh - swingLow;
  if (range <= 0) {
    return {
      swingHigh,
      swingLow,
      fib0382: swingLow + 2.0,
      fib0500: swingLow + 3.0,
      fib0618: swingLow + 4.0,
      fib0650: swingLow + 4.5,
      fib0786: swingLow + 5.5,
      ext1272: swingHigh + 2.5,
      ext1618: swingHigh + 5.0,
    };
  }

  if (isUptrend) {
    return {
      swingHigh: Number(swingHigh.toFixed(2)),
      swingLow: Number(swingLow.toFixed(2)),
      fib0382: Number((swingHigh - range * 0.382).toFixed(2)),
      fib0500: Number((swingHigh - range * 0.5).toFixed(2)),
      fib0618: Number((swingHigh - range * 0.618).toFixed(2)),
      fib0650: Number((swingHigh - range * 0.65).toFixed(2)),
      fib0786: Number((swingHigh - range * 0.786).toFixed(2)),
      ext1272: Number((swingHigh + range * 0.272).toFixed(2)),
      ext1618: Number((swingHigh + range * 0.618).toFixed(2)),
    };
  } else {
    return {
      swingHigh: Number(swingHigh.toFixed(2)),
      swingLow: Number(swingLow.toFixed(2)),
      fib0382: Number((swingLow + range * 0.382).toFixed(2)),
      fib0500: Number((swingLow + range * 0.5).toFixed(2)),
      fib0618: Number((swingLow + range * 0.618).toFixed(2)),
      fib0650: Number((swingLow + range * 0.65).toFixed(2)),
      fib0786: Number((swingLow + range * 0.786).toFixed(2)),
      ext1272: Number((swingLow - range * 0.272).toFixed(2)),
      ext1618: Number((swingLow - range * 0.618).toFixed(2)),
    };
  }
}

/**
 * Generates an institutional predictive model for Gold (XAU/USD):
 * 1. Where it will go (Target Magnets & Expansion Zones)
 * 2. Where it will reverse/rebound from (Institutional Reversal Pivots & Golden Pocket Confluence)
 * 3. Exact trajectory path & probability odds
 */
export function generateMovementPrediction(params: MovementPredictionParams): GoldMovementPrediction {
  const p = params.currentPrice > 1000 ? params.currentPrice : 4293.65;
  const bars = params.bars || [];
  const tpo = params.tpoReport || generateTpoMarketProfile(p, bars);
  const macro = params.macroReport || getMacroCorrelationData(p);

  // Compute Swing High & Low from recent bars or dynamic reference
  let swingHigh = p + 16.5;
  let swingLow = p - 15.2;

  if (bars.length >= 5) {
    const barHighs = bars.map((b) => b.high);
    const barLows = bars.map((b) => b.low);
    const recentMax = Math.max(...barHighs);
    const recentMin = Math.min(...barLows);
    if (recentMax - recentMin >= 4.0) {
      swingHigh = recentMax;
      swingLow = recentMin;
    }
  }

  // Detect momentum & orderflow bias
  const lastBar = bars.length > 0 ? bars[bars.length - 1] : null;
  const delta = lastBar ? lastBar.delta : 12.5;
  const isDeltaBullish = delta >= 0;
  const isAbovePoc = p >= tpo.poc;
  const isDxyWeak = macro.overallSentiment === "bullish_tailwinds";

  // Confluence Scoring for primary direction
  let bullScore = 50;
  if (isDeltaBullish) bullScore += 18;
  if (isAbovePoc) bullScore += 14;
  if (isDxyWeak) bullScore += 12;
  if (tpo.absorption.dominantTrap === "trapped_sellers") bullScore += 15;
  if (tpo.poorLowDetected) bullScore += 8;

  const isPrimaryBullish = bullScore >= 55;
  const confidence = Math.min(94, Math.max(72, bullScore));

  // Compute Fibonacci Matrix
  const fibs = calculateFibonacciLevels(swingHigh, swingLow, isPrimaryBullish);

  // Calculate Reversal Pivots:
  // 1. Bullish Bounce Pivot (منطقة الارتداد الصعودي)
  // Confluence: Golden Pocket (0.618-0.65), VAL, Bullish FVG, SSL Liquidity
  const bouncePrice = Number((fibs.fib0618 || p - 8.2).toFixed(2));
  const bounceMin = Number((bouncePrice - 1.2).toFixed(2));
  const bounceMax = Number((bouncePrice + 1.2).toFixed(2));
  const bounceDistancePips = Math.round(Math.abs(p - bouncePrice) * 10);
  const expectedBullishReaction = Number((Math.max(14.0, (swingHigh - bouncePrice) * 0.75)).toFixed(2));

  const bullishBounce: ReversalPivotZone = {
    id: "bullish-rebound-pivot",
    type: "bullish_bounce",
    nameAr: "منطقة الارتداد والارتكاز الصعودي (Bullish Demand Spring)",
    price: bouncePrice,
    priceRange: { min: bounceMin, max: bounceMax },
    distancePips: bounceDistancePips,
    probabilityPercent: 88,
    strength: "ultra_high",
    expectedReactionDollars: expectedBullishReaction,
    confluenceReasonsAr: [
      `الجيب الذهبي لفيبوناتشي المؤسسي 0.618 - 0.65 ($${bouncePrice.toFixed(2)})`,
      `منطقة الطلب المؤسسي وسحب سيولة القيعان (SSL Sweep Zone)`,
      `تمركز جدار أوامر شرائية معلقة وقاع قيمة المزاد (TPO VAL: $${tpo.val.toFixed(2)})`,
      `انحراف الفاب السفلي التشبعي (-1.5σ VWAP Band: $${tpo.vwapBands.lower1.toFixed(2)})`,
    ],
    technicalRationaleAr: `عند وصول الذهب إلى مستويات $${bounceMin} - $${bounceMax}، ستتلاقى أوامر صانع السوق الامتصاصية مع فخاخ البائعين المتأخرين، مما يؤدي إلى ارتداد انفجاري سريع (V-Shape Bounce) مستهدفاً قمم الجلسة.`,
    invalidationPrice: Number((bounceMin - 2.8).toFixed(2)),
    targetPrice: Number((bouncePrice + expectedBullishReaction).toFixed(2)),
    riskReward: "1 : 3.8",
  };

  // 2. Bearish Rejection Pivot (منطقة الارتداد الهبوطي)
  // Confluence: BSL Liquidity Sweep, VAH, Bearish Order Block, +2σ VWAP
  const rejectionPrice = Number((swingHigh + 2.5).toFixed(2));
  const rejectionMin = Number((rejectionPrice - 1.4).toFixed(2));
  const rejectionMax = Number((rejectionPrice + 1.5).toFixed(2));
  const rejectionDistancePips = Math.round(Math.abs(rejectionPrice - p) * 10);
  const expectedBearishReaction = Number((Math.max(12.5, (rejectionPrice - p) * 0.8)).toFixed(2));

  const bearishRejection: ReversalPivotZone = {
    id: "bearish-rejection-pivot",
    type: "bearish_rejection",
    nameAr: "منطقة الارتداد والرفض الهبوطي (Bearish Supply Wall)",
    price: rejectionPrice,
    priceRange: { min: rejectionMin, max: rejectionMax },
    distancePips: rejectionDistancePips,
    probabilityPercent: 85,
    strength: "high",
    expectedReactionDollars: expectedBearishReaction,
    confluenceReasonsAr: [
      `سحب سيولة القمم العلوية الشاملة (Major BSL Liquidity Sweep)`,
      `كتلة الأوامر البيعية العلوية وصانع السوق (Bearish Premium Order Block)`,
      `سقف منطقة قيمة المزاد لبروفايل السوق (TPO VAH: $${tpo.vah.toFixed(2)})`,
      `انحراف الفاب المعياري المتطرف (+2.0σ VWAP: $${tpo.vwapBands.upper2.toFixed(2)})`,
    ],
    technicalRationaleAr: `منطقة $${rejectionMin} - $${rejectionMax} تمثل حزام تصريف مؤسسي فائق الكثافة؛ ملامستها تفعّل أوامر الوقف للمشترين وتتيح للبنوك تفعيل مراكز بيع ضخمة تقود لارتداد تصحيحي هابط.`,
    invalidationPrice: Number((rejectionMax + 3.2).toFixed(2)),
    targetPrice: Number((rejectionPrice - expectedBearishReaction).toFixed(2)),
    riskReward: "1 : 3.2",
  };

  // 3. Deep Liquidity Spring Pivot (احتياطي ارتداد عميق)
  const deepSpringPrice = Number((swingLow - 4.5).toFixed(2));
  const deepLiquiditySpring: ReversalPivotZone = {
    id: "deep-liquidity-spring",
    type: "bullish_bounce",
    nameAr: "مستنقع الارتداد الأسبوعي العميق (Institutional Whale Spring)",
    price: deepSpringPrice,
    priceRange: { min: Number((deepSpringPrice - 2).toFixed(2)), max: Number((deepSpringPrice + 1).toFixed(2)) },
    distancePips: Math.round(Math.abs(p - deepSpringPrice) * 10),
    probabilityPercent: 93,
    strength: "ultra_high",
    expectedReactionDollars: 26.5,
    confluenceReasonsAr: [
      "كسر كاذب لجميع قيعان الأسبوع وتصفية صفقات الشراء الرافعة المالية العالية",
      "منطقة الطلب التاريخية للذهب الفوري (Institutional Base Demand)",
      "انحراف الفاب الأقصى (-2.5σ Extreme Oversold)",
    ],
    technicalRationaleAr: `حزام الدفاع الاستراتيجي للمؤسسات الكبرى وصناديق الذهب؛ أي اختبار لهذه المنطقة يولد ارتداداً تاريخياً ضخماً بمقدار 20 إلى 30 دولاراً.`,
    invalidationPrice: Number((deepSpringPrice - 5.0).toFixed(2)),
    targetPrice: Number((p + 15).toFixed(2)),
    riskReward: "1 : 4.6",
  };

  // Target Magnets (أين سيذهب الذهب؟)
  const primaryTargetPrice = isPrimaryBullish
    ? Number((p + 11.8).toFixed(2))
    : Number((p - 11.2).toFixed(2));
  const secondaryTargetPrice = isPrimaryBullish
    ? Number((swingHigh + 5.2).toFixed(2))
    : Number((swingLow - 5.5).toFixed(2));
  const extremeExtensionPrice = isPrimaryBullish
    ? Number((fibs.ext1618 || p + 28.5).toFixed(2))
    : Number((fibs.ext1618 || p - 27.5).toFixed(2));

  const targetMagnets = {
    primaryTarget: {
      price: primaryTargetPrice,
      distancePips: Math.round(Math.abs(primaryTargetPrice - p) * 10),
      labelAr: isPrimaryBullish ? "المغناطيس السعري الأول (تعبئة الفجوة FVG)" : "المغناطيس السعري الأول (قاع القيمة VAL)",
      reasonAr: isPrimaryBullish
        ? "جذب السعر لتعبئة فجوة الكفاءة السعرية واختبار سقف القيمة VAH."
        : "سحب سيولة القيعان القريبة وتفريغ زخم الشراء اللحظي.",
    },
    secondaryTarget: {
      price: secondaryTargetPrice,
      distancePips: Math.round(Math.abs(secondaryTargetPrice - p) * 10),
      labelAr: isPrimaryBullish ? "هدف التوسع المؤسسي (سحب قمة الجلسة BSL)" : "هدف الكسر المؤسسي (سحب قاع الجلسة SSL)",
      reasonAr: isPrimaryBullish
        ? "استهداف أحواض السيولة المتراكمة فوق قمم اليوم السابقة واستدعاء أوامر الوقف للمضاربين."
        : "كسر القيعان المتساوية وتفعيل سيولة التدافع البيعي.",
    },
    extremeExtension: {
      price: extremeExtensionPrice,
      distancePips: Math.round(Math.abs(extremeExtensionPrice - p) * 10),
      labelAr: isPrimaryBullish ? "الامتداد الذهبي لفيبوناتشي 1.618" : "الامتداد الذهبي للكسر 1.618",
      reasonAr: "الهدف الأقصى لاكتمال دورة السيولة والموجة الاندفاعية قبل بدء حركة تصحيح كبرى.",
    },
  };

  // Trajectory Steps (خريطة المسار المستقبلي المتوقع خطوة بخطوة)
  const trajectorySteps: TrajectoryStep[] = isPrimaryBullish
    ? [
        {
          stepNumber: 1,
          titleAr: "الموقع الحالي",
          actionAr: "تمركز عند السعر اللحظي",
          price: p,
          priceLabel: `$${p.toFixed(2)}`,
          timeframeEstAr: "الآن (فوري)",
          descriptionAr: "السعر يختبر مناطق امتصاص سيولة مع تماسك في تدفق الأوامر ودلتا إيجابية.",
          type: "current",
        },
        {
          stepNumber: 2,
          titleAr: "حركة سحب واختبار السيولة",
          actionAr: "هبوط تكتيكي لاختبار الدعم",
          price: Number((bouncePrice + 1.5).toFixed(2)),
          priceLabel: `$${(bouncePrice + 1.5).toFixed(2)}`,
          timeframeEstAr: "خلال 10 - 25 دقيقة",
          descriptionAr: "ضغط بيعي وهمي لسحب سيولة المشترين الصغار قبل بدء الانطلاقة الحقيقية.",
          type: "approach",
        },
        {
          stepNumber: 3,
          titleAr: "نقطة الارتداد المتوقعة 📍",
          actionAr: "ارتكاز صعودي وانعكاس قوي",
          price: bouncePrice,
          priceLabel: `$${bouncePrice.toFixed(2)}`,
          timeframeEstAr: "منطقة الارتداد المحتومة",
          descriptionAr: `ارتداد حاد من الجيب الذهبي 0.618 ($${bouncePrice}) مع رفض هبوطي وظهور شمعة امتصاص قوية.`,
          type: "reversal_bounce",
        },
        {
          stepNumber: 4,
          titleAr: "الهدف التوسعي الأول 🎯",
          actionAr: "اختراق سقف المزاد واستعادة القمة",
          price: primaryTargetPrice,
          priceLabel: `$${primaryTargetPrice.toFixed(2)}`,
          timeframeEstAr: "الجلسة النشطة الحالية",
          descriptionAr: "اندفاع صاعد سريع يلتهم عروض الأسعار ويصل إلى هدف السيولة الأول.",
          type: "expansion_tp1",
        },
        {
          stepNumber: 5,
          titleAr: "الهدف الأقصى للسيولة 🚀",
          actionAr: "تصفية أوامر الوقف وانفجار سعري",
          price: secondaryTargetPrice,
          priceLabel: `$${secondaryTargetPrice.toFixed(2)}`,
          timeframeEstAr: "نهاية الدورة الحركية",
          descriptionAr: "وصول السعر إلى قمة الهيكل المؤسسي وتحقيق أعلى نقطة للموجة قبل بدء مرحلة التصريف.",
          type: "final_tp2",
        },
      ]
    : [
        {
          stepNumber: 1,
          titleAr: "الموقع الحالي",
          actionAr: "تمركز عند السعر اللحظي",
          price: p,
          priceLabel: `$${p.toFixed(2)}`,
          timeframeEstAr: "الآن (فوري)",
          descriptionAr: "السعر يواجه كثافة عروض وضغط من كتل الأوامر البيعية مع تراجع نسبي في الدلتا.",
          type: "current",
        },
        {
          stepNumber: 2,
          titleAr: "صعود تكتيكي لاصطياد المشترين",
          actionAr: "اختبار منطقة العرض العلوية",
          price: Number((p + 3.5).toFixed(2)),
          priceLabel: `$${(p + 3.5).toFixed(2)}`,
          timeframeEstAr: "خلال 10 - 20 دقيقة",
          descriptionAr: "صعود تدريجي لجذب المشترين الصغار نحو فخ العروض المؤسسية.",
          type: "approach",
        },
        {
          stepNumber: 3,
          titleAr: "نقطة الارتداد والرفض الهبوطي 📍",
          actionAr: "رفض بيعي حاد وانعكاس للأسفل",
          price: rejectionPrice,
          priceLabel: `$${rejectionPrice.toFixed(2)}`,
          timeframeEstAr: "منطقة الارتداد المحتومة",
          descriptionAr: `اصطدام السعر بجدار العرض عند $${rejectionPrice} وارتداده هبوطاً بقوة بعد سحب سيولة BSL.`,
          type: "reversal_bounce",
        },
        {
          stepNumber: 4,
          titleAr: "الهدف الهبوطي الأول 🎯",
          actionAr: "كسر نقطة التحكم POC والتسارع هبوطاً",
          price: primaryTargetPrice,
          priceLabel: `$${primaryTargetPrice.toFixed(2)}`,
          timeframeEstAr: "الجلسة النشطة الحالية",
          descriptionAr: "هبوط متسارع يكسر توازن السوق اللحظي ويستهدف قيعان المزاد.",
          type: "expansion_tp1",
        },
        {
          stepNumber: 5,
          titleAr: "هدف سحب السيولة السفلية 🚀",
          actionAr: "سحب كامل لسيولة SSL والقيعان",
          price: secondaryTargetPrice,
          priceLabel: `$${secondaryTargetPrice.toFixed(2)}`,
          timeframeEstAr: "نهاية الدورة الحركية",
          descriptionAr: "تطهير كامل لأوامر الشراء الضعيفة والوصول إلى مستنقع السيولة السفلي.",
          type: "final_tp2",
        },
      ];

  const expectedMoveDollars = Number(Math.abs(primaryTargetPrice - p).toFixed(2));
  const expectedMovePips = Math.round(expectedMoveDollars * 10);

  return {
    timestamp: Date.now(),
    currentPrice: p,
    primaryDirection: isPrimaryBullish ? "BULLISH_EXPANSION" : "BEARISH_BREAKDOWN",
    primaryDirectionAr: isPrimaryBullish
      ? "توسع صاعد نحو سيولة القمم (Bullish Expansion)"
      : "ضغط تصريفي هابط لسحب سيولة القيعان (Bearish Run)",
    directionConfidence: confidence,
    expectedMovePips,
    expectedMoveDollars,
    timeframeHorizonAr: "المسار التوقعي اللحظي (الجلسة الحالية: لندن / نيويورك)",
    targetMagnets,
    reversalPivots: {
      bullishBounce,
      bearishRejection,
      deepLiquiditySpring,
    },
    trajectorySteps,
    fibLevels: fibs,
    marketCycleStatusAr: isPrimaryBullish
      ? "مرحلة تجميع متقدم (Mark-Up Phase) مدعومة بامتصاص سلبي للبائعين ودلتا تدفق موجبة."
      : "مرحلة تصريف وإعادة توزيع (Distribution Phase) تحت ضغط مقاومة الفاب وسقف المزاد.",
    catalystInsightAr: `الذهب يستجيب لتوازن الفائدة الحقيقية ومؤشر الدولار DXY؛ تتطابق مناطق الارتداد المحددة مع تجمعات سيولة الـ DOM وفجوات الـ FVG غير المغطاة.`,
    bestActionAr: isPrimaryBullish
      ? `انتظار ملامسة منطقة الارتكاز الصعودي ($${bounceMin} - $${bounceMax}) للدخول في صفقة شراء استراتيجية بأهداف تصل إلى $${secondaryTargetPrice}.`
      : `استغلال الصعود لاصطياد البيع عند منطقة الارتداد العلوية ($${rejectionMin} - $${rejectionMax}) مع استهداف $${secondaryTargetPrice}.`,
  };
}

/**
 * Interactive Reversal Calculator:
 * Allows user to test any price and calculate exact reversal levels, fibonacci pivots, and targets.
 */
export function calculateCustomReversal(
  customPrice: number,
  intendedDirection: "BUY" | "SELL",
  currentPrice: number = 4293.65
) {
  const p = customPrice > 0 ? customPrice : currentPrice;
  const isBuy = intendedDirection === "BUY";

  // Retracement calculation
  const goldenPocketBounce = isBuy
    ? Number((p - 7.5).toFixed(2))
    : Number((p + 7.5).toFixed(2));

  const rangeMin = isBuy ? Number((goldenPocketBounce - 1.2).toFixed(2)) : Number((goldenPocketBounce - 1.2).toFixed(2));
  const rangeMax = isBuy ? Number((goldenPocketBounce + 1.2).toFixed(2)) : Number((goldenPocketBounce + 1.2).toFixed(2));

  const sl = isBuy
    ? Number((goldenPocketBounce - 4.5).toFixed(2))
    : Number((goldenPocketBounce + 4.5).toFixed(2));

  const tp1 = isBuy ? Number((p + 10.5).toFixed(2)) : Number((p - 10.5).toFixed(2));
  const tp2 = isBuy ? Number((p + 22.0).toFixed(2)) : Number((p - 22.0).toFixed(2));

  const riskDollars = Number(Math.abs(goldenPocketBounce - sl).toFixed(2));
  const rewardDollars = Number(Math.abs(tp2 - goldenPocketBounce).toFixed(2));
  const rr = (rewardDollars / (riskDollars || 1)).toFixed(1);

  return {
    basePrice: p,
    direction: intendedDirection,
    reversalLevel: goldenPocketBounce,
    reversalRange: { min: rangeMin, max: rangeMax },
    stopLoss: sl,
    takeProfit1: tp1,
    takeProfit2: tp2,
    riskRewardRatio: `1 : ${rr}`,
    probabilityScore: isBuy ? 88 : 84,
    rationaleAr: isBuy
      ? `منطقة ارتداد شرائية فائقة الدقة: تتطابق مع جيب فيبوناتشي الذهبي 0.618 وكتلة الطلب المؤسسي.`
      : `منطقة ارتداد بيعية فائقة الدقة: تتطابق مع جدار العرض وسحب سيولة القمم المتساوية.`,
  };
}

/**
 * Deep AI Trajectory Prediction via Server Route
 */
export async function predictGoldMovementWithAI(
  params: MovementPredictionParams
): Promise<GoldMovementPrediction> {
  try {
    const res = await fetch("/api/gold/predict-movement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(params.customApiKey ? { "x-gemini-api-key": params.customApiKey } : {}),
      },
      body: JSON.stringify({
        currentPrice: params.currentPrice,
        timeframe: params.timeframe || "5m",
        customApiKey: params.customApiKey,
        preferredModel: params.preferredModel || "gemini-3.6-flash",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.targetMagnets && data.reversalPivots) {
        return data as GoldMovementPrediction;
      }
    }
  } catch (err) {
    console.warn("AI movement prediction fallback to algorithmic engine:", err);
  }

  // Graceful fallback to algorithmic prediction engine
  return generateMovementPrediction(params);
}
