import JSONErrorWare from "../../../../middlewares/json.ware";
import LoginWare from "../../../../middlewares/user/login.ware";
import TypeORM from "@braken/typeorm";
import WechatEntity from "../../../../entities/wechat.entity";
import ProxyEntity from "../../../../entities/proxy.entity";
import { Exception } from "wechatify-sdk";
import { Controller } from "@braken/http";

/**
 * 微信登录
 */
@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(JSONErrorWare, LoginWare)
export default class WechatDetailController extends Controller {
  @Controller.Parameter('path', Number)
  private readonly id: number;

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  public async response() {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    const wechat = await Wechat.findOneBy({ id: this.id });
    if (!wechat) throw new Exception(500, '找不到微信');
    let proxy: ProxyEntity;
    if (wechat.proxy) {
      const Proxy = this.typeorm.connection.manager.getRepository(ProxyEntity);
      proxy = await Proxy.findOneBy({ id: wechat.proxy });
      if (!proxy) throw new Exception(500, '找不到代理');
    }
    return {
      ...wechat,
      proxy: {
        address: proxy?.address
      },
    }
  }
}