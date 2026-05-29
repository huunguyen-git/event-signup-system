import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ResponseUserDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  full_name!: string;

  @Expose()
  birthdate!: Date;

  @Expose()
  phone_number!: string | null;

  @Expose()
  avatar_url!: string | null;

  @Expose()
  description!: string | null;

  constructor(partial: Partial<ResponseUserDto>) {
    Object.assign(this, partial);
  }
}
