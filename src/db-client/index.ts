import fs from "fs/promises";

export async function readDB() {
  const data = await fs.readFile(process.cwd() + "/data/db.json");
  return JSON.parse(data.toString());
}
