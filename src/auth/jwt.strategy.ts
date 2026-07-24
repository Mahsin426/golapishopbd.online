import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/* সাধারণ passport ব্যবহার না করে হালকা কাস্টম guard — নির্ভরতা কম রাখতে।
   পরে চাইলে @nestjs/passport দিয়ে replace করা যায়। */
@Injectable()
export class TokenVerifier {
  constructor(private jwt: JwtService) {}

  verify(token: string) {
    try {
      return this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('টোকেন অবৈধ বা মেয়াদোত্তীর্ণ');
    }
  }
}
