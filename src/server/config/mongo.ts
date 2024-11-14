import exportConfig from './configWrap';

interface MongoConfig {
  DB_URL: string;
  MONGO_OPT?: Record<string, unknown>;
};

const MONGO = exportConfig<MongoConfig>({
  default: {
    DB_URL: process.env.DB_URL || 'mongodb://127.0.0.1:27017/financas',
  },
});

export const { DB_URL, MONGO_OPT } = MONGO;
