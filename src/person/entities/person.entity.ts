
import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Person {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  link_id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  user_name: string;

  @Column()
  password: string;

  @Column()
  org_name: string;
}
