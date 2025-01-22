import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity({ name: 'proxy' })
export default class ProxyEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index('a-idx', { unique: true })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  public address: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  public username: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  public password: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  public description: string;

  @Column({
    type: 'bool',
    default: false
  })
  public invalid: boolean;
}