import { createDB } from "../db/client.js";
import { transferStock } from "../services/inventoryService.js";

export async function onRequest(context) {
  try {
    const db = createDB(context.env);
    const body = await context.request.json();

    const result = await transferStock(
      db,
      Number(body.stock_id),
      Number(body.qty),
      body.from,
      body.to
    );

    return Response.json(result);

  } catch (e) {
    return Response.json({
      success: false,
      error: e.message
    }, { status: 400 });
  }
}
