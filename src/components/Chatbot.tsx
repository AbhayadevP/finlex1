// src/components/Chatbot.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Camera, AlertTriangle, Info, RefreshCw } from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// Educational content about common crypto patterns
const cryptoPatterns = {
  "bullish": "A bullish pattern suggests potential upward price movement. Common indicators include higher lows, positive momentum indicators, and increasing volume on upward moves.",
  "bearish": "A bearish pattern suggests potential downward price movement. Common indicators include lower highs, negative momentum indicators, and increasing volume on downward moves.",
  "consolidation": "Consolidation patterns show sideways price action, often indicating market indecision. These can precede both breakouts and breakdowns.",
  "support": "Support levels are price points where historically the asset has stopped falling and bounced back up. Strong support often forms at round numbers or previous significant lows.",
  "resistance": "Resistance levels are price points where historically the asset has struggled to rise above. Breaking through resistance on high volume can signal continued momentum.",
  "volume": "Volume confirms price movements. High volume during price increases suggests stronger bullish sentiment, while high volume during decreases suggests stronger bearish sentiment."
};

// Test backend connection
const testBackendConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return { 
      success: true, 
      message: 'Backend connected',
      data: response.data 
    };
  } catch (error: any) {
    console.error('Backend connection error:', error);
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
};

