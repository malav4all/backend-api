// src/influxdb/influxdb.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InfluxDB } from '@influxdata/influxdb-client';
import axios from 'axios';

@Injectable()
export class InfluxdbService implements OnModuleInit {
  private influxDB: InfluxDB;
  private influxUrl: string;
  private logger = new Logger('InfluxDb');

  constructor() {
    const url = process.env.INFLUXDB_URL;
    const token = process.env.INFLUXDB_TOKEN;
    this.influxUrl = url;
    this.influxDB = new InfluxDB({ url, token });
  }

  async onModuleInit() {
    try {
      const response = await axios.get(`${this.influxUrl}/ping`);
      if (response.status === 204) {
        this.logger.log('InfluxDB connected successfully.');
      } else {
        this.logger.error(
          'InfluxDB connection failed: Unexpected status code',
          response.status
        );
      }
    } catch (error) {
      this.logger.error('InfluxDB connection failed:', error.message);
    }
  }

  async createBucket(bucketName: string) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { OrgsAPI, BucketsAPI } = require('@influxdata/influxdb-client-apis');
    const orgsAPI = new OrgsAPI(this.influxDB);
    const bucketsAPI = new BucketsAPI(this.influxDB);

    const org = 'IMZ';
    const orgs = await orgsAPI.getOrgs({ org });
    const orgId = orgs.orgs[0].id;

    await bucketsAPI.postBuckets({
      body: {
        orgID: orgId,
        name: bucketName,
        retentionRules: [],
      },
    });

    console.log(`Bucket "${bucketName}" created successfully.`);
  }
}
