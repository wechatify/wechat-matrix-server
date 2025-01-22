import JSONErrorWare from "../../../../middlewares/json.ware";
import LoginWare from "../../../../middlewares/user/login.ware";
import ApiSDK from "../../../../applications/sdk.app";
import TypeORM from "@braken/typeorm";
import WechatEntity from "../../../../entities/wechat.entity";
import { Exception } from "wechatify-sdk";
import { Controller } from "@braken/http";

/**
 * 退出登录
 */
@Controller.Injectable
@Controller.Method('DELETE')
@Controller.Middleware(JSONErrorWare, LoginWare)
export default class extends Controller {
  @Controller.Inject(ApiSDK)
  private readonly sdk: ApiSDK;

  @Controller.Parameter('path', Number)
  private readonly id: number;

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  public async response() {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    const wechat = await Wechat.findOneBy({ id: this.id });
    if (!wechat) throw new Exception(500, '找不到微信');
    await this.sdk.instance.logout(wechat.wxid);
    await this.sdk.offline(Date.now(), wechat.wxid);
    return Date.now();
  }
}