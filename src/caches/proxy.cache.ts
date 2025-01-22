import TypeORM from '@braken/typeorm';
import ProxyEntity from '../entities/proxy.entity';
import { Cache } from '@braken/cache';

export interface ProxyCacheParams {
  id: number
}

@Cache.Injectable
@Cache.Path('/proxy/:id')
export default class ProxyCache extends Cache<ProxyEntity, ProxyCacheParams> {
  @Cache.Inject(TypeORM)
  private readonly typeorm: TypeORM;
  public async execute(params: ProxyCacheParams) {
    const Proxy = this.typeorm.connection.manager.getRepository(ProxyEntity);
    const proxy = await Proxy.findOneBy({ id: params.id });
    if (!proxy) throw new Error('无效代理');
    return {
      value: proxy,
    }
  }
}