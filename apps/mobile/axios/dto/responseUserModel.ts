export class ResponseUser {
  id!: string;
  email!: string;
  full_name!: string;
  birthdate!: Date;
  phone_number!: string | null;
  avatar_url!: string | null;
  role!: string;
}
