import IoRedis from '@braken/ioredis';
import crypto from 'crypto-js';
import RedisCache from '@braken/cache-ioredis';
import { Component } from '@braken/injection';
import { generate } from 'randomstring';
import Configs from '../applications/configs.app';

const { MD5 } = crypto;

@Component.Injectable
export default class UserService extends Component {
  @Component.Inject(IoRedis)
  private readonly redis: IoRedis;

  @Component.Inject(RedisCache)
  private readonly RedisCache: RedisCache;

  @Component.Inject(Configs)
  private readonly configs: Configs;

  private mail_regexp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private password_regexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,16}$/;

  public checkMail(value: string) {
    return this.mail_regexp.test(value);
  }

  public checkPassword(value: string) {
    return this.password_regexp.test(value);
  }

  private createUserCacheKey(id: number) {
    return this.RedisCache.prefix + ':user:cache:' + id;
  }

  public createUserAuthKey(token: string) {
    return this.RedisCache.prefix + ':user:auth:' + token;
  }

  public async refreshCache(uid: number) {
    const userKey = this.createUserCacheKey(uid);
    const token = MD5(generate() + ':' + Date.now()).toString();
    const newUserTokenKey = this.createUserAuthKey(token);
    const maxAge = this.configs.getConfigsValue('USER_EXPIRE') * 24 * 60 * 60;

    await this.removeExistsKey(userKey);
    await this.redis.connection.setex(newUserTokenKey, maxAge, uid);
    await this.redis.connection.setex(userKey, maxAge, token);

    const _maxAge = maxAge * 1000;

    return {
      token,
      expires: new Date(Date.now() + _maxAge),
      maxAge: _maxAge,
    }
  }

  private async removeExistsKey(userKey: string) {
    if (await this.redis.connection.exists(userKey)) {
      const userToken = await this.redis.connection.get(userKey);
      const userTokenKey = this.createUserAuthKey(userToken);
      if (await this.redis.connection.exists(userTokenKey)) {
        await this.redis.connection.del(userTokenKey);
      }
    }
  }

  public async removeCache(uid: number) {
    const userKey = this.createUserCacheKey(uid);
    await this.removeExistsKey(userKey);
    await this.redis.connection.del(userKey);
  }
}