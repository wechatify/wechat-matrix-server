import JSONErrorWare from "../../../../middlewares/json.ware";
import LoginWare from "../../../../middlewares/user/login.ware";
import ApiSDK from "../../../../applications/sdk.app";
import { Controller } from "@braken/http";
import { Exception, QRCODE_STATUS } from "wechatify-sdk";

/**
 * 创建新的微信登录
 */
@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(JSONErrorWare, LoginWare)
export default class WechatQueryController extends Controller {
  @Controller.Inject(ApiSDK)
  private readonly sdk: ApiSDK;

  @Controller.Parameter('path')
  private readonly uuid: string;

  public async response() {
    const res = await this.sdk.instance.checkLogin(this.uuid);
    if (!res) throw new Exception(500, '无效查询');
    const [status, data] = res;
    if (status === QRCODE_STATUS.SUCCESS) {
      await this.sdk.online(Date.now(), data?.wxid, data?.uuid || this.uuid, data?.info, data?.meta);
    }
    return {
      status,
      data: {
        nickname: data?.nickname || data?.info?.nickname,
        avatar: data?.avatar || data?.info?.imgHead,
        wxid: data?.wxid,
        message: data?.message,
      }
    };
  }
}