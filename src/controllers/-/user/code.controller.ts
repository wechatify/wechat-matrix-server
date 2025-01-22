import JSONErrorWare from "../../../middlewares/json.ware";
import HttpBodyWare from "../../../middlewares/body.ware";
import HttpSessionWare from "../../../middlewares/session.ware";
import RedisCache from '@braken/cache-ioredis';
import IoRedis from "@braken/ioredis";
import TypeORM from "@braken/typeorm";
import UserEntity from "../../../entities/user.entity";
import Mailer from "../../../applications/mailer.app";
import Configs from "../../../applications/configs.app";
import UserService from "../../../services/user.service";
import crypto from 'crypto-js';
import { Controller } from "@braken/http";
import { Context } from "koa";
import { Exception } from "wechatify-sdk";
import { generate } from "randomstring";

const { MD5 } = crypto;

enum MAIL_CODE_SCENE {
  LOGIN,
  REGISTER,
}

/**
 * 发送验证码
 */
@Controller.Injectable
@Controller.Method('POST')
@Controller.Middleware(JSONErrorWare, HttpBodyWare, HttpSessionWare)
export default class UserCodeController extends Controller {
  static readonly scenes: MAIL_CODE_SCENE[] = [
    MAIL_CODE_SCENE.LOGIN,
    MAIL_CODE_SCENE.REGISTER,
  ];

  @Controller.Parameter('body', 'validate')
  private readonly body: {
    to: string,
    scene: MAIL_CODE_SCENE,
  }

  @Controller.Inject(RedisCache)
  private readonly RedisCache: RedisCache;

  @Controller.Inject(IoRedis)
  private readonly redis: IoRedis;

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(Mailer)
  private readonly mailer: Mailer;

  @Controller.Inject(Configs)
  private readonly configs: Configs;

  @Controller.Inject(UserService)
  private readonly UserService: UserService;

  protected validate(body: UserCodeController['body']) {
    if (!body?.to) throw new Exception(422, '缺少收件人邮箱');
    if (body?.scene === undefined) throw new Exception(422, '缺少场景值');

    if (!this.UserService.checkMail(body.to)) {
      throw new Exception(423, '收件人邮箱格式错误');
    }

    if (body.to.length > 255) {
      throw new Exception(423, '收件人邮箱长度不能超过 255 个字符串');
    }

    if (!UserCodeController.scenes.includes(body.scene)) {
      throw new Exception(423, '非法场景');
    }

    return body;
  }

  public async response(ctx: Context) {
    const inputkey = await this.canSendCode(ctx.session_id);
    const title = await this.validSence();
    const code = generate(6);
    const name = this.configs.getConfigsValue('PLATFORM_NAME');
    const time = this.configs.getConfigsValue('USER_MAIL_CODE_EXPIRE');
    const limit = this.configs.getConfigsValue('USER_MAIL_CODE_LIMIT');
    const id = await this.mailer.send(this.mailer.from, this.body.to, {
      subject: `${name}${title}验证码`,
      text: `您的${title}验证码为 ${code}，${time}分钟内有效。`,
    })
    const token = MD5(id).toString();
    const outputkey = this.RedisCache.prefix + ':mail:token:' + token;
    await this.redis.connection.setex(outputkey, time * 60, code);
    await this.redis.connection.setex(inputkey, limit, token);
    return token;
  }

  private async canSendCode(sid: string) {
    const key = `${this.RedisCache.prefix}:mail:scene:${this.body.scene}:sid:${sid}`;
    if (await this.redis.connection.exists(key)) {
      throw new Exception(500, '发送验证码过于频繁');
    }
    return key;
  }

  private async validSence() {
    switch (this.body.scene) {
      case MAIL_CODE_SCENE.REGISTER:
        const User = this.typeorm.connection.manager.getRepository(UserEntity);
        const count = await User.countBy({ mail: this.body.to });
        if (count) {
          throw new Exception(500, '账号已存在');
        }
        return '注册';
      case MAIL_CODE_SCENE.LOGIN: return '登录';
      default: return '未知场景';
    }
  }

  public async checkCodeByToken(token: string, code: string) {
    const token_key = this.RedisCache.prefix + ':mail:token:' + token;
    if (!(await this.redis.connection.exists(token_key))) {
      throw new Exception(500, '无效验证码');
    }
    const _code = await this.redis.connection.get(token_key);
    await this.redis.connection.del(token_key);
    return _code === code;
  }
}