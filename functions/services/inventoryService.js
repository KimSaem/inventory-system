import { insertLog } from "./logService.js";

export async function transferStock(db, itemId, qty) {
  const item = await db.get(
    `SELECT * FROM items WHERE id = ?`,
    [itemId]
  );

  if (!item) {
    throw new Error("ITEM_NOT_FOUND");
  }

  if (qty <= 0) {
    throw new Error("INVALID_QTY");
  }

  // 안전 로직
  if (item.home_qty < qty) {
    throw new Error("NOT_ENOUGH_STOCK");
  }

  const newHome = item.home_qty - qty;
  const newStore = item.store_qty + qty;

  await db.run(
    `UPDATE items
     SET home_qty = ?, store_qty = ?
     WHERE id = ?`,
    [newHome, newStore, itemId]
  );

  await insertLog(db, {
    item_id: itemId,
    from: "home",
    to: "store",
    qty
  });

  return { success: true };
}
