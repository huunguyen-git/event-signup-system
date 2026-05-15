import { IsUUID, IsObject, IsNotEmpty } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  @IsNotEmpty()
  event_id!: string;

  @IsUUID()
  @IsNotEmpty()
  user_id!: string;

  @IsObject()
  @IsNotEmpty()
  answers!: Record<string, any>; 
}