import JSONErrorWare from "../../../middlewares/json.ware";
import LoginWare from "../../../middlewares/user/login.ware";
import TypeORM from "@braken/typeorm";
import WechatEntity from "../../../entities/wechat.entity";
import { toNumber } from "../../../utils";
import { Controller } from "@braken/http";

/**
 * 微信列表
 */
@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(JSONErrorWare, LoginWare)
export class WechatsController extends Controller {
  @Controller.Parameter('query', toNumber(1))
  private readonly page: number;

  @Controller.Parameter('query', toNumber(10))
  private readonly size: number;

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  public async response() {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    const [wechats, total] = await Wechat.findAndCount({
      skip: (this.page - 1) * this.size,
      take: this.size,
      order: {
        'last_login_time': 'DESC',
      }
    })
    return {
      total,
      data: wechats,
    }
  }
}