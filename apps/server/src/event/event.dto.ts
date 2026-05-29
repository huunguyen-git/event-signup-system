import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsEnum,
  Min,
  IsOptional,
  IsDateString,
  IsJSON,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventStatus } from '../generated/prisma/enums.js';

export class CreateEventDto {
  @IsOptional()
  id!: string;

  @IsString()
  @IsNotEmpty()
  host_id!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description!: string;

  @IsDateString()
  @IsNotEmpty()
  event_date!: string;

  @IsDateString()
  @IsNotEmpty()
  end_date!: string;

  @IsString()
  @IsOptional()
  banner_url!: string;

  @IsString()
  @IsNotEmpty()
  location_url!: string;

  @IsString()
  @IsNotEmpty()
  allowed_domain!: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  @Min(10)
  max_attendees!: number;

  @IsEnum(EventStatus)
  @IsNotEmpty()
  status: EventStatus = EventStatus.DRAFT;

  @IsJSON()
  @IsNotEmpty()
  form_config!: JSON;

  @IsDateString()
  @IsNotEmpty()
  created_at!: string;
}
