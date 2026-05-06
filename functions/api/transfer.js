import { createDB } from "../db/client.js";

export default {
  async fetch(req, env) {
    try {
      if (!env.DB) {
        throw new Error("DB_NOT_BOUND");
      }

      const db = createDB(env);
      const body = await req.json();

      const stock_id = Number(body.stock_id);
      const qty = Number(body.qty);
      const type = body.type || "OUT";

      if (!stock_id || !qty || qty <= 0) {
        throw new Error("INVALID_INPUT");
      }

      // 1. 현재 재고 조회
      const itemRes = await db
        .prepare("SELECT * FROM stock WHERE id = ?")
        .bind(stock_id)
        .all();

      const item = itemRes?.results?.[0];

      if (!item) {
        throw new Error("ITEM_NOT_FOUND");
      }

      if (type === "OUT" && item.quantity < qty) {
        throw new Error("NOT_ENOUGH_STOCK");
      }

      // 2. 재고 업데이트
      const newQty =
        type === "OUT"
          ? item.quantity - qty
          : item.quantity + qty;

      await db
        .prepare("UPDATE stock SET quantity = ? WHERE id = ?")
        .bind(newQty, stock_id)
        .run();

      // 3. transfer 기록
      await db
        .prepare(
          `INSERT INTO transfers (stock_id, qty, type, from_location, to_location)
           VALUES (?, ?, ?, ?, ?)`
        )
        .bind(
          stock_id,
          qty,
          type,
          type === "OUT" ? "store" : "supplier",
          type === "OUT" ? "sold" : "store"
        )
        .run();

      // 4. log 기록
      await db
        .prepare(
          `INSERT INTO stock_logs (stock_id, action, qty, note)
           VALUES (?, ?, ?, ?)`
        )
        .bind(stock_id, type, qty, `${type} transaction`)
        .run();

      return new Response(
        JSON.stringify({
          success: true,
          stock_id,
          newQty
        })
      );

    } catch (e) {
      return new Response(
        JSON.stringify({
          success: false,
          error: e.message
        }),
        { status: 400 }
      );
    }
  }
};
