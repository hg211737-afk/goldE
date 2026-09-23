import React, { useEffect, useRef, useState } from "react";
import {
  Info,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  ArrowUp,
  ArrowDown,
  Crosshair,
  Maximize2,
  Minimize2,
  Move,
} from "lucide-react";
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
  const [verticalZoom, setVerticalZoom] = useState<number>(1);
  const [verticalPan, setVerticalPan] = useState<number>(0);
  const [isHeightExpanded, setIsHeightExpanded] = useState<boolean>(false);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartY, setDragStartY] = useState<number>(0);

  // Auto-center on current price
  const handleCenterOnPrice = () => {
    setVerticalPan(0);
    setPanOffset(0);
    setVerticalZoom(1);
    setZoomScale(1);
  };

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
    const priceDiff = Math.max(0.5, maxPrice - minPrice);

    // Enhanced Price Y scaling with vertical pan and zoom
    const effectiveHeight = Math.max(100, (chartHeight - 40) * verticalZoom);
    const getY = (p: number) =>
      chartHeight - 20 - ((p - minPrice) / priceDiff) * effectiveHeight + verticalPan;
    const getPriceFromY = (y: number) =>
      minPrice + ((chartHeight - 20 + verticalPan - y) / effectiveHeight) * priceDiff;

    // Grid lines
    ctx.strokeStyle = "#18202f";
    ctx.lineWidth = 1;
    const step = priceDiff > 20 ? 5 : priceDiff > 8 ? 2 : 1;
    const startGrid = Math.ceil(minPrice / step) * step;

    for (let p = startGrid; p <= maxPrice; p += step) {
      const y = getY(p);
      if (y < -30 || y > chartHeight + 30) continue;

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
        chartWidth - 8,
        yStart + 12
      );
    });

    // Volume Profile (VP)
    const volumeProfileMap: { [priceKey: string]: { total: number; buy: number; sell: number } } = {};
    let maxProfileVol = 1;

    visibleBars.forEach((bar) => {
      bar.levels.forEach((lvl) => {
        const pKey = Math.round(lvl.price * 2) / 2;
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

    const vpMaxWidth = 110;
    const vpStartX = chartWidth - vpMaxWidth - 15;

    Object.entries(volumeProfileMap).forEach(([pStr, data]) => {
      const p = parseFloat(pStr);
      if (p < minPrice || p > maxPrice) return;
      const y = getY(p);
      if (y < -20 || y > chartHeight + 20) return;

      const barH = Math.max(3, (effectiveHeight / priceDiff) * 0.45);
      const wRatio = Math.min(1, data.total / maxProfileVol);
      const currentVpW = wRatio * vpMaxWidth;

      ctx.fillStyle = "rgba(30, 41, 59, 0.45)";
      ctx.fillRect(vpStartX, y - barH / 2, vpMaxWidth, barH);

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
        const rowH = Math.max(14, (Math.abs(yLow - yHigh) / numLevels) * verticalZoom || 16);
        const halfW = (barWidth - 4) / 2;

        bar.levels.forEach((lvl) => {
          const yLvl = getY(lvl.price) - rowH / 2;
          if (yLvl < -30 || yLvl > chartHeight + 30) return;

          // Bid side (left)
          if (lvl.isBidImbalance && settings.showImbalances) {
            ctx.fillStyle = "rgba(225, 29, 72, 0.45)";
          } else {
            ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          }
          ctx.fillRect(x + 2, yLvl, halfW, rowH - 1);

          // Ask side (right)
          if (lvl.isAskImbalance && settings.showImbalances) {
            ctx.fillStyle = "rgba(16, 185, 129, 0.45)";
          } else {
            ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          }
          ctx.fillRect(x + 2 + halfW, yLvl, halfW, rowH - 1);

          // POC border highlight
          if (lvl.isPOC && settings.showPOC) {
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 1, yLvl - 0.5, barWidth - 2, rowH);
          }

          // Bid volume text
          ctx.fillStyle = lvl.isBidImbalance ? "#fecdd3" : "#94a3b8";
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = "right";
          ctx.fillText(lvl.bidQty.toFixed(1), x + halfW - 2, yLvl + rowH / 2 + 3);

          // Ask volume text
          ctx.fillStyle = lvl.isAskImbalance ? "#a7f3d0" : "#94a3b8";
          ctx.textAlign = "left";
          ctx.fillText(lvl.askQty.toFixed(1), x + halfW + 4, yLvl + rowH / 2 + 3);
        });
      }

      // Candle Delta & Volume Footer
      const footerY = chartHeight + 16;
      ctx.fillStyle = bar.delta >= 0 ? "#34d399" : "#f87171";
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = "center";
      ctx.fillText(
        `${bar.delta >= 0 ? "+" : ""}${bar.delta.toFixed(0)}`,
        x + barWidth / 2,
        footerY
      );

      ctx.fillStyle = "#64748b";
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`${bar.volume.toFixed(0)}`, x + barWidth / 2, footerY + 14);

      // Time
      const date = new Date(bar.time);
      const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      ctx.fillText(timeStr, x + barWidth / 2, footerY + 28);
    });

    // Current Price Line
    const curY = getY(currentPrice);
    if (curY >= 0 && curY <= chartHeight) {
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(0, curY);
      ctx.lineTo(chartWidth, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price Tag on Right
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(chartWidth + 2, curY - 9, 65, 18);
      ctx.fillStyle = "#020617";
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(`$${currentPrice.toFixed(2)}`, chartWidth + 5, curY + 4);
    }

    // Crosshair inspection
    if (mousePos && mousePos.x < chartWidth && mousePos.y < chartHeight) {
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, chartHeight);
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      const hoveredPrice = getPriceFromY(mousePos.y);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(chartWidth + 2, mousePos.y - 9, 65, 18);
      ctx.fillStyle = "#f8fafc";
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = "left";
      ctx.fillText(`$${hoveredPrice.toFixed(2)}`, chartWidth + 6, mousePos.y + 4);
    }
  }, [
    bars,
    currentPrice,
    liquidityZones,
    settings,
    zoomScale,
    panOffset,
    verticalZoom,
    verticalPan,
    mousePos,
  ]);

  return (
    <div
      className={`relative w-full flex flex-col bg-[#0e121a] rounded-xl border border-slate-800/80 overflow-hidden select-none transition-all duration-300 ${
        isHeightExpanded ? "h-[640px] sm:h-[720px]" : "h-full min-h-[460px] sm:min-h-[500px]"
      }`}
    >
      {/* Chart Top Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300 flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 border border-emerald-400" />
            <span className="text-[11px]">اختلال شراء</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80 border border-rose-400" />
            <span className="text-[11px]">اختلال بيع</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm border-2 border-amber-400 bg-transparent" />
            <span className="text-[11px]">POC</span>
          </div>
        </div>

        {/* Zoom, Pan & Height Controls (Enables scrolling down and clear footprint viewing) */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg flex-wrap">
          {/* Vertical Pan (Scroll Down & Up through Footprint Levels) */}
          <button
            onClick={() => setVerticalPan((p) => p - 40)}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer flex items-center gap-0.5 text-[10px]"
            title="تحريك الشارت للأسفل لرؤية المستويات السفلية"
          >
            <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">للأسفل</span>
          </button>
          <button
            onClick={() => setVerticalPan((p) => p + 40)}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer flex items-center gap-0.5 text-[10px]"
            title="تحريك الشارت للأعلى لرؤية المستويات العلوية"
          >
            <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">للأعلى</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {/* Vertical Zoom (Stretches Candle Rows for Big Readable Numbers) */}
          <button
            onClick={() => setVerticalZoom((z) => Math.min(3.0, z + 0.25))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
            title="تمديد وتكبير ارتفاع شمعات الفوت برنت رأسياً"
          >
            <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
          </button>
          <button
            onClick={() => setVerticalZoom((z) => Math.max(0.6, z - 0.25))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
            title="تصغير الارتفاع الرأسي للشمعات"
          >
            <ZoomOut className="w-3.5 h-3.5 text-rose-400" />
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {/* Auto Center on Price */}
          <button
            onClick={handleCenterOnPrice}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer flex items-center gap-1 text-[10px]"
            title="تركيز الشارت فوراً على السعر الحالي ونقطة التحكم"
          >
            <Crosshair className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">تركيز</span>
          </button>

          {/* Expand Height Toggle for mobile / full visibility */}
          <button
            onClick={() => setIsHeightExpanded(!isHeightExpanded)}
            className={`p-1 rounded transition-all cursor-pointer flex items-center gap-1 text-[10px] ${
              isHeightExpanded
                ? "bg-amber-500 text-slate-950 font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
            title="توسيع ارتفاع الشارت لرؤية الشمعات بوضوح كامل"
          >
            {isHeightExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isHeightExpanded ? "تصغير الحجم" : "توسيع الشارت"}
            </span>
          </button>

          {/* Full Reset */}
          <button
            onClick={handleCenterOnPrice}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
            title="إعادة ضبط القياس"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area with Full Mouse + Touch Drag Support */}
      <div ref={containerRef} className="relative flex-1 w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ touchAction: "none" }}
          // Mouse events for desktop
          onMouseMove={(e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const r = canvas.getBoundingClientRect();
            const clientX = e.clientX - r.left;
            const clientY = e.clientY - r.top;
            setMousePos({ x: clientX, y: clientY });

            if (isDragging) {
              const diffX = clientX - dragStartX;
              const diffY = clientY - dragStartY;
              setPanOffset((prev) => prev + diffX);
              setVerticalPan((prev) => prev + diffY);
              setDragStartX(clientX);
              setDragStartY(clientY);
              return;
            }

            const step = Math.max(65, 85 * zoomScale) + 12;
            const chartW = r.width - 70;
            const visCount = Math.floor(chartW / step);
            const visBars = bars.slice(
              Math.max(0, bars.length - visCount - Math.floor(panOffset / step))
            );
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
            if (r) {
              setDragStartX(e.clientX - r.left);
              setDragStartY(e.clientY - r.top);
            }
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => {
            setMousePos(null);
            setHoveredBar(null);
            setIsDragging(false);
          }}
          // Touch events for mobile phones & tablets (enables scrolling & dragging down)
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              const t = e.touches[0];
              const r = canvasRef.current?.getBoundingClientRect();
              if (r) {
                setIsDragging(true);
                setDragStartX(t.clientX - r.left);
                setDragStartY(t.clientY - r.top);
              }
            }
          }}
          onTouchMove={(e) => {
            if (isDragging && e.touches.length === 1) {
              const t = e.touches[0];
              const r = canvasRef.current?.getBoundingClientRect();
              if (r) {
                const clientX = t.clientX - r.left;
                const clientY = t.clientY - r.top;
                const diffX = clientX - dragStartX;
                const diffY = clientY - dragStartY;
                setPanOffset((prev) => prev + diffX);
                setVerticalPan((prev) => prev + diffY);
                setDragStartX(clientX);
                setDragStartY(clientY);
              }
            }
          }}
          onTouchEnd={() => setIsDragging(false)}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Hovered Candle Details Inspection Card */}
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
