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
      .prepare("SELECT * FROM stock WHERE id = ?")
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
    if (item.store_qty < qty) {
      return Response.json(
        { success: false, error: "NOT_ENOUGH_STORE_STOCK" },
        { status: 400 }
      );
    }

    const newStoreQty = item.store_qty - qty;

    // 3. 재고 업데이트
    await db
      .prepare(`
        UPDATE stock
        SET store_qty = ?
        WHERE id = ?
      `)
      .bind(newStoreQty, stock_id)
      .run();

    // 4. 주문 기록
    await db
      .prepare(`
        INSERT INTO orders (
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
        qty * Number(item.price || 0)
      )
      .run();

    // 5. 로그 기록
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
        "ORDER",
        qty,
        "Store sale order processed"
      )
      .run();

    return Response.json({
      success: true,
      data: {
        stock_id,
        sold_qty: qty,
        remaining_store_qty: newStoreQty
      }
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
