import { createDB } from "../db/client.js";

export async function onRequest(context) {

  const { env } = context;

  try {

    const db = createDB(env);

    const res = await db
      .prepare(`SELECT * FROM stock`)
      .all();

    const items = res.results || [];

    for (const item of items) {

      const usage = Number(item.daily_usage || 0);

      // 간단 ML (v1)
      const predicted =
        Math.ceil(usage * 1.3);

      const newMin =
        Math.max(10, predicted);

      await db
        .prepare(`
          UPDATE stock
          SET min_stock = ?
          WHERE id = ?
        `)
        .bind(newMin, item.id)
        .run();
    }

    return Response.json({
      success: true,
      message: "AI prediction updated"
    });

  } catch (e) {

    return Response.json({
      success: false,
      error: e.message
    }, { status: 500 });
  }
}
