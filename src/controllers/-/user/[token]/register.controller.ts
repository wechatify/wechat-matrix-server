import JSONErrorWare from "../../../../middlewares/json.ware";
import HttpBodyWare from "../../../../middlewares/body.ware";
import TypeORM from "@braken/typeorm";
import UserEntity from "../../../../entities/user.entity";
import crypto from 'crypto-js';
import UserCodeController from "../code.controller";
import UserService from "../../../../services/user.service";
import UserCache from "../../../../caches/user.cache";
import { Controller } from "@braken/http";
import { Context } from "koa";
import { Exception } from "wechatify-sdk";
import { generate } from 'randomstring';

const { MD5 } = crypto;

/**
 * 用户注册
 */
@Controller.Injectable
@Controller.Method('PUT')
@Controller.Middleware(JSONErrorWare, HttpBodyWare)
export default class UserRegisterController extends Controller {
  @Controller.Parameter('path')
  // 验证码对应 token
  private readonly token: string;

  @Controller.Parameter('body', 'validate')
  private readonly body: {
    mail: string,
    password: string,
    code: string,
  }

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(UserCodeController)
  private readonly code: UserCodeController;

  @Controller.Inject(UserService)
  private readonly UserService: UserService;

  @Controller.Inject(UserCache)
  private readonly UserCache: UserCache;

  protected validate(body: UserRegisterController['body']) {
    if (!body?.mail) throw new Exception(422, '缺少邮箱');
    if (!body?.password) throw new Exception(422, '缺少密码');
    if (!body?.code) throw new Exception(422, '缺少验证码');

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
    const total = await User.countBy({ mail: this.body.mail });
    if (total) throw new Exception(500, '邮箱已存在');

    const codeable = await this.code.checkCodeByToken(this.token, this.body.code);
    if (!codeable) throw new Exception(500, '验证码错误');

    const count = await User.count();

    let user = User.create();
    user.admin = !count ? true : false;
    user.forbiden = false;
    user.mail = this.body.mail;
    user.salt = generate(6);
    user.hash = MD5(this.body.password + ':' + user.salt).toString();
    user.last_login_time = new Date();
    user = await User.save(user);

    await this.UserCache.$write({ id: user.id });

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