import { createDB } from "../db/client.js";

export async function onRequest(context) {

  const { env } = context;

  try {

    const db = createDB(env);

    // 1. 전체 재고 조회
    const res = await db
      .prepare(`SELECT * FROM stock`)
      .all();

    const items = res.results || [];

    let orders = {};

    // 2. AI 발주 계산
    for (const item of items) {

      const total =
        Number(item.home_qty || 0) +
        Number(item.store_qty || 0);

      const min = Number(item.min_stock || 15);

      let need = 0;

      // AI demand prediction 기반
      const usage = Number(item.daily_usage || 0);

      if (total <= min) {
        need = (min - total) + Math.ceil(usage * 0.5);
      }

      if (need <= 0) continue;

      if (!orders[item.supplier]) {
        orders[item.supplier] = [];
      }

      orders[item.supplier].push({
        id: item.id,
        name: item.name,
        qty: need,
        category: item.category
      });
    }

    // 3. log 저장
    await db
      .prepare(`
        INSERT INTO stock_logs (
          stock_id,
          action,
          qty,
          note
        )
        VALUES (0, ?, ?, ?)
      `)
      .bind(
        "AUTO_ORDER",
        Object.keys(orders).length,
        "AI auto order generated"
      )
      .run();

    return Response.json({
      success: true,
      orders
    });

  } catch (e) {

    return Response.json({
      success: false,
      error: e.message
    }, { status: 500 });
  }
}
