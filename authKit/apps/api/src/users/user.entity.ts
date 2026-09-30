import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  passwordHash!: string;

  @Column({ default: false })
  emailVerified!: boolean;

  @Column({ default: false })
  mfaEnabled!: boolean;

  @Column({ type: 'varchar', nullable: true })
  mfaMethod!: 'sms' | 'email' | null;

  @Column({ nullable: true })
  phoneNumber!: string;

  @Column({ nullable: true })
  googleId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
