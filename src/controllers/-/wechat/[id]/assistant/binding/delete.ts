import JSONErrorWare from "../../../../../../middlewares/json.ware";
import LoginWare from "../../../../../../middlewares/user/login.ware";
import TypeORM from "@braken/typeorm";
import WechatEntity from "../../../../../../entities/wechat.entity";
import HttpBodyWare from "../../../../../../middlewares/body.ware";
import AssistantEntity from "../../../../../../entities/assistant.entity";
import Assistant from "../../../../../../applications/assistant.app";
import { Exception } from "wechatify-sdk";
import { Controller } from "@braken/http";

@Controller.Injectable
@Controller.Method('POST')
@Controller.Middleware(JSONErrorWare, HttpBodyWare, LoginWare)
export class AssistantBindingDeleteController extends Controller {
  @Controller.Parameter('path', Number)
  private readonly id: number;

  @Controller.Parameter('body')
  private readonly body: {
    username: string,
  }

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Controller.Inject(Assistant)
  private readonly Assistant: Assistant;

  public async response() {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    const wechat = await Wechat.findOneBy({ id: this.id });
    if (!wechat) throw new Exception(500, '找不到微信');

    const Assistant = this.typeorm.connection.manager.getRepository(AssistantEntity);
    let assistant = await Assistant.findOneBy({
      username: this.body.username,
    })

    if (!assistant) throw new Exception(500, '找不到绑定关系');

    await this.Assistant.remove(this.body.username);

    return Date.now();
  }
}