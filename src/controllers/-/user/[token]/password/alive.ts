import IoRedis from '@braken/ioredis';
import JSONErrorWare from '../../../../../middlewares/json.ware';
import RedisCache from '@braken/cache-ioredis';
import { Controller } from "@braken/http";

/**
 * 确认修改密码链接是否有效
 */
@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(JSONErrorWare)
export class UserCheckPasswordResetURLValidController extends Controller {
  @Controller.Inject(IoRedis)
  private readonly redis: IoRedis;

  @Controller.Parameter('path')
  private readonly token: string;

  @Controller.Inject(RedisCache)
  private readonly RedisCache: RedisCache;

  public async response() {
    const tokenKey = this.RedisCache.prefix + ':password:token:' + this.token;
    if (!(await this.redis.connection.exists(tokenKey))) {
      return false;
    }
    return true;
  }
}