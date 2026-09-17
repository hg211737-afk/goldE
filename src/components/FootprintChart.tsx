import React, { useRef, useEffect, useState } from 'react';
import { FootprintBar, LiquidityZone, TerminalSettings } from '../types';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';

interface FootprintChartProps {
  bars: FootprintBar[];
  currentPrice: number;
  liquidityZones: LiquidityZone[];
  settings: TerminalSettings;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

export const FootprintChart: React.FC<FootprintChartProps> = ({
  bars,
  currentPrice,
  liquidityZones,
  settings,
  isFullScreen = false,
  onToggleFullScreen,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hoveredBar, setHoveredBar] = useState<FootprintBar | null>(null);
  const [hoveredLevel, setHoveredLevel] = useState<{ price: number; bid: number; ask: number; delta: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Zoom & Pan state
  const [zoomX, setZoomX] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || bars.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Sub-panel heights: Main footprint (75%), CVD Delta subpanel (25%)
    const cvdHeight = 80;
    const chartHeight = height - cvdHeight;
    const priceAxisWidth = 70;
    const plotWidth = width - priceAxisWidth;

    ctx.clearRect(0, 0, width, height);

    // Background gradient
    ctx.fillStyle = '#0e121a';
    ctx.fillRect(0, 0, width, height);

    // Visible bars calculation
    const barWidth = Math.max(65, 85 * zoomX);
    const spacing = 12;
    const totalBarWidth = barWidth + spacing;

    // Auto-fit or pan
    const maxVisibleBars = Math.floor(plotWidth / totalBarWidth);
    const visibleBars = bars.slice(Math.max(0, bars.length - maxVisibleBars - Math.floor(panX / totalBarWidth)));

    if (visibleBars.length === 0) return;

    // Find min & max price across visible bars
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    visibleBars.forEach((b) => {
      if (b.low < minPrice) minPrice = b.low;
      if (b.high > maxPrice) maxPrice = b.high;
    });

    // Add padding to price scale
    const pricePadding = (maxPrice - minPrice) * 0.08 || 1.5;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    // Coordinate converters
    const priceToY = (price: number) => {
      return chartHeight - ((price - minPrice) / priceRange) * (chartHeight - 40) - 20;
    };
    const yToPrice = (y: number) => {
      return minPrice + ((chartHeight - 20 - y) / (chartHeight - 40)) * priceRange;
    };

    // 1. Draw Grid Lines
    ctx.strokeStyle = '#18202f';
    ctx.lineWidth = 1;

    // Horizontal price grid lines
    const stepSize = priceRange > 20 ? 5 : priceRange > 8 ? 2 : 1;
    const firstGridPrice = Math.ceil(minPrice / stepSize) * stepSize;
    for (let p = firstGridPrice; p <= maxPrice; p += stepSize) {
      const y = priceToY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(plotWidth, y);
      ctx.stroke();

      // Price label on right axis
      ctx.fillStyle = '#64748b';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`$${p.toFixed(2)}`, plotWidth + 6, y + 3.5);
    }

    // 2. Draw Liquidity Zones overlay (BSL / SSL / FVG)
    liquidityZones.forEach((zone) => {
      const yTop = priceToY(zone.priceTop);
      const yBottom = priceToY(zone.priceBottom);
      const zoneH = Math.max(4, Math.abs(yBottom - yTop));
      const startY = Math.min(yTop, yBottom);

      if (zone.type === 'BSL') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      } else if (zone.type === 'SSL') {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      } else {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      }

      ctx.fillRect(0, startY, plotWidth, zoneH);
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(0, startY, plotWidth, zoneH);
      ctx.setLineDash([]);

      // Zone label
      ctx.fillStyle = zone.type === 'BSL' ? '#f87171' : zone.type === 'SSL' ? '#34d399' : '#fbbf24';
      ctx.font = '10px "Cairo", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${zone.nameAr} ($${zone.priceBottom.toFixed(1)} - $${zone.priceTop.toFixed(1)})`, plotWidth - 10, startY + 12);
    });

    // 3. Draw Footprint Candles
    const startX = 20;

