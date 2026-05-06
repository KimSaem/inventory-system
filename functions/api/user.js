import { createDB } from "../db/client.js";

export async function onRequest(context) {
  try {
    const { env } = context;

    if (!env.DB) {
      return Response.json({
        success: false,
        error: "DB_NOT_BOUND"
      });
    }

    const db = createDB(env);

    const res = await db
      .prepare("SELECT * FROM users ORDER BY id DESC")
      .all();

    return Response.json({
      success: true,
      data: res?.results ?? []
    });

  } catch (e) {
    return Response.json({
      success: false,
      error: e.message
    }, { status: 500 });
  }
}
