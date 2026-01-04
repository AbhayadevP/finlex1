// src/components/WalletPortfolio.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, ReceiveIcon, History, ExternalLink } from 'lucide-react';
import { formatEther, parseEther, BrowserProvider } from 'ethers';
import useWalletTransactions from '../hooks/useWalletTransactions';

interface WalletPortfolioProps {
  walletAddress: string;
  walletBalance: string;
}

const WalletPortfolio: React.FC<WalletPortfolioProps> = ({ walletAddress, walletBalance }) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { transactions } = useWalletTransactions(walletAddress);

  const handleSend = async () => {
    if (!recipientAddress || !amount) return;

    setIsLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: parseEther(amount)
      });

      await tx.wait();
      setRecipientAddress('');
      setAmount('');
    } catch (error) {
      console.error('Error sending transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-6">Wallet Portfolio</h2>

      {/* Send/Receive Section */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Recipient Address</label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
              placeholder="0x..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Amount (ETH)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white"
              placeholder="0.0"
              step="0.0001"
            />
          </div>
        </div>
        <button
          onClick={handleSend}
          disabled={isLoading || !recipientAddress || !amount}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 rounded-lg flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {isLoading ? 'Sending...' : 'Send ETH'}
        </button>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Recent Transactions
        </h3>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <motion.div
              key={tx.hash}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-700/30 p-4 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={tx.from.toLowerCase() === walletAddress.toLowerCase() ? 'text-red-400' : 'text-green-400'}>
                  {tx.from.toLowerCase() === walletAddress.toLowerCase() ? 'Sent' : 'Received'}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(tx.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-300">
                {Number(tx.value).toFixed(4)} ETH
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>
                  {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                  {' → '}
                  {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                </span>
                <a
                  href={`https://etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  View
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center text-gray-400 py-4">
              No recent transactions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPortfolio;