import TypeORM from '@braken/typeorm';
import WechatEntity from '../entities/wechat.entity';
import { Exception } from 'wechatify-sdk';
import { Cache } from '@braken/cache';

export interface WechatCacheParams {
  wxid: string,
}

@Cache.Injectable
@Cache.Path('/wechat/:wxid')
export default class WechatCache extends Cache<WechatEntity, WechatCacheParams> {
  @Cache.Inject(TypeORM)
  private readonly typeorm: TypeORM;
  public async execute(params: WechatCacheParams) {
    const Wechat = this.typeorm.connection.manager.getRepository(WechatEntity);
    const wechat = await Wechat.findOneBy({ wxid: params.wxid });
    if (!wechat) {
      throw new Exception(500, '微信不存在');
    }
    return {
      value: wechat,
    }
  }
}