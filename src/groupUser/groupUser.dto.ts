import { Transform } from 'class-transformer';
import { IsBoolean, IsDefined, IsOptional, IsString, Length, ValidationError } from 'class-validator';
import { BadRequestExceptionValidation } from '../common/exception/badRequestExceptionValidation';
import { Group } from '../group/group.entity';
import { User } from '../user/user.entity';

export class CreateGroupUserDTO {
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch (e) {
      let error: ValidationError[] = [{ property: 'active', constraints: { active: 'active must be a boolean value' } }];
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
      let error: ValidationError[] = [{ property: 'active', constraints: { active: 'active must be a boolean value' } }];
      throw new BadRequestExceptionValidation(error);
    }
  })
  @IsBoolean()
  public administrator?: boolean;
}
