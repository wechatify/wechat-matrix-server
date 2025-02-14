import JSONErrorWare from "../../../../middlewares/json.ware";
import LoginWare from "../../../../middlewares/user/login.ware";
import ApiSDK from "../../../../applications/sdk.app";
import { Exception } from "wechatify-sdk";
import { Controller } from "@braken/http";
import TypeORM from "@braken/typeorm";
import WechatEntity from "../../../../entities/wechat.entity";
import WechatCache from "../../../../caches/wechat.cache";

/**
 * 微信登录
 */
@Controller.Injectable
@Controller.Method('DELETE')
@Controller.Middleware(JSONErrorWare, LoginWare)
export class WechatRemoveController extends Controller {
  @Controller.Inject(ApiSDK)
  private readonly sdk: ApiSDK;

  @Controller.Parameter('path', Number)
  private readonly id: number;

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(WechatCache)
  private readonly WechatCache: WechatCache;

  public async response() {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    const wechat = await Wechat.findOneBy({ id: this.id });
    if (!wechat) throw new Exception(500, '找不到微信');
    await this.sdk.instance.delete(wechat.wxid);
    await this.sdk.remove(Date.now(), wechat.wxid);
    await Wechat.remove(wechat);
    await this.WechatCache.$delete({ wxid: wechat.wxid });
    return Date.now();
  }
}