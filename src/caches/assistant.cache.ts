import TypeORM from '@braken/typeorm';
import ProxyEntity from '../entities/proxy.entity';
import { Cache } from '@braken/cache';
import AssistantEntity from '../entities/assistant.entity';
import WechatEntity from '../entities/wechat.entity';

export interface AssistantCacheParams {
  username: string
}

export interface AssistantCacheData {
  wxid: string,
  session: string,
}

@Cache.Injectable
@Cache.Path('/assistant/:username')
export default class AssistantCache extends Cache<AssistantCacheData, AssistantCacheParams> {
  @Cache.Inject(TypeORM)
  private readonly typeorm: TypeORM;
  public async execute(params: AssistantCacheParams) {
    const sql = this.typeorm.connection.manager.getRepository(AssistantEntity).createQueryBuilder('a');
    sql.leftJoin(WechatEntity, 'w', 'w.id=a.wechat_id');
    sql.where('a.username=:username', { username: params.username });
    sql.select('w.wxid', 'wxid');
    sql.addSelect('a.session', 'session');
    const assistant = await sql.getRawOne<AssistantCacheData>();
    if (!assistant) throw new Error('无效助手数据');
    return {
      value: {
        wxid: assistant.wxid,
        session: assistant.session,
      },
    }
  }
}