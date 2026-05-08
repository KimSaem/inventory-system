import { createDB } from "../db/client.js";

export async function onRequest(context) {

  try {

    const { env, request } = context;

    if (!env.DB) {
      return Response.json({
        success: false,
        error: "DB_NOT_BOUND"
      }, {
        status: 500
      });
    }

    const db = createDB(env);

    const body = await request.json();

    const stock_id =
      Number(body.stock_id);

    const home_qty =
      Number(body.home_qty);

    const store_qty =
      Number(body.store_qty);

    // 유효성 검사
    if (
      !stock_id ||
      home_qty < 0 ||
      store_qty < 0
    ) {
      return Response.json({
        success: false,
        error: "INVALID_INPUT"
      }, {
        status: 400
      });
    }

    // 상품 존재 확인
    const itemRes = await db
      .prepare(`
        SELECT *
        FROM stock
        WHERE id = ?
      `)
      .bind(stock_id)
      .all();

    const item =
      itemRes?.results?.[0];

    if (!item) {
      return Response.json({
        success: false,
        error: "ITEM_NOT_FOUND"
      }, {
        status: 404
      });
    }

    // 재고 수정
    await db
      .prepare(`
        UPDATE stock
        SET
          home_qty = ?,
          store_qty = ?
        WHERE id = ?
      `)
      .bind(
        home_qty,
        store_qty,
        stock_id
      )
      .run();

    // 로그 기록
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
        home_qty + store_qty,
        "Manual stock adjustment"
      )
      .run();

    return Response.json({
      success: true
    });

  } catch (e) {

    return Response.json({
      success: false,
      error: e.message
    }, {
      status: 500
    });
  }
}
