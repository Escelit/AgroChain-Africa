import { registerAs } from '@nestjs/config';

export default registerAs('stellar', () => ({
  network: process.env.STELLAR_NETWORK || 'testnet',
  horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  rpcUrl: process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
  platformSignerSecret: process.env.PLATFORM_SIGNER_SECRET || '',
  oraclePublicKey: process.env.ORACLE_PUBLIC_KEY || '',
  oracleSignerSecret: process.env.ORACLE_SIGNER_SECRET || '',
  contracts: {
    harvestToken: process.env.HARVEST_TOKEN_CONTRACT_ID || '',
    escrow: process.env.ESCROW_CONTRACT_ID || '',
    creditScore: process.env.CREDIT_SCORE_CONTRACT_ID || '',
    loan: process.env.LOAN_CONTRACT_ID || '',
  },
}));
