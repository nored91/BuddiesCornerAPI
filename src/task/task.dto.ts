import { IsBoolean, IsDefined, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { User } from '../user/user.entity';
import { Event } from '../event/event.entity';

export class CreateTaskDTO {
  @IsDefined()
  @IsUUID()
  public event_id: string;

  @IsDefined()
  @IsUUID()
  public user_id: string;

  @IsDefined()
  @IsString()
  @Length(1, 100)
  public title: string;

  public event?: Event;
  public user?: User;
}

export class UpdateTaskDTO {
  public task_id: string;

  @IsOptional()
  @IsUUID()
  public event_id?: string;

  @IsOptional()
  @IsUUID()
  public user_id?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  public title?: string;

  @IsOptional()
  @IsBoolean()
  public achieve?: boolean;

  public event?: Event;
  public user?: User;
}
