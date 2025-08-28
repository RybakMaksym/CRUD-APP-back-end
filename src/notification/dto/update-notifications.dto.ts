import { IsArray } from 'class-validator';

export class UpdateNotificationsDto {
  @IsArray()
  public ids: string[];
}
