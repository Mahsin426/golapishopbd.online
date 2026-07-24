import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/* PrismaService — Repository layer-এর ভিত্তি। সব module এই একটা instance
   ইনজেক্ট করে ব্যবহার করবে (connection pool একবারই তৈরি হয়)। */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
