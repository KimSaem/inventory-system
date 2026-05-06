import { createDB } from "../db/client.js";

export default {
  async fetch(req, env) {
    try {
      if (!env.DB) {
        throw new Error("DB_NOT_BOUND");
      }

      const db = createDB(env);
      const method = req.method;

      // =========================
      // 1. CREATE (상품 + 재고 생성)
      // =========================
      if (method === "POST") {
        const body = await req.json();

        const name = body.name;
        const quantity = Number(body.quantity || 0);
        const location = body.location || "store";

        if (!name) {
          throw new Error("NAME_REQUIRED");
        }

        // stock 생성 (ERP 기준)
        await db
          .prepare(
            `INSERT INTO stock (name, quantity, location)
             VALUES (?, ?, ?)`
          )
          .bind(name, quantity, location)
          .run();

        return new Response(
          JSON.stringify({
            success: true,
            message: "ITEM_CREATED"
          })
        );
      }

      // =========================
      // 2. DELETE (재고 삭제)
      // =========================
      if (method === "DELETE") {
        const body = await req.json();

        const id = Number(body.id);

        if (!id) {
          throw new Error("ID_REQUIRED");
        }

        await db
          .prepare("DELETE FROM stock WHERE id = ?")
          .bind(id)
          .run();

        return new Response(
          JSON.stringify({
            success: true,
            message: "ITEM_DELETED"
          })
        );
      }

      // =========================
      // 3. GET (전체 목록)
      // =========================
      const res = await db
        .prepare("SELECT * FROM stock ORDER BY id DESC")
        .all();

      return new Response(
        JSON.stringify({
          success: true,
          data: res?.results ?? []
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
        { status: 400 }
      );
    }
  }
};
