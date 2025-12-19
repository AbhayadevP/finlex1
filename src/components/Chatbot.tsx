import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Camera, AlertTriangle, Info } from "lucide-react";
import axios from "axios";

// API key should be stored securely on a server, not in client-side code
const GEMINI_API_KEY = "AIzaSyCicfNY-lyhzY3H84Leax5j6deMdcVQVPo"; // Replace with secure environment variable
const GEMINI_MODEL = "gemini-2.0-flash"; // Using the flash model for faster responses

// Educational content about common crypto patterns
const cryptoPatterns = {
  "bullish": "A bullish pattern suggests potential upward price movement. Common indicators include higher lows, positive momentum indicators, and increasing volume on upward moves.",
  "bearish": "A bearish pattern suggests potential downward price movement. Common indicators include lower highs, negative momentum indicators, and increasing volume on downward moves.",
  "consolidation": "Consolidation patterns show sideways price action, often indicating market indecision. These can precede both breakouts and breakdowns.",
  "support": "Support levels are price points where historically the asset has stopped falling and bounced back up. Strong support often forms at round numbers or previous significant lows.",
  "resistance": "Resistance levels are price points where historically the asset has struggled to rise above. Breaking through resistance on high volume can signal continued momentum.",
  "volume": "Volume confirms price movements. High volume during price increases suggests stronger bullish sentiment, while high volume during decreases suggests stronger bearish sentiment."
};

// Educational content about crypto market basics
const cryptoEducation = [
  "Cryptocurrency markets are highly volatile, with rapid price swings much larger than traditional markets. This creates both opportunity and risk.",
  "Technical analysis attempts to forecast price movements by studying historical data patterns, but success rates vary greatly and no method is foolproof.",
  "Dollar-cost averaging (investing fixed amounts at regular intervals) can help manage risk in volatile markets by averaging purchase prices over time.",
  "Market sentiment can shift rapidly due to news, regulatory changes, or technological developments.",
  "Risk management is essential - many experts suggest only investing what you can afford to lose in high-risk assets like cryptocurrencies."
];

// Function to convert image data to base64
const imageToBase64 = (imgElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = imgElement.width;
  canvas.height = imgElement.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgElement, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.7).split(',')[1]; // Return base64 without the prefix
};

