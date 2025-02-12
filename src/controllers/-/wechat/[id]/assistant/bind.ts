import JSONErrorWare from "../../../../../middlewares/json.ware";
import LoginWare from "../../../../../middlewares/user/login.ware";
import ApiSDK from "../../../../../applications/sdk.app";
import TypeORM from "@braken/typeorm";
import WechatEntity from "../../../../../entities/wechat.entity";
import HttpBodyWare from "../../../../../middlewares/body.ware";
import AssistantEntity from "../../../../../entities/assistant.entity";
import AssistantCache from "../../../../../caches/assistant.cache";
import { Exception } from "wechatify-sdk";
import { Controller } from "@braken/http";

@Controller.Injectable
@Controller.Method('PUT')
@Controller.Middleware(JSONErrorWare, HttpBodyWare, LoginWare)
export class AssistantBindController extends Controller {
  @Controller.Inject(ApiSDK)
  private readonly sdk: ApiSDK;

  @Controller.Parameter('path', Number)
  private readonly id: number;

  @Controller.Parameter('body')
  private readonly body: {
    username: string,
  }

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(AssistantCache)
  private readonly AssistantCache: AssistantCache;

  public async response() {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    const wechat = await Wechat.findOneBy({ id: this.id });
    if (!wechat) throw new Exception(500, '找不到微信');

    const Assistant = this.typeorm.connection.manager.getRepository(AssistantEntity);
    let assistant = await Assistant.findOneBy({
      username: this.body.username,
    })

    if (assistant) throw new Exception(500, '已绑定，请不要重复绑定');

    const token = Date.now().toString();
    const list = await this.sdk.instance.assistant.members(wechat.wxid, token);
    const current = list.find(item => item.finderUsername === this.body.username);
    if (!current) throw new Exception(500, '找不到绑定关系');

    const session = await this.sdk.instance.assistant.scan(wechat.wxid, token, current.finderUsername);

    assistant = Assistant.create();

    // @ts-ignore
    assistant.company_name = current.authCompanyName;
    assistant.nickname = current.nickname;
    assistant.username = current.finderUsername;
    assistant.wechat_id = wechat.id;
    assistant.avatar = current.headImgUrl;
    assistant.session = session;
    assistant.last_build_time = new Date();
    assistant = await Assistant.save(assistant);

    await this.AssistantCache.$write({ username: assistant.username });

    return Date.now();
  }
}