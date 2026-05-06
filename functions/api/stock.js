export default {
  async fetch(req, env) {
    return new Response(
      JSON.stringify({
        db: !!env.DB,
        keys: Object.keys(env || {})
      })
    );
  }
};
