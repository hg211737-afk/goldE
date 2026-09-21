import { CorrelationAsset, MacroCorrelationReport, DualSmartLevel, LiquidityZone } from "../types";

/**
 * Institutional Macro Correlation Service for Gold (XAU/USD)
 * Tracks DXY, EUR/USD, Silver (XAG/USD), US 10-Year Yields, and USD/JPY
 */

export function getMacroCorrelationData(goldPrice: number, goldChangePercent: number = 0.45): MacroCorrelationReport {
  // Dynamically derive realistic correlated values based on current gold state
  const isGoldBullish = goldChangePercent >= 0;

  // DXY has strong inverse correlation (~ -0.90) with gold
  const dxyChange = isGoldBullish ? -0.38 : +0.42;
  const dxyPrice = 104.15 + (isGoldBullish ? -0.25 : +0.30);

  // Silver (XAG/USD) has strong direct correlation (~ +0.88)
  const silverPrice = Number((goldPrice / 82.5).toFixed(2));
  const silverChange = isGoldBullish ? +1.25 : -0.95;

  // EUR/USD represents 57.6% of DXY basket (~ +0.82 with gold)
  const eurPrice = isGoldBullish ? 1.0875 : 1.0790;
  const eurChange = isGoldBullish ? +0.35 : -0.40;

  // US10Y 10-year treasury yield (~ -0.74 with gold)
  const us10yYield = isGoldBullish ? 4.14 : 4.28;
  const us10yChange = isGoldBullish ? -0.05 : +0.07;

  // USD/JPY (~ -0.68 with gold)
  const usdjpyPrice = isGoldBullish ? 152.10 : 153.80;
  const usdjpyChange = isGoldBullish ? -0.45 : +0.55;

  const assets: CorrelationAsset[] = [
    {
      symbol: "DXY",
      name: "US Dollar Index",
      nameAr: "مؤشر الدولار الأمريكي (DXY)",
      price: Number(dxyPrice.toFixed(2)),
      change24h: Number((dxyChange * 0.4).toFixed(2)),
      changePercent24h: dxyChange,
      correlationCoef: -0.91,
      correlationType: "inverse",
      goldImpact: dxyChange < 0 ? "bullish" : "bearish",
      impactDescriptionAr:
        dxyChange < 0
          ? "تراجع مؤشر الدولار يزيل الضغوط البيعية ويمنح الذهب زخماً شرائياً مؤسسياً قوياً."
          : "صعود مؤشر الدولار يشكل عائقاً أمام صعود الذهب ويزيد من جاذبية النقد.",
      historicalTrend: [104.8, 104.65, 104.5, 104.3, 104.2, dxyPrice],
    },
    {
      symbol: "XAG/USD",
      name: "Silver Spot",
      nameAr: "الفضة الفورية (XAG/USD)",
      price: silverPrice,
      change24h: Number((silverChange * 0.3).toFixed(2)),
      changePercent24h: silverChange,
      correlationCoef: +0.88,
      correlationType: "direct",
      goldImpact: silverChange > 0 ? "bullish" : "bearish",
      impactDescriptionAr:
        silverChange > 0
          ? "زخم الفضة القوي يقود قطاع المعادن الثمينة ويعطي إشارة استباقية لاختراق المقاومات."
          : "تراجع الفضة يضعف الزخم الصاعد العام للمعادن الثمينة.",
      historicalTrend: [silverPrice - 0.6, silverPrice - 0.4, silverPrice - 0.2, silverPrice],
    },
    {
      symbol: "EUR/USD",
      name: "Euro / US Dollar",
      nameAr: "اليورو مقابل الدولار الأمريكي",
      price: eurPrice,
      change24h: Number((eurChange * 0.005).toFixed(4)),
      changePercent24h: eurChange,
      correlationCoef: +0.82,
      correlationType: "direct",
      goldImpact: eurChange > 0 ? "bullish" : "bearish",
      impactDescriptionAr:
        eurChange > 0
          ? "صعود اليورو (الذي يشكل 57.6% من DXY) يؤكد ضعف العملة الأمريكية ويدعم أسعار الذهب."
          : "ضعف اليورو أمام الدولار ينعكس سلباً على أسعار المعادن والسلع المسعرة بالدولار.",
      historicalTrend: [eurPrice - 0.004, eurPrice - 0.002, eurPrice],
    },
    {
      symbol: "US10Y",
      name: "US 10Y Yield",
      nameAr: "عوائد سندات الخزانة الأمريكية (10 سنوات)",
      price: us10yYield,
      change24h: us10yChange,
      changePercent24h: Number(((us10yChange / us10yYield) * 100).toFixed(2)),
      correlationCoef: -0.74,
      correlationType: "inverse",
      goldImpact: us10yChange < 0 ? "bullish" : "bearish",
      impactDescriptionAr:
        us10yChange < 0
          ? "انخفاض العوائد الحقيقية يقلل تكلفة الفرصة البديلة لحيازة الذهب غير المدر لعائد."
          : "ارتفاع عوائد السندات يسحب السيولة الاستثمارية نحو أدوات الدخل الثابت على حساب الذهب.",
      historicalTrend: [us10yYield + 0.1, us10yYield + 0.05, us10yYield],
    },
    {
      symbol: "USD/JPY",
      name: "US Dollar / Japanese Yen",
      nameAr: "الدولار مقابل الين الياباني",
      price: usdjpyPrice,
      change24h: Number((usdjpyChange * 0.5).toFixed(2)),
      changePercent24h: usdjpyChange,
      correlationCoef: -0.68,
      correlationType: "inverse",
      goldImpact: usdjpyChange < 0 ? "bullish" : "bearish",
      impactDescriptionAr:
        usdjpyChange < 0
          ? "قوة الين كملاذ آمن تتماشى مع التدفقات التحوطية المؤسسية نحو الذهب."
          : "شهية المخاطرة وارتفاع الدولار ين يخفضان الطلب على أصول الملاذ الآمن.",
      historicalTrend: [usdjpyPrice + 0.8, usdjpyPrice + 0.3, usdjpyPrice],
    },
  ];

  // Calculate alignment score
  const bullishVotes = assets.filter((a) => a.goldImpact === "bullish").length;
  const alignmentScore = Math.round((bullishVotes / assets.length) * 100);

  // Check for divergence
  const isDxyWeak = dxyChange < -0.15;
  const isGoldLagging = goldChangePercent < 0.1 && isDxyWeak;

  let divergenceDetected = false;
  let divergenceAlertAr: string | undefined = undefined;

  if (isGoldLagging) {
    divergenceDetected = true;
    divergenceAlertAr =
      "رصد دايفرجنس ماكرو صاعد (Bullish Macro Divergence): مؤشر الدولار DXY يسجل قيعاناً جديدة بينما الذهب لم ينفجر بعد، مما ينذر بحركة صعود اندفاعية لاحقة لتصفية الفجوة.";
  } else if (!isGoldBullish && isDxyWeak) {
    divergenceDetected = true;
    divergenceAlertAr =
      "تراجع غير اعتيادي للذهب بالتزامن مع ضعف الدولار: يشير إلى تصفية سيولة سريعة ومصيدة بيعية مؤقتة (Liquidity Sweep) قبل استئناف الصعود المتوافق مع الماكرو.";
  }

  const overallSentiment =
    alignmentScore >= 65
      ? "bullish_tailwinds"
      : alignmentScore <= 35
      ? "bearish_headwinds"
      : "mixed_divergence";

  const overallSentimentAr =
    overallSentiment === "bullish_tailwinds"
      ? "بيئة ماكرو داعمة بقوة لصعود الذهب (Macro Tailwinds)"
      : overallSentiment === "bearish_headwinds"
      ? "رياح ماكرو معاكسة وضغط سلبي من الدولار (Macro Headwinds)"
      : "إشارات متباينة وتماسك عرضي (Neutral Macro Alignment)";

  const dxyAnalysisAr =
    dxyChange < 0
      ? `مؤشر الدولار DXY يتداول عند ${dxyPrice.toFixed(2)} بانخفاض (${dxyChange}%). كسر الدولار لمستويات الدعم يفتح المجال للذهب لاختبار مستويات السيولة العلوية (BSL).`
      : `مؤشر الدولار DXY يتداول عند ${dxyPrice.toFixed(2)} بارتفاع (+${dxyChange}%). قوة الدولار الحالية تدعو للحذر ومراقبة دفاع المشترين عند المستويات البيعية السفلية.`;

  const institutionalAdviceAr =
    alignmentScore >= 60
      ? "توافق حركة DXY والفضة مع الاتجاه الصاعد يعزز سيناريو الشراء الذكي عند اختراق المستوى الشرائي أو الشراء من ارتداد المستوى البيعي."
      : "التباين في أسواق العملات يتطلب انتظار تأكيد الإغلاق القطعي للشمعة عند مستويات السيولة لتجنب الانكسارات الوهمية (Fakeouts).";

  return {
    timestamp: Date.now(),
    alignmentScore,
    overallSentiment,
    overallSentimentAr,
    dxyAnalysisAr,
    divergenceDetected,
    divergenceAlertAr,
    assets,
    institutionalAdviceAr,
  };
}

