import JSONErrorWare from "../../../../middlewares/json.ware";
import HttpBodyWare from "../../../../middlewares/body.ware";
import TypeORM from "@braken/typeorm";
import UserEntity from "../../../../entities/user.entity";
import AdminWare from "../../../../middlewares/user/admin.ware";
import UserCache from "../../../../caches/user.cache";
import { Controller } from "@braken/http";
import { Context } from "koa";
import { Exception } from "wechatify-sdk";

/**
 * 设置管理员
 */
@Controller.Injectable
@Controller.Method('POST')
@Controller.Middleware(JSONErrorWare, HttpBodyWare, AdminWare)
export default class UserForbidenController extends Controller {
  @Controller.Parameter('path', Number)
  private readonly id: number;

  @Controller.Parameter('body')
  private readonly body: {
    value: boolean,
  }

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(UserCache)
  private readonly cache: UserCache

  public async response(ctx: Context) {
    if (this.id === ctx.user.id) throw new Exception(500, '不能修改自己');
    const User = this.typeorm.connection.manager.getRepository(UserEntity);
    let user = await User.findOneBy({ id: this.id });
    if (!user) throw new Exception(500, '用户不存在');

    user.forbiden = this.body.value;
    user = await User.save(user);

    await this.cache.$write({ id: user.id });

    return Date.now();
  }
}