import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsDateString,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9._%+-]+@(gm\.uit\.edu\.vn|uit\.edu\.vn)$/, {
    message: 'Chỉ chấp nhận email nội bộ trường (@gm.uit.edu.vn hoặc @uit.edu.vn)',
  })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  password!: string;

  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @IsDateString()
  @IsNotEmpty()
  birthdate!: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsOptional()
  token?: string;
}