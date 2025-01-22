import JSONErrorWare from "../../../middlewares/json.ware";
import HttpBodyWare from "../../../middlewares/body.ware";
import TypeORM from "@braken/typeorm";
import UserEntity from "../../../entities/user.entity";
import crypto from 'crypto-js';
import UserService from "../../../services/user.service";
import UserCache from "../../../caches/user.cache";
import { Controller } from "@braken/http";
import { Context } from "koa";
import { Exception } from "wechatify-sdk";
import { generate } from 'randomstring';

const { MD5 } = crypto;

/**
 * 用户账号密码登录
 */
@Controller.Injectable
@Controller.Method('POST')
@Controller.Middleware(JSONErrorWare, HttpBodyWare)
export default class UserLoginWithPasswordController extends Controller {
  @Controller.Parameter('body', 'validate')
  private readonly body: {
    mail: string,
    password: string,
  }

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(UserService)
  private readonly UserService: UserService;

  @Controller.Inject(UserCache)
  private readonly cache: UserCache;

  protected validate(body: UserLoginWithPasswordController['body']) {
    if (!body?.mail) throw new Exception(422, '缺少邮箱');
    if (!body?.password) throw new Exception(422, '缺少密码');

    if (!this.UserService.checkMail(body.mail)) {
      throw new Exception(423, '邮箱格式错误');
    }

    if (body.mail.length > 255) {
      throw new Exception(423, '邮箱长度不能超过 255 个字符串');
    }

    if (!this.UserService.checkPassword(body.password)) {
      throw new Exception(423, '密码格式不符合规范');
    }

    return body;
  }

  public async response(ctx: Context) {
    const User = this.typeorm.connection.manager.getRepository(UserEntity);
    let user = await User.findOneBy({ mail: this.body.mail });
    if (!user) throw new Exception(500, '用户不存在');
    if (MD5(this.body.password + ':' + user.salt).toString() !== user.hash) {
      throw new Exception(500, '密码错误');
    }

    user.salt = generate(6);
    user.hash = MD5(this.body.password + ':' + user.salt).toString();
    user = await User.save(user);
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