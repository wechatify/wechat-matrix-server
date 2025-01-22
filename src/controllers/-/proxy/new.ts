import JSONErrorWare from "../../../middlewares/json.ware";
import HttpBodyWare from "../../../middlewares/body.ware";
import LoginWare from "../../../middlewares/user/login.ware";
import TypeORM from "@braken/typeorm";
import ProxyEntity from "../../../entities/proxy.entity";
import { Exception, IProxy } from "wechatify-sdk";
import { Controller } from "@braken/http";
import ProxyCache from "../../../caches/proxy.cache";

/**
 * 创建代理
 */
@Controller.Injectable
@Controller.Method('PUT')
@Controller.Middleware(JSONErrorWare, HttpBodyWare, LoginWare)
export class ProxyNewController extends Controller {
  @Controller.Parameter('body')
  private readonly body: IProxy & {
    description: string,
  };

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(ProxyCache)
  private readonly ProxyCache: ProxyCache;

  public async response() {
    const Proxy = this.typeorm.connection.manager.getRepository(ProxyEntity);
    let proxy = await Proxy.findOneBy({ address: this.body.address });
    if (proxy) throw new Exception(500, '代理已存在');
    proxy = Proxy.create();
    proxy.address = this.body.address;
    proxy.username = this.body.username;
    proxy.password = this.body.password;
    proxy.description = this.body.description;
    proxy.invalid = false;
    proxy = await Proxy.save(proxy);
    await this.ProxyCache.$write({ id: proxy.id });
    return proxy;
  }
}