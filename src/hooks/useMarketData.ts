// src/hooks/useMarketData.ts
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface PriceData {
  time: number;
  value: number;
}

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws';
const BINANCE_API_URL = 'https://api.binance.com/api/v3';
const UPDATE_INTERVAL = 2000; // Increased to 2 seconds for more stable updates
const PRICE_BUFFER_SIZE = 10; // Number of prices to keep for smoothing

export const useMarketData = (cryptoId: string | null) => {
  const [lineData, setLineData] = useState<PriceData[]>([]);
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const currentSymbol = useRef<string | null>(null);
  
  // Enhanced price buffer with moving average
  const priceBuffer = useRef<{
    prices: { price: number; volume: number }[];
    lastUpdate: number;
    movingAverage: number;
  }>({
    prices: [],
    lastUpdate: 0,
    movingAverage: 0
  });

  const getBinanceSymbol = (cryptoId: string) => {
    const symbolMap: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binancecoin': 'BNB',
      'cardano': 'ADA',
      'dogecoin': 'DOGE',
      'ripple': 'XRP',
      'polkadot': 'DOT',
      'solana': 'SOL'
    };
    const symbol = symbolMap[cryptoId] || cryptoId.toUpperCase();
    return symbol + 'USDT';
  };

  // Calculate Volume Weighted Average Price (VWAP)
  const calculateVWAP = (prices: { price: number; volume: number }[]) => {
    if (prices.length === 0) return 0;
    
    const totalVolume = prices.reduce((sum, item) => sum + item.volume, 0);
    if (totalVolume === 0) return prices[prices.length - 1].price;

    const vwap = prices.reduce((sum, item) => {
      return sum + (item.price * item.volume);
    }, 0) / totalVolume;

    return vwap;
  };

  // Exponential Moving Average
  const calculateEMA = (newPrice: number, prevEMA: number, smoothingFactor = 0.2) => {
    return (newPrice * smoothingFactor) + (prevEMA * (1 - smoothingFactor));
  };

  // Reset all state when switching cryptocurrencies
  const resetState = () => {
    setLineData([]);
    setCandlestickData([]);
    setCurrentPrice(null);
    priceBuffer.current = {
      prices: [],
      lastUpdate: 0,
      movingAverage: 0
    };
  };

  // Cleanup WebSocket connection
  const cleanupWebSocket = () => {
    if (ws.current) {
      if (ws.current.readyState === WebSocket.OPEN && currentSymbol.current) {
        // Unsubscribe from current streams
        ws.current.send(JSON.stringify({
          method: 'UNSUBSCRIBE',
          params: [
            `${currentSymbol.current}@kline_1m`,
            `${currentSymbol.current}@trade`
          ],
          id: 1
        }));
      }
      ws.current.close();
      ws.current = null;
    }
  };

  // Fetch historical data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!cryptoId) {
        resetState();
        return;
      }
      
      setIsLoading(true);
      resetState();
      
      try {
        const symbol = getBinanceSymbol(cryptoId);
        
        const klinesResponse = await axios.get(`${BINANCE_API_URL}/klines`, {
          params: {
            symbol,
            interval: '1m',
            limit: 60
          }
        });

        const processedCandlesticks = klinesResponse.data.map((kline: any) => ({
          time: Math.floor(kline[0] / 1000),
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4])
        }));

        const processedLineData = klinesResponse.data.map((kline: any) => ({
          time: Math.floor(kline[0] / 1000),
          value: parseFloat(kline[4])
        }));

        setCandlestickData(processedCandlesticks);
        setLineData(processedLineData);
        
        const lastPrice = processedCandlesticks[processedCandlesticks.length - 1].close;
        setCurrentPrice(lastPrice);
        
        // Initialize price buffer with the last known price
        priceBuffer.current = {
          prices: [{ price: lastPrice, volume: 1 }],
          lastUpdate: Math.floor(Date.now() / 1000),
          movingAverage: lastPrice
        };
        
      } catch (error) {
        console.error('Error fetching historical data:', error);
        resetState();
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();

    // Cleanup when unmounting or switching cryptocurrencies
    return () => {
      cleanupWebSocket();
    };
  }, [cryptoId]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!cryptoId) return;

    const symbol = getBinanceSymbol(cryptoId).toLowerCase();
    currentSymbol.current = symbol;
    
    const connectWebSocket = () => {
      // Clean up existing connection first
      cleanupWebSocket();

      ws.current = new WebSocket(BINANCE_WS_URL);

      ws.current.onopen = () => {
        if (ws.current) {
          ws.current.send(JSON.stringify({
            method: 'SUBSCRIBE',
            params: [
              `${symbol}@kline_1m`,
              `${symbol}@trade`
            ],
            id: 1
          }));
        }
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Ignore messages from previous subscriptions
        if (currentSymbol.current !== symbol) return;
        
        if (data.e === 'trade') {
          const price = parseFloat(data.p);
          const volume = parseFloat(data.q);

          priceBuffer.current.prices.push({ price, volume });
          if (priceBuffer.current.prices.length > PRICE_BUFFER_SIZE) {
            priceBuffer.current.prices.shift();
          }

          // Update moving average with new price
          const vwap = calculateVWAP(priceBuffer.current.prices);
          priceBuffer.current.movingAverage = calculateEMA(
            vwap,
            priceBuffer.current.movingAverage
          );
        }
        
        if (data.e === 'kline') {
          const kline = data.k;
          if (kline.x) { // If candle is closed
            const candleData: CandlestickData = {
              time: Math.floor(kline.t / 1000),
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              close: parseFloat(kline.c)
            };
            
            setCandlestickData(prev => {
              const newData = [...prev];
              const lastCandle = newData[newData.length - 1];
              
              if (lastCandle && lastCandle.time === candleData.time) {
                newData[newData.length - 1] = candleData;
              } else {
                newData.push(candleData);
                if (newData.length > 60) newData.shift();
              }
              
              return newData;
            });
          }
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        // Only attempt to reconnect if we haven't switched cryptocurrencies
        if (currentSymbol.current === symbol) {
          setTimeout(connectWebSocket, 5000);
        }
      };
    };

    connectWebSocket();

    // Set up price aggregation interval
    const aggregationInterval = setInterval(() => {
      if (priceBuffer.current.prices.length > 0 && currentSymbol.current === symbol) {
        const time = Math.floor(Date.now() / 1000);
        const smoothedPrice = priceBuffer.current.movingAverage;

        setCurrentPrice(smoothedPrice);
        
        setLineData(prev => {
          const newData = [...prev];
          const lastPoint = newData[newData.length - 1];
          
          if (lastPoint && time - lastPoint.time < 60) {
            // Update last point if within same minute
            newData[newData.length - 1] = { time: lastPoint.time, value: smoothedPrice };
          } else {
            // Add new point for new minute
            newData.push({ time, value: smoothedPrice });
            if (newData.length > 60) newData.shift();
          }
          
          return newData;
        });

        // Keep only recent prices for next calculation
        priceBuffer.current = {
          prices: [{ price: smoothedPrice, volume: 1 }],
          lastUpdate: time,
          movingAverage: smoothedPrice
        };
      }
    }, UPDATE_INTERVAL);

    return () => {
      clearInterval(aggregationInterval);
      cleanupWebSocket();
    };
  }, [cryptoId]);

  return {
    lineData,
    candlestickData,
    isLoading,
    currentPrice
  };
};

export default useMarketData;