// src/components/LiveChart.tsx
import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';

interface ChartProps {
  data: any[];
  type: 'candlestick' | 'line';
  containerClassName?: string;
}

const LiveChart: React.FC<ChartProps> = ({ data, type, containerClassName = '' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const series = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance
    chart.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#9CA3AF',
      },
      grid: {
        vertLines: { color: 'rgba(55, 65, 81, 0.3)' },
        horzLines: { color: 'rgba(55, 65, 81, 0.3)' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
        borderColor: 'rgba(55, 65, 81, 0.5)',
        fixLeftEdge: true,
        fixRightEdge: true,
        rightOffset: 12,
        barSpacing: 5,
        minBarSpacing: 3,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        borderVisible: true,
        visible: true,
      },
      rightPriceScale: {
        borderColor: 'rgba(55, 65, 81, 0.5)',
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        borderVisible: true,
      },
      crosshair: {
        vertLine: {
          color: '#9CA3AF',
          width: 1,
          style: 2,
          visible: true,
          labelVisible: true,
        },
        horzLine: {
          color: '#9CA3AF',
          width: 1,
          style: 2,
          visible: true,
          labelVisible: true,
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
      },
    });

    // Create series based on type
    if (type === 'candlestick') {
      series.current = chart.current.addCandlestickSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
        borderVisible: false,
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });
    } else {
      series.current = chart.current.addAreaSeries({
        lineColor: '#0EA5E9',
        topColor: 'rgba(14, 165, 233, 0.3)',
        bottomColor: 'rgba(14, 165, 233, 0)',
        lineWidth: 2,
        priceLineVisible: true,
        lastValueVisible: true,
        crosshairMarkerVisible: true,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });
    }

    // Handle window resize
    const handleResize = () => {
      if (chartContainerRef.current && chart.current) {
        const width = chartContainerRef.current.clientWidth;
        chart.current.applyOptions({
          width: width,
          height: 400,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial resize
    handleResize();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart.current) {
        chart.current.remove();
      }
    };
  }, [type]); // Only recreate chart when type changes

  // Update data
  useEffect(() => {
    if (!series.current || !data || data.length === 0) return;

    try {
      // Update the series with new data
      if (type === 'candlestick') {
        series.current.setData(data);
      } else {
        series.current.setData(data);
      }

      // Update visible range to show latest data
      if (chart.current && data.length > 0) {
        const timeRange = {
          from: data[0].time,
          to: data[data.length - 1].time + 300, // Add 5 minutes to show some space on the right
        };
        
        chart.current.timeScale().setVisibleRange(timeRange);
        
        // Only fit content on initial load or type change
        if (data.length <= 60) {
          chart.current.timeScale().fitContent();
        }
      }
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }, [data, type]);

  return (
    <div className={`w-full h-[400px] ${containerClassName}`}>
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
};

export default LiveChart;