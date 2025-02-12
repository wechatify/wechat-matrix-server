import ApiSDK from "./sdk.app";
import AssistantCache from '../caches/assistant.cache';
import TypeORM from '@braken/typeorm';
import AssistantEntity from '../entities/assistant.entity';
import Logger from '@braken/logger';
import { Application } from "@braken/application";
import { AssistantRequest } from 'wechatify-sdk/dist/requests/assistant';
import { Exception } from "wechatify-sdk";

@Application.Injectable
export default class Assistant extends Application {
  private readonly stacks = new Map<string, AssistantRequest>();

  @Application.Inject(ApiSDK)
  private readonly sdk: ApiSDK;

  @Application.Inject(AssistantCache)
  private readonly AssistantCache: AssistantCache;

  @Application.Inject(TypeORM)
  private readonly typeorm: TypeORM;

  @Application.Inject(Logger)
  private readonly logger: Logger;

  private async saveSession(username: string, session: string) {
    const Assistant = this.typeorm.connection.manager.getRepository(AssistantEntity);
    const assistant = await Assistant.findOneBy({ username });
    if (assistant) {
      assistant.session = session;
      assistant.last_build_time = new Date();
      await Assistant.save(assistant);
      await this.AssistantCache.$write({ username });
    }
  }

  public async remove(username: string) {
    const Assistant = this.typeorm.connection.manager.getRepository(AssistantEntity);
    const assistant = await Assistant.findOneBy({ username });
    if (assistant) {
      await Assistant.remove(assistant);
      await this.AssistantCache.$delete({ username });
    }
    if (this.stacks.has(username)) {
      const cur = this.stacks.get(username);
      cur.clean();
      this.sdk.instance.assistant.delete(cur.wxid, cur.finder);
      this.stacks.delete(username);
    }
  }

  public async use(username: string) {
    if (this.stacks.has(username)) {
      return this.stacks.get(username);
    }
    const res = await this.AssistantCache.$read({ username });
    if (!res) throw new Exception(500, '找不到助手缓存');
    const current = this.sdk.instance.assistant.use(res.wxid, username);
    current.setSession(res.session);
    current.on('session', session => this.saveSession(username, session).catch(e => this.logger.error(e)));
    current.on('disconnect', () => this.remove(username).catch(e => this.logger.error(e)));
    this.stacks.set(username, current);
    return current;
  }

  public get(username: string) {
    return this.stacks.get(username);
  }

  public async initialize() {
    // const res = await this.sdk.instance.assistant.members('wxid_plsdxzp40r8k11', '123');
    // const finders = res.map(item => item.finderUsername);
    // const s1 = await this.sdk.instance.assistant.scan('plmes3', '123', finders[0]);
    // const req = this.sdk.instance.assistant.use('wxid_plsdxzp40r8k11', 'v2_060000231003b20faec8c5e78d1acad2cc03e531b077456029bf2af826dbcc3647e7f6d71807@finder');
    // req.on('session', session => console.log('+', session));
    // req.on('disconnect', () => console.log('-', 'disconnect', req.wxid, req.finder))
    // req.setSession('BgAA+O+dJYzBBTEHxzbx5V7XSJz2+74SelR6iS9DfT01BVbGMjkeXsiggA/4VbbIkSpuM66PAtSt9e8mndZR6dCKcyXuc4LOLYZudt3kEs/A');
    // const res = await req.post(`/cgi-bin/mmfinderassistant-bin/post/post_list?_rid=${Date.now()}`, {
    //   currentPage: 1,
    //   pageSize: 5,
    //   reqScene: 7,
    //   scene: 7,
    //   timestamp: Math.floor(Date.now() / 1000).toString(),
    //   userpageType: 11,
    //   _log_finder_id: req.finder
    // })
    // const s = 'BgAAD6a3vLyFm5qGsY/Wy9zqeebeL1bMdLAF5FddymXtGbT3Opr3YBGIMhEhM/g2OFvd+bV0ZuDOw0hqEAd/RmGqc1NarIvhMnFJNrVMp58=';
    // const res = await axios.post(`https://channels.weixin.qq.com/cgi-bin/mmfinderassistant-bin/post/post_list?_rid=${Date.now()}`, {
    //   currentPage: 1,
    //   pageSize: 5,
    //   reqScene: 7,
    //   scene: 7,
    //   timestamp: Math.floor(Date.now() / 1000).toString(),
    //   userpageType: 11,
    //   _log_finder_id: 'v2_060000231003b20faec8c5e58d1ac2d0cc04ed35b0773e0dcaa981a2a9947a6ca3fe4c0b0d7d@finder'
    // }, {
    //   headers: {
    //     Cookie: 'sessionid=' + encodeURIComponent(s),
    //   }
    // })
    // console.log(res);
  }
}