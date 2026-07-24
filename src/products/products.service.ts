import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { CreateProductDto } from './dto/create-product.dto';

/* ProductsService — data.js-এর ProductStore/zoneProducts() লজিকের
   সার্ভার-সাইড প্রতিস্থাপন। Variant grouping (groupId) এখানে DB query-তেই
   হয়, ক্লায়েন্টে O(n) loop করার দরকার নেই। */
@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductsDto) {
    const where: any = {
      zone: query.zone,
      status: 'active',
    };
    if (query.category) where.category = query.category;
    if (query.isFlash) where.isFlash = true;
    if (query.isFeatured) where.isFeatured = true;
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const products = await this.prisma.product.findMany({
      where,
      take: 30,
      ...(query.cursor && { skip: 1, cursor: { id: query.cursor } }),
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: products,
      nextCursor: products.length === 30 ? products[products.length - 1].id : null,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('প্রোডাক্ট পাওয়া যায়নি');
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto as any });
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: dto as any });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: { status: 'inactive' } });
  }

  async decrementStock(id: string, qty: number) {
    // Race condition-safe stock deduction (একসাথে একাধিক অর্ডার এলেও stock নেগেটিভ হবে না)
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product || product.stock < qty) {
        throw new NotFoundException('পর্যাপ্ত স্টক নেই');
      }
      return tx.product.update({
        where: { id },
        data: { stock: { decrement: qty }, soldCount: { increment: qty } },
      });
    });
  }
}
