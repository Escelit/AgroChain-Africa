export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  stellarNetwork: 'TESTNET' as const,
  stellarHorizonUrl: 'https://horizon-testnet.stellar.org',
  contractIds: {
    harvestToken: '',
    escrow: '',
    creditScore: '',
    loan: '',
  },
};
