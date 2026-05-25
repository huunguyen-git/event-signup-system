import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class SaveTokenDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;
}
