import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDefined, IsNumber, isNumber, IsOptional } from "class-validator";

const LIMIT: number = 10;
const OFFSET: number = 0;

export class Pagination {

  @ApiProperty({ type: Number, description: 'pagination limit', example: 10, required: false, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public limit: number = LIMIT;

  @ApiProperty({ type: Number, description: 'pagination offset', example: 0, required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  public offset: number = OFFSET;
}