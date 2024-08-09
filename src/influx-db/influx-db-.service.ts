// src/influxdb/influxdb.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InfluxDB, QueryApi } from '@influxdata/influxdb-client';
import axios from 'axios';
import { OrgsAPI, BucketsAPI } from '@influxdata/influxdb-client-apis';

@Injectable()
export class InfluxdbService implements OnModuleInit {
  private influxDB: InfluxDB;
  private influxUrl: string;
  private queryApi: QueryApi;
  private logger = new Logger('InfluxDb');

  constructor() {
    this.initializeInfluxDB();
  }

  initializeInfluxDB() {
    try {
      const url = process.env.INFLUXDB_URL;
      const token = process.env.INFLUXDB_TOKEN;
      const org = process.env.INFLUXDB_ORG || 'my-org';

      if (!url || !token) {
        throw new Error('InfluxDB URL and Token must be defined');
      }

      this.influxUrl = url;
      this.influxDB = new InfluxDB({ url, token });
      this.queryApi = this.influxDB.getQueryApi(org);
    } catch (error) {
      this.logger.error('Error initializing InfluxDB:', error.message);
      throw error;
    }
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
    try {
      const orgsAPI = new OrgsAPI(this.influxDB);
      const bucketsAPI = new BucketsAPI(this.influxDB);

      const org = process.env.INFLUXDB_ORG || 'my-org';
      const orgs = await orgsAPI.getOrgs({ org });

      if (!orgs.orgs || orgs.orgs.length === 0) {
        throw new Error(`Organization ${org} not found.`);
      }
      const orgId = orgs.orgs[0].id;

      await bucketsAPI.postBuckets({
        body: {
          orgID: orgId,
          name: bucketName,
          retentionRules: [],
        },
      });
    } catch (error) {
      console.error('Error creating bucket:', error);
    }
  }

  executeQuery(fluxQuery: string) {
    try {
      if (!this.queryApi) {
        throw new Error('Query API is not initialized.');
      }
      return this.queryApi.iterateRows(fluxQuery);
    } catch (error) {
      this.logger.error('Error executing query:', error.message);
      throw error;
    }
  }

  countQuery(fluxQuery: string) {
    try {
      if (!this.queryApi) {
        throw new Error('Query API is not initialized.');
      }
      return this.queryApi.collectRows(fluxQuery);
    } catch (error) {
      this.logger.error('Error executing query:', error.message);
      throw error;
    }
  }
}
