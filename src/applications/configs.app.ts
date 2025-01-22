import IoRedis from '@braken/ioredis';
import t from '@braken/json-schema';
import RedisCache from '@braken/cache-ioredis';
import { Application } from '@braken/application';

interface IConfigs {
  PLATFORM_NAME: string,
  USER_EXPIRE: number,
  USER_MAIL_CODE_EXPIRE: number,
  USER_MAIL_CODE_LIMIT: number,
  USER_MAIL_CODE_RESET: number,
}

@Application.Injectable
export default class Configs extends Application {
  @Application.Inject(IoRedis)
  private readonly redis: IoRedis;

  @Application.Inject(RedisCache)
  private readonly RedisCache: RedisCache;

  public readonly state = new Map<keyof IConfigs, any>();
  public readonly schema = t.Object({
    PLATFORM_NAME: t.String('Julex').title('平台名称').description('平台名称'),
    USER_EXPIRE: t.Number(7).title('用户登录有效期').description('用户在登录后保持登录的持续有效时间，单位：天。'),
    USER_MAIL_CODE_EXPIRE: t.Number(5).title('邮件验证码有效期').description('用户在使用邮箱发送验证码时候，验证码持续有效时间，单位：分钟。'),
    USER_MAIL_CODE_LIMIT: t.Number(10).title('邮件验证码频率间隔').description('用户在使用发送邮件功能时候，单个 IP 限流的间隔时间，单位：秒。'),
    USER_MAIL_CODE_RESET: t.Number(60).title('忘记密码邮件有效期').description('用户在使用忘记密码功能的时候，每个链接的有效时间，单位：分钟。'),
  })

  private createKey() {
    return this.RedisCache.prefix + ':variable:state';
  }

  public async initialize() {
    const key = this.createKey();
    const data = this.schema.toJSON();
    // @ts-ignore
    const properties = data.properties;
    for (const key in properties) {
      const item = properties[key];
      this.state.set(key as keyof IConfigs, item.default);
    }
    const exists = await this.redis.connection.exists(key);
    if (exists) {
      const _data = await this.redis.connection.get(key);
      if (_data) {
        const json: IConfigs = JSON.parse(_data);
        for (const key of this.state.keys()) {
          if (json[key] !== undefined) {
            this.state.set(key, json[key]);
          }
        }
      }
    }
  }

  public getConfigsValue<U extends keyof IConfigs>(key: U): IConfigs[U] {
    return this.state.get(key);
  }

  public setConfigsValue<U extends keyof IConfigs>(key: U, value: IConfigs[U]) {
    this.state.set(key, value);
    return this;
  }

  public toJSON(): IConfigs {
    const data: Partial<Record<keyof IConfigs, any>> = {}
    for (const [key, value] of this.state.entries()) {
      data[key] = value;
    }
    return data as IConfigs;
  }

  public saveConfigs(value: Partial<IConfigs>) {
    const key = this.createKey();
    for (const key in value) {
      const _key = key as keyof IConfigs;
      if (this.state.has(_key)) {
        this.state.set(_key, value[_key]);
      }
    }
    return this.redis.connection.set(key, JSON.stringify(this.toJSON()));
  }

  public updateConfigs(key: keyof IConfigs, value: IConfigs[keyof IConfigs]) {
    const path = this.createKey();
    if (this.state.has(key)) {
      this.state.set(key, value);
    }
    return this.redis.connection.set(path, JSON.stringify(this.toJSON()));
  }
}