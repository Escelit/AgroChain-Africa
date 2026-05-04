import { Controller, Post, Get, Body, Param, UseGuards, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { OracleService } from './oracle.service';
import { OracleDeliveryDto } from './dto/oracle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('oracle')
@Controller('oracle')
export class OracleController {
  constructor(
    private oracleService: OracleService,
    private config: ConfigService,
  ) {}

  @Post('delivery-confirmed')
  @ApiSecurity('oracle-api-key')
  @ApiOperation({ summary: 'IoT sensor delivery webhook' })
  async deliveryConfirmed(
    @Headers('x-api-key') apiKey: string,
    @Body() payload: OracleDeliveryDto,
  ) {
    if (apiKey !== this.config.get('ORACLE_API_KEY')) {
      throw new UnauthorizedException('Invalid API key');
    }
    await this.oracleService.verifyAndEnqueue(payload);
    return { queued: true };
  }

  @Get('ndvi/:geohash')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get NDVI yield forecast for a location' })
  getNdvi(@Param('geohash') geohash: string, @Param('commodity') commodity = 'MAIZE') {
    return this.oracleService.getNdviForecast(geohash, commodity);
  }
}
