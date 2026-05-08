import exportConfig from './configWrap';

interface DrizzleConfig {
  DB_URL: string;
}

const MONGO = exportConfig<DrizzleConfig>({
  default: {
    DB_URL: process.env.DB_URL || 'postgresql://financas:financas@localhost:5432/financas',
  },
});

export const { DB_URL } = MONGO;
