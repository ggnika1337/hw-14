import express from "express";
import { expensesRouter } from "./expenses/expenses.controller.js";
const app = express();
const port = 3000;

app.use(express.json());

app.use("/expenses", expensesRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
