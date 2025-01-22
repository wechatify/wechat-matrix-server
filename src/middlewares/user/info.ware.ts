import IoRedis from "@braken/ioredis";
import UserCache from "../../caches/user.cache";
import UserService from "../../services/user.service";
import UserEntity from "../../entities/user.entity";
import { Next, Context } from "koa";
import { Middleware } from "@braken/http";

declare module 'koa' {
  interface BaseContext {
    user: UserEntity,
  }
}

@Middleware.Injectable
export default class UserWare extends Middleware {
  @Middleware.Inject(IoRedis)
  private readonly redis: IoRedis;

  @Middleware.Inject(UserService)
  private readonly user: UserService;

  @Middleware.Inject(UserCache)
  private readonly cache: UserCache;

  public async use(ctx: Context, next: Next) {
    let token = ctx.cookies.get('authorization', { signed: true });
    if (!token) {
      token = ctx.headers['authorization'];
    }
    if (!token) return await next();
    const key = this.user.createUserAuthKey(token);
    if (!(await this.redis.connection.exists(key))) return await next();
    const idText = await this.redis.connection.get(key);
    const uid = Number(idText);
    if (!uid || uid < 0) return await next();
    const user = await this.cache.$read({ id: uid });
    if (!user) return await next();
    ctx.user = user;
    await next();
  }
}