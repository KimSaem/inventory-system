import { createDB } from "../db/client.js";

export default {
  async fetch(req, env) {
    try {
      if (!env.DB) {
        throw new Error("DB_NOT_BOUND");
      }

      const db = createDB(env);

      const res = await db
        .prepare("SELECT * FROM users ORDER BY id DESC")
        .all();

      const users = res?.results ?? [];

      return new Response(
        JSON.stringify({
          success: true,
          data: users
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
