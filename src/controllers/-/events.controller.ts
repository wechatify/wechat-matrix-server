import ApiSDK from "../../applications/sdk.app";
import HttpBodyWare from "../../middlewares/body.ware";
import PlainErrorWare from "../../middlewares/plain.ware";
import { Controller } from "@braken/http";
import { WechatReceiveMessage } from "wechatify-sdk";

@Controller.Injectable
@Controller.Method('POST')
@Controller.Middleware(PlainErrorWare, HttpBodyWare)
export default class extends Controller {
  @Controller.Parameter('body')
  private readonly body: WechatReceiveMessage;

  @Controller.Inject(ApiSDK)
  private readonly sdk: ApiSDK;

  public async response() {
    console.log('event.body', this.body)
    this.sdk.instance.receive(this.body);
    return Date.now();
  }
}