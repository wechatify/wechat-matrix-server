import JSONErrorWare from "../../../middlewares/json.ware";
import TypeORM from "@braken/typeorm";
import ProxyEntity from "../../../entities/proxy.entity";
import { Controller } from "@braken/http";
import { toNumber } from "../../../utils";
import AdminWare from "../../../middlewares/user/admin.ware";

/**
 * 代理列表
 */
@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(JSONErrorWare, AdminWare)
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