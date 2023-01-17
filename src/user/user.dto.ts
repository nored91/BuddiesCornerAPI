import { IsDefined, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { IsBoolean } from 'class-validator/types/decorator/typechecker/IsBoolean';
import { IsDate } from 'class-validator/types/decorator/typechecker/IsDate';
import { IsString } from 'class-validator/types/decorator/typechecker/IsString';

export class UserDto {
  @IsDefined()
  @IsEmail()
  @IsString()
  public mail: string;

  @IsDefined()
  @IsString()
  public firstname: string;

  @IsDefined()
  @IsString()
  public lastname: string;

  @IsDefined()
  @IsString()
  public pseudo: string;

  @IsDefined()
  @IsString()
  public password: string;

  @IsOptional()
  @IsBoolean()
  public active: boolean;

  @IsDefined()
  @IsDate()
  public creation_date: Date;
}
