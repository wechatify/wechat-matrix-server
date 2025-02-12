import JSONErrorWare from "../../../middlewares/json.ware";
import AdminWare from "../../../middlewares/user/admin.ware";
import Configs from "../../../applications/configs.app";
import { Controller } from "@braken/http";
import { Context } from "koa";

@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(JSONErrorWare, AdminWare)
export class QueryConfigsController extends Controller {
  @Controller.Inject(Configs)
  private readonly configs: Configs;
  public async response(ctx: Context) {
    ctx.body = this.configs.toJSON();
  }
}