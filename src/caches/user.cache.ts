import TypeORM from '@braken/typeorm';
import UserEntity from '../entities/user.entity';
import { Cache } from '@braken/cache';

export interface UserCacheParams {
  id: number
}

@Cache.Injectable
@Cache.Path('/user/:id')
export default class UserCache extends Cache<UserEntity, UserCacheParams> {
  @Cache.Inject(TypeORM)
  private readonly typeorm: TypeORM;
  public async execute(params: UserCacheParams) {
    const User = this.typeorm.connection.manager.getRepository(UserEntity);
    const user = await User.findOneBy({ id: params.id });
    if (!user) throw new Error('无效用户');
    return {
      value: user,
    }
  }
}