    visibleBars.forEach((bar, bIdx) => {
      const x = startX + bIdx * totalBarWidth;
      const isUp = bar.close >= bar.open;

      // Candle wick
      const yHigh = priceToY(bar.high);
      const yLow = priceToY(bar.low);
      ctx.strokeStyle = isUp ? 'rgba(52, 211, 153, 0.4)' : 'rgba(248, 113, 113, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + barWidth / 2, yHigh);
      ctx.lineTo(x + barWidth / 2, yLow);
      ctx.stroke();

      // Bar level footprint cells
      const numLevels = bar.levels.length;
      if (numLevels > 0) {
        const cellH = Math.max(14, (Math.abs(yLow - yHigh) / numLevels) || 16);

        bar.levels.forEach((lvl) => {
          const yLvl = priceToY(lvl.price);
          const cellY = yLvl - cellH / 2;
          const halfW = (barWidth - 4) / 2;

          // Background styling for cell
          // Left side: Bid (red tint if high or imbalance)
          if (lvl.isBidImbalance && settings.showImbalances) {
            ctx.fillStyle = 'rgba(225, 29, 72, 0.45)'; // Aggressive Sell Imbalance
          } else {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          }
          ctx.fillRect(x + 2, cellY, halfW, cellH - 1);

          // Right side: Ask (green tint if high or imbalance)
          if (lvl.isAskImbalance && settings.showImbalances) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.45)'; // Aggressive Buy Imbalance
          } else {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          }
          ctx.fillRect(x + 2 + halfW, cellY, halfW, cellH - 1);

          // POC outline box
          if (lvl.isPOC && settings.showPOC) {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x + 2, cellY, barWidth - 4, cellH - 1);
          } else {
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x + 2, cellY, barWidth - 4, cellH - 1);
          }

          // Center divider
          ctx.strokeStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(x + 2 + halfW, cellY);
          ctx.lineTo(x + 2 + halfW, cellY + cellH - 1);
          ctx.stroke();

          // Render text (Bid x Ask numbers)
          if (cellH >= 11 && barWidth >= 60) {
            ctx.font = '9px "JetBrains Mono", monospace';

            // Bid text (left)
            ctx.fillStyle = lvl.isBidImbalance ? '#fecdd3' : '#94a3b8';
            ctx.textAlign = 'right';
            ctx.fillText(lvl.bidQty >= 10 ? lvl.bidQty.toFixed(0) : lvl.bidQty.toFixed(1), x + halfW - 2, cellY + cellH / 2 + 3);

            // Ask text (right)
            ctx.fillStyle = lvl.isAskImbalance ? '#a7f3d0' : '#cbd5e1';
            ctx.textAlign = 'left';
            ctx.fillText(lvl.askQty >= 10 ? lvl.askQty.toFixed(0) : lvl.askQty.toFixed(1), x + halfW + 4, cellY + cellH / 2 + 3);
          }
        });
      }

      // Bar Delta summary box at the bottom of the main chart
      const deltaY = chartHeight - 34;
      const isDeltaPos = bar.delta >= 0;
      ctx.fillStyle = isDeltaPos ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(x + 2, deltaY, barWidth - 4, 30);
      ctx.strokeStyle = isDeltaPos ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, deltaY, barWidth - 4, 30);

      // Delta Value
      ctx.fillStyle = isDeltaPos ? '#34d399' : '#f87171';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${isDeltaPos ? '+' : ''}${bar.delta.toFixed(1)}`, x + barWidth / 2, deltaY + 13);

      // Volume & Time
      ctx.fillStyle = '#64748b';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`V: ${bar.volume.toFixed(0)}`, x + barWidth / 2, deltaY + 25);
    });

    // 4. Live Current Price Line
    const yCurrent = priceToY(currentPrice);
    if (yCurrent >= 0 && yCurrent <= chartHeight) {
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, yCurrent);
      ctx.lineTo(plotWidth, yCurrent);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price Tag on right axis
      ctx.fillStyle = '#eab308';
      ctx.fillRect(plotWidth, yCurrent - 10, priceAxisWidth, 20);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`$${currentPrice.toFixed(2)}`, plotWidth + 6, yCurrent + 4);
    }

    // 5. CVD (Cumulative Volume Delta) Sub-panel
    const cvdYStart = chartHeight;
    ctx.fillStyle = '#0a0d13';
    ctx.fillRect(0, cvdYStart, width, cvdHeight);

    // Border between main chart and CVD
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cvdYStart);
    ctx.lineTo(width, cvdYStart);
    ctx.stroke();

    // CVD Title
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Cairo", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('دلتا الحجم التراكمي (Cumulative Volume Delta - CVD)', 12, cvdYStart + 16);

    // Draw CVD line graph
    const cvdValues = visibleBars.map((b) => b.cumulativeDelta);
    const minCvd = Math.min(...cvdValues, 0);
    const maxCvd = Math.max(...cvdValues, 0);
    const cvdRange = (maxCvd - minCvd) || 1;

    const cvdToY = (val: number) => {
      return cvdYStart + cvdHeight - 12 - ((val - minCvd) / cvdRange) * (cvdHeight - 34);
    };

    // Zero Line in CVD
    const zeroY = cvdToY(0);
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(plotWidth, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Line Path
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    visibleBars.forEach((bar, bIdx) => {
      const cx = startX + bIdx * totalBarWidth + barWidth / 2;
      const cy = cvdToY(bar.cumulativeDelta);
      if (bIdx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // Fill under CVD
    ctx.lineTo(startX + (visibleBars.length - 1) * totalBarWidth + barWidth / 2, cvdYStart + cvdHeight);
    ctx.lineTo(startX + barWidth / 2, cvdYStart + cvdHeight);
    ctx.closePath();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.fill();

    // 6. Crosshair if mouse is moving inside
    if (mousePos && mousePos.x <= plotWidth && mousePos.y <= chartHeight) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, chartHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(plotWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floating price tooltip at cursor
      const cursorPrice = yToPrice(mousePos.y);
      ctx.fillStyle = '#334155';
      ctx.fillRect(plotWidth, mousePos.y - 9, priceAxisWidth, 18);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`$${cursorPrice.toFixed(2)}`, plotWidth + 6, mousePos.y + 4);
    }
  }, [bars, currentPrice, liquidityZones, settings, zoomX, panX, mousePos]);

  // Handle Mouse Move for Tooltip and Crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    if (isDragging) {
      const deltaX = x - dragStartX;
      setPanX((prev) => prev + deltaX);
      setDragStartX(x);
      return;
    }

    // Identify hovered bar
    const barWidth = Math.max(65, 85 * zoomX);
    const spacing = 12;
    const totalBarWidth = barWidth + spacing;
    const startX = 20;

    const plotWidth = rect.width - 70;
    const maxVisibleBars = Math.floor(plotWidth / totalBarWidth);
    const visibleBars = bars.slice(Math.max(0, bars.length - maxVisibleBars - Math.floor(panX / totalBarWidth)));

    const barIdx = Math.floor((x - startX) / totalBarWidth);
    if (barIdx >= 0 && barIdx < visibleBars.length) {
      const bar = visibleBars[barIdx];
      setHoveredBar(bar);
    } else {
      setHoveredBar(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) setDragStartX(e.clientX - rect.left);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0e121a] rounded-xl border border-slate-800/80 overflow-hidden select-none">
      {/* Top Legend Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-300 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 border border-emerald-400"></span>
            <span>اختلال شراء (Ask Imbalance)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80 border border-rose-400"></span>
            <span>اختلال بيع (Bid Imbalance)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm border-2 border-amber-400 bg-transparent"></span>
            <span>نقطة التحكم (POC)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>حجم التداول مقسم: طلب (Sell Market) x عرض (Buy Market)</span>
          </div>
        </div>

        {/* Zoom & Pan Controls */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg">
          <button
            onClick={() => setZoomX((z) => Math.min(2.5, z + 0.2))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
            title="تكبير أفقي"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomX((z) => Math.max(0.6, z - 0.2))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
            title="تصغير أفقي"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setZoomX(1);
              setPanX(0);
            }}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-all cursor-pointer"
            title="إعادة ضبط الشارت"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {onToggleFullScreen && (
            <>
              <span className="w-px h-3.5 bg-slate-700 mx-0.5" />
              <button
                onClick={onToggleFullScreen}
                className={`p-1 rounded transition-all cursor-pointer ${
                  isFullScreen
                    ? 'text-amber-400 bg-amber-500/20 hover:bg-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
                title={isFullScreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة لمساحة الشارت'}
              >
                {isFullScreen ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="relative flex-1 w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setMousePos(null);
            setHoveredBar(null);
            setIsDragging(false);
          }}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Hovered Bar Detailed Tooltip */}
        {hoveredBar && (
          <div className="absolute top-3 left-3 pointer-events-none bg-slate-900/95 border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs backdrop-blur-md z-20 font-['JetBrains_Mono']">
            <div className="text-amber-400 font-bold mb-1 border-b border-slate-800 pb-1 flex justify-between gap-4 font-['Cairo']">
              <span>تفاصيل شمعة الفوت برنت</span>
              <span className="font-mono text-slate-300">
                {new Date(hoveredBar.time).toLocaleTimeString('ar-EG')}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300">
              <div>افتتاح: <span className="text-white">${hoveredBar.open.toFixed(2)}</span></div>
              <div>إغلاق: <span className="text-white">${hoveredBar.close.toFixed(2)}</span></div>
              <div>أعلى: <span className="text-emerald-400">${hoveredBar.high.toFixed(2)}</span></div>
              <div>أدنى: <span className="text-rose-400">${hoveredBar.low.toFixed(2)}</span></div>
              <div>حجم الشمعة: <span className="text-amber-300">{hoveredBar.volume.toFixed(1)} Oz</span></div>
              <div>
                دلتا الشمعة:{' '}
                <span className={hoveredBar.delta >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {hoveredBar.delta >= 0 ? '+' : ''}{hoveredBar.delta.toFixed(1)}
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
