import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { readDB } from "./db-client";

dotenv.config();

const app: Express = express();
app.use(cors());

const port = process.env.PORT;

app.get("/", async (req: Request, res: Response) => {
  const data = await readDB();
  res.status(200).send(data);
});

app.listen(port, () => {
  console.log("Server started on port " + port);
});
