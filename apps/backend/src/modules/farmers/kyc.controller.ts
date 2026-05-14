import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FarmersService } from './farmers.service';
import { KycService } from './kyc.service';
import { KycDto } from './dto/kyc.dto';

@ApiTags('farmers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('farmers')
export class KycController {
  constructor(
    private farmersService: FarmersService,
    private kycService: KycService,
  ) {}

  @Post('me/kyc')
  @ApiOperation({ summary: 'Submit KYC verification' })
  async submitKyc(@Request() req, @Body() dto: KycDto) {
    const farmer = await this.farmersService.findById(req.user.id);
    const result = await this.kycService.verifyIdentity(
      farmer.id,
      dto.nationalId,
      dto.fullName,
      farmer.countryCode,
    );

    await this.farmersService.update(farmer.id, {
      nationalIdHash: result.nationalIdHash,
      fullName: dto.fullName,
      kycVerified: result.verified,
      kycVerifiedAt: result.verifiedAt,
    } as any);

    return { verified: result.verified, provider: result.provider };
  }
}
