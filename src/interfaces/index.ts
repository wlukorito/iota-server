import * as Zod from "zod";

export const supplyChainItemSchema = Zod.object({
  id: Zod.string().uuid(),
  name: Zod.string(),
  color: Zod.string(),
  price: Zod.number(),
});

export type SupplyChainItem = Zod.infer<typeof supplyChainItemSchema>;

export interface Inventory {
  id: string;
  supplyChainItemId: string;
  quantity: number;
}

const courierSchema = Zod.object({
  id: Zod.string().uuid(),
  name: Zod.string(),
  location: Zod.string(),
});

export type Courier = Zod.infer<typeof courierSchema>;

const warehouseSchema = Zod.object({
  id: Zod.string().uuid(),
  name: Zod.string(),
  location: Zod.string(),
});

export type Warehouse = Zod.infer<typeof warehouseSchema>;

export type Status = "Ordered" | "Awaiting Shipment" | "Shipped" | "Delivered";

export type Movement = "Inbound" | "Outbound";

const supplierSchema = Zod.object({
  id: Zod.string().uuid(),
  name: Zod.string(),
});

export type Supplier = Zod.infer<typeof supplierSchema>;

const suppliesBaseSchema = Zod.object({
  id: Zod.string().uuid(),
  supplyChainItemId: Zod.string().uuid(),
  quantity: Zod.string().transform((str) => parseInt(str, 10)),
  price: Zod.string().transform((str) => parseInt(str, 10)),
  status: Zod.union([
    Zod.literal("Ordered"),
    Zod.literal("Awaiting Shipment"),
    Zod.literal("Shipped"),
    Zod.literal("Delivered"),
  ]),
  movement: Zod.union([Zod.literal("Inbound"), Zod.literal("Outbound")]),
  destination: Zod.string(),
  orderDate: Zod.string().transform((str) => new Date(str)),
  expectedDeliveryDate: Zod.string().transform((str) => new Date(str)),
  shippedOn: Zod.string().transform((str) => new Date(str)),
  deliveryDate: Zod.string().transform((str) => new Date(str)),
});

type SuppliesBase = Zod.infer<typeof suppliesBaseSchema>;

export const suppliesExchangeSchema = suppliesBaseSchema.extend({
  warehouse: Zod.string().uuid(),
  courier: Zod.string().uuid(),
  supplier: Zod.string().uuid(),
});

export type SuppliesExchange = Zod.infer<typeof suppliesExchangeSchema>;

const suppliesResponseSchema = suppliesBaseSchema.extend({
  warehouse: warehouseSchema,
  courier: courierSchema,
  supplier: supplierSchema,
});

export type SuppliesResponse = Zod.infer<typeof suppliesResponseSchema>;

export interface Supplies extends SuppliesBase {}

export interface SupplyChain {
  items: SupplyChainItem[];
  inventory: Inventory[];
  couriers: Courier[];
  warehouses: Warehouse[];
  supplies: Supplies[];
  suppliers: Supplier[];
}

export type DbItemKey = keyof SupplyChain;
export type DbItem =
  | SupplyChainItem
  | Inventory
  | Courier
  | Warehouse
  | Supplies
  | Supplier;

type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
export type SupplyChainDbItem = PropType<SupplyChain, keyof SupplyChain>;

export type DbItemToUpdate = Partial<DbItem> & Pick<DbItem, "id">;
