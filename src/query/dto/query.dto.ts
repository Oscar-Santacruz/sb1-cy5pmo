import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDto {
  @ApiProperty({
    description: 'SQL query to execute',
    example: 'SELECT * FROM mcleda.lck9 WHERE DATE(TIMESTAMP) = \'2024-10-16\''
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^SELECT\s+.*\s+FROM/i, {
    message: 'Only SELECT queries are allowed'
  })
  query: string;
}