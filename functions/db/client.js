export function createDB(env) {
  return {
    db: env.DB,

    async all(query, params = []) {
      return await this.db.prepare(query).bind(...params).all();
    },

    async get(query, params = []) {
      return await this.db.prepare(query).bind(...params).first();
    },

    async run(query, params = []) {
      return await this.db.prepare(query).bind(...params).run();
    }
  };
}
