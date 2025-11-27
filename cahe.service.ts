import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

@Injectable()
export default class CacheService implements OnModuleInit {
  private readonly logger = new Logger('CacheService');
  private redis: Keyv<any>;
  private readonly redisUrl = process.env.REDIS_URL;
  async onModuleInit() {
    if (!this.redisUrl) {
      this.logger.error(
        'REDIS_URL não está definido nas variáveis de ambiente!',
      );
      throw new Error('REDIS_URL is missing');
    }

    try {
      this.redis = new Keyv({ store: new KeyvRedis(this.redisUrl) });
      this.redis.on('error', (err) =>
        this.logger.error('Erro na conexão Redis', err),
      );
      await this.redis.set('cache_service_status', 'ready', 10000);
      this.logger.debug(
        '✅ Redis conectado e CacheService inicializado com sucesso.',
      );
    } catch (error) {
      this.logger.error('Falha ao inicializar Redis', error);
    }
  }

  async set(key: string, value: any, ttl?: number) {
    await this.redis.set(key, value, ttl);
    this.logger.debug(`Cache SET: ${key}`);
  }

  async get<T = any>(key: string): Promise<T | undefined> {
    const value = await this.redis.get(key);
    return value as T;
  }

  async delete(key: string) {
    await this.redis.delete(key);
    this.logger.debug(`Cache DELETE: ${key}`);
  }

  async clear() {
    await this.redis.clear();
  }
}
