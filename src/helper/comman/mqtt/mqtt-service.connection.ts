import { Injectable, Logger } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class MqttService {
  private client: MqttClient;
  private pubSub: PubSub = new PubSub();
  private coordinates: { lat: number; long: number }[] = [];
  private logger = new Logger('MqttConnection');
  private currentTopic: string;

  constructor() {
    this.client = connect('mqtt://103.20.214.74:1883/', {
      clientId: 'malav_web_app',
      username: 'pocweb',
      password: 'imzpoc@183',
    });
    this.client.on('connect', () => {
      this.logger.log('Connected MQTT Server....');
    });

    this.client.on('message', (topic, message) => {
      this.logger.log(
        `Received message on topic ${topic}: ${message.toString()}`
      );
    });

    this.client.on('error', (err) => {
      this.logger.error(err);
    });
  }

  startPublishingCoordinates() {
    let index = 0;
    const newCoordinates = [
      { lat: 28.626764963100868, long: 77.2231583370176 },
      { lat: 28.623255884728806, long: 77.22511639500334 },
      { lat: 28.620073270234826, long: 77.22699308495362 },
      { lat: 28.61550551601603, long: 77.2295811811598 },
    ];
    const intervalId = setInterval(() => {
      if (index >= newCoordinates.length) {
        clearInterval(intervalId);
        return;
      }

      const currentCoordinate = newCoordinates[index];
      this.updateCoordinates([currentCoordinate]);
      index++;
    }, 2000);
  }

  private updateCoordinates(newCoordinates: { lat: number; long: number }[]) {
    this.coordinates = newCoordinates;
    this.pubSub.publish('coordinatesUpdated', {
      coordinatesUpdated: this.coordinates,
    });
    this.client.publish(this.currentTopic, JSON.stringify(this.coordinates));
    this.logger.log('Coordinates updated');
  }

  coordinatesUpdated(topic: string) {
    this.currentTopic = topic;
    this.client.subscribe(topic, (err) => {
      if (err) {
        this.logger.error('Error subscribing to topic:', err);
      } else {
        this.logger.log('Subscribed to topic:', topic);
      }
    });

    if (topic === this.currentTopic) {
      this.startPublishingCoordinates();
    }

    return this.pubSub.asyncIterator('coordinatesUpdated');
  }
}
