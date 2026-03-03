// src/hooks/useWalletTransactions.ts
import { useState, useEffect } from 'react';
import { BrowserProvider, formatEther } from 'ethers';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

export const useWalletTransactions = (walletAddress: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!walletAddress) return;
      
      setIsLoading(true);
      try {
        const provider = new BrowserProvider(window.ethereum);
        
        // Get the last 10 blocks
        const currentBlock = await provider.getBlockNumber();
        const blocks = await Promise.all(
          Array.from({ length: 10 }, (_, i) => 
            provider.getBlock(currentBlock - i, true)
          )
        );

        const walletTxs = blocks
          .flatMap(block => block?.transactions || [])
          .filter(tx => typeof tx === 'object' && tx !== null && tx.from) // guard string hashes
          .filter(tx => 
            tx.from.toLowerCase() === walletAddress.toLowerCase() ||
            tx.to?.toLowerCase() === walletAddress.toLowerCase()
          )
          .map(tx => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to || '',
            value: formatEther(tx.value),
            timestamp: Date.now() // Using current time as blocks don't have timestamps
          }));

        setTransactions(walletTxs);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [walletAddress]);

  return { transactions, isLoading };
};

export default useWalletTransactions;