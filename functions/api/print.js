export async function onRequest(context) {

  const body = await context.request.json();

  console.log("PRINT RECEIPT:", body);

  // 실제 프린터 연결은 나중에 ESC/POS SDK 붙임

  return Response.json({
    success: true
  });
}
