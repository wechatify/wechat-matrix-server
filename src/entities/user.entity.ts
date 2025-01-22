import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity({ name: 'user' })
export default class UserEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index('mail-idx', { unique: true })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  public mail: string;

  @Column({
    type: 'varchar',
    length: 32,
    nullable: false
  })
  public hash: string;

  @Column({
    type: 'varchar',
    length: 6,
    nullable: false
  })
  public salt: string;

  @Column({
    type: 'bool',
    default: false
  })
  @Index('admin-idx')
  public admin: boolean;

  @Column({
    type: 'bool',
    default: false,
  })
  @Index('forbiden-idx')
  public forbiden: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  public last_login_time: Date;
}