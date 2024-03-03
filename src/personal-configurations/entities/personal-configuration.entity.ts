import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class PersonalConfigurations {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: string;

  @Column({ nullable: true })
  user_name: string;

  @Column({ nullable: true, type: 'jsonb' })
  favorite_persons: object;

  @Column({ nullable: true, type: 'jsonb' })
  recent_persons: object;

  @Column({ type: "timestamp", nullable: true ,default: () => 'CURRENT_TIMESTAMP'})
  last_login: Date;

  @Column({ type: "timestamp", nullable: true , default: () => 'CURRENT_TIMESTAMP'})
  last_logout: Date;
}
