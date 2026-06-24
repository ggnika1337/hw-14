import { Router } from "express";
import {
  deleteExpense,
  editExpense,
  getExpenses,
  postExpense,
} from "./expenses.service.js";
import secretkeyMiddleware from "../middlewares/secretkey.middleware.cjs";
import checkRequestBodyMiddleware from "../middlewares/checkRequestBody.middleware.cjs";

export const expensesRouter = new Router();

// GET EXPENSES
expensesRouter.get("/", async (req, res) => {
  try {
    const result = await getExpenses(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).send("Error reading file");
  }
});

// ADD NEW EXPENSE
expensesRouter.post("/", checkRequestBodyMiddleware, async (req, res) => {
  try {
    let newExpense = await postExpense(req.body);

    res.status(201).json({ success: true, data: newExpense });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE EXPENSE
expensesRouter.delete(
  "/:id",
  secretkeyMiddleware(["secretkey"]),
  async (req, res) => {
    try {
      let deletedUser = await deleteExpense(req.params);
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server Error", data: deletedUser });
    }
  },
);

// EDIT EXPENSE
expensesRouter.patch(
  "/:id",
  secretkeyMiddleware(["secretkey"]),
  async (req, res) => {
    try {
      if (!req.body?.name || req.body?.price === undefined) {
        return res.status(400).json({ message: "fields are empty" });
      }

      let editedExpense = await editExpense(req.params, req.body);

      res.status(200).json({ message: "Edit Completed", data: editedExpense });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
      console.log(error);
    }
  },
);
