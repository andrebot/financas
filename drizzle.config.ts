import { defineConfig } from 'drizzle-kit';
import { DB_URL } from './src/server/config/drizzle';

export default defineConfig({
  out: './src/server/migrations/drizzle',
  schema: './src/server/resources/models',
  dialect: 'postgresql',
  dbCredentials: {
    url: DB_URL,
  },
});
