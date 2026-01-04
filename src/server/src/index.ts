// dolorer/src/server/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import geminiRoutes from './routes/gemini';
import cryptoRoutes from './routes/cryptocurrencies'; // Your existing routes
import expenseRoutes from './routes/expenses';
import { pool } from './db';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your Vite dev server
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Increased for images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/gemini', geminiRoutes);
app.use('/api/cryptocurrencies', cryptoRoutes);
app.use('/api/expenses', expenseRoutes);
// app.use('/api/db', db);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FINLEX Backend',
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Gemini API: http://localhost:${PORT}/api/gemini/test`);
});