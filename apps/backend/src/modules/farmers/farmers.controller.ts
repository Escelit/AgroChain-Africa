import { Controller, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FarmersService } from './farmers.service';
import { UpdateFarmerDto } from './dto/farmer.dto';

@ApiTags('farmers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('farmers')
export class FarmersController {
  constructor(private farmersService: FarmersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated farmer profile' })
  getMe(@Request() req) {
    return this.farmersService.findById(req.user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update farmer profile' })
  updateMe(@Request() req, @Body() dto: UpdateFarmerDto) {
    return this.farmersService.update(req.user.id, dto);
  }

  @Get(':publicKey/credit')
  @ApiOperation({ summary: 'Get on-chain credit score by public key' })
  getCreditScore(@Param('publicKey') publicKey: string) {
    return this.farmersService.findByPublicKey(publicKey);
  }
}
