export interface MarketSessionInfo {
  isMarketOpen: boolean;
  currentSession: 'GOLDEN_OVERLAP' | 'NEW_YORK' | 'LONDON' | 'ASIAN' | 'DAILY_BREAK' | 'WEEKEND_CLOSED';
  sessionNameAr: string;
  liquidityLevel: 'PRIME' | 'HIGH' | 'MODERATE' | 'LOW' | 'NONE';
  liquidityDescriptionAr: string;
  isHighLiquidity: boolean;
  canTradeSignals: boolean;
  reasonIfBlockedAr?: string;
  nextEvent: {
    nameAr: string;
    countdownStr: string;
    targetUtcHour: number;
  };
  utcTimeStr: string;
  localTimeStr: string;
  recommendationQualityMultiplier: number; // 1.0 during prime overlap, 0.9 during london/ny, 0.6 during asian, 0 during closed
}

export interface SessionSchedule {
  name: string;
  nameAr: string;
  startUtc: number; // in hours (e.g. 7.0 for 07:00 UTC)
  endUtc: number;
  liquidity: 'PRIME' | 'HIGH' | 'MODERATE' | 'LOW';
  descriptionAr: string;
}

export const GOLD_SESSIONS_SCHEDULE: SessionSchedule[] = [
  {
    name: 'Golden Overlap (London + NY)',
    nameAr: 'جلسة التداخل الذهبي (لندن + نيويورك)',
    startUtc: 12,
    endUtc: 16,
    liquidity: 'PRIME',
    descriptionAr: 'ذروة السيولة العالمية للذهب والفيوتشرز — أعلى نسبة نجاح للصفقات وانفجارات سعرية نظيفة',
  },
  {
    name: 'New York Session (COMEX)',
    nameAr: 'جلسة نيويورك (بورصة كومكس)',
    startUtc: 12,
    endUtc: 21,
    liquidity: 'HIGH',
    descriptionAr: 'حجم تداول مؤسسي ضخم، صدور البيانات الاقتصادية الأمريكية وتحركات قوية',
  },
  {
    name: 'London Session (LBMA)',
    nameAr: 'جلسة لندن (سوق الذهب الفوري)',
    startUtc: 7,
    endUtc: 16,
    liquidity: 'HIGH',
    descriptionAr: 'تثبيت أسعار الذهب العالمية (LBMA Gold Fix) وانطلاق الاتجاه الأوروبي',
  },
  {
    name: 'Asian Session (Tokyo & Sydney)',
    nameAr: 'جلسة آسيا (طوكيو وسيدني)',
    startUtc: 23,
    endUtc: 7,
    liquidity: 'MODERATE',
    descriptionAr: 'حركة تجميع هادئة ونطاقات ضيقة (Asian Range) تمهد لسيولة لندن',
  },
];

/**
 * Evaluates the live global gold market status, active session, liquidity depth,
 * and whether institutional-grade trade recommendations are permitted.
 * 
 * Gold Market Hours (Globex / LBMA / Spot Gold):
 * - Opens: Sunday 22:00 UTC (or 23:00 UTC depending on DST)
 * - Closes: Friday 21:00 UTC / 22:00 UTC
 * - Daily Maintenance Break: Mon-Thu 21:00 - 22:00 UTC
 * - Weekend Closed: Friday night to Sunday night
 */
