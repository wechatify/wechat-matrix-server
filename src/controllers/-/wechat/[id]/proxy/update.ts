import JSONErrorWare from "../../../../../middlewares/json.ware";
import LoginWare from "../../../../../middlewares/user/login.ware";
import ApiSDK from "../../../../../applications/sdk.app";
import { Exception } from "wechatify-sdk";
import { Controller } from "@braken/http";
import TypeORM from "@braken/typeorm";
import WechatEntity from "../../../../../entities/wechat.entity";
import HttpBodyWare from "../../../../../middlewares/body.ware";
import ProxyCache from "../../../../../caches/proxy.cache";
import ProxyEntity from "../../../../../entities/proxy.entity";

/**
 * 更换代理
 */
@Controller.Injectable
@Controller.Method('POST')
@Controller.Middleware(JSONErrorWare, HttpBodyWare, LoginWare)
export class WechatProxyUpdateController extends Controller {
  @Controller.Inject(ApiSDK)
  private readonly sdk: ApiSDK;

  @Controller.Parameter('path', Number)
  private readonly id: number;

  @Controller.Parameter('body')
  private readonly body: {
    proxy: number,
  }

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(ProxyCache)
  private readonly ProxyCache: ProxyCache;

  public async response() {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    const wechat = await Wechat.findOneBy({ id: this.id });
    if (!wechat) throw new Exception(500, '找不到微信');
    if (!this.body.proxy) throw new Exception(500, '请选择需要更新的代理');
    const proxy: ProxyEntity = await this.ProxyCache.$read({ id: this.body.proxy });
    if (!proxy) throw new Exception(500, '找不到代理');

    const data = {
      address: proxy.address,
      username: proxy.username,
      password: proxy.password,
    }

    await this.sdk.instance.updateProxy(wechat.wxid, data);
    await this.sdk.proxy(Date.now(), wechat.wxid, data);

    return Date.now();
  }
}