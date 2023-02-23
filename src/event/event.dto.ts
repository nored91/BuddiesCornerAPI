import { IsDateString, IsDefined, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { EventType } from './event.entity';

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

  @IsString()
  @Length(1, 250)
  public description?: string;

  @IsString()
  @Length(1, 255)
  public location: string;

  @IsDateString()
  public event_date?: string;

  @IsDefined()
  @IsEnum(EventType)
  public type: EventType;
}

export class UpdateEventDTO {
  public event_id: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  public title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 250)
  public description?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  public location?: string;

  @IsOptional()
  @IsDateString()
  public event_date?: string;

  @IsOptional()
  @IsEnum(EventType)
  public type?: EventType;
}
