import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

// Example entity to verify the TypeORM setup. Replace or extend with your own
// domain models; any *.entity.ts file in this folder is picked up automatically.
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Unique login/contact email for the user.
  @Column({ unique: true })
  email: string;

  // Display name shown in the UI.
  @Column()
  name: string;

  // Timestamp set automatically when the row is first inserted.
  @CreateDateColumn()
  createdAt: Date;

  // Timestamp refreshed automatically whenever the row is updated.
  @UpdateDateColumn()
  updatedAt: Date;
}
