export function createDB(env){

  if(!env.DB){
    throw new Error("DB_NOT_BOUND");
  }

  return env.DB;
}
