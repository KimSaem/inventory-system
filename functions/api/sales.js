import { createDB } from "../db/client.js";

export async function onRequest(context) {

  const { env, request } = context;

  try {

    if (!env.DB) {
      return Response.json({
        success: false,
        error: "DB_NOT_BOUND"
      }, { status: 500 });
    }

    const db = createDB(env);

    const body = await request.json();

    const items = body.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({
        success: false,
        error: "EMPTY_CART"
      }, { status: 400 });
    }

    let totalAmount = 0;
    let salesResults = [];

    // =========================
    // 1. LOOP ITEMS (POS CART)
    // =========================
    for (const cartItem of items) {

      const stock_id = Number(cartItem.id);
      const qty = Number(cartItem.qty || 1);

      if (!stock_id || qty <= 0) continue;

      // =========================
      // 2. GET ITEM
      // =========================
      const itemRes = await db
        .prepare(`
          SELECT *
          FROM stock
          WHERE id = ?
        `)
        .bind(stock_id)
        .all();

      const item = itemRes?.results?.[0];

      if (!item) continue;

      // =========================
      // 3. CHECK STOCK
      // =========================
      if (Number(item.store_qty) < qty) {
        return Response.json({
          success: false,
          error: `NOT_ENOUGH_STOCK: ${item.name}`
        }, { status: 400 });
      }

      const newStoreQty = Number(item.store_qty) - qty;

      const totalPrice = qty * Number(item.price || 0);

      totalAmount += totalPrice;

      // =========================
      // 4. UPDATE STOCK
      // =========================
      await db
        .prepare(`
          UPDATE stock
          SET store_qty = ?
          WHERE id = ?
        `)
        .bind(newStoreQty, stock_id)
        .run();

      // =========================
      // 5. SALES TABLE
      // =========================
      await db
        .prepare(`
          INSERT INTO sales (
            stock_id,
            item_name,
            qty,
            total_price,
            created_at
          )
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `)
        .bind(
          stock_id,
          item.name,
          qty,
          totalPrice
        )
        .run();

      // =========================
      // 6. LOG TABLE
      // =========================
      await db
        .prepare(`
          INSERT INTO stock_logs (
            stock_id,
            action,
            qty,
            note
          )
          VALUES (?, ?, ?, ?)
        `)
        .bind(
          stock_id,
          "SALE",
          qty,
          "POS checkout"
        )
        .run();

      // =========================
      // 7. AI LEARNING FEED
      // =========================
      await db
        .prepare(`
          UPDATE stock
          SET daily_usage =
            COALESCE(daily_usage, 0) + ?
          WHERE id = ?
        `)
        .bind(qty, stock_id)
        .run();

      salesResults.push({
        item: item.name,
        qty,
        price: totalPrice
      });
    }

    // =========================
    // 8. AUTO AI TRIGGER HOOK
    // =========================
    // (추후 auto-order.js 연결 가능)

    return Response.json({
      success: true,
      data: {
        total_amount: totalAmount,
        items: salesResults
      }
    });

  } catch (e) {

    return Response.json({
      success: false,
      error: e.message || "SERVER_ERROR"
    }, { status: 500 });
  }
}
