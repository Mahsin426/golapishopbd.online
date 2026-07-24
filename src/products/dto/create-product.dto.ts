import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CategoryFilter, ZoneFilter } from './query-products.dto';

export class CreateProductDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(CategoryFilter) category: CategoryFilter;
  @IsEnum(ZoneFilter) zone: ZoneFilter;
  @IsOptional() @IsString() unit?: string;

  @IsNumber() @Min(0) price: number;
  @IsNumber() @Min(0) salePrice: number;
  @IsOptional() @IsNumber() @Min(0) costPrice?: number;
  @IsOptional() @IsNumber() @Min(0) extraCost?: number;
  @IsOptional() @IsNumber() deliveryPercent?: number;
  @IsOptional() @IsNumber() profitPercent?: number;

  @IsNumber() @Min(0) stock: number;
  @IsOptional() @IsBoolean() cod?: boolean;
  @IsOptional() @IsBoolean() fastDelivery?: boolean;
  @IsOptional() @IsBoolean() isFlash?: boolean;
  @IsOptional() @IsBoolean() isFeatured?: boolean;

  @IsOptional() @IsString() groupId?: string;
  @IsOptional() @IsString() imageUrl?: string;
}
