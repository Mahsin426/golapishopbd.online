import { IsPhoneNumber, IsString } from 'class-validator';

export class SendOtpDto {
  @IsString()
  phone: string; // বাংলাদেশি নাম্বার ফরম্যাট backend-এই normalize হবে (01XXXXXXXXX -> +8801XXXXXXXXX)
}
