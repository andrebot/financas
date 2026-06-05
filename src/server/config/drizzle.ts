import exportConfig from './configWrap';

/* eslint-disable import/prefer-default-export */

interface DrizzleConfig {
  DB_URL: string;
}

const MONGO = exportConfig<DrizzleConfig>({
  default: {
    DB_URL: process.env.DB_URL || 'postgresql://financas:financas@localhost:5432/financas',
  },
});

export const { DB_URL } = MONGO;
