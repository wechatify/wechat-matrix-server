import JSONErrorWare from '../../../middlewares/json.ware';
import AdminWare from '../../../middlewares/user/admin.ware';
import Configs, { IConfigs } from '../../../applications/configs.app';
import HttpBodyWare from '../../../middlewares/body.ware';
import { Controller } from "@braken/http";

@Controller.Injectable
@Controller.Method('POST')
@Controller.Middleware(JSONErrorWare, HttpBodyWare, AdminWare)
export class UpdateConfigsController extends Controller {
  @Controller.Parameter('body')
  private readonly body: Partial<IConfigs>;

  @Controller.Inject(Configs)
  private readonly configs: Configs;
  public async response() {
    await this.configs.saveConfigs(this.body);
    return Date.now();
  }
}