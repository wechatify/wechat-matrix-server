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
}