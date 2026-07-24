import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.sub, dto);
  }

  @Get('my')
  findMy(@Req() req: any) {
    return this.ordersService.findByUser(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'zone_manager', 'driver')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch(':id/assign-driver')
  @UseGuards(RolesGuard)
  @Roles('admin', 'zone_manager')
  assignDriver(@Param('id') id: string, @Body('driverId') driverId: string) {
    return this.ordersService.assignDriver(id, driverId);
  }
}
