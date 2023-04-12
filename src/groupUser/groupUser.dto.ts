import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, ValidationError } from 'class-validator';
import { BadRequestExceptionValidation } from '../common/exception/badRequestExceptionValidation';

export class CreateGroupUserDTO {
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      let error: ValidationError[] = [{ property: 'administrator', constraints: { administrator: 'administrator must be a boolean value' } }];
      throw new BadRequestExceptionValidation(error);
    }
  })
  @IsBoolean()
  public administrator: boolean;

  public group_id?: string;
  public user_id?: string;
}

export class UpdateGroupUserDTO {
  public group_id: string;
  public user_id: string;

  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      let error: ValidationError[] = [{ property: 'administrator', constraints: { administrator: 'administrator must be a boolean value' } }];
      throw new BadRequestExceptionValidation(error);
    }
  })
  @IsBoolean()
  public administrator?: boolean;
}
