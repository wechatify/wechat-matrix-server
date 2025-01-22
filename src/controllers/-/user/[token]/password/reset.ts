import IoRedis from '@braken/ioredis';
import JSONErrorWare from '../../../../../middlewares/json.ware';
import RedisCache from '@braken/cache-ioredis';
import crypto from 'crypto-js';
import HttpBodyWare from '../../../../../middlewares/body.ware';
import UserService from '../../../../../services/user.service';
import TypeORM from '@braken/typeorm';
import UserEntity from '../../../../../entities/user.entity';
import UserCache from '../../../../../caches/user.cache';
import { Controller } from "@braken/http";
import { Context } from "koa";
import { Exception } from 'wechatify-sdk';
import { generate } from 'randomstring';

const { MD5 } = crypto;
/**
 * 修改密码
 */
@Controller.Injectable
@Controller.Method('POST')
@Controller.Middleware(JSONErrorWare, HttpBodyWare)
export class UserResetPasswordController extends Controller {
  @Controller.Inject(IoRedis)
  private readonly redis: IoRedis;

  @Controller.Inject(UserService)
  private readonly UserService: UserService;

  @Controller.Parameter('path')
  private readonly token: string;

  @Controller.Parameter('body', 'validate')
  private readonly body: {
    mail: string,
    password: string,
  }

  @Controller.Inject(RedisCache)
  private readonly RedisCache: RedisCache;

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(UserCache)
  private readonly cache: UserCache;

  protected validate(body: UserResetPasswordController['body']) {
    if (!body?.mail) throw new Exception(422, '缺少邮箱');
    if (!body?.password) throw new Exception(422, '缺少密码');
    if (body.mail.length > 255) {
      throw new Exception(423, '邮箱长度不能超过 255 个字符串');
    }
    if (!this.UserService.checkPassword(body.password)) {
      throw new Exception(423, '密码格式不符合规范');
    }

    return body;
  }

  public async response(ctx: Context) {
    const tokenKey = this.RedisCache.prefix + ':password:token:' + this.token;
    if (!(await this.redis.connection.exists(tokenKey))) {
      throw new Exception(500, '链接已失效');
    }

    const mail = await this.redis.connection.get(tokenKey);
    if (mail !== this.body.mail) throw new Exception(500, '非法操作');

    const User = this.typeorm.connection.manager.getRepository(UserEntity);
    let user = await User.findOneBy({ mail });
    if (!user) throw new Exception(500, '用户不存在');

    user.salt = generate(6);
    user.hash = MD5(this.body.password + ':' + user.salt).toString();
    user = await User.save(user);

    const mailKey = this.RedisCache.prefix + ':password:mail:' + user.mail;

    try {
      await this.redis.connection.del(tokenKey);
      await this.redis.connection.del(mailKey);
    } catch (e) { }

    await this.cache.$write({ id: user.id });

    const { token, expires, maxAge } = await this.UserService.refreshCache(user.id);
    ctx.cookies.set('authorization', token, {
      path: '/',
      httpOnly: true,
      expires,
      maxAge,
      signed: true,
    })

    return Date.now();
  }
}