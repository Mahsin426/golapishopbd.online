import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  phone: string;

  @IsString()
  @Length(4, 6)
  code: string;

  name?: string; // প্রথমবার রেজিস্ট্রেশনে
}
