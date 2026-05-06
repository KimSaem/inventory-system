import { createDB } from "../db/client.js";

export default {
  async fetch(req, env) {
    try {
      // ─────────────────────────────
      // 1. DB 연결 체크 (필수 방어)
      // ─────────────────────────────
      if (!env.DB) {
        throw new Error("D1_DB_NOT_BOUND");
      }

      const db = createDB(env);

      // ─────────────────────────────
      // 2. 데이터 조회
      // ─────────────────────────────
      const res = await db
        .prepare("SELECT * FROM items ORDER BY id DESC")
        .all();

      // ─────────────────────────────
      // 3. 결과 안전 처리 (핵심)
      // D1은 results 구조 / 배열 구조 둘 다 가능
      // ─────────────────────────────
      const items = res?.results ?? res ?? [];

      // ─────────────────────────────
      // 4. 정상 응답
      // ─────────────────────────────
      return new Response(JSON.stringify(items), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      });

    } catch (e) {
      // ─────────────────────────────
      // 5. 에러도 JSON 유지 (HTML 방지 핵심)
      // ─────────────────────────────
      return new Response(
        JSON.stringify({
          success: false,
          error: e.message,
          hint: "check D1 binding or table schema"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
  }
};
