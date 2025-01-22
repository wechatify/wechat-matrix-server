import JSONErrorWare from "../../../middlewares/json.ware";
import HttpBodyWare from "../../../middlewares/body.ware";
import LoginWare from "../../../middlewares/user/login.ware";
import ApiSDK from "../../../applications/sdk.app";
import ProxyCache from "../../../caches/proxy.cache";
import { createToken } from "../../../utils";
import { Controller } from "@braken/http";
import { Exception } from "wechatify-sdk";
import ProxyEntity from "../../../entities/proxy.entity";

/**
 * 创建新的微信登录
 */
@Controller.Injectable
@Controller.Method('PUT')
@Controller.Middleware(JSONErrorWare, HttpBodyWare, LoginWare)
export class WechatNewController extends Controller {
  @Controller.Inject(ApiSDK)
  private readonly sdk: ApiSDK;

  @Controller.Parameter('body')
  private readonly body: {
    proxy: number,
  };

  @Controller.Inject(ProxyCache)
  private readonly ProxyCache: ProxyCache;

  public async response() {
    let proxy: ProxyEntity;
    if (this.body.proxy) {
      proxy = await this.ProxyCache.$read({ id: this.body.proxy });
      if (!proxy) throw new Exception(500, '找不到代理');
      if (proxy.invalid) throw new Exception(500, '代理已失效');
    }
    const deviceId = createToken(4, 6);
    const deviceName = createToken(4, 4, 4, 4);
    return await this.sdk.instance.qrcode({
      deviceId,
      deviceName,
      proxy: {
        address: proxy?.address || '',
        username: proxy?.username || '',
        password: proxy?.password || '',
      }
    })
  }
}