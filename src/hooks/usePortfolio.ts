// src/hooks/usePortfolio.ts
import { useState, useEffect, useCallback } from 'react';

interface PortfolioHolding {
  quantity: number;
  averagePrice: number;
}

interface Portfolio {
  [cryptoId: string]: PortfolioHolding;
}

export const usePortfolio = (selectedCryptoId: string | null, currentPrice: number | null) => {
  const [portfolio, setPortfolio] = useState<Portfolio>({});
  const [profitLoss, setProfitLoss] = useState<{ amount: number; percentage: number } | null>(null);

  // Calculate profit/loss whenever price or holdings change
  const calculateProfitLoss = useCallback(() => {
    if (!selectedCryptoId || !currentPrice) {
      setProfitLoss(null);
      return;
    }

    const holding = portfolio[selectedCryptoId];
    if (!holding || holding.quantity === 0) {
      setProfitLoss(null);
      return;
    }

    const currentValue = holding.quantity * currentPrice;
    const investedValue = holding.quantity * holding.averagePrice;
    const plAmount = currentValue - investedValue;
    const plPercentage = (plAmount / investedValue) * 100;

    setProfitLoss({
      amount: plAmount,
      percentage: plPercentage
    });
  }, [selectedCryptoId, currentPrice, portfolio]);

  // Update profit/loss whenever price changes
  useEffect(() => {
    calculateProfitLoss();
  }, [calculateProfitLoss, currentPrice]);

  const updatePortfolio = (
    cryptoId: string,
    type: 'buy' | 'sell',
    quantity: number,
    price: number
  ) => {
    setPortfolio(prev => {
      const current = prev[cryptoId] || { quantity: 0, averagePrice: 0 };
      
      if (type === 'buy') {
        const totalQuantity = current.quantity + quantity;
        const totalCost = current.quantity * current.averagePrice + quantity * price;
        return {
          ...prev,
          [cryptoId]: {
            quantity: totalQuantity,
            averagePrice: totalCost / totalQuantity
          }
        };
      } else {
        const remainingQuantity = current.quantity - quantity;
        return {
          ...prev,
          [cryptoId]: {
            quantity: remainingQuantity,
            averagePrice: remainingQuantity > 0 ? current.averagePrice : 0
          }
        };
      }
    });
  };

  return {
    portfolio,
    profitLoss,
    updatePortfolio
  };
};

export default usePortfolio;