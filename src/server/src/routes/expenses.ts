// src/server/src/routes/expenses.ts
// src/server/src/routes/expenses.ts
import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// Define schema directly here (simple version)
const expenseSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, default: "manual" }
  },
  { timestamps: true }
);

// Prevent model overwrite error in dev (important for nodemon)
const Expense =
  mongoose.models.Expense ||
  mongoose.model("Expense", expenseSchema);

// GET /api/expenses
router.get("/", async (_req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load expenses" });
  }
});

// POST /api/expenses
router.post("/", async (req, res) => {
  const { amount, description, category, date, type } = req.body;

  if (!amount || !description || !category || !date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newExpense = new Expense({
      amount,
      description,
      category,
      date,
      type: type || "manual"
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save expense" });
  }
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

export default router;