import JSONErrorWare from "../../../../../middlewares/json.ware";
import LoginWare from "../../../../../middlewares/user/login.ware";
import TypeORM from "@braken/typeorm";
import WechatEntity from "../../../../../entities/wechat.entity";
import AssistantEntity from "../../../../../entities/assistant.entity";
import { Exception } from "wechatify-sdk";
import { Controller } from "@braken/http";

@Controller.Injectable
@Controller.Method('GET')
@Controller.Middleware(JSONErrorWare, LoginWare)
export default class AssistantListController extends Controller {
  @Controller.Parameter('path', Number)
  private readonly id: number;

  @Controller.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  public async response() {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    const wechat = await Wechat.findOneBy({ id: this.id });
    if (!wechat) throw new Exception(500, '找不到微信');
    const Assistant = this.typeorm.connection.manager.getRepository(AssistantEntity);
    const res = await Assistant.findBy({ wechat_id: wechat.id });
    return res.map(item => ({
      id: item.id,
      username: item.username,
      nickname: item.nickname,
      avatar: item.avatar,
      company_name: item.company_name,
      last_build_time: item.last_build_time,
    }))
  }
}