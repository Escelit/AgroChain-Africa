import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChallengeDto, VerifyDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('challenge')
  @ApiOperation({ summary: 'Get SEP-10 challenge transaction' })
  @ApiResponse({ status: 200, description: 'Challenge transaction returned' })
  getChallenge(@Body() dto: ChallengeDto) {
    return this.authService.getChallenge(dto.publicKey);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify signed transaction and receive JWT' })
  @ApiResponse({ status: 200, description: 'JWT access token' })
  verify(@Body() dto: VerifyDto) {
    return this.authService.verifyAndLogin(dto.publicKey, dto.signedXdr);
  }
}
