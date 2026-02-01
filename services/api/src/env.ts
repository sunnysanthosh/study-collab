import { cleanEnv, str, num, bool } from 'envalid';

const defaults = {
  JWT_SECRET: 'your-secret-key-change-in-production',
  JWT_REFRESH_SECRET: 'your-refresh-secret-key',
};

const raw = cleanEnv(process.env, {
  NODE_ENV: str({ default: 'development', choices: ['development', 'test', 'production', 'demo'] }),
  PORT: num({ default: 3001 }),
  DATABASE_URL: str({
    default: 'postgresql://studycollab:studycollab@localhost:5432/studycollab',
    desc: 'PostgreSQL connection string',
  }),
  JWT_SECRET: str({
    default: defaults.JWT_SECRET,
    desc: 'Secret for JWT access tokens; must be set in production',
  }),
  JWT_REFRESH_SECRET: str({
    default: defaults.JWT_REFRESH_SECRET,
    desc: 'Secret for JWT refresh tokens; must be set in production',
  }),
  FRONTEND_URL: str({ default: 'http://localhost:3000', desc: 'Allowed CORS origin' }),
  REDIS_URL: str({ default: '', desc: 'Redis URL for broker and CSRF; optional' }),
  DISABLE_CSRF: bool({ default: false }),
  DISABLE_RATE_LIMIT: bool({ default: false }),
  DISABLE_INPUT_SANITIZATION: bool({ default: false }),
  DEMO_MODE: bool({ default: false }),
  LOG_LEVEL: str({ default: '', choices: ['', 'error', 'warn', 'info', 'http', 'debug'] }),
  LOG_TO_FILE: bool({ default: false }),
  TEST_DATABASE_URL: str({ default: '' }),
});

if (raw.NODE_ENV === 'production') {
  if (!raw.JWT_SECRET || raw.JWT_SECRET === defaults.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set to a secure value in production');
  }
  if (!raw.JWT_REFRESH_SECRET || raw.JWT_REFRESH_SECRET === defaults.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET must be set to a secure value in production');
  }
}

export const env = {
  ...raw,
  REDIS_URL: raw.REDIS_URL || undefined,
  LOG_LEVEL: raw.LOG_LEVEL || undefined,
  TEST_DATABASE_URL: raw.TEST_DATABASE_URL || undefined,
};
