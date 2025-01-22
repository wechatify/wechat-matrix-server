import JSONErrorWare from "../../../middlewares/json.ware";
import LoginWare from "../../../middlewares/user/login.ware";
import TypeORM from "@braken/typeorm";
import ProxyEntity from "../../../entities/proxy.entity";
import { Controller } from "@braken/http";
import { toNumber } from "../../../utils";

/**
 * 代理列表
 */
@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(JSONErrorWare, LoginWare)
export class ProxyQueryController extends Controller {
  @Controller.Parameter('query', toNumber(1))
  private readonly page: number;

  @Controller.Parameter('query', toNumber(10))
  private readonly size: number;

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  public async response() {
    const Proxy = this.typeorm.connection.manager.getRepository(ProxyEntity);
    const [data, total] = await Proxy.findAndCount({
      skip: (this.page - 1) * this.size,
      take: this.size,
    })
    return {
      total, data,
    }
  }
}