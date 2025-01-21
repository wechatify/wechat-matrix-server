import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

export enum WECHAT_STATUS {
  FORBIDEN,
  OFFLINE,
  ONLINE,
}

@Entity({ name: 'wechat' })
export default class WechatEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index('v-idx', { unique: true })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  public wxid: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  public nickname: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  public email: string;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  public mobile: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  public uin: string;

  @Column({
    type: 'integer',
    default: 0
  })
  public sex: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  public signature: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  public country: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  public province: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  public city: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  public avatar: string;

  @Index('s-idx')
  @Column({
    type: 'integer',
    default: 0
  })
  public status: WECHAT_STATUS;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  public device_id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  public device_name: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  public proxy: {
    address: string,
    username: string,
    password: string,
  };

  @Index('lut-idx')
  @Column({
    type: 'timestamp',
    comment: '更新时间',
    default: () => 'CURRENT_TIMESTAMP'
  })
  public last_login_time: Date;

  @Index('d-idx')
  @Column({
    type: 'bool',
    nullable: false,
  })
  public invalid: boolean;
}