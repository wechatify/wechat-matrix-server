import Logger from '@braken/logger';
import { Middleware } from "@braken/http";
import { Context, Next } from "koa";

@Middleware.Injectable
export default class JSONErrorWare extends Middleware {
  @Middleware.Inject(Logger)
  private readonly logger: Logger;
  public async use(ctx: Context, next: Next) {
    try {
      await next();
      ctx.body = {
        status: 200,
        data: ctx.body,
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        this.logger.error(e);
      }
      ctx.body = {
        status: e.code || e.status || ctx.status || 500,
        message: e.message,
      }
    }
  }
}