import fs from "fs/promises";

export async function getExpenses(query) {
  const response = await fs.readFile("expenses.json", "utf8");
  const data = JSON.parse(response);

  // PAGINATION
  const page = Math.max(Number(query.page) || 1, 1);
  const take = Math.min(Number(query.take) || 10, 10);

  return data.slice((page - 1) * take, page * take);
}
