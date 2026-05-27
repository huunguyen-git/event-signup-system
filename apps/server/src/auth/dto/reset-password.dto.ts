import { IsEmail, IsNotEmpty, IsString, Length, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  otp!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @IsNotEmpty()
  newPassword!: string;
}
