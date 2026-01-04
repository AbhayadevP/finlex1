// src/server/src/routes/expenses.ts
import { Router } from "express";
import { pool } from "../db";

const router = Router();

// GET /api/expenses
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, amount, description, category, date, type FROM expenses ORDER BY date DESC, id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load expenses" });
  }
});

// POST /api/expenses
router.post("/", async (req, res) => {
  const { amount, description, category, date, type } = req.body;

  if (
    amount === undefined ||
    !description ||
    !category ||
    !date
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO expenses (amount, description, category, date, type) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [amount, description, category, date, type || "manual"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save expense" });
  }
});

// DELETE /api/expenses/:id
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM expenses WHERE id = $1", [
      req.params.id,
    ]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

export default router;
