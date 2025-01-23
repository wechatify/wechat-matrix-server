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
export default class extends Controller {
  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  public async response() {
    const Proxy = this.typeorm.connection.manager.getRepository(ProxyEntity);
    const res = await Proxy.findBy({
      invalid: false,
    })
    return res.map(item => ({
      id: item.id,
      description: item.description,
      address: item.address,
    }))
  }
}