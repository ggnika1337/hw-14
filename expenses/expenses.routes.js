#!/usr/bin/env node
// დაამატე შემდეგი ფუნქციონალი წინა ხარჯების დავალებას (დავალება 14):

// 1) შექმენი routes და გააერთიანე ყველა ხარჯი ამ routes-ში. შეგიძლიათ გამოიყენოთ როგორც layer based ასევე featured based არქიტექტურა.

// 2) დაამატე services ფაილი, სადაც დაწერ ყველა ლოგიკას.

// 3) შექმენი middleware და დაამატე ის delete route-ზე — თუ headers-ში აუცილებელი key არ არის მიწოდებული, დააბრუნე ერორი.

// 4) შექმენი middleware, რომელიც დაემატება create expense route-ს და შეამოწმებს, ყველა აუცილებელი ველი გადმოცემულია თუ არა; წინააღმდეგ შემთხვევაში, დააბრუნოს ერორი.

// 5) შექმენი /random-fact route, რომელიც აბრუნებს ნებისმიერ შემთხვევით ფაქტს. დაამატე middleware, რომელიც ამ route-ზე შემთხვევითად ნახევარ მოთხოვნას დაბლოკავს, ხოლო დანარჩენს გაუშვებს. დაბლოკავს იგულისმება რო ერორს დაუბრუნებს რენდომად

import express from "express";
import fs from "fs/promises";
const app = express();
const port = 3000;

app.use(express.json());

// GET EXPENSES
app.use("/expenses", async (req, res) => {
  try {
    const response = await fs.readFile("expenses.json", "utf8");
    const data = JSON.parse(response);

    // PAGINATION
    const page = Math.max(Number(req.query.page) || 1, 1);
    const take = Math.min(Number(req.query.take) || 10, 10);
    const result = data.slice((page - 1) * take, page * take);

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
app.delete("/expenses/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const secret = req.headers["secret"];
    const resp = await fs.readFile("expenses.json", "utf8");
    const data = JSON.parse(resp);
    const index = data.findIndex((expense) => expense.id === id);
    if (index === -1) {
      return res.status(404).json({ message: "expense not found" });
    }
    if (!secret || secret !== "secretkey") {
      return res.status(401).json({ message: "Permission denied" });
    }
    const deletedExpense = data.splice(index, 1);
    await fs.writeFile("expenses.json", JSON.stringify(data));
    res.json({ success: true, data: deletedExpense[0] });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// EDIT EXPENSE
app.patch("/expenses/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const secret = req.headers["secret"];
    const resp = await fs.readFile("expenses.json", "utf8");
    const data = JSON.parse(resp);
    const index = data.findIndex((expense) => expense.id === id);
    if (index === -1) {
      return res.status(404).json({ message: "expense not found" });
    }
    if (!secret || secret !== "secretkey") {
      return res.status(401).json({ message: "Permission denied" });
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
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
