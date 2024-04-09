import { Injectable } from '@nestjs/common';
import { InfluxDB } from '@influxdata/influxdb-client';
import { PubSub } from 'graphql-subscriptions';
import daysjs from 'dayjs';
import { AlertInputType } from './response';
@Injectable()
export class InfluxService {
  private readonly queryApi;
  private pubSub: PubSub = new PubSub();

  constructor() {
    const url = 'http://103.20.214.74:8086';
    const token = process.env.INFLUXDB_TOKEN;
    const org = `IMZ`;

    const client = new InfluxDB({ url, token });
    this.queryApi = client.getQueryApi(org);
  }

  async executeQuery() {
    const startTime = '2024-04-03T18:30:00Z';
    const endTime = '2024-04-04T09:00:00Z';
    const fluxQuery = `
    from(bucket: "tracking-v2")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r["_measurement"] == "track")
      |> filter(fn: (r) => r["_field"] == "lat" or r["_field"] == "lng" or r["_field"] == "direction")
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> filter(fn: (r) => r["imei"] == "864180068905939")
      |> filter(fn: (r) => r["label"] == "864180068905939")`;

    const data = [];

    for await (const { values } of this.queryApi.iterateRows(fluxQuery)) {
      const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11] = values;
      data.push({
        startTime: t3,
        stopTime: t4,
        currentTime: t5,
        measurement: t6,
        imei: t7,
        label: t8,
        direction: t9,
        lat: t10,
        lng: t11,
      });
    }
    return data;
  }

  async fetchDataAndPublish(payload: AlertInputType) {
    const query = `
      from(bucket: "tracking-alerts")
        |> range(start: ${payload.startDate}, stop: ${payload.endDate})
        |> filter(fn: (r) => r["_measurement"] == "alert")
        |> filter(fn: (r) => r["_field"] == "event" or r["_field"] == "lat" or r["_field"] == "lng" or r["_field"] == "message" or r["_field"] == "mode" or r["_field"] == "source")
        |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
    `;
    const rowData = [];
    for await (const { values } of this.queryApi.iterateRows(query)) {
      const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14] =
        values;
      rowData.push({
        time: t3,
        label: t7,
        imei: t8,
        event: t9,
        lat: t10,
        lng: t11,
        mode: t13,
        source: t14,
        message: t12,
      });
    }

    return rowData;
  }

  async fetchDataDeviceStatus(payload: AlertInputType) {
    const query = `
    from(bucket: "tracking-v2")
    |> range(start: ${payload.startDate}, stop: ${payload.endDate})
    |> filter(fn: (r) => r["_measurement"] == "track")
    |> filter(fn: (r) => r["_field"] == "direction" or r["_field"] == "gps" or r["_field"] == "lat" or r["_field"] == "lng" or r["_field"] == "satellites" or r["_field"] == "speed")
    |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
     |> map(fn: (r) => ({
        r with
        status: if (int(v:now()) - int(v:r["_time"]) < int(v:duration(v: "30m"))) then "online" else "offline"
      }))
    `;
    const rowData = [];
    for await (const { values } of this.queryApi.iterateRows(query)) {
      const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15] =
        values;
      rowData.push({
        time: t4,
        label: t9,
        imei: t10,
        lat: t11,
        lng: t12,
        status: t15,
      });
    }

    return rowData;
  }
}
