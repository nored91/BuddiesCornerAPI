import { IsDefined, IsOptional, IsString, Length } from 'class-validator';

export class CreateGroupDTO {
  @IsDefined()
  @IsString()
  @Length(1, 100)
  public title: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  public description: string;
}

export class UpdateGroupDTO {
  public group_id: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  public title: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  public description: string;
}
