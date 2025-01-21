import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

export enum WECHAT_ACTIONS {
  REMOVE,
  FORBIDEN,
  OFFLINE,
  ONLINE,
  RECONNECT,
  PROXY,
}

@Entity({ name: 'wechat_logs' })
export default class WechatLogsEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index('w-idx')
  @Column({
    type: 'integer',
    nullable: false
  })
  public wechat_id: number;

  @Index('s-idx')
  @Column({
    type: 'integer',
    nullable: true,
  })
  public status: WECHAT_ACTIONS;

  @Index('t-idx')
  @Column({
    type: 'timestamp',
    comment: '更新时间',
    default: () => 'CURRENT_TIMESTAMP'
  })
  public last_login_time: Date;
}