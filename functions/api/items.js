import { createDB } from "../db/client.js";

export async function onRequest(context) {
  const { request, env } = context;

  try {
    const db = createDB(env);
    const method = request.method;
    const body = await request.json().catch(() => ({}));

    // ======================
    // CREATE ITEM
    // ======================
    if (method === "POST") {

      await db.prepare(`
        INSERT INTO stock (
          name,
          home_qty,
          store_qty,
          supplier,
          category,
          price,
          options,
          min_stock,
          ai_enabled
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        body.name,
        body.home_qty || 0,
        body.store_qty || 0,
        body.supplier || "미지정",
        body.category || "SUSHI",
        body.price || 5,
        JSON.stringify(body.options || []),
        body.min_stock || 15,
        body.ai_enabled ? 1 : 0
      )
      .run();

      return Response.json({ success: true });
    }

    // ======================
    // DELETE ITEM
    // ======================
    if (method === "DELETE") {

      await db.prepare(`
        DELETE FROM stock
        WHERE id = ?
      `)
      .bind(body.id)
      .run();

      return Response.json({ success: true });
    }

    return Response.json({
      success: false,
      error: "INVALID_METHOD"
    });

  } catch (e) {
    return Response.json({
      success: false,
      error: e.message
    }, { status: 500 });
  }
}
