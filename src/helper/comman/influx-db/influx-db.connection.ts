import { Injectable } from '@nestjs/common';
import { InfluxDB } from '@influxdata/influxdb-client';

@Injectable()
export class InfluxService {
  private readonly queryApi;

  constructor() {
    const url = 'http://103.20.214.74:8086';
    const token = process.env.INFLUXDB_TOKEN;
    const org = `IMZ`;

    const client = new InfluxDB({ url, token });
    this.queryApi = client.getQueryApi(org);
  }

  async executeQuery() {
    const startTime = '2024-04-04T10:13:26Z';
    const endTime = '2024-04-04T13:00:00Z';
    const fluxQuery = `
    from(bucket: "tracking-v2")
      |> range(start: ${startTime}, stop: ${endTime})
      |> filter(fn: (r) => r["_measurement"] == "track")
      |> filter(fn: (r) => r["_field"] == "lat" or r["_field"] == "lng")
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> filter(fn: (r) => r["imei"] == "864180068905939")
      |> filter(fn: (r) => r["label"] == "864180068905939")`;

    const data = [];

    for await (const { values } of this.queryApi.iterateRows(fluxQuery)) {
      const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10] = values;
      data.push({
        startTime: t3,
        stopTime: t4,
        currentTime: t5,
        measurement: t6,
        imei: t7,
        label: t8,
        lat: t9,
        lng: t10,
      });
    }
    return data;
  }
}
