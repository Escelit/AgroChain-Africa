import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { FarmersService } from '../farmers/farmers.service';
import { WithdrawDto } from './dto/payment.dto';

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private farmersService: FarmersService,
  ) {}

  @Post('withdraw')
  @ApiOperation({ summary: 'Initiate mobile money withdrawal via anchor' })
  async withdraw(@Request() req, @Body() dto: WithdrawDto) {
    const farmer = await this.farmersService.findById(req.user.id);
    return this.paymentsService.initiateWithdrawal(req.user.id, farmer.stellarPublicKey, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get payment history' })
  getHistory(@Request() req) {
    return this.paymentsService.getHistory(req.user.id);
  }
}
