import crypto from 'crypto-js';
import { Middleware } from "@braken/http";
import { Next, Context } from "koa";
import { generate } from 'randomstring';

const { MD5 } = crypto;

declare module 'koa' {
  interface BaseContext {
    session_id: string,
    new_session: boolean,
  }
}

/**
 * POST-Body数据解析中间件
 * @Controller.Middleware(HttpBodyWare)
 */
@Middleware.Injectable
export default class HttpSessionWare extends Middleware {
  private readonly maxAge = 365 * 24 * 60 * 60 * 1000;
  public async use(ctx: Context, next: Next) {
    let sid = ctx.cookies.get('x-sid', { signed: true });
    if (!sid) {
      sid = MD5(generate() + ':' + ctx.ip).toString();
      ctx.new_session = true;
      ctx.cookies.set('x-sid', sid, {
        signed: true,
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + this.maxAge),
        maxAge: this.maxAge,
      })
    }
    ctx.session_id = sid;
    await next();
  }
}