import {
  Controller, Get, Post, Body, Param, UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HarvestsService } from './harvests.service';
import { FarmersService } from '../farmers/farmers.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';

@ApiTags('harvests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('harvests')
export class HarvestsController {
  constructor(
    private harvestsService: HarvestsService,
    private farmersService: FarmersService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new harvest batch (draft)' })
  async create(@Request() req, @Body() dto: CreateHarvestDto) {
    const farmer = await this.farmersService.findById(req.user.id);
    return this.harvestsService.create(farmer, dto);
  }

  @Post(':id/tokenize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tokenize a draft harvest on Stellar' })
  tokenize(@Request() req, @Param('id') id: string) {
    return this.harvestsService.tokenize(req.user.id, id);
  }

  @Get()
  @ApiOperation({ summary: "List farmer's harvests" })
  findAll(@Request() req) {
    return this.harvestsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get harvest details' })
  findOne(@Param('id') id: string) {
    return this.harvestsService.findOne(id);
  }
}
