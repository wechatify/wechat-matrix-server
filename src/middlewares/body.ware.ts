import { Middleware } from "@braken/http";
import { Next, Context } from "koa";
import { koaBody } from 'koa-body';

/**
 * POST-Body数据解析中间件
 * @Controller.Middleware(HttpBodyWare)
 */
@Middleware.Injectable
export default class HttpBodyWare extends Middleware {
  public async use(ctx: Context, next: Next) {
    await koaBody({
      jsonStrict: false,
      jsonLimit: 10 + 'mb',
      formLimit: 10 + 'mb',
      textLimit: 10 + 'mb',
      multipart: true,
    })(ctx, next);
  }
}