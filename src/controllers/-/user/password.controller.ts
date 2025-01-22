import JSONErrorWare from "../../../middlewares/json.ware";
import HttpBodyWare from "../../../middlewares/body.ware";
import TypeORM from "@braken/typeorm";
import UserEntity from "../../../entities/user.entity";
import crypto from 'crypto-js';
import UserService from "../../../services/user.service";
import RedisCache from '@braken/cache-ioredis';
import Configs from "../../../applications/configs.app";
import Mailer from "../../../applications/mailer.app";
import IoRedis from "@braken/ioredis";
import { Controller } from "@braken/http";
import { Context } from "koa";
import { Exception } from "wechatify-sdk";

const { MD5 } = crypto;

/**
 * 忘记密码：发送邮件认证
 */
@Controller.Injectable
@Controller.Method('POST')
@Controller.Middleware(JSONErrorWare, HttpBodyWare)
export default class UserSendResetPasswordURLController extends Controller {
  @Controller.Parameter('body', 'validate')
  private readonly body: {
    mail: string,
  }

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(UserService)
  private readonly UserService: UserService;

  @Controller.Inject(RedisCache)
  private readonly RedisCache: RedisCache;

  @Controller.Inject(Configs)
  private readonly configs: Configs;

  @Controller.Inject(Mailer)
  private readonly mailer: Mailer;

  @Controller.Inject(IoRedis)
  private readonly redis: IoRedis;

  protected validate(body: UserSendResetPasswordURLController['body']) {
    if (!body?.mail) throw new Exception(422, '缺少邮箱');

    if (!this.UserService.checkMail(body.mail)) {
      throw new Exception(423, '邮箱格式错误');
    }

    if (body.mail.length > 255) {
      throw new Exception(423, '邮箱长度不能超过 255 个字符串');
    }

    return body;
  }

  public async response(ctx: Context) {
    const User = this.typeorm.connection.manager.getRepository(UserEntity);
    const user = await User.findOneBy({ mail: this.body.mail });
    if (!user) throw new Exception(500, '用户不存在');

    const sec = this.configs.getConfigsValue('USER_MAIL_CODE_RESET');
    const mailKey = this.RedisCache.prefix + ':password:mail:' + user.mail;
    if (await this.redis.connection.get(mailKey)) {
      throw new Exception(500, '邮件已发送，请不要重复发送；如未收到邮件，请在' + sec + '分钟后重试！');
    }

    const token = MD5(user.mail + ':' + Date.now()).toString();
    const tokenKey = this.RedisCache.prefix + ':password:token:' + token;
    const https = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const url = `${https}://${ctx.header.host}/password/${token}`;
    const name = this.configs.getConfigsValue('PLATFORM_NAME');

    await this.mailer.send(this.mailer.from, user.mail, {
      subject: `${name}重置密码`,
      text: `请复制链接到浏览器重置密码(有效期${sec}分钟)：${url}`,
    })

    await this.redis.connection.setex(tokenKey, sec * 60, user.mail);
    await this.redis.connection.setex(mailKey, sec * 60, token);
    return Date.now();
  }
}