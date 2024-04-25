import { Injectable, Logger } from '@nestjs/common';
import { MqttClient, connect } from 'mqtt';

@Injectable()
export class MqttService {
  private client: MqttClient;
  private logger = new Logger('MqttConnection');
  constructor() {
    this.client = connect('mqtt://103.20.214.75:1883', {
      clientId: 'malav_web_app',
      username: 'malav',
      password: 'malav@123',
    });

    this.client.on('connect', () => {
      this.logger.log('Connected MQTT Server');
    });

    this.client.on('error', (err) => {
      this.logger.error(err);
    });
  }
  getClient(): MqttClient {
    return this.client;
  }
}
