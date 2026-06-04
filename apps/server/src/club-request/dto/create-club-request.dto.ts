import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClubRequestDto {
  @IsString()
  @IsNotEmpty()
  club_name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}
