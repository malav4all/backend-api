import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GeozoneSchema, Geozone } from './enitity/geozone.entity';
import { GeozoneResolver } from './geozone.resolver';
import { GeozoneService } from './geozone.service';
import { RedisService } from '@imz/redis/redis.service';
import { MqttService } from '@imz/mqtt/mqtt.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Geozone.name, schema: GeozoneSchema }]),
  ],
  providers: [GeozoneResolver, GeozoneService, RedisService],
  exports: [GeozoneService],
})
export class GeozoneModule {}
