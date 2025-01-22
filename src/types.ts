import { RedisOptions } from "ioredis";
import { HttpProps } from "@braken/http";
import { DataSourceOptions } from "typeorm";
import { WechatPlatformSDKProps } from 'wechatify-sdk';

export interface Props {
  database: DataSourceOptions,
  redis: RedisOptions,
  http: HttpProps,
  env?: 'development' | 'production',
  api: WechatPlatformSDKProps,
  mail: MailProps,
}

export interface MailProps {
  host: string,
  port: number,
  secure: boolean,
  auth: {
    user: string,
    pass: string,
  },
}