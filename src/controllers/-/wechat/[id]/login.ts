import JSONErrorWare from "../../../../middlewares/json.ware";
import LoginWare from "../../../../middlewares/user/login.ware";
import ApiSDK from "../../../../applications/sdk.app";
import { Exception, IProxy } from "wechatify-sdk";
import { Controller } from "@braken/http";
import TypeORM from "@braken/typeorm";
import WechatEntity from "../../../../entities/wechat.entity";
import ProxyCache from "../../../../caches/proxy.cache";
import ProxyEntity from "../../../../entities/proxy.entity";

/**
 * 微信登录
 */
@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(JSONErrorWare, LoginWare)
export class WechatLoginController extends Controller {
  @Controller.Inject(ApiSDK)
  private readonly sdk: ApiSDK;

  @Controller.Parameter('path', Number)
  private readonly id: number;

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(ProxyCache)
  private readonly ProxyCache: ProxyCache;

  public async response() {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    const wechat = await Wechat.findOneBy({ id: this.id });
    if (!wechat) throw new Exception(500, '找不到微信');
    const proxy_id = wechat.proxy;
    let proxy: ProxyEntity;
    if (proxy_id) {
      proxy = await this.ProxyCache.$read({ id: proxy_id });
      if (!proxy) throw new Exception(500, '找不到代理');
      if (proxy.invalid) throw new Exception(500, '代理已失效');
    }
    return await this.sdk.instance.qrcode({
      deviceId: wechat.device_id,
      deviceName: wechat.device_name,
      proxy: {
        address: proxy?.address || '',
        username: proxy?.username || '',
        password: proxy?.password || '',
      }
    })
  }
}