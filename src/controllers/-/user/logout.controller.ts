import JSONErrorWare from "../../../middlewares/json.ware";
import LoginWare from "../../../middlewares/user/login.ware";
import UserService from "../../../services/user.service";
import { Controller } from "@braken/http";
import { Context } from "koa";

/**
 * 用户退出登录
 */
@Controller.Injectable
@Controller.Method('DELETE')
@Controller.Middleware(JSONErrorWare, LoginWare)
export default class UserLogoutController extends Controller {
  @Controller.Inject(UserService)
  private readonly UserService: UserService;

  public async response(ctx: Context) {
    await this.UserService.removeCache(ctx.user.id);
    ctx.cookies.set('authorization', '', {
      path: '/',
      httpOnly: true,
      expires: new Date(0),
      signed: true,
    });
    return Date.now();
  }
}