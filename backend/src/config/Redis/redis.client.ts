import Redis, { Redis as RedisClient, RedisOptions } from 'ioredis';
import { logger } from "../../utils/logger"

type Role = 'general' | 'pub' | 'sub';

let base: RedisClient | null = null;
let pub: RedisClient | null = null;
let sub: RedisClient | null = null;

function buildOptions(): RedisOptions {
  return {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: +(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,     
    enableReadyCheck: true,
    lazyConnect: false,             
  };
}

function wire(client: RedisClient, role: Role) {
  client.on('connect', () => logger.info(`[redis:${role}] connected`));
  client.on('ready',   () => logger.info(`[redis:${role}] ready`));
  client.on('end',     () => logger.warn(`[redis:${role}] disconnected`));
  client.on('error',   (e) => logger.error(`[redis:${role}] error: ${e?.message}`));
}

export function getRedis(): RedisClient {
  if (!base) {
    base = new Redis(buildOptions());
    wire(base, 'general');
  }
  return base;
}

export function getRedisPub(): RedisClient {
  if (!pub) {
    pub = getRedis().duplicate();
    wire(pub, 'pub');
  }
  return pub;
}

export function getRedisSub(): RedisClient {
  if (!sub) {
    sub = getRedis().duplicate();
    wire(sub, 'sub');
  }
  return sub;
}

// Fechamento gracioso ao parar o processo (PM2, systemd, etc.)
export async function closeRedis() {
  const tasks: Promise<unknown>[] = [];
  if (sub) { tasks.push(sub.quit()); sub = null; }
  if (pub) { tasks.push(pub.quit()); pub = null; }
  if (base){ tasks.push(base.quit()); base = null; }
  await Promise.all(tasks);
}

// Só prende sinais em produção (opcional)
if (process.env.NODE_ENV === 'production') {
  const shutdown = async () => {
    try {
      await closeRedis();
    } finally {
      process.exit(0);
    }
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
