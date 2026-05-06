import { createDB } from "../db/client.js";
import { getStock } from "../services/stockService.js";

export default {
  async fetch(req, env) {
    try {
      const db = createDB(env);

      const stock = await getStock(db);

      return new Response(JSON.stringify(stock), {
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (e) {
      return new Response(
        JSON.stringify({ error: e.message }),
        { status: 500 }
      );
    }
  }
};
