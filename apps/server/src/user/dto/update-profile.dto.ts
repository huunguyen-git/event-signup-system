import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsDateString()
  @IsOptional()
  birthdate?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsOptional()
  avatar_url?: string;
}
