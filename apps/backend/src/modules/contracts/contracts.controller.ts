import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ContractsService } from './contracts.service';
import { CreateContractDto, DisputeContractDto } from './dto/contract.dto';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private contractsService: ContractsService) {}

  @Post()
  @ApiOperation({ summary: 'Create escrow contract for a harvest' })
  create(@Request() req, @Body() dto: CreateContractDto) {
    return this.contractsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: "List farmer's contracts" })
  findAll(@Request() req) {
    return this.contractsService.findByFarmer(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract details' })
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Post(':id/dispute')
  @ApiOperation({ summary: 'Raise a dispute on a contract' })
  dispute(@Param('id') id: string, @Body() dto: DisputeContractDto) {
    return this.contractsService.flagDispute(id, dto.reason);
  }
}
