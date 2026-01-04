// src/utils/debugEnv.ts
export const debugEnvironment = () => {
  console.log('=== ENVIRONMENT DEBUG ===');
  console.log('1. import.meta.env keys:', Object.keys(import.meta.env));
  console.log('2. VITE_GEMINI_API_KEY exists:', !!import.meta.env.VITE_GEMINI_API_KEY);
  console.log('3. VITE_GEMINI_API_KEY value (first 10 chars):', 
    import.meta.env.VITE_GEMINI_API_KEY ? 
    import.meta.env.VITE_GEMINI_API_KEY.substring(0, 10) + '...' : 
    'NOT FOUND'
  );
  console.log('4. import.meta.env.MODE:', import.meta.env.MODE);
  console.log('5. import.meta.env.DEV:', import.meta.env.DEV);
  console.log('6. import.meta.env.PROD:', import.meta.env.PROD);
  console.log('========================');
  
  // Check if it's a valid key format
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const isValidFormat = apiKey.startsWith('AIza') && apiKey.length > 30;
  console.log('7. API Key format valid:', isValidFormat);
  
  return {
    hasApiKey: !!import.meta.env.VITE_GEMINI_API_KEY,
    keyLength: apiKey.length,
    isValidFormat,
    mode: import.meta.env.MODE
  };
};