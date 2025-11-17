import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';

export abstract class BasicEntity {
  @PrimaryGeneratedColumn('uuid')
  declare id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @Expose()
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Expose()
  updatedAt!: Date;
}
