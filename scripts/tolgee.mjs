// Runs the Tolgee CLI with the credentials from .env (VITE_APP_TOLGEE_API_URL / VITE_APP_TOLGEE_API_KEY).
// Usage: npm run i18n:push | npm run i18n:pull, or `node scripts/tolgee.mjs <tolgee args>`.
import { spawnSync } from 'node:child_process';
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), 'VITE_APP_TOLGEE_');
const args = process.argv.slice(2);
if (env.VITE_APP_TOLGEE_API_URL) args.push('--api-url', env.VITE_APP_TOLGEE_API_URL);

const { status } = spawnSync('tolgee', args, {
    stdio: 'inherit',
    env: { ...process.env, TOLGEE_API_KEY: process.env.TOLGEE_API_KEY || env.VITE_APP_TOLGEE_API_KEY }
});
process.exit(status ?? 1);
