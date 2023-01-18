import {
  IsBoolean,
  IsDefined,
  IsEmail,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateUserDTO {
  @IsDefined()
  @IsEmail()
  @IsString()
  @Length(1, 255)
  public mail: string;

  @IsDefined()
  @IsString()
  @Length(1, 50)
  public firstname: string;

  @IsDefined()
  @IsString()
  @Length(1, 50)
  public lastname: string;

  @IsDefined()
  @IsString()
  @Length(1, 50)
  public pseudo: string;

  @IsDefined()
  @IsString()
  @Length(1, 255)
  public password: string;
}

export class UpdateUserDTO {
  public user_id: string;

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
