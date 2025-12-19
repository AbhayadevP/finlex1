import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cryptocurrenciesRouter from "./routes/cryptocurrencies";
import expensesRouter from "./routes/expenses";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/cryptocurrencies", cryptocurrenciesRouter);
app.use("/api/expenses", expensesRouter);

app.listen(port, () => {
  console.log(`FINOVA backend running on port ${port}`);
});
