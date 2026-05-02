import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StellarService } from '../../stellar/stellar.service';
import { FarmersService } from '../farmers/farmers.service';

@Injectable()
export class AuthService {
  private challenges = new Map<string, { value: string; expiresAt: number }>();

  constructor(
    private stellarService: StellarService,
    private jwtService: JwtService,
    private farmersService: FarmersService,
  ) {}

  async getChallenge(publicKey: string): Promise<{ challenge: string; transaction: string }> {
    const challenge = Math.random().toString(36).slice(2) + Date.now().toString(36);
    this.challenges.set(publicKey, { value: challenge, expiresAt: Date.now() + 300_000 });

    const transaction = await this.stellarService.buildChallengeTransaction(publicKey);
    return { challenge, transaction };
  }

  async verifyAndLogin(publicKey: string, signedXdr: string): Promise<{ accessToken: string }> {
    const stored = this.challenges.get(publicKey);
    if (!stored || Date.now() > stored.expiresAt) {
      throw new UnauthorizedException('Challenge expired or not found');
    }

    const isValid = await this.stellarService.verifyChallengeTransaction(signedXdr, publicKey);
    if (!isValid) throw new UnauthorizedException('Invalid Stellar signature');

    this.challenges.delete(publicKey);

    let farmer = await this.farmersService.findByPublicKey(publicKey);
    if (!farmer) {
      farmer = await this.farmersService.create({ stellarPublicKey: publicKey });
    }

    const payload = { sub: farmer.id, publicKey };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
