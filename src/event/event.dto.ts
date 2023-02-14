import { IsBoolean, IsDate, IsDefined, IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateEventDTO {
  @IsDefined()
  @IsUUID()
  public group_id: string;

  @IsDefined()
  @IsUUID()
  public creator_user_id: string;

  @IsDefined()
  @IsString()
  @Length(1, 100)
  public title: string;

  @IsDefined()
  @IsString()
  @Length(1, 250)
  public description: string;

  @IsDefined()
  @IsString()
  @Length(1, 255)
  public location: string;

  @IsDefined()
  @IsDate()
  public event_date: string;
}

export class UpdateEventDTO {
  public event_id: string;

  @IsEmail()
  @IsString()
  @Length(1, 255)
  @IsOptional()
  public mail: string;

  @IsString()
  @Length(1, 50)
  @IsOptional()
  public firstname: string;

  @IsString()
  @Length(1, 50)
  @IsOptional()
  public lastname: string;

  @IsString()
  @Length(1, 50)
  @IsOptional()
  public pseudo: string;

  @IsString()
  @Length(1, 255)
  @IsOptional()
  public password: string;

  @IsBoolean()
  @IsOptional()
  public active: boolean;
}
