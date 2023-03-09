import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { v4 as uuid } from "uuid";
import omit from "lodash/omit";

import { createDbItem, getSupplyChainDbItem, updateDbItem } from "./db-client";
import {
  SupplyChainItem,
  Supplies,
  Inventory,
  SupplyChain,
  Courier,
  Warehouse,
  Supplier,
  SuppliesExchange,
  SuppliesResponse,
  supplyChainItemSchema,
  suppliesExchangeSchema,
} from "./interfaces";
import { ZodError } from "zod";

dotenv.config();

const app: Express = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT;

app.post(
  "/items",
  async (
    req: Request<{}, {}, SupplyChainItem>,
    res: Response<SupplyChainItem | ZodError>
  ) => {
    const supplyChainItem = {
      ...req.body,
      id: uuid(),
    };

    const validation = supplyChainItemSchema.safeParse(supplyChainItem);
    if (!validation.success) {
      res.status(400).send(validation.error);
      return;
    }

    await createDbItem("items", supplyChainItem);

    res.status(200).send(supplyChainItem);
  }
);

app.post(
  "/events",
  async (
    req: Request<{}, {}, SuppliesExchange>,
    res: Response<SuppliesExchange | ZodError>
  ) => {
    const item = {
      ...req.body,
      id: uuid(),
    };

    const validation = suppliesExchangeSchema.safeParse(item);
    if (!validation.success) {
      res.status(400).send(validation.error);
      return;
    }

    const { movement, supplyChainItemId, quantity } = item;

    if (movement === "Outbound") {
      const inventory = await getSupplyChainDbItem<Inventory>("inventory");
      const found = inventory.find(
        (item) => item.supplyChainItemId === supplyChainItemId
      );
      if (!found || found.quantity < quantity) {
        res.status(500).send();
        return;
      }

      await updateDbItem<Inventory>("inventory", {
        ...found,
        quantity: found.quantity - quantity,
      });
    }

    await createDbItem("supplies", item);

    res.status(200).send(item);
  }
);

app.patch(
  "/items",
  async (
    req: Request<{}, {}, SupplyChainItem>,
    res: Response<SupplyChainItem | ZodError>
  ) => {
    const validation = supplyChainItemSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).send(validation.error);
      return;
    }

    const data = await updateDbItem<SupplyChainItem>("items", req.body);

    res.status(200).send(data);
  }
);

app.patch(
  "/events",
  async (
    req: Request<{}, {}, SuppliesExchange>,
    res: Response<SuppliesExchange | ZodError>
  ) => {
    const validation = suppliesExchangeSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).send(validation.error);
      return;
    }

    const data = await updateDbItem<SuppliesExchange>("supplies", req.body);

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

app.get("/events", async (_, res: Response<SuppliesResponse[]>) => {
  const exchangesPromise = getSupplyChainDbItem<SuppliesExchange>("supplies");
  const couriersPromise = getSupplyChainDbItem<Courier>("couriers");
  const warehousesPromise = getSupplyChainDbItem<Warehouse>("warehouses");
  const supliersPromise = getSupplyChainDbItem<Supplier>("suppliers");

  const [exchanges, couriers, warehouses, suppliers] = await Promise.all([
    exchangesPromise,
    couriersPromise,
    warehousesPromise,
    supliersPromise,
  ]);

  const response: SuppliesResponse[] = exchanges.map((exchange) => ({
    ...omit(exchange, ["courier", "warehouse", "supplier"]),
    courier: couriers.find((c) => c.id === exchange.courier)!!,
    warehouse: warehouses.find((w) => w.id === exchange.warehouse)!!,
    supplier: suppliers.find((s) => s.id === exchange.supplier)!!,
  }));

  res.status(200).send(response);
});

app.get("/lists", async (_, res: Response<Partial<SupplyChain>>) => {
  const p1 = getSupplyChainDbItem<Courier>("couriers");
  const p2 = getSupplyChainDbItem<Warehouse>("warehouses");
  const p3 = getSupplyChainDbItem<Supplier>("suppliers");
  const p4 = getSupplyChainDbItem<SupplyChainItem>("items");

  const result = await Promise.all([p1, p2, p3, p4]);

  const response: Partial<SupplyChain> = {
    couriers: result[0],
    warehouses: result[1],
    suppliers: result[2],
    items: result[3],
  };

  res.status(200).send(response);
});

app.listen(port, () => {
  console.log("Server started on port " + port);
});
