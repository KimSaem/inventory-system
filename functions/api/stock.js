import { createDB } from "../db/client.js";

export default {
  async fetch(req, env) {
    try {
      // 1. DB 연결 체크
      if (!env.DB) {
        throw new Error("D1_DB_NOT_BOUND");
      }

      const db = createDB(env);

      // 2. 데이터 조회
      const res = await db
        .prepare("SELECT * FROM items ORDER BY id DESC")
        .all();

      // 3. 결과 안전 처리
      const items = res?.results ?? [];

      // 4. JSON 응답 (핵심)
      return new Response(JSON.stringify(items), {
        headers: {
          "Content-Type": "application/json"
        }
      });

    } catch (e) {
      // 5. 에러도 JSON으로 (HTML 방지 핵심)
      return new Response(
        JSON.stringify({
          success: false,
          error: e.message
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
