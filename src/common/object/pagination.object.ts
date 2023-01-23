import { Transform, Type } from "class-transformer";
import { IsDefined, IsOptional } from "class-validator";

const LIMIT: number = 10;
const OFFSET: number = 0;

export class Pagination {

  @IsOptional()
  @Type(() => Number)
  public limit: number = LIMIT;

  @IsOptional()
  @Type(() => Number)
  public offset: number = OFFSET;
}