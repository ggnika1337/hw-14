import fs from "fs/promises";

export async function getExpenses(query) {
  const response = await fs.readFile("expenses.json", "utf8");
  const data = JSON.parse(response);

  // PAGINATION
  const page = Math.max(Number(query.page) || 1, 1);
  const take = Math.min(Number(query.take) || 10, 10);

  return data.slice((page - 1) * take, page * take);
}

export async function postExpense(body) {
  let resp = await fs.readFile("expenses.json", "utf8");
  let expenses = await JSON.parse(resp);
  let lastId = expenses[expenses.length - 1]?.id || 0;
  let newExpense = {
    id: lastId + 1,
    name: body.name,
    price: body.price,
    creationDate: new Date().toISOString().split("T")[0],
  };

  expenses.push(newExpense);

  await fs.writeFile("expenses.json", JSON.stringify(expenses));
  return newExpense;
}

export async function deleteExpense(params) {
  const id = Number(params.id);
  const resp = await fs.readFile("expenses.json", "utf8");
  const data = JSON.parse(resp);
  const index = data.findIndex((expense) => expense.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "expense not found" });
  }
  const deletedExpense = data.splice(index, 1);
  await fs.writeFile("expenses.json", JSON.stringify(data));
  return deleteExpense;
}

export async function editExpense(params, body) {
  const id = Number(params.id);
  const resp = await fs.readFile("expenses.json", "utf8");
  const data = JSON.parse(resp);
  const index = data.findIndex((expense) => expense.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "expense not found" });
  }

  data[index].name = body.name;
  data[index].price = body.price;

  await fs.writeFile("expenses.json", JSON.stringify(data, null, 2));
  return data[index];
}
