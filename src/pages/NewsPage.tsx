// src/pages/NewsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Shield, RefreshCw } from 'lucide-react';

const NewsPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Using CryptoCompare News API (free tier)
        const response = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
        const data = await response.json();
        
        if (data.Data) {
          const formattedNews = data.Data.map(item => ({
            id: item.id,
            title: item.title,
            source: item.source,
            date: new Date(item.published_on * 1000).toLocaleDateString(),
            summary: item.body,
            url: item.url,
            imageUrl: item.imageurl
          }));
          setNews(formattedNews);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        // Fallback to CoinGecko API
        try {
          const response = await fetch('https://api.coingecko.com/api/v3/news');
          const data = await response.json();
          setNews(data);
        } catch (secondError) {
          console.error('Error fetching from backup source:', secondError);
          // Final fallback to static data
          setNews([
            {
              id: 1,
              title: 'Bitcoin Surges Past Previous Resistance Levels',
              source: 'CryptoNews',
              date: new Date().toLocaleDateString(),
              summary: 'Bitcoin has broken through key resistance levels, suggesting a potential bull run ahead.',
              url: 'https://www.cryptonews.com/news/bitcoin-surge',
              imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=500&q=80'
            },
            {
              id: 2,
              title: 'Ethereum Network Upgrade Announced',
              source: 'CoinDesk',
              date: new Date().toLocaleDateString(),
              summary: 'The Ethereum network is preparing for its next major upgrade, promising improved scalability.',
              url: 'https://www.coindesk.com/ethereum-upgrade',
              imageUrl: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=500&q=80'
            },
            {
              id: 3,
              title: 'DeFi Protocol Sets New Total Value Locked Record',
              source: 'DeFi Daily',
              date: new Date().toLocaleDateString(),
              summary: 'A major DeFi protocol has achieved a new milestone in total value locked.',
              url: 'https://www.defidaily.com/tvl-record',
              imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=500&q=80'
            },
            {
              id: 4,
              title: 'New Cryptocurrency Exchange Launches With Zero Fees',
              source: 'CoinTelegraph',
              date: new Date().toLocaleDateString(),
              summary: 'A new cryptocurrency exchange platform has launched with a zero-fee trading model.',
              url: 'https://www.cointelegraph.com/zero-fee-exchange',
              imageUrl: 'https://images.unsplash.com/photo-1634704784915-aacf363b021f?w=500&q=80'
            },
            {
              id: 5,
              title: 'Major Bank Adopts Blockchain Technology',
              source: 'Bloomberg Crypto',
              date: new Date().toLocaleDateString(),
              summary: 'A leading financial institution announces integration of blockchain technology.',
              url: 'https://www.bloomberg.com/crypto/bank-blockchain',
              imageUrl: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=500&q=80'
            },
            {
              id: 6,
              title: 'NFT Market Shows Signs of Recovery',
              source: 'NFT News',
              date: new Date().toLocaleDateString(),
              summary: 'The NFT market is showing positive indicators after a period of decline.',
              url: 'https://www.nftnews.com/market-recovery',
              imageUrl: 'https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=500&q=80'
            }
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-black/50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">FINLEX</span>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white flex items-center"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */} <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
            Cryptocurrency News
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Stay informed with the latest updates from the cryptocurrency market
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center my-20">
            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="h-48 bg-gray-700/50 relative overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                    <span>{item.source}</span>
                    <span>{item.date}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {item.summary}
                  </p>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300"
                  >
                    Read Full Article <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
