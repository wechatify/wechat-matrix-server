import JSONErrorWare from "../../../../../middlewares/json.ware";
import LoginWare from "../../../../../middlewares/user/login.ware";
import ApiSDK from "../../../../../applications/sdk.app";
import { Exception } from "wechatify-sdk";
import { Controller } from "@braken/http";
import TypeORM from "@braken/typeorm";
import WechatEntity from "../../../../../entities/wechat.entity";

/**
 * 删除代理
 */
@Controller.Injectable
@Controller.Method('DELETE')
@Controller.Middleware(JSONErrorWare, LoginWare)
export class WechatProxyRemoveController extends Controller {
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
    await this.sdk.instance.deleteProxy(wechat.wxid);
    await this.sdk.proxy(Date.now(), wechat.wxid, {
      address: null,
      username: null,
      password: null,
    })
    return Date.now();
  }
}