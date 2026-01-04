// src/server/src/routes/cryptocurrencies.ts
import { Router } from "express";
import axios from "axios";

const router = Router();
const CRYPTO_API = "https://api.coingecko.com/api/v3";

router.get("/", async (_req, res) => {
  try {
    const response = await axios.get(
      `${CRYPTO_API}/coins/markets`,
      {
        params: {
          vs_currency: "usd",
          order: "market_cap_desc",
          per_page: 50,
          sparkline: false,
          price_change_percentage: "24h"
        }
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load cryptocurrencies" });
  }
});

export default router;
