import { createDB } from "../db/client.js";
import { transferStock } from "../services/inventoryService.js";

export default {
  async fetch(req, env) {
    const db = createDB(env);

    try {
      const body = await req.json();

      const result = await transferStock(
        db,
        body.item_id,
        body.qty
      );

      return new Response(JSON.stringify(result));
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        { status: 400 }
      );
    }
  }
};
