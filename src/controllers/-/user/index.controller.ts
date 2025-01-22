import JSONErrorWare from "../../../middlewares/json.ware";
import TypeORM from "@braken/typeorm";
import UserEntity from "../../../entities/user.entity";
import AdminWare from "../../../middlewares/user/admin.ware";
import { Context } from "koa";
import { Controller } from "@braken/http";
import { toNumber } from "../../../utils";

/**
 * 用户列表
 */
@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(JSONErrorWare, AdminWare)
export default class UserTokenController extends Controller {
  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Parameter('query', toNumber(1))
  private readonly page: number;

  @Controller.Parameter('query', toNumber(10))
  private readonly size: number;

  public async response(ctx: Context) {
    const User = this.typeorm.connection.manager.getRepository(UserEntity);
    const [data, total] = await User.findAndCount({
      skip: (this.page - 1) * this.size,
      take: this.size,
    })
    return {
      total,
      data: data.map(user => ({
        id: user.id,
        mail: user.mail,
        admin: user.admin,
        forbiden: user.forbiden,
        last_login_time: user.last_login_time,
      }))
    }
  }
}