export interface MarketSessionInfo {
  sessionName: string;
  sessionNameAr: string;
  isOpen: boolean;
  statusTextAr: string;
  liquidityLevel: "Extreme" | "High" | "Medium" | "Low" | "Closed";
  liquidityDescriptionAr: string;
  activeConditionsMet: boolean;
  activeConditionsAr: string[];
  recommendedAction: string;
}

export function getCurrentMarketSession(currentTimeUTC = new Date()): MarketSessionInfo {
  const hours = currentTimeUTC.getUTCHours();
  const day = currentTimeUTC.getUTCDay(); // 0 = Sun, 6 = Sat

  // Weekend check (Forex / Gold market closed from Friday 22:00 UTC to Sunday 22:00 UTC)
  if (day === 6 || (day === 5 && hours >= 22) || (day === 0 && hours < 22)) {
    return {
      sessionName: "Weekend Market Closed",
      sessionNameAr: "عطلة نهاية الأسبوع (السوق مغلق)",
      isOpen: false,
      statusTextAr: "الأسواق العالمية للذهب (Spot & COMEX) مقفلة تماماً حتى افتتاح جلسة سيدني الأحد 22:00 UTC.",
      liquidityLevel: "Closed",
      liquidityDescriptionAr: "سيولة معدومة تماماً بسبب عطلة الأسبوع. يُمنع التداول المباشر لتجنب الفجوات السعرية.",
      activeConditionsMet: false,
      activeConditionsAr: ["السوق مقفل في عطلة نهاية الأسبوع"],
      recommendedAction: "راقب الشارت التاريخي وجهز خطط جلسة الأسبوع القادم.",
    };
  }

  // Session hours in UTC:
  // Sydney: 22:00 - 07:00 UTC
  // Tokyo: 00:00 - 09:00 UTC
  // London: 08:00 - 16:30 UTC
  // New York: 13:00 - 22:00 UTC
  // London/NY Overlap (Peak Liquidity): 13:00 - 16:30 UTC

  let sessionName = "Asian Session";
  let sessionNameAr = "الجلسة الآسيوية (طوكيو / سيدني)";
  let liquidityLevel: "Extreme" | "High" | "Medium" | "Low" = "Low";
  let liquidityDesc = "حركة عرضية غالباً مع سيولة هادئة ونطاقات ضيقة.";
  let conditions = ["نطاق عرضي ضيق", "ضعف في أحجام التداول الكبرى"];

  if (hours >= 13 && hours < 17) {
    sessionName = "London / New York Overlap (Peak Liquidity)";
    sessionNameAr = "تداخل لندن ونيويورك (ذروة السيولة العالمية)";
    liquidityLevel = "Extreme";
    liquidityDesc = "أعلى سيولة في اليوم بأكمله! تفاعل عنيف مع بيانات الاقتصاد الكلي واختراق حوض السيولة BSL / SSL.";
    conditions = ["حجم تداول مرتفع جداً", "اختلالات فوت برنت قوية", "سيولة حيتان وعقود خيارات ضخمة"];
  } else if (hours >= 8 && hours < 13) {
    sessionName = "London Session";
    sessionNameAr = "جلسة لندن الأوروبية";
    liquidityLevel = "High";
    liquidityDesc = "نشاط مؤسسي قوي وبداية تشكل اتجاهات اليوم وتحديد قمم وقيعان الجلسة.";
    conditions = ["سيولة أوروبية نشطة", "اختبار مستويات POC الصباحية"];
  } else if (hours >= 17 && hours < 22) {
    sessionName = "New York Afternoon Session";
    sessionNameAr = "جلسة نيويورك المسائية";
    liquidityLevel = "Medium";
    liquidityDesc = "هدوء تدريجي واقتراب إغلاق الجلسة الأمريكية وتسوية العقود.";
    conditions = ["إغلاق صفقات اليوم", "تراجع تدريجي في أحجام الفوت برنت"];
  }

  const isHighLiquidity = liquidityLevel === "Extreme" || liquidityLevel === "High";

  return {
    sessionName,
    sessionNameAr,
    isOpen: true,
    statusTextAr: `سوق الذهب مفتوح حالياً في ${sessionNameAr}.`,
    liquidityLevel,
    liquidityDescriptionAr: liquidityDesc,
    activeConditionsMet: isHighLiquidity,
    activeConditionsAr: conditions,
    recommendedAction: isHighLiquidity
      ? "الشروط متوفرة بالكامل: سيولة عالية وتفعيل لاختلالات الفوت برنت وصيد الستوبات."
      : "سيولة منخفضة: يُفضل انتظار تداخل لندن ونيويورك أو توفر اختلال حجمي واضح.",
  };
}
