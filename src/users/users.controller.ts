import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  me(@Req() req: any) {
    return this.usersService.findById(req.user.sub);
  }

  @Get('me/addresses')
  addresses(@Req() req: any) {
    return this.usersService.listAddresses(req.user.sub);
  }

  @Post('me/addresses')
  addAddress(@Req() req: any, @Body() body: any) {
    return this.usersService.addAddress(req.user.sub, body);
  }
}
