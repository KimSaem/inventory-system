export async function onRequest(context) {
  return Response.json({
    success: false,
    error: "DEPRECATED_USE_SALES_API"
  });
}
