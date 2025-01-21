import { RedisOptions } from "ioredis";
import { HttpProps } from "@braken/http";
import { DataSourceOptions } from "typeorm";
import { WechatProps } from 'wechatify';

export interface Props {
  database: DataSourceOptions,
  redis: RedisOptions,
  http: HttpProps,
  mail: MailProps,
  wechat: WechatProps,
  env?: 'development' | 'production',
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