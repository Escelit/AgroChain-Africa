## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│   Angular 17 PWA (web)          USSD Gateway (feature phones)  │
└──────────────────┬──────────────────────────────┬──────────────┘
                   │ REST / WebSocket              │ HTTP callback
┌──────────────────▼──────────────────────────────▼──────────────┐
│                    BACKEND LAYER (NestJS 10)                    │
│  Auth │ Farmers │ Harvests │ Contracts │ Payments │ Oracle      │
│  Loans │ Marketplace │ Notifications                            │
└──────────────────────────────────┬─────────────────────────────┘
                                   │ Stellar SDK / Soroban RPC
┌──────────────────────────────────▼─────────────────────────────┐
│                   STELLAR NETWORK (Testnet / Mainnet)           │
│  SCP Ledger │ Soroban Contracts │ Stellar DEX │ Path Payments  │
└──────────────────────────────────┬─────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────┐
│                      OFF-CHAIN BRIDGES                          │
│  IoT Weight Sensors │ Sentinel Hub NDVI │ Africa's Talking SMS │
│  M-Pesa Anchor │ MTN MoMo Anchor │ Flutterwave Anchor          │
└─────────────────────────────────────────────────────────────────┘
```

### Smart Contract Interactions

```
Farmer                Backend (Relayer)           Soroban Contracts
  │                        │                            │
  │── POST /harvests ──────►│                            │
  │                        │── create_batch() ──────────►│ HarvestToken
  │                        │◄── batch_id ───────────────│
  │◄── harvest (TOKENIZED) ─│                            │
  │                        │                            │
  │── POST /contracts ─────►│                            │
  │                        │── fund() ──────────────────►│ Escrow
  │                        │◄── contract_id ────────────│
  │◄── contract (FUNDED) ──│                            │
  │                        │                            │
IoT Sensor              Oracle Processor              Escrow
  │── POST /oracle/delivery►│                            │
  │                        │── confirm_delivery() ──────►│
  │                        │◄── Released ───────────────│
  │                        │── record_completion() ─────►│ CreditScore
  │◄── SMS: Payment sent ──│                            │
```

### Database Schema

```
farmers ──< harvests ──< escrow_contracts
    │                          │
    └──< loans                 │
    └──< payments ─────────────┘
```

### Authentication Flow (SEP-10)

1. Client sends `POST /auth/challenge` with Stellar public key
2. Server returns a challenge transaction (unsigned XDR)
3. Client signs with Freighter wallet
4. Client sends `POST /auth/verify` with signed XDR
5. Server verifies signature, issues JWT
6. All subsequent requests use `Authorization: Bearer <token>`
