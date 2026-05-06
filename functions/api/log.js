import { createDB } from "../db/client.js";
import { getLogs } from "../services/logService.js";

export async function onRequest(context) {
  try {
    const db = createDB(context.env);

    const logs = await getLogs(db);

    return Response.json({
      success: true,
      data: logs
    });

  } catch (e) {
    return Response.json({
      success: false,
      error: e.message
    }, { status: 500 });
  }
}
