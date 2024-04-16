import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis({
      host: '103.20.214.75',
      port: 6333,
    });
  }

  getClient(): Redis {
    return this.client;
  }
}
