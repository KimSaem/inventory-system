import { createDB } from "../db/client.js";
import { getItems } from "../services/itemService.js";

export default {
  async fetch(req, env) {
    try {
      const db = createDB(env);

      const items = await getItems(db);

      return new Response(JSON.stringify(items), {
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
