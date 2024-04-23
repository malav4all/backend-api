import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly client: Redis;
  private isConnected: boolean;
  private logger = new Logger('RedisServer');

  constructor() {
    this.client = new Redis({
      host: '103.20.214.75',
      port: 6333,
    });

    this.checkConnection();
  }

  private async checkConnection() {
    try {
      await this.client.ping();
      this.isConnected = true;
      this.logger.log('Connected Redis Server');
    } catch (error) {
      this.isConnected = false;
      this.logger.error('Failed to connect to Redis:', error);
    }
  }

  getClient(): Redis {
    return this.client;
  }
}