export function getMarketSessionStatus(simulatedDate?: Date): MarketSessionInfo {
  const now = simulatedDate || new Date();
  
  // Day of week in UTC: 0 is Sunday, 1 is Monday, ..., 5 is Friday, 6 is Saturday
  const dayUtc = now.getUTCDay();
  const hourUtc = now.getUTCHours();
  const minuteUtc = now.getUTCMinutes();
  const timeDecimalUtc = hourUtc + minuteUtc / 60;

  const utcTimeStr = `${String(hourUtc).padStart(2, '0')}:${String(minuteUtc).padStart(2, '0')} UTC`;
  const localTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Check Weekend Market Closure
  // Friday closes at 21:00 UTC (or after 21:45 UTC)
  // Saturday completely closed
  // Sunday opens at 22:00 UTC
  const isWeekend =
    dayUtc === 6 || // Saturday
    (dayUtc === 5 && timeDecimalUtc >= 21.0) || // Friday after 21:00 UTC
    (dayUtc === 0 && timeDecimalUtc < 22.0); // Sunday before 22:00 UTC

  if (isWeekend) {
    // Calculate time remaining until Sunday 22:00 UTC
    let hoursUntilOpen = 0;
    if (dayUtc === 5) {
      hoursUntilOpen = (24 - timeDecimalUtc) + 24 + 22;
    } else if (dayUtc === 6) {
      hoursUntilOpen = (24 - timeDecimalUtc) + 22;
    } else if (dayUtc === 0) {
      hoursUntilOpen = Math.max(0, 22 - timeDecimalUtc);
    }

    const hrs = Math.floor(hoursUntilOpen);
    const mins = Math.floor((hoursUntilOpen - hrs) * 60);
    const countdownStr = `${hrs} ساعة و ${mins} دقيقة`;

    return {
      isMarketOpen: false,
      currentSession: 'WEEKEND_CLOSED',
      sessionNameAr: 'عطلة نهاية الأسبوع (السوق مغلق)',
      liquidityLevel: 'NONE',
      liquidityDescriptionAr: 'السوق العالمي مغلق — انعدام السيولة وحظر التداول لتجنب فجوات الأسعار',
      isHighLiquidity: false,
      canTradeSignals: false,
      reasonIfBlockedAr:
        'السوق العالمي للذهب مغلق حالياً في عطلة نهاية الأسبوع. تم حظر التوصيات آلياً لحماية رأس المال من فجوات الافتتاح والسيولة الوهمية، وستُستأنف الإشارات فور افتتاح جلسة الأحد 22:00 UTC.',
      nextEvent: {
        nameAr: 'افتتاح سوق الذهب العالمي (جلسة الأحد)',
        countdownStr,
        targetUtcHour: 22,
      },
      utcTimeStr,
      localTimeStr,
      recommendationQualityMultiplier: 0,
    };
  }

  // 2. Check Daily Maintenance Break (Mon-Thu 21:00 - 22:00 UTC)
  const isDailyBreak = timeDecimalUtc >= 21.0 && timeDecimalUtc < 22.0;
  if (isDailyBreak) {
    const minutesLeft = Math.round((22.0 - timeDecimalUtc) * 60);
    return {
      isMarketOpen: false,
      currentSession: 'DAILY_BREAK',
      sessionNameAr: 'استراحة الصيانة والتسوية اليومية (Daily Maintenance)',
      liquidityLevel: 'NONE',
      liquidityDescriptionAr: 'توقف مؤقت للتسويات البنكية وعقود الفيوتشرز لمدة ساعة واحدة',
      isHighLiquidity: false,
      canTradeSignals: false,
      reasonIfBlockedAr:
        'فترة استراحة وتصفية يومية لسوق الذهب العالمي (21:00 - 22:00 UTC). يمتنع النظام عن تقديم توصيات في هذه الساعة لتجنب اتساع السبريد وتوقف تنفيذ البنوك.',
      nextEvent: {
        nameAr: 'استئناف التداول وافتتاح الجلسة الآسيوية',
        countdownStr: `${minutesLeft} دقيقة`,
        targetUtcHour: 22,
      },
      utcTimeStr,
      localTimeStr,
      recommendationQualityMultiplier: 0,
    };
  }

  // 3. Determine Active Trading Session
  // Golden Overlap: 12:00 - 16:00 UTC
  if (timeDecimalUtc >= 12.0 && timeDecimalUtc < 16.0) {
    const minsToClose = Math.round((16.0 - timeDecimalUtc) * 60);
    return {
      isMarketOpen: true,
      currentSession: 'GOLDEN_OVERLAP',
      sessionNameAr: 'جلسة التداخل الذهبي (لندن + نيويورك)',
      liquidityLevel: 'PRIME',
      liquidityDescriptionAr: 'ذروة السيولة العالمية القصوى — أعلى نسبة نجاح للصفقات مع أدنى سبريد',
      isHighLiquidity: true,
      canTradeSignals: true,
      nextEvent: {
        nameAr: 'إغلاق جلسة لندن واستمرار جلسة نيويورك',
        countdownStr: `${Math.floor(minsToClose / 60)} س و ${minsToClose % 60} د`,
        targetUtcHour: 16,
      },
      utcTimeStr,
      localTimeStr,
      recommendationQualityMultiplier: 1.0,
    };
  }

  // New York Session: 16:00 - 21:00 UTC (after London closes)
  if (timeDecimalUtc >= 16.0 && timeDecimalUtc < 21.0) {
    const minsToClose = Math.round((21.0 - timeDecimalUtc) * 60);
    return {
      isMarketOpen: true,
      currentSession: 'NEW_YORK',
      sessionNameAr: 'جلسة نيويورك الأمريكية (COMEX)',
      liquidityLevel: 'HIGH',
      liquidityDescriptionAr: 'سيولة عالية مدعومة بحجم تداول الفيوتشرز والخيارات الأمريكية',
      isHighLiquidity: true,
      canTradeSignals: true,
      nextEvent: {
        nameAr: 'إغلاق جلسة نيويورك وبدء الاستراحة اليومية',
        countdownStr: `${Math.floor(minsToClose / 60)} س و ${minsToClose % 60} د`,
        targetUtcHour: 21,
      },
      utcTimeStr,
      localTimeStr,
      recommendationQualityMultiplier: 0.95,
    };
  }

  // London Session: 07:00 - 12:00 UTC (before NY opens)
  if (timeDecimalUtc >= 7.0 && timeDecimalUtc < 12.0) {
    const minsToOverlap = Math.round((12.0 - timeDecimalUtc) * 60);
    return {
      isMarketOpen: true,
      currentSession: 'LONDON',
      sessionNameAr: 'جلسة لندن الأوروبية (سوق الذهب الفوري LBMA)',
      liquidityLevel: 'HIGH',
      liquidityDescriptionAr: 'سيولة مرتفعة ونشاط بنكي أوروبي كثيف ومثالي لاقتناص الأوردر فلو',
      isHighLiquidity: true,
      canTradeSignals: true,
      nextEvent: {
        nameAr: 'افتتاح جلسة نيويورك وبدء التداخل الذهبي',
        countdownStr: `${Math.floor(minsToOverlap / 60)} س و ${minsToOverlap % 60} د`,
        targetUtcHour: 12,
      },
      utcTimeStr,
      localTimeStr,
      recommendationQualityMultiplier: 0.92,
    };
  }

  // Asian Session: 22:00 - 07:00 UTC (spanning midnight)
  if (timeDecimalUtc >= 22.0 || timeDecimalUtc < 7.0) {
    let hoursToLondon = 0;
    if (timeDecimalUtc >= 22.0) {
      hoursToLondon = (24 - timeDecimalUtc) + 7;
    } else {
      hoursToLondon = 7 - timeDecimalUtc;
    }
    const hrs = Math.floor(hoursToLondon);
    const mins = Math.floor((hoursToLondon - hrs) * 60);

    return {
      isMarketOpen: true,
      currentSession: 'ASIAN',
      sessionNameAr: 'جلسة آسيا وطوكيو (Asian Session)',
      liquidityLevel: 'MODERATE',
      liquidityDescriptionAr: 'سيولة متوسطة وهادئة — تذبذب نطاقي وتجميع طلبات قبل انفجار لندن',
      isHighLiquidity: false,
      canTradeSignals: true, // permitted but with strict validation
      nextEvent: {
        nameAr: 'افتتاح جلسة لندن عالية السيولة (07:00 UTC)',
        countdownStr: `${hrs} س و ${mins} د`,
        targetUtcHour: 7,
      },
      utcTimeStr,
      localTimeStr,
      recommendationQualityMultiplier: 0.78,
    };
  }

  // Fallback (Low Liquidity gap, if any)
  return {
    isMarketOpen: true,
    currentSession: 'ASIAN',
    sessionNameAr: 'فترة تداول هادئة (Inter-Session)',
    liquidityLevel: 'LOW',
    liquidityDescriptionAr: 'سيولة منخفضة — يُنصح بالانتظار حتى دخول السيولة المؤسسية الكبرى',
    isHighLiquidity: false,
    canTradeSignals: false,
    reasonIfBlockedAr: 'سيولة السوق اللحظية غير كافية لضمان وصول التوصية لأهدافها بسرعة وبدون انزلاق سعري.',
    nextEvent: {
      nameAr: 'افتتاح جلسة لندن',
      countdownStr: 'قريباً',
      targetUtcHour: 7,
    },
    utcTimeStr,
    localTimeStr,
    recommendationQualityMultiplier: 0.5,
  };
}
