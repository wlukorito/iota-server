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
  id: number;
  name: string;
  location: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
}

export type Status = "Ordered" | "Awaiting Shipment" | "Shipped" | "Delivered";

export interface Supplies {
  id: string;
  supplyChainItemId: string;
  quantity: number;
  warehouse: Warehouse;
  courier: Courier;
  destination: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  shippedOn: Date;
  deliveryDate: Date;
  status: Status;
}
