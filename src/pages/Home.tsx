// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, TrendingUp, MessageCircle, Newspaper, Users, Upload, Receipt, CreditCard, Wallet, Lock, BookOpen, LineChart, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import HolographicCube from '../components/HolographicCube';
import { CircleDollarSign } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Fetch financial news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/news');
        const data = await response.json();
        setNews(data?.slice(0, 3) || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([
          {
            id: 1,
            title: 'Bitcoin Reaches New All-Time High',
            source: 'CryptoNews',
            date: new Date().toLocaleDateString(),
            url: 'https://www.cryptonews.com/news/bitcoin-new-high',
            imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=500&q=80'
          },
          {
            id: 2,
            title: 'Ethereum 2.0 Update Successfully Implemented',
            source: 'CoinDesk',
            date: new Date().toLocaleDateString(),
            url: 'https://www.coindesk.com/ethereum-update',
            imageUrl: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=500&q=80'
          },
          {
            id: 3,
            title: 'DeFi Market Cap Surpasses $100 Billion',
            source: 'CryptoDaily',
            date: new Date().toLocaleDateString(),
            url: 'https://www.cryptodaily.com/defi-milestone',
            imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=500&q=80'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const redirectToMetamask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  const toggleExpenseModal = () => {
    setShowExpenseModal(!showExpenseModal);
  };

  const goToManualExpenseEntry = () => {
    navigate('/expenses/manual');
    setShowExpenseModal(false);
  };

  const handleBillUpload = () => {
    navigate('/expenses/upload');
    setShowExpenseModal(false);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      category: "About FINLEX",
      questions: [
        {
          question: "What is FINLEX?",
          answer: "FINLEX is a next-generation cryptocurrency platform that combines decentralized finance with advanced blockchain technology. We offer secure, transparent, and efficient crypto trading services including portfolio tracking, investment opportunities, and crypto news updates."
        },
        {
          question: "How does FINLEX ensure security?",
          answer: "FINLEX utilizes advanced blockchain technology to secure all transactions and personal data. Our platform employs end-to-end encryption, multi-factor authentication, and regular security audits to ensure your crypto assets remain protected."
        }
      ]
    },
    {
      category: "Cryptocurrency",
      questions: [
        {
          question: "How can I start trading cryptocurrency?",
          answer: "To start trading cryptocurrency on FINLEX, create an account, complete verification, connect your wallet (like MetaMask), and you can begin trading various cryptocurrencies. We provide educational resources to help you make informed trading decisions."
        },
        {
          question: "What cryptocurrencies can I trade?",
          answer: "FINLEX supports a wide range of cryptocurrencies including Bitcoin, Ethereum, and other major altcoins. The list of supported cryptocurrencies is regularly updated based on market trends and user demand."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CircleDollarSign className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold text-white">FINLEX</span>
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => navigate('/contact')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Contact Us
                </span>
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Launch App
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="mb-2 inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-900/30 to-purple-900/30 text-blue-400 text-sm border border-blue-800"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
                Next Generation Crypto Trading Platform
              </motion.div>
              
              <motion.h1 
                className="text-5xl sm:text-7xl font-bold mb-6 leading-tight text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Your Gateway to{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Cryptocurrency
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-300 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Start your crypto journey with our comprehensive platform. Learn, trade, and grow your digital assets securely.
              </motion.p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => navigate('/login')}
                >
                  <span className="flex items-center justify-center text-lg font-semibold">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border border-green-500 text-green-400 px-8 py-4 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={toggleExpenseModal}
                >
                  <span className="flex items-center justify-center text-lg font-semibold">
                    <Receipt className="mr-2 h-5 w-5" />
                    Expense Tracker 
                  </span>
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <HolographicCube />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Portfolio Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={toggleExpenseModal}></div>
          <motion.div 
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-lg z-10 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h3 className="text-2xl font-bold text-white mb-4">Expense Tracker</h3>
            <p className="text-gray-300 mb-6">
              Track your crypto portfolio easily and manage your investments. All trades made through FINLEX will be automatically recorded in your portfolio.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleBillUpload}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all"
              >
                <Upload className="h-8 w-8 mb-2 mx-auto" />
                <h4 className="text-lg font-semibold mb-1">Import Trades</h4>
                <p className="text-sm text-gray-200">Import your trading history</p>
              </button>
              
              <button
                onClick={goToManualExpenseEntry}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl hover:shadow-lg hover:shadow-green-500/20 transition-all"
              >
                <Receipt className="h-8 w-8 mb-2 mx-auto" />
                <h4 className="text-lg font-semibold mb-1">Manual Entry</h4>
                <p className="text-sm text-gray-200">Manually input your trades</p>
              </button>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center text-cyan-400 mb-4">
                <CreditCard className="h-5 w-5 mr-2" />
                <span className="font-medium">FINLEX Trading Integration</span>
              </div>
              <p className="text-gray-400 text-sm">
                All trades made through FINLEX will be automatically recorded in your portfolio tracker, providing real-time updates and performance analytics.
              </p>
            </div>
            
            <button 
              onClick={toggleExpenseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}

      {/* News Section */}
      <div className="relative bg-gray-900/80 py-20">
        {/* 🔧 FIX 1: background overlay should NOT block clicks */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />

        {/* 🔧 FIX 2: content placed ABOVE overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center mb-4 px-4 py-2 rounded-full bg-cyan-900/30 text-cyan-400 text-lg border border-cyan-800">
              <Newspaper className="mr-2 h-5 w-5" />
              Crypto Market Updates
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Latest Crypto News
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Stay informed with the most recent updates and trends in the cryptocurrency market
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {loading ? (
              Array(3).fill(null).map((_, i) => (
                <div key={i} className="bg-gray-800/50 animate-pulse rounded-xl overflow-hidden">
                  <div className="h-48 bg-gray-700/50"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
                    <div className="h-10 bg-gray-700/50 rounded"></div>
                    <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : (
              news.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
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
                    <h3 className="text-xl font-semibold text-white mb-4 line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* ✅ BUTTON NOW CLICKABLE */}
          <div className="text-center mt-12">
            <div className="relative inline-block">
  <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl"></div>

  <button
    onClick={() => navigate('/news')}
    className="
      relative
      px-10 py-5
      text-lg font-semibold
      rounded-full
      bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600
      text-white
      shadow-lg shadow-cyan-500/40
      hover:shadow-cyan-500/70
      hover:scale-110
      active:scale-95
      transition-all duration-300
      border border-cyan-400/40
    "
  >
    <span className="flex items-center justify-center">
      View All Crypto News
      <ArrowRight className="ml-3 h-5 w-5" />
    </span>
  </button>
</div>

          </div>
        </div>
      </div>


      {/* Crypto Account Section */}
      <div className="relative bg-gray-900 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Start Your Crypto Journey</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Begin your cryptocurrency investment journey with our comprehensive guide. Learn how to create and secure your crypto wallet, understand the basics, and start trading safely.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Getting Started with Cryptocurrency</h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-800/70 p-6 rounded-xl">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">1</div>
                    <h4 className="text-xl font-semibold text-white">Learn the Basics</h4>
                  </div>
                  <p className="text-gray-300">
                    Start with our comprehensive guide to understand cryptocurrency fundamentals, blockchain technology, and different types of digital assets.
                  </p>
                </div>

                <div className="bg-gray-800/70 p-6 rounded-xl">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">2</div>
                    <h4 className="text-xl font-semibold text-white">Choose a Secure Wallet</h4>
                  </div>
                  <p className="text-gray-300">
                    Learn about different types of crypto wallets (hardware, software) and choose the one that best suits your needs. Security is paramount in crypto.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800/70 p-6 rounded-xl">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">3</div>
                    <h4 className="text-xl font-semibold text-white">Verify Your Identity</h4>
                  </div>
                  <p className="text-gray-300">
                    Complete the KYC (Know Your Customer) process by providing valid identification documents. This is required for legal compliance and account security.
                  </p>
                </div>

                <div className="bg-gray-800/70 p-6 rounded-xl">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">4</div>
                    <h4 className="text-xl font-semibold text-white">Start Trading</h4>
                  </div>
                  <p className="text-gray-300">
                    Begin with small investments to understand the market. Use our educational resources and real-time market data to make informed trading decisions.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-800/50">
                <Lock className="h-8 w-8 text-blue-400 mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Security First</h4>
                <p className="text-gray-300 text-sm">
                  Learn about two-factor authentication, secure password practices, and safe storage of your crypto assets.
                </p>
              </div>
              
              <div className="bg-purple-900/20 p-6 rounded-xl border border-purple-800/50">
                <BookOpen className="h-8 w-8 text-purple-400 mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Educational Resources</h4>
                <p className="text-gray-300 text-sm">
                  Access our library of tutorials, guides, and market analysis to enhance your trading knowledge.
                </p>
              </div>
              
              <div className="bg-green-900/20 p-6 rounded-xl border border-green-800/50">
                <LineChart className="h-8 w-8 text-green-400 mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">Market Analysis</h4>
                <p className="text-gray-300 text-sm">
                  Learn to read charts, understand market indicators, and analyze trends for better trading decisions.
                </p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-8 py-4 rounded-xl"
                onClick={redirectToMetamask}
              >
                <span className="flex items-center justify-center text-lg font-semibold">
                  Create Crypto Account <Wallet className="ml-2 h-5 w-5" />
                </span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="relative bg-gray-900 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.1),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center mb-4 px-4 py-2 rounded-full bg-purple-900/30 text-purple-400 text-lg border border-purple-800">
              <HelpCircle className="mr-2 h-5 w-5" />
              Frequently Asked Questions
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Common Questions</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to know about FINLEX and cryptocurrency
            </p>
          </motion.div>

          <div className="space-y-12">
            {faqItems.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-2xl font-bold text-white">{category.category}</h3>
                </div>
                <div className="divide-y divide-gray-700">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex;
                    const isOpen = openFaqIndex === globalIndex;
                    
                    return (
                      <div key={faqIndex} className="p-6">
                        <button
                          className="w-full flex justify-between items-center text-left"
                          onClick={() => toggleFaq(globalIndex)}
                        >
                          <h4 className="text-lg font-semibold text-white">{faq.question}</h4>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-blue-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-blue-400 flex-shrink-0" />
                          )}
                        </button>
                        
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 text-gray-300"
                          >
                            <p>{faq.answer}</p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/70 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-blue-500" />
              <span className="text-lg font-bold text-white">FINLEX</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/news')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Crypto News
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact Us
              </button>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} FINLEX. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
