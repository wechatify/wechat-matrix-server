import ApiSDK from "../../applications/sdk.app";
import PlainErrorWare from "../../middlewares/plain.ware";
import { Controller } from "@braken/http";
import { WechatReceiveMessage } from "wechatify-sdk";

@Controller.Injectable
@Controller.Method('POST')
@Controller.Middleware(PlainErrorWare)
export default class extends Controller {
  @Controller.Parameter('body')
  private readonly body: WechatReceiveMessage;

  @Controller.Inject(ApiSDK)
  private readonly sdk: ApiSDK;

  public async response() {
    this.sdk.instance.receive(this.body);
    return Date.now();
  }
}