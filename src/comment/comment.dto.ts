import { IsDateString, IsDefined, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateCommentDTO {
  @IsDefined()
  @IsUUID()
  public event_id: string;

  @IsDefined()
  @IsUUID()
  public user_id: string;

  @IsDefined()
  @IsString()
  @Length(1, 100)
  public message: string;
}

export class UpdateCommentDTO {
  public comment_id: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  public message?: string;

  @IsOptional()
  @IsDateString()
  public edition_date?: string;
}
