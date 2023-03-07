import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { v4 as uuid } from "uuid";

import { createDbItem, getSupplyChainDbItem, updateDbItem } from "./db-client";
import {
  SupplyChainItem,
  Supplies,
  Inventory,
  SupplyChain,
  Courier,
  Warehouse,
  Supplier,
} from "./interfaces";

dotenv.config();

const app: Express = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT;

app.post(
  "/items",
  async (
    req: Request<{}, {}, SupplyChainItem>,
    res: Response<SupplyChainItem>
  ) => {
    const supplyChainItem = {
      ...req.body,
      id: uuid(),
    };

    const data = await createDbItem("items", supplyChainItem);

    res.status(200).send(supplyChainItem);
  }
);

app.post(
  "/events",
  async (req: Request<{}, {}, Supplies>, res: Response<Supplies>) => {
    const { movement, supplyChainItemId, quantity } = req.body;
    if (movement === "Outbound") {
      const inventory = await getSupplyChainDbItem<Inventory>("inventory");
      const found = inventory.find((item) => item.id === supplyChainItemId);
      if (!found || found.quantity < quantity) {
        res.status(500).send();
        return;
      }

      await updateDbItem<Inventory>("inventory", {
        ...found,
        quantity: found.quantity - quantity,
      });
    }

    const item = {
      ...req.body,
      id: uuid(),
    };

    await createDbItem("supplies", item);

    res.status(200).send(item);
  }
);

app.patch(
  "/items",
  async (
    req: Request<{}, {}, SupplyChainItem>,
    res: Response<SupplyChainItem>
  ) => {
    if (!req.body.id) {
      res.status(400).send();
      return;
    }

    const data = await updateDbItem<SupplyChainItem>("items", req.body);

    res.status(200).send(data);
  }
);

app.patch(
  "/events",
  async (req: Request<{}, {}, Supplies>, res: Response<Supplies>) => {
    if (!req.body.id) {
      res.status(400).send();
      return;
    }

    const data = await updateDbItem<Supplies>("supplies", req.body);

    const { status, movement, supplyChainItemId, quantity } = data;

    if (status === "Delivered" && movement === "Inbound") {
      const inventory = await getSupplyChainDbItem<Inventory>("inventory");
      const found = inventory.find((item) => item.id === supplyChainItemId);

      if (!found) {
        await createDbItem("inventory", {
          id: uuid(),
          supplyChainItemId,
          quantity,
        });
      } else {
        await updateDbItem<Inventory>("inventory", {
          ...found,
          quantity: quantity + found.quantity,
        });
      }
    }

    res.status(200).send(data);
  }
);

app.get("/items", async (_, res: Response<SupplyChainItem[]>) => {
  const items = await getSupplyChainDbItem<SupplyChainItem>("items");

  res.status(200).send(items);
});

app.get("/lists", async (_, res: Response<Partial<SupplyChain>>) => {
  const p1 = getSupplyChainDbItem<Courier>("couriers");
  const p2 = getSupplyChainDbItem<Warehouse>("warehouses");
  const p3 = getSupplyChainDbItem<Supplier>("suppliers");

  const result = await Promise.all([p1, p2, p3]);

  const response: Partial<SupplyChain> = {
    couriers: result[0],
    warehouses: result[1],
    suppliers: result[2],
  };

  res.status(200).send(response);
});

app.listen(port, () => {
  console.log("Server started on port " + port);
});
