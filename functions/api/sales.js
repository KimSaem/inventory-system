import { createDB } from "../db/client.js";

export async function onRequest(context) {
  const { env, request } = context;

  try {
    if (!env.DB) {
      return Response.json(
        { success: false, error: "DB_NOT_BOUND" },
        { status: 500 }
      );
    }

    const db = createDB(env);

    const method = request.method;

    // =========================
    // 📦 SALES CREATE (판매 실행)
    // =========================
    if (method === "POST") {
      const body = await request.json();

      const stock_id = Number(body.stock_id);
      const qty = Number(body.qty);

      if (!stock_id || !qty || qty <= 0) {
        return Response.json(
          { success: false, error: "INVALID_INPUT" },
          { status: 400 }
        );
      }

      // 1. 상품 조회
      const itemRes = await db
        .prepare(`SELECT * FROM stock WHERE id = ?`)
        .bind(stock_id)
        .all();

      const item = itemRes?.results?.[0];

      if (!item) {
        return Response.json(
          { success: false, error: "ITEM_NOT_FOUND" },
          { status: 404 }
        );
      }

      // 2. 재고 체크
      const currentStock = Number(item.store_qty || 0);

      if (currentStock < qty) {
        return Response.json(
          { success: false, error: "NOT_ENOUGH_STOCK" },
          { status: 400 }
        );
      }

      const newStock = currentStock - qty;
      const totalPrice = qty * Number(item.price || 0);

      // =========================
      // 3. 트랜잭션 시작
      // =========================

      await db
        .prepare(`
          UPDATE stock
          SET store_qty = ?
          WHERE id = ?
        `)
        .bind(newStock, stock_id)
        .run();

      // =========================
      // 4. SALES 기록 (핵심)
      // =========================
      await db
        .prepare(`
          INSERT INTO sales (
            stock_id,
            item_name,
            qty,
            price,
            total_price,
            created_at
          )
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `)
        .bind(
          stock_id,
          item.name,
          qty,
          Number(item.price || 0),
          totalPrice
        )
        .run();

      // =========================
      // 5. STOCK LOG
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
          `Sold from POS (${item.name})`
        )
        .run();

      return Response.json({
        success: true,
        data: {
          stock_id,
          sold_qty: qty,
          remaining_stock: newStock,
          total_price: totalPrice
        }
      });
    }

    // =========================
    // 📊 SALES LIST (조회)
    // =========================
    if (method === "GET") {
      const res = await db
        .prepare(`
          SELECT *
          FROM sales
          ORDER BY id DESC
          LIMIT 100
        `)
        .all();

      return Response.json({
        success: true,
        data: res.results || []
      });
    }

    return Response.json({
      success: false,
      error: "METHOD_NOT_ALLOWED"
    });

  } catch (e) {
    return Response.json(
      {
        success: false,
        error: e.message || "SERVER_ERROR"
      },
      { status: 500 }
    );
  }
}
