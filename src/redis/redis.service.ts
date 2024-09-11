import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly clients: Map<string, Redis> = new Map();
  private logger = new Logger('RedisService');

  constructor() {
    // Default Redis server
    const defaultDb = 0;
    this.addClient(`default-${defaultDb}`, {
      host: '192.168.77.44',
      port: 6379,
      password: 'nP76rskp1sAD',
      db: defaultDb,
    });

    // Another Redis DB on the same server
    const anotherDb = 1;
    this.addClient(`default-${anotherDb}`, {
      host: '192.168.77.44',
      port: 6379,
      password: 'nP76rskp1sAD',
      db: anotherDb,
    });

    // Check connection for each DB
    this.clients.forEach((client, id) => this.checkConnection(client, id));
  }

  private addClient(id: string, config: any) {
    const client = new Redis(config);
    this.clients.set(id, client);
  }

  private async checkConnection(client: Redis, id: string) {
    try {
      await client.ping();
      this.logger.log(`Connected to Redis server with id ${id}`);
    } catch (error) {
      this.logger.error(
        `Failed to connect to Redis server with id ${id}:`,
        error
      );
    }
  }

  getClient(id: string): Redis {
    if (this.clients.has(id)) {
      return this.clients.get(id);
    } else {
      throw new Error(`Redis server with id ${id} is not configured.`);
    }
  }
}
