import exportConfig from './configWrap';

interface AuthConfig {
  WORK_FACTOR: number;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ISSUER: string;
  ACCESS_TOKEN_EXPIRATION: string;
  REFRESH_TOKEN_EXPIRATION: string;
  REFRESH_TOKEN_EXPIRATION_COOKIE: number;
  TOKEN_HTTPS_ONLY: boolean;
}

const AUTH = exportConfig<AuthConfig>({
  default: {
    WORK_FACTOR: 10,
    ACCESS_TOKEN_SECRET: 'this is a secret',
    REFRESH_TOKEN_SECRET: 'this is a refresh secret',
    ISSUER: 'financas',
    ACCESS_TOKEN_EXPIRATION: '1h',
    REFRESH_TOKEN_EXPIRATION: '1d',
    REFRESH_TOKEN_EXPIRATION_COOKIE: 24 * 60 * 60 * 1000,
    TOKEN_HTTPS_ONLY: true,
  },
  development: {
    TOKEN_HTTP_ONLY: false,
  },
});

export const {
  WORK_FACTOR,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ISSUER,
  ACCESS_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION,
  REFRESH_TOKEN_EXPIRATION_COOKIE,
  TOKEN_HTTPS_ONLY,
} = AUTH;