// Test Gemini API through backend
const testGeminiConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/gemini/test`);
    return {
      success: true,
      message: 'Gemini backend connected',
      data: response.data
    };
  } catch (error: any) {
    console.error('Gemini backend error:', error);
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
};

// Call Gemini through backend
const fetchGeminiResponse = async (prompt: string, imageData: string | null = null) => {
  try {
    console.log('Calling backend API with prompt:', prompt.substring(0, 50) + '...');
    
    const response = await axios.post(
      `${API_BASE_URL}/api/gemini/chat`,
      {
        prompt,
        imageData
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      }
    );

    if (response.data.success) {
      return response.data.response;
    } else {
      throw new Error(response.data.error || 'API call failed');
    }
  } catch (error: any) {
    console.error('Backend API error:', error);
    
    // Return user-friendly error messages
    if (error.response?.status === 502) {
      return "🔌 **Backend Connection Error**\n\nThe server is not responding. Please:\n1. Start your backend server\n2. Check if it's running on port 4000\n3. Verify the backend has the Gemini API key";
    } else if (error.response?.status === 500) {
      return "⚙️ **Server Configuration Error**\n\nThe backend server is not properly configured. Please check:\n1. Backend .env file has GEMINI_API_KEY\n2. Backend server is running\n3. Port 4000 is not blocked";
    } else if (error.message?.includes('Network Error')) {
      return "🌐 **Network Error**\n\nCannot connect to the backend server. Please:\n1. Ensure backend is running (npm run server)\n2. Check your internet connection\n3. Verify CORS settings in backend";
    }
    
    return `❌ **Error**\n\n${error.message || 'Unknown error occurred'}`;
  }
};

// Function to generate educational content
const generateEducationalContent = (analysisText: string) => {
  const analysisLower = analysisText.toLowerCase();
  let relevantEducation = "";
  
  Object.keys(cryptoPatterns).forEach(pattern => {
    if (analysisLower.includes(pattern)) {
      relevantEducation += `\n\n**About ${pattern} patterns**: ${cryptoPatterns[pattern]}`;
    }
  });
  
  if (relevantEducation === "" || Math.random() < 0.3) {
    const cryptoEducation = [
      "Cryptocurrency markets are highly volatile, with rapid price swings much larger than traditional markets. This creates both opportunity and risk.",
      "Technical analysis attempts to forecast price movements by studying historical data patterns, but success rates vary greatly and no method is foolproof.",
      "Dollar-cost averaging (investing fixed amounts at regular intervals) can help manage risk in volatile markets by averaging purchase prices over time.",
      "Market sentiment can shift rapidly due to news, regulatory changes, or technological developments.",
      "Risk management is essential - many experts suggest only investing what you can afford to lose in high-risk assets like cryptocurrencies."
    ];
    const randomEducation = cryptoEducation[Math.floor(Math.random() * cryptoEducation.length)];
    relevantEducation += `\n\n**Market insight**: ${randomEducation}`;
  }
  
  return relevantEducation;
};

interface Message {
  text: string;
  isUser: boolean;
  isDisclaimer?: boolean;
  isPrompt?: boolean;
  isError?: boolean;
  hasScreenshot?: boolean;
  isDebug?: boolean;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hello! I'm FINLEX, your cryptocurrency education assistant. How can I help you today?", 
      isUser: false 
    },
    { 
      text: "📊 I can analyze cryptocurrency charts and provide educational insights.\n⚠️ Remember: All analysis is for educational purposes only, not financial advice.", 
      isUser: false, 
      isDisclaimer: true 
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [screenCaptureMode, setScreenCaptureMode] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const [geminiStatus, setGeminiStatus] = useState<'checking' | 'connected' | 'failed'>('checking');
  const screenshotImageRef = useRef<string | null>(null);

  // Check connections on component mount
  useEffect(() => {
    const checkConnections = async () => {
      console.log('Checking connections...');
      
      // Check backend
      const backendResult = await testBackendConnection();
      setBackendStatus(backendResult.success ? 'connected' : 'failed');
      
      if (backendResult.success) {
        // Check Gemini through backend
        const geminiResult = await testGeminiConnection();
        setGeminiStatus(geminiResult.success ? 'connected' : 'failed');
        
        if (geminiResult.success) {
          console.log('✅ All connections working');
        } else {
          console.log('❌ Gemini backend failed:', geminiResult.error);
        }
      } else {
        console.log('❌ Backend connection failed:', backendResult.error);
      }
    };
    
    checkConnections();
  }, []);

  // Function to handle screen capture
  const requestScreenCapture = async () => {
    try {
      setIsLoading(true);
      
      setMessages(prev => [...prev, { 
        text: "📸 Select the screen/window with the crypto chart to analyze...", 
        isUser: false 
      }]);
      
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { cursor: "always" },
        audio: false
      });
      
      const video = document.createElement("video");
      video.srcObject = stream;
      
      await new Promise<void>((resolve, reject) => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
        video.onerror = reject;
        setTimeout(() => reject(new Error("Timeout")), 5000);
      });
      
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas error");
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL("image/jpeg", 0.8);
      
      stream.getTracks().forEach(track => track.stop());
      screenshotImageRef.current = imageUrl;
      
      setMessages(prev => [...prev, { 
        text: "✅ Screen captured! Analyzing chart patterns...", 
        isUser: false 
      }]);
      
      const analysisResponse = await fetchGeminiResponse(input, imageUrl);
      const enhancedResponse = analysisResponse + generateEducationalContent(analysisResponse);
      
      setMessages(prev => [...prev, { 
        text: enhancedResponse, 
        isUser: false,
        hasScreenshot: true
      }]);
      
      setScreenCaptureMode(false);
      setIsLoading(false);
      
    } catch (error) {
      console.error("Screen capture error:", error);
      setMessages(prev => [...prev, { 
        text: "❌ Screen capture cancelled or failed. Try again or ask a text question.", 
        isUser: false,
        isError: true
      }]);
      setScreenCaptureMode(false);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    
    // Check for chart analysis request
    const chartKeywords = [
      "chart", "graph", "screen", "analyze", "what do you see",
      "crypto chart", "bitcoin chart", "ethereum chart", "pattern",
      "technical analysis", "price chart"
    ];
    
    const isChartRequest = chartKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );
    
    if (isChartRequest && backendStatus === 'connected' && geminiStatus === 'connected') {
      setMessages(prev => [...prev, { 
        text: "📊 I can analyze that chart! Click the camera button to capture your screen.", 
        isUser: false,
        isPrompt: true 
      }]);
      setScreenCaptureMode(true);
      return;
    }
    
    // Text-only request
    setIsLoading(true);
    let responseText = await fetchGeminiResponse(userMessage);
    setMessages(prev => [...prev, { text: responseText, isUser: false }]);
    setIsLoading(false);
  };

  const retestConnections = async () => {
    setIsLoading(true);
    
    const backendResult = await testBackendConnection();
    setBackendStatus(backendResult.success ? 'connected' : 'failed');
    
    if (backendResult.success) {
      const geminiResult = await testGeminiConnection();
      setGeminiStatus(geminiResult.success ? 'connected' : 'failed');
      
      setMessages(prev => [...prev, {
        text: backendResult.success && geminiResult.success 
          ? "✅ **All connections restored!** Backend and Gemini API are working." 
          : `❌ **Connection issues**\nBackend: ${backendResult.success ? '✅' : '❌'}\nGemini: ${geminiResult.success ? '✅' : '❌'}`,
        isUser: false,
        isDebug: true
      }]);
    } else {
      setMessages(prev => [...prev, {
        text: "❌ **Backend server not reachable**\nPlease ensure the backend server is running on port 4000.",
        isUser: false,
        isError: true
      }]);
    }
    
    setIsLoading(false);
  };

  const getConnectionStatus = () => {
    if (backendStatus === 'connected' && geminiStatus === 'connected') {
      return { text: 'Connected', color: 'bg-green-500' };
    } else if (backendStatus === 'failed') {
      return { text: 'Backend Offline', color: 'bg-red-500' };
    } else if (geminiStatus === 'failed') {
      return { text: 'Gemini Failed', color: 'bg-yellow-500' };
    } else {
      return { text: 'Checking...', color: 'bg-blue-500 animate-pulse' };
    }
  };

  const status = getConnectionStatus();

  return (
    <>
      <motion.button
        className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 w-96 max-w-[90vw] bg-gray-900 rounded-2xl shadow-2xl z-50 border border-gray-700"
          >
            <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">FINLEX Assistant</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${status.color}`} />
                    <p className="text-xs text-gray-400">{status.text}</p>
                    <button 
                      onClick={retestConnections}
                      className="text-xs text-blue-400 hover:text-blue-300 ml-2 flex items-center gap-1"
                      disabled={isLoading}
                    >
                      <RefreshCw className="h-3 w-3" />
                      Retest
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-2xl ${
                    message.isUser 
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 rounded-br-none" 
                      : message.isDisclaimer || message.isPrompt
                        ? "bg-gradient-to-r from-yellow-800/80 to-yellow-900/80 border border-yellow-600 rounded-bl-none" 
                        : message.isError
                          ? "bg-gradient-to-r from-red-800/80 to-red-900/80 border border-red-600 rounded-bl-none"
                          : message.isDebug
                            ? "bg-gradient-to-r from-purple-800/80 to-purple-900/80 border border-purple-600 rounded-bl-none"
                            : "bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-bl-none"
                    } text-white ${(message.isDisclaimer || message.isPrompt || message.isError || message.isDebug) ? "flex items-start gap-3" : ""}`}
                  >
                    {message.isDisclaimer && <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-yellow-400" />}
                    {message.isPrompt && <Camera className="h-5 w-5 flex-shrink-0 mt-0.5 text-blue-400" />}
                    {message.isError && <X className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />}
                    {message.isDebug && <Info className="h-5 w-5 flex-shrink-0 mt-0.5 text-purple-400" />}
                    <div className="whitespace-pre-line">
                      <div dangerouslySetInnerHTML={{ 
                        __html: message.text
                          .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-yellow-300">$1</span>')
                          .replace(/\n/g, '<br/>')
                          .replace(/✅/g, '✅ ')
                          .replace(/❌/g, '❌ ')
                          .replace(/⚠️/g, '⚠️ ')
                          .replace(/📊/g, '📊 ')
                          .replace(/📸/g, '📸 ')
                          .replace(/🔧/g, '🔧 ')
                          .replace(/🔌/g, '🔌 ')
                          .replace(/⚙️/g, '⚙️ ')
                          .replace(/🌐/g, '🌐 ')
                      }} />
                      {message.hasScreenshot && screenshotImageRef.current && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-400 mb-1">Analyzed Screenshot:</div>
                          <img 
                            src={screenshotImageRef.current} 
                            alt="Screenshot analysis" 
                            className="w-full h-auto rounded-lg border-2 border-gray-700 shadow-lg max-h-48 object-contain bg-black" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex justify-start"
                >
                  <div className="bg-gray-800 text-white p-4 rounded-2xl rounded-bl-none border border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-300">
                        {screenCaptureMode ? "Preparing screen capture..." : "Processing..."}
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150" />
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="p-3 border-t border-gray-700 bg-gray-800/50">
              <div className="bg-gray-800/70 rounded-lg p-3 text-xs text-gray-300 flex items-start gap-3 border border-gray-700">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-yellow-500" />
                <span><strong>Note:</strong> Educational purposes only. Past performance ≠ future results. No financial advice.</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700 bg-gray-800/30">
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Ask about crypto charts, patterns, or concepts..." 
                  disabled={isLoading || backendStatus !== 'connected' || geminiStatus !== 'connected'} 
                  className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border border-gray-700 disabled:opacity-50" 
                />
                {screenCaptureMode && backendStatus === 'connected' && geminiStatus === 'connected' ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    type="button" 
                    onClick={requestScreenCapture}
                    disabled={isLoading} 
                    className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-3 rounded-xl hover:from-green-700 hover:to-emerald-800 disabled:opacity-50 transition-all shadow-lg border border-emerald-600"
                    title="Capture screen for analysis"
                  >
                    <Camera className="h-5 w-5" />
                  </motion.button>
                ) : (
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    type="submit" 
                    disabled={isLoading || !input.trim() || backendStatus !== 'connected' || geminiStatus !== 'connected'} 
                    className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-3 rounded-xl hover:from-blue-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg border border-blue-600"
                    title={backendStatus !== 'connected' ? "Backend required" : geminiStatus !== 'connected' ? "Gemini API not ready" : "Send message"}
                  >
                    <Send className="h-5 w-5" />
                  </motion.button>
                )}
              </div>
              {backendStatus !== 'connected' && (
                <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded-lg">
                  <p className="text-xs text-red-300">
                    ⚠️ Backend server not running. Start it with:{" "}
                    <code className="bg-black/50 px-2 py-1 rounded">npm run server</code> in your backend folder.
                  </p>
                </div>
              )}
              {backendStatus === 'connected' && geminiStatus !== 'connected' && (
                <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                  <p className="text-xs text-yellow-300">
                    ⚠️ Gemini API not configured on backend. Check backend .env file.
                  </p>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;