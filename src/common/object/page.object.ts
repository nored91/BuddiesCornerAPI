import { Transform, Type } from "class-transformer";
import { IsDefined, IsOptional } from "class-validator";

export class Page {

  @IsOptional()
  @Type(() => Number)
  public limit: number;

  @IsOptional()
  public offset: number;
}