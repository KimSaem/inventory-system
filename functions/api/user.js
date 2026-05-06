import { createDB } from "../db/client.js";

export default {
  async fetch(req, env) {
    const db = createDB(env);

    const users = await db
      .prepare("SELECT * FROM users")
      .all();

    return new Response(
      JSON.stringify(users.results ?? [])
    );
  }
};
