import { createDB } from "../db/client.js";
import { getLogs } from "../services/logService.js";

export default {
  async fetch(req, env) {
    const db = createDB(env);

    const logs = await getLogs(db);

    return new Response(JSON.stringify(logs), {
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
