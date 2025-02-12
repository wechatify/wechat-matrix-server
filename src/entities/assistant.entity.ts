import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity({ name: 'proxy' })
export default class AssistantEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index('w-idx')
  @Column({
    type: 'integer',
    default: 0,
  })
  public wechat_id: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  public nickname: string;

  @Index('u-idx', { unique: true })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  public username: string;

  @Column({
    type: 'text',
    nullable: true
  })
  public avatar: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true
  })
  public company_name: string;

  @Column({
    type: 'text',
    nullable: true
  })
  public session: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  public last_build_time: Date;
}