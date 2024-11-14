import exportConfig from './configWrap';

interface ServerConfig {
  PORT: number;
}

const SERVER = exportConfig<ServerConfig>({
  default: {
    PORT: process.env.PORT || 3000,
  },
});

export const { PORT } = SERVER;
