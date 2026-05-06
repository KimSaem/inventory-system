import { insertLog } from "./logService.js";
import { getStockById, updateStockQty } from "./stockService.js";

export async function transferStock(db, stock_id, qty, from, to) {
  if (!stock_id || !qty || qty <= 0) {
    throw new Error("INVALID_INPUT");
  }

  const item = await getStockById(db, stock_id);

  if (!item) {
    throw new Error("ITEM_NOT_FOUND");
  }

  let home = Number(item.home_qty || 0);
  let store = Number(item.store_qty || 0);

  // =========================
  // ERP 로직 (집 ↔ 매장 이동)
  // =========================

  if (from === "home" && to === "store") {
    if (home < qty) throw new Error("NOT_ENOUGH_HOME_STOCK");

    home -= qty;
    store += qty;
  }

  if (from === "store" && to === "home") {
    if (store < qty) throw new Error("NOT_ENOUGH_STORE_STOCK");

    store -= qty;
    home += qty;
  }

  await updateStockQty(db, stock_id, home, store);

  await insertLog(db, {
    stock_id,
    action: "MOVE",
    qty,
    note: `${from} → ${to}`
  });

  await db
    .prepare(`
      INSERT INTO transfers (stock_id, qty, from_location, to_location, type)
      VALUES (?, ?, ?, ?, 'MOVE')
    `)
    .bind(stock_id, qty, from, to)
    .run();

  return {
    success: true,
    stock_id,
    home_qty: home,
    store_qty: store
  };
}
