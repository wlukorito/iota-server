export interface SupplyChainItem {
  id: string;
  name: string;
  color: string;
  price: number;
}

export interface Inventory {
  id: string;
  supplyChainItemId: string;
  quantity: number;
}

export interface Courier {
  id: string;
  name: string;
  location: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export type Status = "Ordered" | "Awaiting Shipment" | "Shipped" | "Delivered";

export type Movement = "Inbound" | "Outbound";

export interface Supplier {
  id: string;
  name: string;
}

export interface Supplies {
  id: string;
  supplyChainItemId: string;
  quantity: number;
  warehouse: Warehouse;
  status: Status;
  movement: Movement;
  courier: Courier;
  destination: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  shippedOn: Date;
  deliveryDate: Date;
  supplier: Supplier;
}

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
