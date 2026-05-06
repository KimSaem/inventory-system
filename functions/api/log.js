import { createDB } from "../db/client.js";

export default {
  async fetch(req, env) {
    try {
      if (!env.DB) {
        throw new Error("DB_NOT_BOUND");
      }

      const db = createDB(env);

      const res = await db
        .prepare(
          "SELECT * FROM stock_logs ORDER BY id DESC LIMIT 100"
        )
        .all();

      const logs = res?.results ?? [];

      return new Response(
        JSON.stringify({
          success: true,
          data: logs
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

    } catch (e) {
      return new Response(
        JSON.stringify({
          success: false,
          error: e.message
        }),
        { status: 500 }
      );
    }
  }
};
