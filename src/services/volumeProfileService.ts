import { FootprintBar, VolumeProfileData, VolumeProfileLevel } from '../types';

export type ProfileRangeOption = 'SESSION' | 'FIXED_VISIBLE' | 'LAST_20' | 'LAST_10';

/**
 * Calculates a professional Volume Profile (Fixed Range / Current Session)
 * based on footprint clusters and tick data across price levels.
 *
 * It accurately derives:
 * - Total volume per discrete tick level
 * - Bid volume (aggressive market sells) vs Ask volume (aggressive market buys)
 * - Point of Control (POC) - the absolute highest volume node
 * - Value Area (70% standard normal distribution enclosing VAH and VAL)
 * - High Volume Nodes (HVNs) representing institutional support/resistance magnet areas
 * - Low Volume Nodes (LVNs) representing price rejection or rapid pass-through zones
 */
export function calculateVolumeProfile(
  bars: FootprintBar[],
  currentPrice: number,
  rangeOption: ProfileRangeOption = 'SESSION',
  tickSize: number = 0.5
): VolumeProfileData {
  if (!bars || bars.length === 0) {
    return {
      rangeType: rangeOption,
      pocPrice: currentPrice,
      pocVolume: 0,
      vahPrice: currentPrice + 2,
      valPrice: currentPrice - 2,
      totalVolume: 0,
      totalDelta: 0,
      totalBuyVolume: 0,
      totalSellVolume: 0,
      levels: [],
      hvnNodes: [],
      lvnNodes: [],
      summaryText: 'في انتظار بيانات التداول لحساب بروفايل الحجم...',
    };
  }

  // Filter bars according to range option
  let selectedBars: FootprintBar[] = [];
  switch (rangeOption) {
    case 'LAST_10':
      selectedBars = bars.slice(-10);
      break;
    case 'LAST_20':
      selectedBars = bars.slice(-20);
      break;
    case 'FIXED_VISIBLE':
      selectedBars = bars.slice(-15);
      break;
    case 'SESSION':
    default:
      selectedBars = [...bars];
      break;
  }

  if (selectedBars.length === 0) selectedBars = [...bars];

  // Map to collect volume by rounded price level
  const priceMap = new Map<
    number,
    { volume: number; bidVolume: number; askVolume: number; delta: number }
  >();

  let totalVolume = 0;
  let totalDelta = 0;
  let totalBuyVolume = 0;
  let totalSellVolume = 0;

  // Aggregate levels from footprint bars
  for (const bar of selectedBars) {
    if (bar.levels && bar.levels.length > 0) {
      for (const lvl of bar.levels) {
        // Quantize price to tickSize step
        const roundedPrice = Math.round(lvl.price / tickSize) * tickSize;
        const normalizedPrice = Number(roundedPrice.toFixed(2));

        const existing = priceMap.get(normalizedPrice) || {
          volume: 0,
          bidVolume: 0,
          askVolume: 0,
          delta: 0,
        };

        existing.volume += lvl.totalQty;
        existing.bidVolume += lvl.bidQty;
        existing.askVolume += lvl.askQty;
        existing.delta += lvl.delta;

        totalVolume += lvl.totalQty;
        totalDelta += lvl.delta;
        totalBuyVolume += lvl.askQty;
        totalSellVolume += lvl.bidQty;

        priceMap.set(normalizedPrice, existing);
      }
    } else {
      // Fallback if individual footprint levels aren't populated for this bar
      const barVol = bar.volume || 10;
      const roundedPrice = Math.round(bar.close / tickSize) * tickSize;
      const normalizedPrice = Number(roundedPrice.toFixed(2));

      const existing = priceMap.get(normalizedPrice) || {
        volume: 0,
        bidVolume: 0,
        askVolume: 0,
        delta: 0,
      };

      existing.volume += barVol;
      existing.bidVolume += barVol * 0.5;
      existing.askVolume += barVol * 0.5;
      priceMap.set(normalizedPrice, existing);
      totalVolume += barVol;
    }
  }

  // Convert to sorted array (high to low price for intuitive ladder display)
  const sortedPrices = Array.from(priceMap.keys()).sort((a, b) => b - a);

  if (sortedPrices.length === 0) {
    return {
      rangeType: rangeOption,
      pocPrice: currentPrice,
      pocVolume: 0,
      vahPrice: currentPrice + 2,
      valPrice: currentPrice - 2,
      totalVolume: 0,
      totalDelta: 0,
      totalBuyVolume: 0,
      totalSellVolume: 0,
      levels: [],
      hvnNodes: [],
      lvnNodes: [],
      summaryText: 'لا تتوفر مستويات كافية في هذا النطاق.',
    };
  }

  // Find POC (maximum volume price level)
  let pocPrice = sortedPrices[0];
  let pocVolume = 0;

  for (const price of sortedPrices) {
    const data = priceMap.get(price)!;
    if (data.volume > pocVolume) {
      pocVolume = data.volume;
      pocPrice = price;
    }
  }

  // Calculate Value Area (70% of total volume expanding outward from POC)
  const targetVaVolume = totalVolume * 0.70;
  let currentVaVolume = pocVolume;
  const inValueAreaSet = new Set<number>([pocPrice]);

  const pocIdx = sortedPrices.indexOf(pocPrice);
  let upIdx = pocIdx - 1; // higher prices
  let downIdx = pocIdx + 1; // lower prices

  while (currentVaVolume < targetVaVolume && (upIdx >= 0 || downIdx < sortedPrices.length)) {
    const upPrice = upIdx >= 0 ? sortedPrices[upIdx] : null;
    const downPrice = downIdx < sortedPrices.length ? sortedPrices[downIdx] : null;

    const upVol = upPrice !== null ? priceMap.get(upPrice)!.volume : -1;
    const downVol = downPrice !== null ? priceMap.get(downPrice)!.volume : -1;

    if (upVol >= downVol && upPrice !== null) {
      inValueAreaSet.add(upPrice);
      currentVaVolume += upVol;
      upIdx--;
    } else if (downPrice !== null) {
      inValueAreaSet.add(downPrice);
      currentVaVolume += downVol;
      downIdx++;
    } else if (upPrice !== null) {
      inValueAreaSet.add(upPrice);
      currentVaVolume += upVol;
      upIdx--;
    } else {
      break;
    }
  }

  // Find VAH and VAL
  const vaPrices = Array.from(inValueAreaSet).sort((a, b) => b - a);
  const vahPrice = vaPrices[0];
  const valPrice = vaPrices[vaPrices.length - 1];

  // Calculate moving average volume across neighbouring ticks to identify HVN peaks and LVN valleys
  const avgVolume = totalVolume / Math.max(1, sortedPrices.length);

  // Build final structured levels
  const levels: VolumeProfileLevel[] = sortedPrices.map((price, idx) => {
    const data = priceMap.get(price)!;
    const isPOC = price === pocPrice;
    const isVAH = price === vahPrice;
    const isVAL = price === valPrice;
    const isInValueArea = inValueAreaSet.has(price);
    const percentage = totalVolume > 0 ? (data.volume / totalVolume) * 100 : 0;

    // Detect Local Peak (HVN) vs Valley (LVN)
    const prevVol = idx > 0 ? priceMap.get(sortedPrices[idx - 1])!.volume : 0;
    const nextVol = idx < sortedPrices.length - 1 ? priceMap.get(sortedPrices[idx + 1])!.volume : 0;

    let nodeType: 'HVN' | 'LVN' | 'NORMAL' = 'NORMAL';
    if (data.volume >= avgVolume * 1.35 && data.volume >= prevVol && data.volume >= nextVol) {
      nodeType = 'HVN';
    } else if (data.volume <= avgVolume * 0.45 && data.volume <= prevVol && data.volume <= nextVol) {
      nodeType = 'LVN';
    }

    return {
      price,
      volume: Number(data.volume.toFixed(1)),
      bidVolume: Number(data.bidVolume.toFixed(1)),
      askVolume: Number(data.askVolume.toFixed(1)),
      delta: Number(data.delta.toFixed(1)),
      percentage: Number(percentage.toFixed(2)),
      isPOC,
      isVAH,
      isVAL,
      isInValueArea,
      nodeType,
    };
  });

  // Extract key High Volume Nodes (HVNs) for Support/Resistance
  const hvnNodes = levels
    .filter((l) => l.nodeType === 'HVN' || l.isPOC)
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 6);

  // Extract Low Volume Nodes (LVNs)
  const lvnNodes = levels
    .filter((l) => l.nodeType === 'LVN')
    .slice(0, 4);

  // Build strategic Arabic market insight text
  let summaryText = '';
  const priceVsPOC = currentPrice - pocPrice;
  if (currentPrice > vahPrice) {
    summaryText = `السعر يتداول فوق منطقة القيمة (VAH: $${vahPrice.toFixed(2)}). توازن شرائي قوي مع بحث عن أسعار أعلى ما لم يعاود الانكسار لداخل النطاق.`;
  } else if (currentPrice < valPrice) {
    summaryText = `السعر يتداول أسفل منطقة القيمة (VAL: $${valPrice.toFixed(2)}). ضغط بيعي ورفض للقيمة العادلة مع احتمالية استمرار الهبوط أو ارتداد فخ سيولة.`;
  } else if (Math.abs(priceVsPOC) <= 1.0) {
    summaryText = `السعر يتمركز مباشرة عند نقطة التحكم المؤسسية (POC: $${pocPrice.toFixed(2)}). منطقة توازن مثالية (Fair Value) تشهد صراعاً حاداً بين المشترين والبائعين.`;
  } else if (currentPrice > pocPrice) {
    summaryText = `السعر يتداول داخل منطقة القيمة أعلى POC. يعتبر الـ POC ($${pocPrice.toFixed(2)}) أقوى دعم مؤسسي مع احتمالية استهداف VAH ($${vahPrice.toFixed(2)}).`;
  } else {
    summaryText = `السعر يتداول داخل منطقة القيمة أسفل POC. يعتبر الـ POC ($${pocPrice.toFixed(2)}) أقوى مقاومة مؤسسية مع مراقبة دعم VAL ($${valPrice.toFixed(2)}).`;
  }

  return {
    rangeType: rangeOption,
    pocPrice,
    pocVolume: Number(pocVolume.toFixed(1)),
    vahPrice,
    valPrice,
    totalVolume: Number(totalVolume.toFixed(1)),
    totalDelta: Number(totalDelta.toFixed(1)),
    totalBuyVolume: Number(totalBuyVolume.toFixed(1)),
    totalSellVolume: Number(totalSellVolume.toFixed(1)),
    levels,
    hvnNodes,
    lvnNodes,
    summaryText,
  };
}
