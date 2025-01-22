import LoginWare from "./login.ware";
import { Next, Context } from "koa";
import { Middleware } from "@braken/http";
import { Exception } from "wechatify-sdk";

@Middleware.Injectable
@Middleware.Dependencies(LoginWare)
export default class AdminWare extends Middleware {
  public async use(ctx: Context, next: Next) {
    if (!ctx.user.admin) {
      throw new Exception(406, '权限不足')
    }
    await next();
  }
}