import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as crypto from 'crypto';

/* AuthService — Phone OTP-based auth (Firebase Phone Auth-এর প্রতিস্থাপন)।
   OTP নিজস্ব DB-তে রাখা হচ্ছে (এই স্টেজে in-memory/Redis সহজ, প্রোডাকশনে Redis
   ব্যবহার করা উচিত rate-limit ও multi-instance সমস্যা এড়াতে)। */
@Injectable()
export class AuthService {
  private otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('880')) return '+' + digits;
    if (digits.startsWith('0')) return '+880' + digits.slice(1);
    if (digits.startsWith('+880')) return digits;
    throw new BadRequestException('অবৈধ ফোন নাম্বার');
  }

  async sendOtp(rawPhone: string): Promise<{ sent: boolean }> {
    const phone = this.normalizePhone(rawPhone);
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit
    this.otpStore.set(phone, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // ৫ মিনিট মেয়াদ
      attempts: 0,
    });

    // TODO: SMS gateway (Alpha SMS / Elit BD) দিয়ে এখানে code পাঠাতে হবে।
    // await this.smsGateway.send(phone, `আপনার Golapi Shop OTP কোড: ${code}`);

    return { sent: true };
  }

  async verifyOtp(rawPhone: string, code: string, name?: string) {
    const phone = this.normalizePhone(rawPhone);
    const record = this.otpStore.get(phone);

    if (!record) throw new BadRequestException('OTP পাঠানো হয়নি বা মেয়াদ শেষ');
    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(phone);
      throw new BadRequestException('OTP-এর মেয়াদ শেষ হয়ে গেছে');
    }
    record.attempts += 1;
    if (record.attempts > 5) {
      this.otpStore.delete(phone);
      throw new BadRequestException('অনেকবার ভুল চেষ্টা — নতুন OTP নিন');
    }
    if (record.code !== code) throw new UnauthorizedException('ভুল OTP কোড');

    this.otpStore.delete(phone);

    let user = await this.prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { phone, name: name || null, phoneVerified: true, role: 'customer' },
      });
    } else if (!user.phoneVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      });
    }

    return this.issueTokens(user.id, user.role);
  }

  async issueTokens(userId: string, role: string) {
    const payload = { sub: userId, role };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '30d' });
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = this.jwt.verify(refreshToken);
      return this.issueTokens(decoded.sub, decoded.role);
    } catch {
      throw new UnauthorizedException('Refresh token অবৈধ বা মেয়াদোত্তীর্ণ');
    }
  }
}
