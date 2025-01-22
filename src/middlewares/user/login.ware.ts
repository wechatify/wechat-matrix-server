import UserWare from "./info.ware";
import { Next, Context } from "koa";
import { Middleware } from "@braken/http";
import { Exception } from "wechatify-sdk";

@Middleware.Injectable
@Middleware.Dependencies(UserWare)
export default class LoginWare extends Middleware {
  public async use(ctx: Context, next: Next) {
    if (!ctx.user) {
      throw new Exception(401, '未登录')
    }
    if (ctx.user.forbiden) {
      throw new Exception(403, '禁止登录')
    }
    await next();
  }
}