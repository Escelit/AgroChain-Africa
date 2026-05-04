import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HarvestsService } from '../harvests/harvests.service';
import { OracleService } from '../oracle/oracle.service';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private harvestsService: HarvestsService,
    private oracleService: OracleService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Browse available harvest lots' })
  browse() {
    return this.harvestsService.findListed();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get harvest lot details with NDVI forecast' })
  async getLot(@Param('id') id: string) {
    const harvest = await this.harvestsService.findOne(id);
    const ndvi = await this.oracleService.getNdviForecast(
      harvest.locationGeohash,
      harvest.commodity,
    );
    return { harvest, ndviForecast: ndvi };
  }
}
