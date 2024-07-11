import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly clients: Map<number, Redis> = new Map();
  private logger = new Logger('RedisService');

  constructor() {
    const defaultDb = 0;
    this.addClient(defaultDb, {
      host: '103.20.214.75',
      port: 6379,
      password: 'Rootunlock@#2211',
      db: defaultDb,
    });

    // Add other DBs if needed
    const anotherDb = 1;
    this.addClient(anotherDb, {
      host: '103.20.214.75',
      port: 6379,
      password: 'Rootunlock@#2211',
      db: anotherDb,
    });

    // Check connection for each DB
    this.clients.forEach((client, db) => this.checkConnection(client, db));
  }

  private addClient(db: number, config: any) {
    const client = new Redis(config);
    this.clients.set(db, client);
  }

  private async checkConnection(client: Redis, db: number) {
    try {
      await client.ping();
      this.logger.log(`Connected to Redis DB ${db}`);
    } catch (error) {
      this.logger.error(`Failed to connect to Redis DB ${db}:`, error);
    }
  }

  getClient(db = 0): Redis {
    if (this.clients.has(db)) {
      return this.clients.get(db);
    } else {
      throw new Error(`Redis DB ${db} is not configured.`);
    }
  }
}
