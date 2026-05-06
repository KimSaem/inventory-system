import { createDB } from "../db/client.js";

export async function onRequest(context) {
  try {
    const { env, request } = context;

    if (!env.DB) {
      return Response.json({
        success: false,
        error: "DB_NOT_BOUND"
      });
    }

    const db = createDB(env);
    const body = await request.json();

    const stock_id = Number(body.stock_id);
    const qty = Number(body.qty);
    const type = body.type || "OUT";

    if (!stock_id || !qty || qty <= 0) {
      return Response.json({
        success: false,
        error: "INVALID_INPUT"
      }, { status: 400 });
    }

    // 1. stock 조회
    const itemRes = await db
      .prepare("SELECT * FROM stock WHERE id = ?")
      .bind(stock_id)
      .all();

    const item = itemRes?.results?.[0];

    if (!item) {
      return Response.json({
        success: false,
        error: "ITEM_NOT_FOUND"
      }, { status: 404 });
    }

    if (type === "OUT" && item.quantity < qty) {
      return Response.json({
        success: false,
        error: "NOT_ENOUGH_STOCK"
      }, { status: 400 });
    }

    // 2. 업데이트
    const newQty =
      type === "OUT"
        ? item.quantity - qty
        : item.quantity + qty;

    await db
      .prepare("UPDATE stock SET quantity = ? WHERE id = ?")
      .bind(newQty, stock_id)
      .run();

    // 3. transfer log
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

    // 4. stock_logs
    await db
      .prepare(
        `INSERT INTO stock_logs (stock_id, action, qty, note)
         VALUES (?, ?, ?, ?)`
      )
      .bind(stock_id, type, qty, `${type} transaction`)
      .run();

    return Response.json({
      success: true,
      data: {
        stock_id,
        newQty
      }
    });

  } catch (e) {
    return Response.json({
      success: false,
      error: e.message
    }, { status: 500 });
  }
}
