import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min, min } from 'class-validator';

export const LIMIT: number = 10;
export const OFFSET: number = 0;

export class Pagination {
  @ApiProperty({ type: Number, description: 'pagination limit', example: 10, required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  public limit: number = LIMIT;

  @ApiProperty({ type: Number, description: 'pagination offset', example: 0, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  public offset: number = OFFSET;
}
