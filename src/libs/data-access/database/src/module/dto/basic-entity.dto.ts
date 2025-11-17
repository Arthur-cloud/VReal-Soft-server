import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

export class BasicEntityDto {
  @ApiProperty({
    description: 'The ID of the record.',
    type: String,
    format: 'uuid',
    required: true,
    readOnly: true,
  })
  @IsUUID()
  @IsOptional()
  @Expose()
  declare id: string;

  @ApiProperty({
    description: 'The date and time when the record was created.',
    type: Date,
    format: 'date-time',
    required: true,
  })
  @Expose()
  declare createdAt: Date;

  @ApiProperty({
    description: 'The date and time when the record was last updated.',
    type: Date,
    format: 'date-time',
    required: true,
  })
  @Expose()
  declare updatedAt: Date;
}
