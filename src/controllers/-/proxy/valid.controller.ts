import JSONErrorWare from "../../../middlewares/json.ware";
import LoginWare from "../../../middlewares/user/login.ware";
import TypeORM from "@braken/typeorm";
import ProxyEntity from "../../../entities/proxy.entity";
import { Controller } from "@braken/http";

/**
 * 可用代理列表
 */
@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(JSONErrorWare, LoginWare)
export class ProxyQueryController extends Controller {
  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  public async response() {
    const Proxy = this.typeorm.connection.manager.getRepository(ProxyEntity);
    return await Proxy.findBy({
      invalid: false,
    })
  }
}