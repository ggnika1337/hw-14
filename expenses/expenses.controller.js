#!/usr/bin/env node

import fs from "fs/promises";
import secretkeyMiddleware from "../middlewares/secretkey.middleware.cjs";
import userSignedInMiddleware from "../middlewares/userSignedIn.middleware.cjs";
import { getExpenses } from "./expenses.service";
export const app = express();
const port = 3000;

app.use(express.json());

// GET EXPENSES
app.get("/expenses", userSignedInMiddleware(), async (req, res) => {
  try {
    let result = await getExpenses(req.query);
    res.json(result);
  } catch (err) {
    res.status(500).send("Error reading file");
  }
});

// ADD NEW EXPENSE
app.post("/expenses", async (req, res) => {
  try {
    if (!req.body?.name || !req.body?.price) {
      return res.status(400).json({ message: "fields are empty" });
    }
    let resp = await fs.readFile("expenses.json", "utf8");
    let expenses = await JSON.parse(resp);
    let lastId = expenses[expenses.length - 1]?.id || 0;
    let newExpense = {
      id: lastId + 1,
      name: req.body.name,
      price: req.body.price,
      creationDate: new Date().toISOString().split("T")[0],
    };

    expenses.push(newExpense);

    await fs.writeFile("expenses.json", JSON.stringify(expenses));

    res.status(201).json({ success: true, data: newExpense });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE EXPENSE
app.delete(
  "/expenses/:id",
  secretkeyMiddleware(["secretkeyone", "secretkeytwo"]),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      const resp = await fs.readFile("expenses.json", "utf8");
      const data = JSON.parse(resp);
      const index = data.findIndex((expense) => expense.id === id);
      if (index === -1) {
        return res.status(404).json({ message: "expense not found" });
      }

      const deletedExpense = data.splice(index, 1);
      await fs.writeFile("expenses.json", JSON.stringify(data));
      res.json({ success: true, data: deletedExpense[0] });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
    }
  },
);

// EDIT EXPENSE
app.patch(
  "/expenses/:id",
  secretkeyMiddleware(["secretkeyone", "secretkeytwo"]),
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const resp = await fs.readFile("expenses.json", "utf8");
      const data = JSON.parse(resp);
      const index = data.findIndex((expense) => expense.id === id);
      if (index === -1) {
        return res.status(404).json({ message: "expense not found" });
      }

      if (!req.body?.name || req.body?.price === undefined) {
        return res.status(400).json({ message: "fields are empty" });
      }

      data[index].name = req.body.name;
      data[index].price = req.body.price;

      await fs.writeFile("expenses.json", JSON.stringify(data, null, 2));

      res.status(200).json({ message: "Edit Completed" });
    } catch (error) {
      res.status(500).json({ message: "Server Error" });
      console.log(error);
    }
  },
);
