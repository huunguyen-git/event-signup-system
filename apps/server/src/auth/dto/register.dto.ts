import { IsEmail, IsString, IsNotEmpty, MinLength, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class RegisterDto {
    @IsEmail()
    @IsNotEmpty()
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
}