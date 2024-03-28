import { Resolver, Subscription, Args } from '@nestjs/graphql';
import { MqttService } from './mqtt-service.connection';
import { Coordinate } from '@imz/helper/dto/response';

@Resolver()
export class MqttResolver {
  constructor(private readonly mqttService: MqttService) {}

  @Subscription(() => [Coordinate])
  coordinatesUpdated(@Args('topic') topic: string) {
    return this.mqttService.coordinatesUpdated(topic);
  }
}
