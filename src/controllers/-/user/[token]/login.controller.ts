import JSONErrorWare from "../../../../middlewares/json.ware";
import HttpBodyWare from "../../../../middlewares/body.ware";
import TypeORM from "@braken/typeorm";
import UserEntity from "../../../../entities/user.entity";
import UserCodeController from "../code.controller";
import UserService from "../../../../services/user.service";
import { Controller } from "@braken/http";
import { Context } from "koa";
import { Exception } from "wechatify-sdk";

/**
 * 用户邮箱登录
 */
@Controller.Injectable
@Controller.Method('PUT')
@Controller.Middleware(JSONErrorWare, HttpBodyWare)
export default class UserLoginWithMailController extends Controller {
  @Controller.Parameter('path')
  // 验证码对应 token
  private readonly token: string;

  @Controller.Parameter('body', 'validate')
  private readonly body: {
    mail: string,
    code: string,
  }

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(UserCodeController)
  private readonly code: UserCodeController;

  @Controller.Inject(UserService)
  private readonly UserService: UserService;

  protected validate(body: UserLoginWithMailController['body']) {
    if (!body?.mail) throw new Exception(422, '缺少邮箱');
    if (!body?.code) throw new Exception(422, '缺少验证码');

    if (!this.UserService.checkMail(body.mail)) {
      throw new Exception(423, '邮箱格式错误');
    }

    if (body.mail.length > 255) {
      throw new Exception(423, '邮箱长度不能超过 255 个字符串');
    }

    return body;
  }

  public async response(ctx: Context) {
    const codeable = await this.code.checkCodeByToken(this.token, this.body.code);
    if (!codeable) throw new Exception(500, '验证码错误');

    const User = this.typeorm.connection.manager.getRepository(UserEntity);
    const user = await User.findOneBy({ mail: this.body.mail });
    if (!user) throw new Exception(500, '用户不存在');

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