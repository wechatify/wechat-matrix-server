import JSONErrorWare from "../../../../middlewares/json.ware";
import HttpBodyWare from "../../../../middlewares/body.ware";
import TypeORM from "@braken/typeorm";
import ProxyEntity from "../../../../entities/proxy.entity";
import { Exception, IProxy } from "wechatify-sdk";
import { Controller } from "@braken/http";
import ProxyCache from "../../../../caches/proxy.cache";
import AdminWare from "../../../../middlewares/user/admin.ware";

/**
 * 更新代理
 */
@Controller.Injectable
@Controller.Method('POST')
@Controller.Middleware(JSONErrorWare, HttpBodyWare, AdminWare)
export default class extends Controller {
  @Controller.Parameter('path', Number)
  private readonly id: number;
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
    let proxy = await Proxy.findOneBy({ id: this.id });
    if (!proxy) throw new Exception(500, '代理不存在');
    proxy.address = this.body.address;
    proxy.username = this.body.username;
    proxy.password = this.body.password;
    proxy.description = this.body.description;
    proxy = await Proxy.save(proxy);
    await this.ProxyCache.$write({ id: proxy.id });
    return proxy;
  }
}