import { createDB } from "../db/client.js";
import {
  createItem,
  deleteItem
} from "../services/itemService.js";

export default {
  async fetch(req, env) {
    const db = createDB(env);
    const method = req.method;

    try {
      const body = await req.json().catch(() => ({}));

      if (method === "POST") {
        await createItem(db, body);
      }

      if (method === "DELETE") {
        await deleteItem(db, body.id);
      }

      return new Response(JSON.stringify({ success: true }));
    } catch (e) {
      return new Response(
        JSON.stringify({ error: e.message }),
        { status: 400 }
      );
    }
  }
};
