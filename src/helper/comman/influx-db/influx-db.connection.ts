import { Injectable } from '@nestjs/common';
import { InfluxDB } from '@influxdata/influxdb-client';
import { PubSub } from 'graphql-subscriptions';
import daysjs from 'dayjs';
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

  async getExecuteAlertData() {
    const query = `
      from(bucket: "tracking-alerts")
        |> range(start: -1h)
        |> filter(fn: (r) => r["_measurement"] == "alert")
        |> filter(fn: (r) => r["_field"] == "event" or r["_field"] == "lat" or r["_field"] == "lng" or r["_field"] == "mode" or r["_field"] == "source")
        |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
        |> filter(fn: (r) => r["imei"] == "937066712051")
        |> filter(fn: (r) => r["label"] == "937066712051")
    `;

    // Define a function to fetch data and publish it to PubSub
    const fetchDataAndPublish = async () => {
      const rowData = [];
      for await (const { values } of this.queryApi.iterateRows(query)) {
        const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13] = values;
        rowData.push({
          event: t9,
          lat: t10,
          lng: t11,
          mode: t12,
          source: t13,
        });
      }
      this.pubSub.publish('alertTableData', {
        alertTableData: rowData,
      });
    };

    // Fetch data initially
    await fetchDataAndPublish();

    // Set up interval to fetch data periodically
    setInterval(async () => {
      await fetchDataAndPublish();
    }, 3000); // Fetch data every minute

    // Return an async iterator for the subscription channel
    return this.pubSub.asyncIterator('alertTableData');
  }
}
