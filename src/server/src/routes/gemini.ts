// src/server/src/routes/gemini.ts

import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ===============================
// Test route (sanity check)
// ===============================
router.get("/test", (req, res) => {
  res.json({
    message: "Gemini API backend is running",
    hasApiKey: !!GEMINI_API_KEY,
    keyLength: GEMINI_API_KEY?.length || 0,
    timestamp: new Date().toISOString()
  });
});

// ===============================
// Main chat route
// ===============================
router.post("/chat", async (req, res) => {
  try {
    const { prompt, imageData } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: "Prompt is required"
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "Gemini API key not configured on server"
      });
    }

    // ✅ Supported model for YOUR API key
    const model = "models/gemini-2.5-flash";

    // ===============================
    // Build Gemini request body
    // ===============================
    const contents = imageData
      ? [
          {
            role: "user",
            parts: [
              {
                text: `You are FINLEX, a cryptocurrency education assistant.

Analyze the provided crypto chart/image and explain:
- Visible trends or patterns
- Support and resistance (if visible)
- Market structure

Educational purposes only. No financial advice.

User question: ${prompt}`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageData.includes(",")
                    ? imageData.split(",")[1]
                    : imageData
                }
              }
            ]
          }
        ]
      : [
          {
            role: "user",
            parts: [
              {
                text: `You are FINLEX, a cryptocurrency education assistant.

Answer the user's question clearly and simply.
Educational only. No financial advice.

Question: ${prompt}`
              }
            ]
          }
        ];

    // ===============================
    // Call Gemini API
    // ===============================
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${GEMINI_API_KEY}`,
      { contents },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 30000
      }
    );

    const aiText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      return res.status(500).json({
        success: false,
        error: "Empty response from Gemini API"
      });
    }

    return res.json({
      success: true,
      response: aiText,
      modelUsed: model
    });

  } catch (error: any) {
    console.error("🔥 Gemini API error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    return res.status(500).json({
      success: false,
      error:
        error.response?.data?.error?.message ||
        error.message ||
        "Gemini API request failed"
    });
  }
});

export default router;
