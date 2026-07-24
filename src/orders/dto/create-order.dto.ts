import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ZoneFilter } from '../../products/dto/query-products.dto';

class OrderItemDto {
  @IsString() productId: string;
  quantity: number;
}

export enum PaymentMethodDto {
  cod = 'cod',
  bkash = 'bkash',
  nagad = 'nagad',
  sslcommerz = 'sslcommerz',
}

export class CreateOrderDto {
  @IsEnum(ZoneFilter)
  zone: ZoneFilter;

  @IsString()
  addressId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @IsOptional()
  @IsString()
  customBazarNote?: string;
}
