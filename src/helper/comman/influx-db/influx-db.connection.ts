import { Injectable } from '@nestjs/common';
import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';

@Injectable()
export class InfluxService {
  private readonly writeApi: WriteApi;

  constructor() {
    const url = process.env.INFLUX_DB_URL || '';
    const token = process.env.INFLUXDB_TOKEN || '';
    const org = process.env.INFLUX_DB_ORG || '';

    const client = new InfluxDB({ url, token });
    this.writeApi = client.getWriteApi(org, 'vts', 'ns');
  }

  writeData() {
    for (let i = 0; i < 5; i++) {
      const point = new Point('measurement1')
        .tag('tagname1', 'tagvalue1')
        .intField('field1', i);

      this.writeApi.writePoint(point);
    }

    this.writeApi.flush();
  }

  close() {
    this.writeApi.close();
  }
}
