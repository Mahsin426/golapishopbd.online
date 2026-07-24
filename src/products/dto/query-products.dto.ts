import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum CategoryFilter {
  grocery = 'grocery',
  medicine = 'medicine',
  gas = 'gas',
  cosmetics = 'cosmetics',
}

export enum ZoneFilter {
  noakhali_sadar = 'noakhali_sadar',
  begumganj = 'begumganj',
}

export class QueryProductsDto {
  @IsEnum(ZoneFilter)
  zone: ZoneFilter;

  @IsOptional()
  @IsEnum(CategoryFilter)
  category?: CategoryFilter;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  cursor?: string; // pagination

  @IsOptional()
  isFlash?: boolean;

  @IsOptional()
  isFeatured?: boolean;
}
