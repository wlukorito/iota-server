import fs from "fs/promises";
import {
  DbItemKey,
  SupplyChain,
  DbItem,
  SupplyChainDbItem,
  DbItemToUpdate,
} from "../interfaces";

const dbPath = process.cwd() + "/data/db.json";

export async function readDB(): Promise<SupplyChain> {
  const data = await fs.readFile(dbPath);
  return JSON.parse(data.toString()) as SupplyChain;
}

export async function writeDB(data: SupplyChain) {
  const dataToWrite = JSON.stringify(data);
  await fs.writeFile(dbPath, dataToWrite);
}

export async function createDbItem(dbItemKey: DbItemKey, data: DbItem) {
  const supplyChainData: SupplyChain = await readDB();
  const targetItemsList: SupplyChainDbItem = supplyChainData[dbItemKey];
  const newList: DbItem[] = [...targetItemsList, data];
  const newDbData: SupplyChain = { ...supplyChainData, [dbItemKey]: newList };

  await writeDB(newDbData);
}

export async function updateDbItem<Titem>(
  dbItemKey: DbItemKey,
  updatedData: DbItemToUpdate
): Promise<Titem> {
  const supplyChainData: SupplyChain = await readDB();
  const targetItemsList: SupplyChainDbItem = supplyChainData[dbItemKey];

  let updatedItem = {};
  const newList = targetItemsList.map((item) => {
    if (item.id === updatedData.id) {
      updatedItem = {
        ...item,
        ...updatedData,
      };

      return updatedItem;
    }

    return item;
  });

  const newDbData: SupplyChain = { ...supplyChainData, [dbItemKey]: newList };

  await writeDB(newDbData);
  return updatedItem as Titem;
}

export async function getSupplyChainDbItem<TItem>(
  dbItemKey: DbItemKey
): Promise<TItem[]> {
  const supplyChainData: SupplyChain = await readDB();
  return supplyChainData[dbItemKey] as TItem[];
}
