import { createDB } from "../db/client.js";
import { transferStock } from "../services/inventoryService.js";

export default {
  async fetch(req, env) {
    try {
      const db = createDB(env);
      const body = await req.json();

      const result = await transferStock(
        db,
        body.item_id,
        body.qty
      );

      return new Response(JSON.stringify(result));
    } catch (e) {
      return new Response(
        JSON.stringify({ error: e.message }),
        { status: 400 }
      );
    }
  }
};
