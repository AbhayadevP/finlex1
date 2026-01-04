// src/pages/Dashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Activity,
  Zap,
  History,
  Repeat,
  CreditCard,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { formatEther, BrowserProvider } from "ethers";
import LiveChart from "../components/LiveChart";
import WalletPortfolio from "../components/WalletPortfolio";
import useMarketData from "../hooks/useMarketData";

interface Cryptocurrency {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
}

interface Transaction {
  hash: string;
  timestamp: number;
  value: string;
  from: string;
  to: string;
}

interface SimulatedTrade {
  id: string;
  type: "buy" | "sell";
  crypto: string;
  amount: number;
  price: number;
  timestamp: number;
  quantity: number;
}

interface Portfolio {
  [key: string]: {
    quantity: number;
    averagePrice: number;
  };
}

// use backend base URL instead of direct Coingecko
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const DEMO_BALANCE = 100000; // $100,000 demo money

const Dashboard: React.FC = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [demoBalance, setDemoBalance] = useState(DEMO_BALANCE);
  const [simulatedTrades, setSimulatedTrades] = useState<SimulatedTrade[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({});
  const [tradeAmount, setTradeAmount] = useState<string>("");
  const [tradeQuantity, setTradeQuantity] = useState<string>("");
  const [tradeType, setTradeType] = useState<"amount" | "quantity">("amount");
  const [chartType, setChartType] = useState<"line" | "candlestick">("line");
  const [showWalletPortfolio, setShowWalletPortfolio] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const {
    lineData,
    candlestickData,
    isLoading: isMarketDataLoading,
    currentPrice,
  } = useMarketData(selectedCrypto);

  // get list of cryptocurrencies from backend
  const { data: cryptocurrencies, isLoading } = useQuery({
    queryKey: ["cryptocurrencies"],
    queryFn: async () => {
      const response = await axios.get<Cryptocurrency[]>(
        `${API_BASE_URL}/api/cryptocurrencies`
      );
      return response.data;
    },
    refetchInterval: 10000,
  });

  // load saved trades from backend
  useEffect(() => {
    axios
      .get<SimulatedTrade[]>(`${API_BASE_URL}/api/simulated-trades`)
      .then((res) => setSimulatedTrades(res.data))
      .catch((err) => console.error("Failed to load trades", err));
  }, []);

  // load saved portfolio from backend
  useEffect(() => {
    axios
      .get<Portfolio>(`${API_BASE_URL}/api/portfolio`)
      .then((res) => setPortfolio(res.data || {}))
      .catch((err) => console.error("Failed to load portfolio", err));
  }, []);

  // Calculate total P/L for the selected crypto
  const calculateProfitLoss = useCallback(
    (crypto: Cryptocurrency) => {
      const holding = portfolio[crypto.id];
      if (!holding || holding.quantity === 0) return null;

      const priceToUse = currentPrice || crypto.current_price;
      const currentValue = holding.quantity * priceToUse;
      const investedValue = holding.quantity * holding.averagePrice;
      const profitLoss = currentValue - investedValue;
      const profitLossPercentage = (profitLoss / investedValue) * 100;

      return {
        amount: profitLoss,
        percentage: profitLossPercentage,
      };
    },
    [portfolio, currentPrice]
  );

  // wallet details via MetaMask
  useEffect(() => {
    const getWalletDetails = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts[0]) {
          setWalletAddress(accounts[0]);
          const balance = await provider.getBalance(accounts[0]);
          setWalletBalance(formatEther(balance));
        }
      }
    };

    getWalletDetails();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const rotateX = useTransform(mouseY, [0, window.innerHeight], [5, -5]);
  const rotateY = useTransform(mouseX, [0, window.innerWidth], [-5, 5]);

  const handleSimulatedTrade = (type: "buy" | "sell") => {
    const selectedCryptoData = cryptocurrencies?.find(
      (c) => c.id === selectedCrypto
    );
    if (!selectedCryptoData || !currentPrice) return;

    let quantity: number;
    let amount: number;

    if (tradeType === "amount") {
      amount = parseFloat(tradeAmount);
      quantity = amount / currentPrice;
    } else {
      quantity = parseFloat(tradeQuantity);
      amount = quantity * currentPrice;
    }

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (type === "buy" && amount > demoBalance) {
      alert("Insufficient demo balance");
      return;
    }

    if (type === "sell") {
      const currentHolding =
        portfolio[selectedCryptoData.id]?.quantity || 0;
      if (quantity > currentHolding) {
        alert("Insufficient crypto balance");
        return;
      }
    }

    const newTrade: SimulatedTrade = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      crypto: selectedCryptoData.symbol,
      amount,
      price: currentPrice,
      timestamp: Date.now(),
      quantity,
    };

    // local state update
    setSimulatedTrades((prev) => [newTrade, ...prev]);

    // persist to backend
    axios
      .post(`${API_BASE_URL}/api/simulated-trades`, newTrade)
      .catch((err) => console.error("Failed to save trade", err));

    setDemoBalance((prev) => (type === "buy" ? prev - amount : prev + amount));

    // Update portfolio and persist
    setPortfolio((prev) => {
      const current =
        prev[selectedCryptoData.id] || { quantity: 0, averagePrice: 0 };

      let nextForId;
      if (type === "buy") {
        const totalQuantity = current.quantity + quantity;
        const totalCost =
          current.quantity * current.averagePrice + amount;
        nextForId = {
          quantity: totalQuantity,
          averagePrice: totalCost / totalQuantity,
        };
      } else {
        const remainingQuantity = current.quantity - quantity;
        nextForId = {
          quantity: remainingQuantity,
          averagePrice:
            remainingQuantity > 0 ? current.averagePrice : 0,
        };
      }

      const next: Portfolio = {
        ...prev,
        [selectedCryptoData.id]: nextForId,
      };

      axios
        .put(`${API_BASE_URL}/api/portfolio`, next)
        .catch((err) => console.error("Failed to save portfolio", err));

      return next;
    });

    // Reset input fields
    setTradeAmount("");
    setTradeQuantity("");
  };

  const handleCryptoSelect = (cryptoId: string) => {
    setSelectedCrypto(cryptoId);
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((id) => id !== cryptoId);
      return [cryptoId, ...filtered].slice(0, 5);
    });
  };

  const selectedCryptoData = cryptocurrencies?.find(
    (c) => c.id === selectedCrypto
  );
  const currentHolding = selectedCryptoData
    ? portfolio[selectedCryptoData.id]?.quantity || 0
    : 0;

  return (
    <div
      className="min-h-screen bg-black text-white overflow-hidden pt-16"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Wallet Info Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowWalletPortfolio(!showWalletPortfolio)}
          >
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-400" />
              Wallet Details
            </h3>
            <p className="text-sm text-gray-400 mb-1">
              Address:{" "}
              {walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(
                    -4
                  )}`
                : "Not Connected"}
            </p>
            <p className="text-lg font-bold">
              {Number(walletBalance).toFixed(4)} ETH
            </p>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-400" />
              Demo Balance
            </h3>
            <p className="text-sm text-gray-400 mb-1">
              Available for Trading
            </p>
            <p className="text-lg font-bold">
              ${demoBalance.toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <History className="h-5 w-5 text-purple-400" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              {simulatedTrades.slice(0, 3).map((trade) => (
                <div
                  key={trade.id}
                  className="text-sm flex items-center justify-between"
                >
                  <span
                    className={
                      trade.type === "buy"
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {trade.type === "buy" ? "Bought" : "Sold"}{" "}
                    {trade.crypto.toUpperCase()}
                  </span>
                  <span>${trade.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Wallet Portfolio Modal */}
        <AnimatePresence>
          {showWalletPortfolio && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowWalletPortfolio(false)}
              />
              <motion.div
                className="relative w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <WalletPortfolio
                  walletAddress={walletAddress}
                  walletBalance={walletBalance}
                />
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  onClick={() => setShowWalletPortfolio(false)}
                >
                  ✕
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Crypto List */}
        <motion.div
          className="mb-8 bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg overflow-x-auto border border-gray-700"
          style={{
            rotateX,
            rotateY,
            transformPerspective: 1000,
          }}
        >
          <div className="flex space-x-2">
            {isLoading ? (
              Array(10)
                .fill(null)
                .map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-10 w-32 bg-gray-700/50 rounded"
                    animate={{
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))
            ) : (
              cryptocurrencies?.map((crypto) => (
                <motion.button
                  key={crypto.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap backdrop-blur-sm ${
                    selectedCrypto === crypto.id
                      ? "bg-blue-500/80 shadow-lg shadow-blue-500/20"
                      : "bg-gray-700/50 hover:bg-gray-600/50"
                  }`}
                  onClick={() => handleCryptoSelect(crypto.id)}
                >
                  <span>{crypto.symbol.toUpperCase()}</span>
                  <motion.span
                    className={
                      crypto.price_change_percentage_24h >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }
                    animate={{
                      opacity: [0.5, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    {crypto.price_change_percentage_24h.toFixed(2)}%
                  </motion.span>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>

        {/* Trading Interface */}
        <AnimatePresence mode="wait">
          {selectedCrypto && selectedCryptoData && (
            <motion.div
              key={selectedCrypto}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-3 bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-400" />
                      {selectedCryptoData.name} (
                      {selectedCryptoData.symbol.toUpperCase()})
                    </h2>
                    <p className="text-gray-400 mt-1">
                      Current Price: $
                      {(
                        currentPrice || selectedCryptoData.current_price
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      Your Holdings
                    </p>
                    <p className="text-lg font-semibold">
                      {currentHolding.toFixed(4)}{" "}
                      {selectedCryptoData.symbol.toUpperCase()}
                    </p>
                    {currentHolding > 0 && (
                      <div className="mt-1">
                        {(() => {
                          const pl =
                            calculateProfitLoss(selectedCryptoData);
                          if (!pl) return null;
                          const isPositive = pl.amount >= 0;
                          return (
                            <p
                              className={`text-sm ${
                                isPositive
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {isPositive ? "+" : ""}
                              {pl.amount.toFixed(2)} USD (
                              {isPositive ? "+" : ""}
                              {pl.percentage.toFixed(2)}%)
                            </p>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4 flex justify-between items-center">
                  <div className="flex gap-4">
                    <button
                      className={`px-4 py-2 rounded-lg ${
                        chartType === "line"
                          ? "bg-blue-500"
                          : "bg-gray-700"
                      }`}
                      onClick={() => setChartType("line")}
                    >
                      Line Chart
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg ${
                        chartType === "candlestick"
                          ? "bg-blue-500"
                          : "bg-gray-700"
                      }`}
                      onClick={() => setChartType("candlestick")}
                    >
                      Candlestick
                    </button>
                  </div>
                  <div className="text-sm text-gray-400">
                    Updates every 10 seconds
                  </div>
                </div>

                <div className="h-[400px] mb-6">
                  {isMarketDataLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <motion.div
                        className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </div>
                  ) : (
                    <LiveChart
                      data={
                        chartType === "line"
                          ? lineData
                          : candlestickData
                      }
                      type={chartType}
                      containerClassName="h-full"
                    />
                  )}
                </div>

                {/* Trading Controls */}
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <div className="flex gap-4 mb-4">
                    <button
                      className={`flex-1 py-2 rounded-lg ${
                        tradeType === "amount"
                          ? "bg-blue-500"
                          : "bg-gray-700"
                      }`}
                      onClick={() => setTradeType("amount")}
                    >
                      Trade by Amount
                    </button>
                    <button
                      className={`flex-1 py-2 rounded-lg ${
                        tradeType === "quantity"
                          ? "bg-blue-500"
                          : "bg-gray-700"
                      }`}
                      onClick={() => setTradeType("quantity")}
                    >
                      Trade by Quantity
                    </button>
                  </div>

                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-1">
                        {tradeType === "amount"
                          ? "Amount (USD)"
                          : `Quantity (${selectedCryptoData.symbol.toUpperCase()})`}
                      </label>
                      <input
                        type="number"
                        value={
                          tradeType === "amount"
                            ? tradeAmount
                            : tradeQuantity
                        }
                        onChange={(e) => {
                          if (tradeType === "amount") {
                            setTradeAmount(e.target.value);
                          } else {
                            setTradeQuantity(e.target.value);
                          }
                        }}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                        placeholder={
                          tradeType === "amount"
                            ? "Enter USD amount"
                            : "Enter quantity"
                        }
                      />
                      {tradeType === "amount" &&
                        tradeAmount &&
                        currentPrice && (
                          <p className="text-sm text-gray-400 mt-1">
                            ≈{" "}
                            {(
                              parseFloat(tradeAmount) / currentPrice
                            ).toFixed(4)}{" "}
                            {selectedCryptoData.symbol.toUpperCase()}
                          </p>
                        )}
                      {tradeType === "quantity" &&
                        tradeQuantity &&
                        currentPrice && (
                          <p className="text-sm text-gray-400 mt-1">
                            ≈ $
                            {(
                              parseFloat(tradeQuantity) * currentPrice
                            ).toFixed(2)}
                          </p>
                        )}
                    </div>
                    <button
                      onClick={() => handleSimulatedTrade("buy")}
                      className="px-6 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      Buy
                    </button>
                    <button
                      onClick={() => handleSimulatedTrade("sell")}
                      className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">
                  Trading History
                </h3>
                <div className="space-y-4">
                  {simulatedTrades
                    .filter(
                      (trade) =>
                        trade.crypto === selectedCryptoData.symbol
                    )
                    .map((trade) => (
                      <div
                        key={trade.id}
                        className="p-3 bg-gray-700/30 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <span
                            className={
                              trade.type === "buy"
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {trade.type === "buy" ? "Buy" : "Sell"}{" "}
                            {trade.crypto.toUpperCase()}
                          </span>
                          <span>
                            ${trade.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                          {trade.quantity.toFixed(4)} @ $
                          {trade.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(
                            trade.timestamp
                          ).toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">
              Recently Viewed
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {recentlyViewed.map((cryptoId) => {
                const crypto = cryptocurrencies?.find(
                  (c) => c.id === cryptoId
                );
                return crypto ? (
                  <motion.div
                    key={crypto.id}
                    className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleCryptoSelect(crypto.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span>{crypto.symbol.toUpperCase()}</span>
                      <span
                        className={
                          crypto.price_change_percentage_24h >= 0
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {crypto.price_change_percentage_24h.toFixed(
                          2
                        )}
                        %
                      </span>
                    </div>
                    <div className="mt-2 text-lg font-semibold">
                      ${crypto.current_price.toLocaleString()}
                    </div>
                    {portfolio[crypto.id] && (
                      <div className="mt-1 text-sm text-gray-400">
                        Holdings:{" "}
                        {portfolio[crypto.id].quantity.toFixed(4)}
                      </div>
                    )}
                  </motion.div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
