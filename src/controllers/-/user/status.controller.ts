import JSONErrorWare from "../../../middlewares/json.ware";
import LoginWare from "../../../middlewares/user/login.ware";
import { Controller } from "@braken/http";
import { Context } from "koa";

interface UserProps {
  mail: string,
  admin: boolean,
}

/**
 * 用户状态
 */
@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(JSONErrorWare, LoginWare)
export default class UserStatusController extends Controller {
  public async response(ctx: Context) {
    const res: UserProps = {
      mail: null,
      admin: false,
    }
    res.mail = ctx.user?.mail || null;
    res.admin = ctx.user?.admin || false;
    return res;
  }
}