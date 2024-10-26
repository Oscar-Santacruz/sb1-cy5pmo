import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryParamsDto {
  @ApiProperty({
    description: 'Start date (YYYY-MM-DD)',
    example: '2024-10-16',
    required: true
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date (YYYY-MM-DD)',
    example: '2024-10-16',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Specific user (e.g., QZDASOINIT) or leave empty for all users',
    example: 'QZDASOINIT',
    required: false
  })
  @IsOptional()
  @IsString()
  user?: string;
}