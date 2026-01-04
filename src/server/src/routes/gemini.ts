// ./src/server/src/routes/gemini.ts
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Test route to verify backend is working
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Gemini API backend is running',
    hasApiKey: !!GEMINI_API_KEY,
    keyLength: GEMINI_API_KEY?.length || 0,
    timestamp: new Date().toISOString()
  });
});

// Main chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { prompt, imageData } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured on server' });
    }

    let requestData;
    
    if (imageData) {
      // For image analysis
      let cleanBase64 = imageData;
      if (imageData.includes(',')) {
        cleanBase64 = imageData.split(',')[1];
      }
      
      requestData = {
        contents: [
          {
            parts: [
              { 
                text: `You are FINLEX, a cryptocurrency chart analysis assistant. Analyze this cryptocurrency chart/image and provide educational insights.

**Focus on:**
1. Technical patterns visible (trend lines, support/resistance, chart patterns)
2. Volume analysis if data is visible
3. Market structure and key levels
4. Educational commentary only - NO financial advice

**User's question:** ${prompt}

**Remember:** This is for educational purposes only. Do not provide trading advice or price predictions.`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.7
        }
      };
    } else {
      // For text-only questions
      requestData = { 
        contents: [{ 
          parts: [{ 
            text: `You are FINLEX, a cryptocurrency education assistant. Provide clear, educational answers about crypto concepts.

**Guidelines:**
- Be educational, not advisory
- Explain concepts simply
- If asked for advice, remind this is educational only
- Keep responses under 250 words
- Focus on teaching, not predicting

**Question:** ${prompt}`
          }] 
        }],
        generationConfig: {
          maxOutputTokens: 350,
          temperature: 0.7
        }
      };
    }

    // Try different models with fallback
    const models = imageData 
      ? ['gemini-1.5-pro-vision-latest', 'gemini-pro-vision']
      : ['gemini-1.5-pro-latest', 'gemini-pro'];

    let lastError = null;
    
    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);
        
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          requestData,
          {
            headers: { "Content-Type": "application/json" },
            timeout: 30000
          }
        );

        const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (aiResponse) {
          return res.json({
            success: true,
            response: aiResponse,
            modelUsed: model
          });
        }
      } catch (error: any) {
        console.log(`Model ${model} failed:`, error.response?.status || error.message);
        lastError = error;
        if (error.response?.status === 404) {
          continue; // Try next model
        }
        break; // Stop for other errors
      }
    }

    // If all models failed
    throw new Error(lastError?.message || 'All models failed');

  } catch (error: any) {
    console.error('Gemini API error in backend:', error);
    
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message || 'Unknown error';
    
    res.status(status).json({
      success: false,
      error: message,
      details: error.response?.data
    });
  }
});

export default router;