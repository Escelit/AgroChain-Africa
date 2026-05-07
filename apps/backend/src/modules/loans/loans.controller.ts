import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LoansService } from './loans.service';
import { CreateLoanDto, RepayLoanDto } from './dto/loan.dto';

@ApiTags('loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Post()
  @ApiOperation({ summary: 'Request a pre-harvest loan against tokenized harvest' })
  create(@Request() req, @Body() dto: CreateLoanDto) {
    return this.loansService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List farmer's loans" })
  findAll(@Request() req) {
    return this.loansService.findByFarmer(req.user.id);
  }

  @Get('lender')
  @ApiOperation({ summary: 'List loans funded by a lender public key' })
  @ApiQuery({ name: 'publicKey', required: true })
  findByLender(@Query('publicKey') publicKey: string) {
    return this.loansService.findByLender(publicKey);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get loan details' })
  findOne(@Param('id') id: string) {
    return this.loansService.findOne(id);
  }

  @Post(':id/repay')
  @ApiOperation({ summary: 'Make a loan repayment' })
  repay(@Request() req, @Param('id') id: string, @Body() dto: RepayLoanDto) {
    return this.loansService.repay(req.user.id, id, dto);
  }
}
