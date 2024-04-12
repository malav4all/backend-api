import { Injectable, Logger } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class MqttService {
  private client: MqttClient;
  private pubSub: PubSub = new PubSub();
  private logger = new Logger('MqttConnection');
  private currentTopic: string;

  constructor() {
    this.client = connect('mqtt://103.20.214.75:1883', {
      clientId: 'malav_web_app',
      username: 'malav',
      password: 'malav@123',
    });

    this.client.on('connect', () => {
      this.logger.log('Connected MQTT Server');
    });

    this.client.on('message', (topic, message) => {
      const [first, second] = topic.split('/');
      const messageString = Buffer.from(message).toString('utf8');
      const messageObject = JSON.parse(messageString);
      console.log(messageObject);
      if (first === 'alerts') {
        this.pubSub.publish('alertUpdated', {
          alertUpdated: messageObject,
        });
      } else if (first === 'track') {
        this.pubSub.publish('coordinatesUpdated', {
          coordinatesUpdated: messageObject,
        });
      }
    });

    this.client.on('error', (err) => {
      this.logger.error(err);
    });
  }

  coordinatesUpdated(topic: string) {
    this.client.subscribe(topic, (err) => {
      if (err) {
        this.logger.error('Error subscribing to topic:', err);
      } else {
        this.logger.log('Subscribed to topic:', topic);
        this.currentTopic = topic;
      }
    });

    return this.pubSub.asyncIterator('coordinatesUpdated');
  }

  alertUpdated(topic: string) {
    this.client.subscribe(topic, (err) => {
      if (err) {
        this.logger.error('Error subscribing to topic:', err);
      } else {
        this.logger.log('Subscribed to Alert topic:', topic);
        this.currentTopic = topic;
      }
    });

    return this.pubSub.asyncIterator('alertUpdated');
  }
}
