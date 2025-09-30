/**
 * Redis client configuration
 * @author Eden Solutions <contact@eden-solutions.pro>
 */

import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();


const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err);
});

redis.on('connect', () => {
  console.log('[Redis] Connected');
});

export default redis;


