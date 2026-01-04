// src/utils/geminiModels.ts
export const GEMINI_MODELS = {
  // Try these in order - most recent first
  LATEST_PRO: "gemini-1.5-pro-latest",
  PRO_15: "gemini-1.5-pro",
  PRO: "gemini-pro",
  FLASH: "gemini-1.5-flash-latest",
  FLASH_15: "gemini-1.5-flash",
  
  // Vision models for image analysis
  VISION_PRO: "gemini-1.5-pro-vision-latest",
  VISION_FLASH: "gemini-1.5-flash-vision-latest",
};

export const MODEL_PRIORITY = [
  GEMINI_MODELS.LATEST_PRO,
  GEMINI_MODELS.PRO_15,
  GEMINI_MODELS.FLASH,
  GEMINI_MODELS.PRO,
  GEMINI_MODELS.FLASH_15,
];

export const VISION_MODEL_PRIORITY = [
  GEMINI_MODELS.VISION_PRO,
  GEMINI_MODELS.VISION_FLASH,
  GEMINI_MODELS.LATEST_PRO,
  GEMINI_MODELS.PRO_15,
  GEMINI_MODELS.FLASH,
];