const fetchGeminiResponse = async (userInput, screenshotData = null) => {
  try {
    let requestData;
    
    // Check if analyzing a screenshot or just responding to text
    if (screenshotData) {
      // Create a more specific prompt for crypto chart analysis
      requestData = {
        contents: [
          {
            parts: [
              { text: `You are FINLEX, a cryptocurrency market educator.

                Analyze the crypto chart or data shown in this image and:
                1. DESCRIBE what you see in the chart (3-4 sentences): price action, timeframe, indicators visible.
                2. EDUCATE about the patterns visible (2-3 sentences): explain what these patterns typically mean.
                3. SUGGEST what someone might consider (1-2 sentences): frame this as "Some traders might consider..." or "This pattern sometimes precedes..."
                
                IMPORTANT: Never make definitive price predictions. Always present information as educational content rather than direct advice.
                Include this disclaimer: "This is educational information about chart patterns, not financial advice. Past patterns don't guarantee future results."
                
                User question: ${userInput}` 
              },
              { inline_data: { mime_type: "image/jpeg", data: screenshotData } }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 350
        }
      };
    } else {
      // Standard text-only request
      requestData = { 
        contents: [{ parts: [{ 
          text: `You are FINLEX, a concise financial assistant chatbot. 
          Provide brief, direct answers in 1-2 sentences maximum.
          Avoid unnecessary explanations, introductions, or conclusions.
          DO NOT PROVIDE SPECIFIC INVESTMENT ADVICE.
          If asked about investments, remind the user you can only provide general information, not personalized advice.
          Question: ${userInput}`
        }] }],
        generationConfig: {
          maxOutputTokens: 150
        }
      };
    }
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      requestData,
      { headers: { "Content-Type": "application/json" } }
    );
    
    let aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";
    
    aiResponse = aiResponse
      .replace(/\bAI\b|\bchatbot\b|\bmodel\b/g, "FINLEX")
      .replace(/^(Hi|Hello|Greetings|Hey).*?\,\s*/i, "")
      .replace(/\s*As FINLEX,\s*/i, "")
      .trim();
      
    return aiResponse;
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I apologize, but FINLEX is having trouble processing your request right now.";
  }
};

// Function to generate educational content based on keywords
const generateEducationalContent = (analysisText) => {
  // Keywords to look for in the analysis
  const analysisLower = analysisText.toLowerCase();
  let relevantEducation = "";
  
  // Check for mentions of specific patterns
  Object.keys(cryptoPatterns).forEach(pattern => {
    if (analysisLower.includes(pattern)) {
      relevantEducation += `\n\n**About ${pattern} patterns**: ${cryptoPatterns[pattern]}`;
    }
  });
  
  // Add general education if nothing specific was found or randomly
  if (relevantEducation === "" || Math.random() < 0.3) {
    const randomEducation = cryptoEducation[Math.floor(Math.random() * cryptoEducation.length)];
    relevantEducation += `\n\n**Market insight**: ${randomEducation}`;
  }
  
  return relevantEducation;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm FINLEX. How can I help you today?", isUser: false },
    { text: "I can analyze cryptocurrency charts and provide educational information about what I see. However, remember that all analysis is for educational purposes only.", isUser: false, isDisclaimer: true },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [screenCaptureMode, setScreenCaptureMode] = useState(false);
  const screenshotImageRef = useRef(null);

  // Function to handle screen capture request
  const requestScreenCapture = async () => {
    try {
      setIsLoading(true);
      
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { cursor: "always" },
        audio: false
      });
      
      // Create video element to display the screen capture
      const video = document.createElement("video");
      video.srcObject = stream;
      
      // Wait for video metadata to load
      await new Promise(resolve => {
        video.onloadedmetadata = () => {
          video.play();
          resolve();
        };
      });
      
      // Create canvas to capture frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get the image data
      const imageUrl = canvas.toDataURL("image/jpeg");
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      
      // Create image element for conversion
      const img = new Image();
      img.src = imageUrl;
      await new Promise(resolve => {
        img.onload = resolve;
      });
      
      // Convert to base64 for API
      const base64Data = imageToBase64(img);
      
      // Store reference to image (for display)
      screenshotImageRef.current = imageUrl;
      
      // Add capture confirmation message
      setMessages(prev => [...prev, { 
        text: "I've captured your screen. Analyzing the chart patterns...", 
        isUser: false 
      }]);
      
      // Send to Gemini for analysis
      const analysisResponse = await fetchGeminiResponse(input, base64Data);
      
      // Add educational content
      const enhancedResponse = analysisResponse + generateEducationalContent(analysisResponse);
      
      // Add Gemini response
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
        text: "Screen capture was canceled or failed. Please try again or ask a different question.", 
        isUser: false,
        isError: true
      }]);
      setScreenCaptureMode(false);
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    
    // Check if the message is related to screen analysis
    const screenAnalysisKeywords = [
      "chart", "graph", "screen", "looking at", "what do you see", 
      "analyze this", "what's on my screen", "my screen", "cryptocurrency",
      "crypto", "bitcoin", "ethereum", "market", "recommend", "advice", "should i"
    ];
    
    const isScreenAnalysisRequest = screenAnalysisKeywords.some(
      keyword => userMessage.toLowerCase().includes(keyword)
    );
    
    if (isScreenAnalysisRequest) {
      setMessages(prev => [...prev, { 
        text: "I can analyze your crypto chart and provide educational information about what I see. Click the camera button below to authorize screen capture.", 
        isUser: false,
        isPrompt: true 
      }]);
      setScreenCaptureMode(true);
      return;
    }
    
    // Normal text processing
    setIsLoading(true);
    let responseText = await fetchGeminiResponse(userMessage);
    setMessages(prev => [...prev, { text: responseText, isUser: false }]);
    setIsLoading(false);
  };

  return (
    <>
      <motion.button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 w-96 bg-gray-900 rounded-lg shadow-xl z-50"
          >
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">FINLEX Assistant</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser 
                      ? "bg-blue-500" 
                      : message.isDisclaimer || message.isPrompt
                        ? "bg-yellow-700 border border-yellow-500" 
                        : message.isError
                          ? "bg-red-700 border border-red-500"
                          : "bg-gray-800"
                    } text-white ${message.isDisclaimer || message.isPrompt || message.isError ? "flex items-start gap-2" : ""}`}
                  >
                    {(message.isDisclaimer || message.isPrompt) && <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
                    {message.isError && <X className="h-5 w-5 flex-shrink-0 mt-0.5" />}
                    <div>
                      <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                      {message.hasScreenshot && screenshotImageRef.current && (
                        <div className="mt-2">
                          <img 
                            src={screenshotImageRef.current} 
                            alt="Screenshot" 
                            className="w-full h-auto rounded-md border border-gray-700 mt-1" 
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
                  <div className="bg-gray-800 text-white p-3 rounded-lg flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
                  </div>
                </motion.div>
              )}
            </div>
            <div className="p-2 border-t border-gray-700">
              <div className="bg-gray-800 rounded-lg p-2 text-xs text-gray-300 flex items-start gap-2">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5 text-yellow-500" />
                <span>Note: Chart analysis and pattern recognition are educational only. Past patterns do not predict future results.</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder="Ask about crypto charts or patterns..." 
                  disabled={isLoading} 
                  className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                />
                {screenCaptureMode ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    type="button" 
                    onClick={requestScreenCapture}
                    disabled={isLoading} 
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Camera className="h-5 w-5" />
                  </motion.button>
                ) : (
                  <motion.button 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }} 
                    type="submit" 
                    disabled={isLoading} 
                    className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;