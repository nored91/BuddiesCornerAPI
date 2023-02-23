import { IsBoolean, IsDefined, IsOptional, IsString, IsUUID, Length } from 'class-validator';

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
}

export class UpdateTaskDTO {
  public task_id: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  public title?: string;

  @IsOptional()
  @IsBoolean()
  public achieve?: boolean;
}
