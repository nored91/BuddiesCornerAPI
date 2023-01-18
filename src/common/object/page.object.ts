import { Transform, Type } from "class-transformer";
import { IsDefined } from "class-validator";

export class Page {

  @IsDefined()
  @Type(() => Number)
  public limit: number;

  @IsDefined()
  public offset: number;
}