import { Resolver, Subscription, Args } from '@nestjs/graphql';
import { MqttService } from './mqtt-service.connection';
import { AlertResponse, Coordinate } from '@imz/helper/dto/response';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@imz/user/guard';

@Resolver()
export class MqttResolver {
  constructor(private readonly mqttService: MqttService) {}

  @Subscription(() => Coordinate)
  coordinatesUpdated(@Args('topic') topic: string) {
    return this.mqttService.coordinatesUpdated(topic);
  }

  @Subscription(() => AlertResponse)
  async alertUpdated(@Args('topic') topic: string) {
    const res = await this.mqttService.alertUpdated(topic);
    return res;
  }
}