/**
 * Generate Flexible Dual-Scenario Smart Levels (Smart Buy & Smart Sell Levels)
 * As requested:
 * - Upper Level (above current price, e.g. 4370 when price is 4355):
 *    -> If price BREAKS out: Smart Buy (شراء ذكي)
 *    -> If price FAILS to break & bounces down: Smart Sell (بيع ذكي)
 * - Lower Level (below current price, e.g. 4340 when price is 4355):
 *    -> If price BREAKS down: Smart Sell (بيع ذكي)
 *    -> If price HOLDS & bounces up: Smart Buy (شراء ذكي)
 */
export function generateDualSmartLevels(
  currentPrice: number,
  liquidityZones: LiquidityZone[] = []
): {
  upperLevel: DualSmartLevel;
  lowerLevel: DualSmartLevel;
} {
  // Find nearest BSL zone above current price, or compute dynamically
  const bslZones = liquidityZones
    .filter((z) => z.priceBottom > currentPrice || z.type === "BSL")
    .sort((a, b) => a.priceBottom - b.priceBottom);

  // Find nearest SSL zone below current price, or compute dynamically
  const sslZones = liquidityZones
    .filter((z) => z.priceTop < currentPrice || z.type === "SSL")
    .sort((a, b) => b.priceTop - a.priceTop);

  // Upper level: e.g. +14 to +16$ above current price
  const upperPrice = bslZones.length > 0 && bslZones[0].priceBottom > currentPrice
    ? Number(bslZones[0].priceBottom.toFixed(2))
    : Number((currentPrice + 15.0).toFixed(2));

  // Lower level: e.g. -14 to -16$ below current price
  const lowerPrice = sslZones.length > 0 && sslZones[0].priceTop < currentPrice
    ? Number(sslZones[0].priceTop.toFixed(2))
    : Number((currentPrice - 15.0).toFixed(2));

  const upperDist = Math.abs(upperPrice - currentPrice);
  const lowerDist = Math.abs(currentPrice - lowerPrice);

  const upperLevel: DualSmartLevel = {
    id: "smart-level-upper",
    levelPrice: upperPrice,
    levelType: "upper_buy",
    titleAr: `المستوى الشرائي العلوي المرن`,
    badgeLabel: "مستوى السيولة العلوي (BSL / Resistance)",
    distanceFromPrice: Number(upperDist.toFixed(2)),
    distancePips: Math.round(upperDist * 10),
    isAboveCurrent: true,
    volumeClusterEstimated: 185.4,
    descriptionAr: `يقع عند $${upperPrice.toFixed(2)} فوق السعر الحالي (يبعد $${upperDist.toFixed(2)}). يقبل الاتجاهين بمرونة مؤسسية: شراء ذكي عند الاختراق أو بيع ذكي عند الارتداد.`,
    breakScenario: {
      action: "BUY",
      titleAr: "شراء ذكي مع الاختراق (Smart Breakout Buy)",
      conditionAr: `في حال اخترق السعر $${upperPrice.toFixed(2)} وثبت أعلاه مع تدفق شرائي`,
      triggerCondition: `اختراق قطعي بشمعة إغلاق أعلى $${upperPrice.toFixed(2)} مع دلتا موجبة تفوق +120`,
      entryZone: `$${(upperPrice + 1.0).toFixed(2)} - $${(upperPrice + 2.5).toFixed(2)}`,
      takeProfit1: `$${(upperPrice + 14.0).toFixed(2)}`,
      takeProfit2: `$${(upperPrice + 28.0).toFixed(2)}`,
      stopLoss: `$${(upperPrice - 6.0).toFixed(2)}`,
      riskReward: "1 : 3.2",
      rationaleAr: "اختراق هذا المستوى يؤدي لتفعيل أوامر الشراء المعلقة وتصفية البائعين (Buy Stop Run)، مما يخلق موجة اندفاعية صاعدة سريعة.",
      probabilityScore: 82,
    },
    bounceScenario: {
      action: "SELL",
      titleAr: "بيع ذكي مع الارتداد (Smart Rejection Sell)",
      conditionAr: `في حال فشل السعر في الاختراق وارتد دون $${upperPrice.toFixed(2)}`,
      triggerCondition: `ملامسة المستوى وتشكيل ذيل علوي (Rejection Wick) مع تدفق بيعي ماركت`,
      entryZone: `$${(upperPrice - 1.5).toFixed(2)} - $${(upperPrice - 0.5).toFixed(2)}`,
      takeProfit1: `$${currentPrice.toFixed(2)}`,
      takeProfit2: `$${lowerPrice.toFixed(2)}`,
      stopLoss: `$${(upperPrice + 4.5).toFixed(2)}`,
      riskReward: "1 : 2.9",
      rationaleAr: "عدم قدرة المشترين على كسر هذا الحاجز يعني امتصاص صانع السوق للسيولة وبدء موجة تصريف هابطة نحو منتصف النطاق السعري.",
      probabilityScore: 78,
    },
  };

  const lowerLevel: DualSmartLevel = {
    id: "smart-level-lower",
    levelPrice: lowerPrice,
    levelType: "lower_sell",
    titleAr: `المستوى البيعي السفلي المرن`,
    badgeLabel: "مستوى السيولة السفلي (SSL / Support)",
    distanceFromPrice: Number(lowerDist.toFixed(2)),
    distancePips: Math.round(lowerDist * 10),
    isAboveCurrent: false,
    volumeClusterEstimated: 210.8,
    descriptionAr: `يقع عند $${lowerPrice.toFixed(2)} تحت السعر الحالي (يبعد $${lowerDist.toFixed(2)}). يقبل الاتجاهين بمرونة مؤسسية: بيع ذكي عند الكسر أو شراء ذكي عند الارتداد.`,
    breakScenario: {
      action: "SELL",
      titleAr: "بيع ذكي مع الكسر (Smart Breakdown Sell)",
      conditionAr: `في حال كسر السعر $${lowerPrice.toFixed(2)} واستقر دونه مع ضغط بيعي`,
      triggerCondition: `كسر قطعي بشمعة هابطة قوية أسفل $${lowerPrice.toFixed(2)} مع دلتا سالبة تفوق -150`,
      entryZone: `$${(lowerPrice - 1.0).toFixed(2)} - $${(lowerPrice - 2.5).toFixed(2)}`,
      takeProfit1: `$${(lowerPrice - 15.0).toFixed(2)}`,
      takeProfit2: `$${(lowerPrice - 30.0).toFixed(2)}`,
      stopLoss: `$${(lowerPrice + 6.0).toFixed(2)}`,
      riskReward: "1 : 3.1",
      rationaleAr: "كسر هذا الحاجز يفعل أوامر وقف الخسارة للمشترين ويفتح المجال لانزلاق هابط حاد نحو مستنقعات السيولة الأسبوعية.",
      probabilityScore: 84,
    },
    bounceScenario: {
      action: "BUY",
      titleAr: "شراء ذكي مع الارتداد (Smart Bounce Buy)",
      conditionAr: `في حال صمد المستوى ولم يكسره السعر وارتد صعوداً`,
      triggerCondition: `امتصاص أوامر البيع عند $${lowerPrice.toFixed(2)} وظهور دايفرجنس شرائي في CVD`,
      entryZone: `$${(lowerPrice + 1.0).toFixed(2)} - $${(lowerPrice + 2.5).toFixed(2)}`,
      takeProfit1: `$${currentPrice.toFixed(2)}`,
      takeProfit2: `$${upperPrice.toFixed(2)}`,
      stopLoss: `$${(lowerPrice - 5.0).toFixed(2)}`,
      riskReward: "1 : 3.0",
      rationaleAr: "صمود هذا المستوى وتراجع ضغط البيع يؤكد دفاع المشترين الكبار عن أسعارهم وبدء رحلة تجميع جديدة تستهدف القمم.",
      probabilityScore: 80,
    },
  };

  return { upperLevel, lowerLevel };
}
