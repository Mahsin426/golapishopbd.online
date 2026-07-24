import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';

/* OrdersService — checkout.js-এর order-creation লজিকের সার্ভার-সাইড সংস্করণ।
   পুরো অর্ডার তৈরি + stock deduction + coupon apply একটাই DB transaction-এ,
   তাই আংশিক ব্যর্থ হয়ে "stock কমে গেছে কিন্তু অর্ডার হয়নি" — এমন state আসবে না। */
@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `GS-${year}-${rand}`;
  }

  async create(userId: string, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const itemsData: any[] = [];

      for (const item of dto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundException(`প্রোডাক্ট পাওয়া যায়নি: ${item.productId}`);
        if (product.stock < item.quantity) {
          throw new BadRequestException(`পর্যাপ্ত স্টক নেই: ${product.name}`);
        }
        subtotal += Number(product.salePrice) * item.quantity;
        itemsData.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.salePrice,
        });
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
        });
      }

      let discount = 0;
      let couponId: string | null = null;
      if (dto.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: dto.couponCode } });
        if (coupon && coupon.isActive && new Date() <= coupon.validUntil && subtotal >= Number(coupon.minOrderValue)) {
          discount =
            coupon.discountType === 'percent'
              ? (subtotal * Number(coupon.discountValue)) / 100
              : Number(coupon.discountValue);
          couponId = coupon.id;
          await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
        }
      }

      const deliveryFee = 0; // TODO: zone-ভিত্তিক ডেলিভারি ফি রুল
      const total = subtotal - discount + deliveryFee;

      const order = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          userId,
          addressId: dto.addressId,
          zone: dto.zone,
          subtotal,
          discount,
          deliveryFee,
          total,
          couponId,
          paymentMethod: dto.paymentMethod,
          customBazarNote: dto.customBazarNote,
          items: { create: itemsData },
        },
        include: { items: true },
      });

      return order;
    });
  }

  async findByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, address: true, driver: true },
    });
    if (!order) throw new NotFoundException('অর্ডার পাওয়া যায়নি');
    return order;
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.order.update({ where: { id }, data: { status: status as any } });
  }

  async assignDriver(id: string, driverId: string) {
    return this.prisma.order.update({
      where: { id },
      data: { driverId, status: 'assigned' },
    });
  }
}
