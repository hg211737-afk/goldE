import React, { useEffect, useRef, useState } from "react";
import { Info, RotateCcw, ZoomIn, ZoomOut, Layers } from "lucide-react";
import { AppSettings, FootprintBar, LiquidityZone, DualSmartLevel } from "../types";

interface FootprintChartProps {
  bars: FootprintBar[];
  currentPrice: number;
  liquidityZones: LiquidityZone[];
  settings: AppSettings;
  dualLevels?: {
    upperLevel: DualSmartLevel;
    lowerLevel: DualSmartLevel;
  };
}

export const FootprintChart: React.FC<FootprintChartProps> = ({
  bars,
  currentPrice,
  liquidityZones,
  settings,
  dualLevels,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [hoveredBar, setHoveredBar] = useState<FootprintBar | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bars.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const chartHeight = height - 80;
    const chartWidth = width - 70;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0e121a";
    ctx.fillRect(0, 0, width, height);

    const barWidth = Math.max(65, 85 * zoomScale);
    const colStep = barWidth + 12;
    const visibleCount = Math.floor(chartWidth / colStep);
    const visibleBars = bars.slice(Math.max(0, bars.length - visibleCount - Math.floor(panOffset / colStep)));

    if (visibleBars.length === 0) return;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    visibleBars.forEach((b) => {
      if (b.low < minPrice) minPrice = b.low;
      if (b.high > maxPrice) maxPrice = b.high;
    });

    const pad = (maxPrice - minPrice) * 0.08 || 1.5;
    minPrice -= pad;
    maxPrice += pad;
    const priceDiff = maxPrice - minPrice;

    const getY = (p: number) => chartHeight - ((p - minPrice) / priceDiff) * (chartHeight - 40) - 20;
    const getPriceFromY = (y: number) => minPrice + ((chartHeight - 20 - y) / (chartHeight - 40)) * priceDiff;

    // Grid lines
    ctx.strokeStyle = "#18202f";
    ctx.lineWidth = 1;
    const step = priceDiff > 20 ? 5 : priceDiff > 8 ? 2 : 1;
    const startGrid = Math.ceil(minPrice / step) * step;

    for (let p = startGrid; p <= maxPrice; p += step) {
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      ctx.fillStyle = "#64748b";
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(`$${p.toFixed(2)}`, chartWidth + 6, y + 3.5);
    }

    // Liquidity Zones
    liquidityZones.forEach((zone) => {
      const yTop = getY(zone.priceTop);
      const yBottom = getY(zone.priceBottom);
      const h = Math.max(4, Math.abs(yBottom - yTop));
      const yStart = Math.min(yTop, yBottom);

      if (zone.type === "BSL") {
        ctx.fillStyle = "rgba(239, 68, 68, 0.08)";
        ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
      } else if (zone.type === "SSL") {
        ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
        ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
      } else {
        ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
        ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
      }

      ctx.fillRect(0, yStart, chartWidth, h);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(0, yStart, chartWidth, h);
      ctx.setLineDash([]);

      ctx.fillStyle =
        zone.type === "BSL" ? "#f87171" : zone.type === "SSL" ? "#34d399" : "#fbbf24";
      ctx.font = '10px "Cairo", sans-serif';
      ctx.textAlign = "right";
      ctx.fillText(
        `${zone.nameAr} ($${zone.priceBottom.toFixed(1)} - $${zone.priceTop.toFixed(1)})`,
        chartWidth - 10,
        yStart + 12
      );
    });

    // Volume Profile (VP) calculation & rendering alongside Footprint
    const volumeProfileMap: { [priceKey: string]: { total: number; buy: number; sell: number } } = {};
    let maxProfileVol = 1;

    visibleBars.forEach((bar) => {
      bar.levels.forEach((lvl) => {
        const pKey = Math.round(lvl.price * 2) / 2; // bin to 0.5 step
        if (!volumeProfileMap[pKey]) {
          volumeProfileMap[pKey] = { total: 0, buy: 0, sell: 0 };
        }
        volumeProfileMap[pKey].total += lvl.totalQty;
        volumeProfileMap[pKey].buy += lvl.askQty;
        volumeProfileMap[pKey].sell += lvl.bidQty;
        if (volumeProfileMap[pKey].total > maxProfileVol) {
          maxProfileVol = volumeProfileMap[pKey].total;
        }
      });
    });

    const vpMaxWidth = 130;
    const vpStartX = chartWidth - vpMaxWidth - 15;

    // Render Volume Profile bars horizontally on the right side of chart
    Object.entries(volumeProfileMap).forEach(([pStr, data]) => {
      const p = parseFloat(pStr);
      if (p < minPrice || p > maxPrice) return;
      const y = getY(p);
      const barH = Math.max(3, (chartHeight / priceDiff) * 0.45);
      const wRatio = Math.min(1, data.total / maxProfileVol);
      const currentVpW = wRatio * vpMaxWidth;

      // Background profile bar
      ctx.fillStyle = "rgba(30, 41, 59, 0.45)";
      ctx.fillRect(vpStartX, y - barH / 2, vpMaxWidth, barH);

      // Buy vs Sell breakdown in profile bar
      const buyWidth = currentVpW * (data.buy / (data.total || 1));
      ctx.fillStyle = "rgba(16, 185, 129, 0.55)";
      ctx.fillRect(vpStartX, y - barH / 2, buyWidth, barH);

      ctx.fillStyle = "rgba(239, 68, 68, 0.55)";
      ctx.fillRect(vpStartX + buyWidth, y - barH / 2, currentVpW - buyWidth, barH);

      ctx.strokeStyle = "rgba(51, 65, 85, 0.5)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(vpStartX, y - barH / 2, currentVpW, barH);
    });

    // Footprint Candles
    visibleBars.forEach((bar, idx) => {
      const x = 20 + idx * colStep;
      const isBull = bar.close >= bar.open;
      const yHigh = getY(bar.high);
      const yLow = getY(bar.low);

      // Wick
      ctx.strokeStyle = isBull ? "rgba(52, 211, 153, 0.4)" : "rgba(248, 113, 113, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + barWidth / 2, yHigh);
      ctx.lineTo(x + barWidth / 2, yLow);
      ctx.stroke();

      const numLevels = bar.levels.length;
      if (numLevels > 0) {
        const rowH = Math.max(14, Math.abs(yLow - yHigh) / numLevels || 16);
        const halfW = (barWidth - 4) / 2;

        bar.levels.forEach((lvl) => {
          const yLvl = getY(lvl.price) - rowH / 2;

          // Bid side (left)
          if (lvl.isBidImbalance && settings.showImbalances) {
            ctx.fillStyle = "rgba(225, 29, 72, 0.45)";
          } else {
            ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
          }
          ctx.fillRect(x + 2, yLvl, halfW, rowH - 1);

          // Ask side (right)
          if (lvl.isAskImbalance && settings.showImbalances) {
            ctx.fillStyle = "rgba(16, 185, 129, 0.45)";
          } else {
            ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
          }
          ctx.fillRect(x + 2 + halfW, yLvl, halfW, rowH - 1);

          // POC border highlight
          if (lvl.isPOC && settings.showPOC) {
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, yLvl, barWidth - 4, rowH - 1);
          } else {
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x + 2, yLvl, barWidth - 4, rowH - 1);
          }

          // Center divider
          ctx.strokeStyle = "#334155";
          ctx.beginPath();
          ctx.moveTo(x + 2 + halfW, yLvl);
          ctx.lineTo(x + 2 + halfW, yLvl + rowH - 1);
          ctx.stroke();

          // Numbers inside cells
          if (rowH >= 11 && barWidth >= 60) {
            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.fillStyle = lvl.isBidImbalance ? "#fecdd3" : "#94a3b8";
            ctx.textAlign = "right";
            ctx.fillText(
              lvl.bidQty >= 10 ? lvl.bidQty.toFixed(0) : lvl.bidQty.toFixed(1),
              x + halfW - 2,
              yLvl + rowH / 2 + 3
            );

            ctx.fillStyle = lvl.isAskImbalance ? "#a7f3d0" : "#cbd5e1";
            ctx.textAlign = "left";
            ctx.fillText(
              lvl.askQty >= 10 ? lvl.askQty.toFixed(0) : lvl.askQty.toFixed(1),
              x + halfW + 4,
              yLvl + rowH / 2 + 3
            );
          }
        });
      }

      // Bottom delta / volume bar indicator
      const deltaY = chartHeight - 34;
      const isPosDelta = bar.delta >= 0;
      ctx.fillStyle = isPosDelta ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)";
      ctx.fillRect(x + 2, deltaY, barWidth - 4, 30);
      ctx.strokeStyle = isPosDelta ? "#10b981" : "#ef4444";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, deltaY, barWidth - 4, 30);

      ctx.fillStyle = isPosDelta ? "#34d399" : "#f87171";
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText(`${isPosDelta ? "+" : ""}${bar.delta.toFixed(1)}`, x + barWidth / 2, deltaY + 13);

      ctx.fillStyle = "#64748b";
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`V: ${bar.volume.toFixed(0)}`, x + barWidth / 2, deltaY + 25);
    });

    // Render Flexible Dual Smart Levels (Upper Buy & Lower Sell)
    if (dualLevels) {
      // Upper Smart Level (Above Price)
      const upperY = getY(dualLevels.upperLevel.levelPrice);
      if (upperY >= 0 && upperY <= chartHeight) {
        ctx.strokeStyle = "rgba(244, 63, 94, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(0, upperY);
        ctx.lineTo(chartWidth, upperY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label on chart
        ctx.fillStyle = "rgba(244, 63, 94, 0.2)";
        ctx.fillRect(8, upperY - 14, 180, 14);
        ctx.fillStyle = "#fecdd3";
        ctx.font = 'bold 9px "Cairo", sans-serif';
        ctx.textAlign = "left";
        ctx.fillText(`▲ المستوى الشرائي: اختراق = شراء | ارتداد = بيع`, 12, upperY - 3);

        // Price tag on scale
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(chartWidth, upperY - 9, 70, 18);
        ctx.fillStyle = "#ffffff";
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillText(`$${dualLevels.upperLevel.levelPrice.toFixed(2)}`, chartWidth + 6, upperY + 4);
      }

      // Lower Smart Level (Below Price)
      const lowerY = getY(dualLevels.lowerLevel.levelPrice);
      if (lowerY >= 0 && lowerY <= chartHeight) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(0, lowerY);
        ctx.lineTo(chartWidth, lowerY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label on chart
        ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
        ctx.fillRect(8, lowerY + 1, 180, 14);
        ctx.fillStyle = "#bae6fd";
        ctx.font = 'bold 9px "Cairo", sans-serif';
        ctx.textAlign = "left";
        ctx.fillText(`▼ المستوى البيعي: كسر = بيع | ارتداد = شراء`, 12, lowerY + 12);

        // Price tag on scale
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(chartWidth, lowerY - 9, 70, 18);
        ctx.fillStyle = "#ffffff";
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillText(`$${dualLevels.lowerLevel.levelPrice.toFixed(2)}`, chartWidth + 6, lowerY + 4);
      }
    }

    // Current Price Line
    const curY = getY(currentPrice);
    if (curY >= 0 && curY <= chartHeight) {
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, curY);
      ctx.lineTo(chartWidth, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#eab308";
      ctx.fillRect(chartWidth, curY - 10, 70, 20);
      ctx.fillStyle = "#0f172a";
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(`$${currentPrice.toFixed(2)}`, chartWidth + 6, curY + 4);
    }

    // Cumulative Delta (CVD) pane at bottom
    const cvdTop = chartHeight;
    ctx.fillStyle = "#0a0d13";
    ctx.fillRect(0, cvdTop, width, 80);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cvdTop);
    ctx.lineTo(width, cvdTop);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = '10px "Cairo", sans-serif';
    ctx.textAlign = "left";
    ctx.fillText("دلتا الحجم التراكمي (Cumulative Volume Delta - CVD)", 12, cvdTop + 16);

    const cvdVals = visibleBars.map((b) => b.cumulativeDelta);
    const minCvd = Math.min(...cvdVals, 0);
    const maxCvd = Math.max(...cvdVals, 0);
    const cvdRange = maxCvd - minCvd || 1;
    const getCvdY = (v: number) => cvdTop + 80 - 12 - ((v - minCvd) / cvdRange) * 46;

    // Zero baseline
    const zeroY = getCvdY(0);
    ctx.strokeStyle = "#334155";
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(chartWidth, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Line
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    visibleBars.forEach((bar, idx) => {
      const px = 20 + idx * colStep + barWidth / 2;
      const py = getCvdY(bar.cumulativeDelta);
      if (idx === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    });
    ctx.stroke();

    // Area fill
    ctx.lineTo(20 + (visibleBars.length - 1) * colStep + barWidth / 2, cvdTop + 80);
    ctx.lineTo(20 + barWidth / 2, cvdTop + 80);
    ctx.closePath();
    ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
    ctx.fill();

    // Crosshair cursor
    if (mousePos && mousePos.x <= chartWidth && mousePos.y <= chartHeight) {
      ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, chartHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const hoveredPrice = getPriceFromY(mousePos.y);
      ctx.fillStyle = "#334155";
      ctx.fillRect(chartWidth, mousePos.y - 9, 70, 18);
      ctx.fillStyle = "#f8fafc";
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(`$${hoveredPrice.toFixed(2)}`, chartWidth + 6, mousePos.y + 4);
    }
  }, [bars, currentPrice, liquidityZones, settings, zoomScale, panOffset, mousePos]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0e121a] rounded-xl border border-slate-800/80 overflow-hidden select-none">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-300 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 border border-emerald-400" />
            <span>اختلال شراء (Ask Imbalance)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80 border border-rose-400" />
            <span>اختلال بيع (Bid Imbalance)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm border-2 border-amber-400 bg-transparent" />
            <span>نقطة التحكم (POC)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>حجم التداول مقسم: طلب (Sell Market) x عرض (Buy Market)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg">
          <button
            onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.2))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
            title="تكبير أفقي"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.2))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
            title="تصغير أفقي"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoomScale(1);
              setPanOffset(0);
            }}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
            title="إعادة ضبط الشارت"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div ref={containerRef} className="relative flex-1 w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseMove={(e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const r = canvas.getBoundingClientRect();
            const clientX = e.clientX - r.left;
            const clientY = e.clientY - r.top;
            setMousePos({ x: clientX, y: clientY });

            if (isDragging) {
              const diff = clientX - dragStartX;
              setPanOffset((prev) => prev + diff);
              setDragStartX(clientX);
              return;
            }

            const step = Math.max(65, 85 * zoomScale) + 12;
            const chartW = r.width - 70;
            const visCount = Math.floor(chartW / step);
            const visBars = bars.slice(Math.max(0, bars.length - visCount - Math.floor(panOffset / step)));
            const barIndex = Math.floor((clientX - 20) / step);

            if (barIndex >= 0 && barIndex < visBars.length) {
              setHoveredBar(visBars[barIndex]);
            } else {
              setHoveredBar(null);
            }
          }}
          onMouseDown={(e) => {
            setIsDragging(true);
            const r = canvasRef.current?.getBoundingClientRect();
            if (r) setDragStartX(e.clientX - r.left);
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => {
            setMousePos(null);
            setHoveredBar(null);
            setIsDragging(false);
          }}
          className="w-full h-full cursor-crosshair block"
        />

        {hoveredBar && (
          <div className="absolute top-3 left-3 pointer-events-none bg-slate-900/95 border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs backdrop-blur-md z-20 font-['JetBrains_Mono']">
            <div className="text-amber-400 font-bold mb-1 border-b border-slate-800 pb-1 flex justify-between gap-4 font-['Cairo']">
              <span>تفاصيل شمعة الفوت برنت</span>
              <span className="font-mono text-slate-300">
                {new Date(hoveredBar.time).toLocaleTimeString("ar-EG")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
              <div>
                افتتاح: <span className="text-white">${hoveredBar.open.toFixed(2)}</span>
              </div>
              <div>
                إغلاق: <span className="text-white">${hoveredBar.close.toFixed(2)}</span>
              </div>
              <div>
                أعلى: <span className="text-emerald-400">${hoveredBar.high.toFixed(2)}</span>
              </div>
              <div>
                أدنى: <span className="text-rose-400">${hoveredBar.low.toFixed(2)}</span>
              </div>
              <div>
                حجم الشمعة: <span className="text-amber-300">{hoveredBar.volume.toFixed(1)} Oz</span>
              </div>
              <div>
                دلتا الشمعة:{" "}
                <span
                  className={
                    hoveredBar.delta >= 0 ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"
                  }
                >
                  {hoveredBar.delta >= 0 ? "+" : ""}
                  {hoveredBar.delta.toFixed(1)}
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-800/80 text-[11px] text-sky-400">
                POC (أعلى حجم): ${hoveredBar.pocPrice.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
