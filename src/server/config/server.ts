import exportConfig from './configWrap';

interface ServerConfig {
  PORT: number;
  API_PREFIX: string;
}

const SERVER = exportConfig<ServerConfig>({
  default: {
    PORT: process.env.PORT || 3000,
    API_PREFIX: '/api/v1',
  },
});

export const { PORT, API_PREFIX } = SERVER;
