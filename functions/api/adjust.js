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
    const home_qty = Number(body.home_qty);
    const store_qty = Number(body.store_qty);

    if (
      !stock_id ||
      home_qty < 0 ||
      store_qty < 0
    ) {
      return Response.json(
        { success: false, error: "INVALID_INPUT" },
        { status: 400 }
      );
    }

    // 1. 존재 확인
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

    // 2. 업데이트
    await db
      .prepare(`
        UPDATE stock
        SET home_qty = ?,
            store_qty = ?
        WHERE id = ?
      `)
      .bind(
        home_qty,
        store_qty,
        stock_id
      )
      .run();

    // 3. 로그 (차이 기반으로 기록)
    const total = home_qty + store_qty;

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
        "ADJUST",
        total,
        `Manual adjustment → home:${home_qty}, store:${store_qty}`
      )
      .run();

    return Response.json({
      success: true,
      data: {
        stock_id,
        home_qty,
        store_qty,
        total
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
