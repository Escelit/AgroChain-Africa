# 🌾 AgroChain Africa — Decentralized Agricultural Supply Chain on Stellar

> Empowering smallholder farmers across Africa with transparent payments, on-chain credit history, pre-harvest financing, and immutable trade records — built on the Stellar blockchain.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution Architecture](#solution-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Stellar & Soroban Integration](#stellar--soroban-integration)
- [Smart Contracts (Soroban)](#smart-contracts-soroban)
- [Backend — NestJS](#backend--nestjs)
- [Frontend — Angular](#frontend--angular)
- [Off-chain Integrations](#off-chain-integrations)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**AgroChain Africa** is a full-stack decentralized application (dApp) that digitizes and trustlessly automates the agricultural supply chain — from planting season through post-harvest settlement. It connects smallholder farmers, aggregator cooperatives, commodity buyers, and financial lenders on a shared, tamper-proof ledger powered by the [Stellar network](https://stellar.org) and [Soroban smart contracts](https://soroban.stellar.org).

The platform solves three compounding failures that lock African farmers in poverty cycles:

1. **Payment opacity** — farmers are paid weeks or months after delivery, at prices they didn't agree to
2. **Credit invisibility** — no formal credit history means no access to pre-harvest financing
3. **Post-harvest losses** — caused by inability to access storage financing or sell forward contracts

AgroChain Africa puts farmers in control: they tokenize their harvests, lock in buyer commitments via escrow, build on-chain credit profiles, and receive instant cross-border settlements — all from a feature phone via USSD or a smartphone app.

---

## Problem Statement

| Problem | Scale | AgroChain Response |
|---|---|---|
| 30–40% post-harvest losses | Sub-Saharan Africa | Pre-harvest forward contracts + escrow |
| 600M+ unbanked rural adults | Africa-wide | Stellar wallet + mobile money anchor |
| No formal credit for smallholders | 70% of farmers | On-chain harvest history → credit score |
| Cross-border payment friction | Intra-Africa trade | Stellar path payments + USDC settlement |
| Buyer default / side-selling | Entire value chain | Soroban escrow with oracle-triggered release |
| Opaque commodity pricing | Local markets | On-chain DEX price feeds + marketplace |

---

## Solution Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                   │
│   Angular PWA (web + mobile)        USSD Gateway (feature phones)    │
└───────────────────┬───────────────────────────────┬───────────────────┘
                    │ REST / WebSocket               │ HTTP callback
┌───────────────────▼───────────────────────────────▼───────────────────┐
│                        BACKEND LAYER (NestJS)                         │
│  Auth  │  Farmers  │  Harvests  │  Contracts  │  Payments  │  Oracle  │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │ Stellar SDK / Soroban RPC
┌───────────────────────────────────▼───────────────────────────────────┐
│                        STELLAR NETWORK (Testnet / Mainnet)            │
│  SCP Ledger  │  Soroban Contracts  │  Stellar DEX  │  Path Payments  │
└───────────────────────────────────┬───────────────────────────────────┘
                                    │
┌───────────────────────────────────▼───────────────────────────────────┐
│                        OFF-CHAIN BRIDGES                              │
│  IoT Weight Sensors  │  Satellite NDVI  │  KYC/ID  │  MoMo / M-Pesa │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | Angular 17+ (standalone components) |
| State management | NgRx (signals-based store) |
| Styling | Tailwind CSS + Angular Material |
| Stellar SDK | `@stellar/stellar-sdk` (browser bundle) |
| Wallet integration | Freighter wallet extension + WalletConnect |
| PWA | Angular Service Worker (`@angular/pwa`) |
| Charting | Apache ECharts via `ngx-echarts` |
| i18n | `@angular/localize` (English, Swahili, Hausa, French) |

### Backend
| Layer | Technology |
|---|---|
| Framework | NestJS 10+ |
| Runtime | Node.js 20 LTS |
| Database | PostgreSQL 16 (primary) + Redis (cache/queue) |
| ORM | TypeORM |
| Queue | BullMQ (harvest events, oracle triggers) |
| Stellar SDK | `@stellar/stellar-sdk` (Node) |
| Soroban RPC | `@stellar/stellar-sdk` Soroban client |
| Auth | JWT + Stellar account keypair verification |
| Validation | `class-validator` / `class-transformer` |
| API docs | Swagger / OpenAPI 3.1 |
| Testing | Jest + Supertest |

### Blockchain
| Layer | Technology |
|---|---|
| Network | Stellar (Testnet for dev, Mainnet for prod) |
| Smart contracts | Soroban (Rust) |
| Contract toolchain | `stellar-cli`, `soroban-sdk` |
| Stablecoin | USDC (Circle anchor on Stellar) |
| Local currency anchors | MPESA anchor, flutterwave anchor |

### Infrastructure
| Layer | Technology |
|---|---|
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Cloud | AWS ECS (prod) / local Docker (dev) |
| Monitoring | Grafana + Prometheus |
| Secrets | AWS Secrets Manager / `.env` (dev) |

---

## Project Structure

```
agrochain-africa/
│
├── apps/
│   ├── frontend/                     # Angular application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/             # Guards, interceptors, services
│   │   │   │   ├── features/
│   │   │   │   │   ├── auth/         # Wallet login, KYC
│   │   │   │   │   ├── dashboard/    # Farmer / buyer / lender views
│   │   │   │   │   ├── harvests/     # Tokenize & list harvests
│   │   │   │   │   ├── contracts/    # Escrow management
│   │   │   │   │   ├── payments/     # Payment history, settlement
│   │   │   │   │   └── marketplace/  # Buyer price discovery
│   │   │   │   ├── shared/           # Components, pipes, directives
│   │   │   │   └── store/            # NgRx state slices
│   │   │   ├── assets/
│   │   │   └── environments/
│   │   └── package.json
│   │
│   └── backend/                      # NestJS application
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/             # JWT + Stellar keypair auth
│       │   │   ├── farmers/          # Farmer profiles & credit scores
│       │   │   ├── harvests/         # Harvest tokenization
│       │   │   ├── contracts/        # Soroban contract orchestration
│       │   │   ├── payments/         # Payment processing & anchors
│       │   │   ├── oracle/           # IoT / satellite data ingestion
│       │   │   ├── marketplace/      # Order book & price feeds
│       │   │   └── notifications/    # SMS, push, in-app
│       │   ├── stellar/              # Stellar SDK wrapper services
│       │   │   ├── stellar.service.ts
│       │   │   ├── soroban.service.ts
│       │   │   └── anchor.service.ts
│       │   ├── common/               # Decorators, filters, guards
│       │   ├── config/               # Config modules
│       │   └── main.ts
│       └── package.json
│
├── contracts/                        # Soroban smart contracts (Rust)
│   ├── harvest-token/
│   ├── escrow/
│   ├── credit-score/
│   └── loan/
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── Dockerfile.*
│
├── docs/
│   ├── architecture.md
│   ├── stellar-integration.md
│   └── api/
│
└── README.md
```

---

## Core Features

### For Farmers
- **Stellar wallet creation** — generated on first login, keys encrypted in device secure storage
- **Harvest tokenization** — create an on-chain asset representing a crop batch (commodity, grade, weight, location, expected harvest date)
- **Forward sale contracts** — lock in a buyer's price before harvest; funds held in Soroban escrow
- **On-chain credit profile** — every completed contract builds a verifiable credit score
- **Pre-harvest loan** — pledge tokenized harvest as collateral; draw USDC stablecoin advances
- **Instant settlement** — payment released to mobile money (M-Pesa, MTN MoMo) within seconds of delivery confirmation

### For Aggregators / Co-ops
- **Batch management** — aggregate multiple farmer tokens into a consolidated export lot
- **Quality grading** — record grade, moisture content, and weight after aggregation
- **Storage receipts** — issue warehouse receipt tokens redeemable against physical inventory
- **Multi-party payment splitting** — automatic on-chain distribution of buyer payments to constituent farmers

### For Buyers / Exporters
- **Marketplace** — browse tokenized harvest lots with live NDVI-verified yield projections
- **Purchase order issuance** — sign and fund Soroban escrow contracts on-chain
- **Delivery tracking** — IoT sensor data fed via oracle triggers payment release
- **Cross-border settlement** — Stellar path payments auto-convert buyer currency to farmer local currency

### For Lenders / DeFi Financiers
- **Credit score access** — query verified on-chain farmer history
- **Collateralized loans** — fund loans against tokenized harvest; automatic liquidation logic in Soroban
- **Yield-linked repayment** — repayment schedules tied to oracle-confirmed harvest events
- **Portfolio dashboard** — real-time exposure, repayment rates, and yield forecasts

---

## Stellar & Soroban Integration

### Stellar Accounts
Every user (farmer, aggregator, buyer, lender) has a Stellar keypair. The platform operates as a custodial wallet for USSD users and a non-custodial wallet for smartphone users (Freighter extension).

```typescript
// stellar/stellar.service.ts
import { Keypair, Networks, TransactionBuilder, Asset, Operation } from '@stellar/stellar-sdk';

@Injectable()
export class StellarService {
  private server: Horizon.Server;
  private network: Networks;

  constructor(private config: ConfigService) {
    const isTestnet = config.get('STELLAR_NETWORK') === 'testnet';
    this.server = new Horizon.Server(
      isTestnet
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );
    this.network = isTestnet ? Networks.TESTNET : Networks.PUBLIC;
  }

  async createAccount(): Promise<{ publicKey: string; secretKey: string }> {
    const keypair = Keypair.random();
    // Fund via friendbot on testnet, or anchor on mainnet
    if (this.config.get('STELLAR_NETWORK') === 'testnet') {
      await fetch(`https://friendbot.stellar.org?addr=${keypair.publicKey()}`);
    }
    return {
      publicKey: keypair.publicKey(),
      secretKey: keypair.secret(),
    };
  }

  async sendPayment(
    sourceSecret: string,
    destinationPublicKey: string,
    asset: Asset,
    amount: string,
    memo?: string
  ): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
    const sourceKeypair = Keypair.fromSecret(sourceSecret);
    const sourceAccount = await this.server.loadAccount(sourceKeypair.publicKey());

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: await this.server.fetchBaseFee().then(String),
      networkPassphrase: this.network,
    })
      .addOperation(
        Operation.payment({
          destination: destinationPublicKey,
          asset,
          amount,
        })
      )
      .addMemo(memo ? Memo.text(memo) : Memo.none())
      .setTimeout(180)
      .build();

    transaction.sign(sourceKeypair);
    return this.server.submitTransaction(transaction);
  }
}
```

### Stellar DEX — Currency Conversion
All payments can traverse the Stellar DEX via path payments, allowing buyers to pay in USDC while farmers receive their local currency (KES, NGN, GHS, XOF) — without a centralized FX desk.

```typescript
async pathPayment(
  sourceSecret: string,
  sendAsset: Asset,         // Buyer's asset (USDC)
  sendMax: string,
  destination: string,
  destAsset: Asset,         // Farmer's local currency token
  destAmount: string,
): Promise<Horizon.HorizonApi.SubmitTransactionResponse> {
  const keypair = Keypair.fromSecret(sourceSecret);
  const account = await this.server.loadAccount(keypair.publicKey());

  // Find optimal path via Stellar DEX
  const paths = await this.server
    .strictReceivePaths([sendAsset], destAsset, destAmount)
    .call();

  const transaction = new TransactionBuilder(account, {
    fee: await this.server.fetchBaseFee().then(String),
    networkPassphrase: this.network,
  })
    .addOperation(
      Operation.pathPaymentStrictReceive({
        sendAsset,
        sendMax,
        destination,
        destAsset,
        destAmount,
        path: paths.records[0]?.path ?? [],
      })
    )
    .setTimeout(180)
    .build();

  transaction.sign(keypair);
  return this.server.submitTransaction(transaction);
}
```

---

## Smart Contracts (Soroban)

All contracts are written in Rust using `soroban-sdk`. They are compiled to WASM and deployed to Stellar Testnet/Mainnet.

### 1. Harvest Token Contract

Represents a tokenized crop batch as a Stellar Asset controlled by a Soroban contract.

```rust
// contracts/harvest-token/src/lib.rs
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, symbol_short};

#[contracttype]
#[derive(Clone)]
pub struct HarvestBatch {
    pub farmer: Address,
    pub commodity: Symbol,      // e.g. "MAIZE", "COFFEE"
    pub grade: Symbol,          // e.g. "AA", "AB"
    pub weight_kg: u64,
    pub location_geohash: String,
    pub harvest_date_unix: u64,
    pub is_pledged: bool,
    pub is_delivered: bool,
}

#[contract]
pub struct HarvestTokenContract;

#[contractimpl]
impl HarvestTokenContract {
    pub fn create_batch(
        env: Env,
        farmer: Address,
        commodity: Symbol,
        grade: Symbol,
        weight_kg: u64,
        location_geohash: String,
        harvest_date_unix: u64,
    ) -> u64 {
        farmer.require_auth();

        let batch_id: u64 = env
            .storage()
            .instance()
            .get(&symbol_short!("batch_ct"))
            .unwrap_or(0u64) + 1;

        let batch = HarvestBatch {
            farmer: farmer.clone(),
            commodity,
            grade,
            weight_kg,
            location_geohash,
            harvest_date_unix,
            is_pledged: false,
            is_delivered: false,
        };

        env.storage().persistent().set(&batch_id, &batch);
        env.storage().instance().set(&symbol_short!("batch_ct"), &batch_id);

        env.events().publish(
            (symbol_short!("HARVEST"), symbol_short!("CREATED")),
            (farmer, batch_id),
        );

        batch_id
    }

    pub fn get_batch(env: Env, batch_id: u64) -> HarvestBatch {
        env.storage()
            .persistent()
            .get(&batch_id)
            .expect("Batch not found")
    }

    pub fn pledge_batch(env: Env, batch_id: u64, farmer: Address) {
        farmer.require_auth();
        let mut batch: HarvestBatch = env.storage().persistent().get(&batch_id).unwrap();
        assert_eq!(batch.farmer, farmer, "Not the owner");
        assert!(!batch.is_pledged, "Already pledged");
        batch.is_pledged = true;
        env.storage().persistent().set(&batch_id, &batch);
    }
}
```

### 2. Escrow Contract

Holds buyer funds until IoT oracle confirms delivery. Supports partial delivery, dispute resolution, and auto-refund on timeout.

```rust
// contracts/escrow/src/lib.rs
#[contracttype]
#[derive(Clone)]
pub enum EscrowStatus {
    Funded,
    Delivered,
    Disputed,
    Released,
    Refunded,
}

#[contracttype]
#[derive(Clone)]
pub struct EscrowContract {
    pub buyer: Address,
    pub farmer: Address,
    pub oracle: Address,         // IoT oracle authority
    pub batch_id: u64,
    pub amount_usdc: i128,
    pub status: EscrowStatus,
    pub expiry_ledger: u32,      // Auto-refund if not delivered by this ledger
}

#[contractimpl]
impl EscrowContractImpl {
    pub fn fund(
        env: Env,
        buyer: Address,
        farmer: Address,
        oracle: Address,
        batch_id: u64,
        amount_usdc: i128,
        ttl_ledgers: u32,
    ) -> u64 {
        buyer.require_auth();

        // Transfer USDC from buyer to contract
        let usdc_client = token::Client::new(&env, &get_usdc_address(&env));
        usdc_client.transfer(&buyer, &env.current_contract_address(), &amount_usdc);

        let contract_id = generate_id(&env);
        let escrow = EscrowContract {
            buyer,
            farmer,
            oracle,
            batch_id,
            amount_usdc,
            status: EscrowStatus::Funded,
            expiry_ledger: env.ledger().sequence() + ttl_ledgers,
        };
        env.storage().persistent().set(&contract_id, &escrow);
        contract_id
    }

    pub fn confirm_delivery(env: Env, oracle: Address, contract_id: u64) {
        oracle.require_auth();
        let mut escrow: EscrowContract = env.storage().persistent().get(&contract_id).unwrap();
        assert!(matches!(escrow.status, EscrowStatus::Funded));
        assert_eq!(escrow.oracle, oracle, "Unauthorized oracle");

        // Release funds to farmer
        let usdc_client = token::Client::new(&env, &get_usdc_address(&env));
        usdc_client.transfer(
            &env.current_contract_address(),
            &escrow.farmer,
            &escrow.amount_usdc,
        );

        escrow.status = EscrowStatus::Released;
        env.storage().persistent().set(&contract_id, &escrow);

        env.events().publish(
            (symbol_short!("ESCROW"), symbol_short!("RELEASED")),
            contract_id,
        );
    }

    pub fn refund_expired(env: Env, contract_id: u64) {
        let mut escrow: EscrowContract = env.storage().persistent().get(&contract_id).unwrap();
        assert!(matches!(escrow.status, EscrowStatus::Funded));
        assert!(env.ledger().sequence() > escrow.expiry_ledger, "Not expired");

        let usdc_client = token::Client::new(&env, &get_usdc_address(&env));
        usdc_client.transfer(
            &env.current_contract_address(),
            &escrow.buyer,
            &escrow.amount_usdc,
        );

        escrow.status = EscrowStatus::Refunded;
        env.storage().persistent().set(&contract_id, &escrow);
    }
}
```

### 3. Credit Score Contract

Builds an on-chain credit profile from completed harvest deliveries. No central authority — the ledger is the source of truth.

```rust
#[contracttype]
#[derive(Clone)]
pub struct FarmerCredit {
    pub farmer: Address,
    pub total_contracts: u32,
    pub completed_contracts: u32,
    pub total_value_usdc: i128,
    pub defaults: u32,
    pub score: u32,              // 0–1000 (like a FICO equivalent)
    pub last_updated_ledger: u32,
}

#[contractimpl]
impl CreditScoreContract {
    pub fn record_completion(env: Env, escrow_contract: Address, farmer: Address, value: i128) {
        escrow_contract.require_auth();  // Only the escrow contract can call this
        let mut credit: FarmerCredit = env
            .storage()
            .persistent()
            .get(&farmer)
            .unwrap_or(FarmerCredit::default_for(&env, &farmer));

        credit.total_contracts += 1;
        credit.completed_contracts += 1;
        credit.total_value_usdc += value;
        credit.score = Self::calculate_score(&credit);
        credit.last_updated_ledger = env.ledger().sequence();

        env.storage().persistent().set(&farmer, &credit);
    }

    fn calculate_score(credit: &FarmerCredit) -> u32 {
        if credit.total_contracts == 0 { return 0; }
        let completion_rate = (credit.completed_contracts as u64 * 1000)
            / credit.total_contracts as u64;
        let volume_bonus = (credit.total_value_usdc / 1_000_0000).min(200) as u32; // max +200 pts
        ((completion_rate as u32 * 8 / 10) + volume_bonus).min(1000)
    }
}
```

### 4. Loan Contract

Allows lenders to fund pre-harvest advances against tokenized crop collateral. Repayment flows through escrow settlement.

```rust
#[contracttype]
#[derive(Clone)]
pub enum LoanStatus { Active, Repaid, Defaulted, Liquidated }

#[contracttype]
#[derive(Clone)]
pub struct Loan {
    pub lender: Address,
    pub farmer: Address,
    pub batch_id: u64,           // Collateralized harvest batch
    pub principal_usdc: i128,
    pub interest_bps: u32,       // Basis points e.g. 500 = 5%
    pub due_ledger: u32,
    pub status: LoanStatus,
}
```

### Deploying Contracts

```bash
# Build all contracts
cd contracts
stellar contract build

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/harvest_token.wasm \
  --source <ADMIN_SECRET_KEY> \
  --network testnet

# Initialize escrow with USDC token address
stellar contract invoke \
  --id <ESCROW_CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  --network testnet \
  -- initialize \
  --usdc_address <USDC_CONTRACT_ADDRESS>
```

---

## Backend — NestJS

### Module Overview

```
src/modules/
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts        # Stellar keypair challenge-response auth
│   ├── auth.controller.ts
│   ├── jwt.strategy.ts
│   └── stellar-auth.guard.ts
│
├── farmers/
│   ├── farmers.module.ts
│   ├── farmers.service.ts     # CRUD + credit score queries
│   ├── farmers.controller.ts
│   └── entities/farmer.entity.ts
│
├── harvests/
│   ├── harvests.module.ts
│   ├── harvests.service.ts    # Calls Soroban harvest-token contract
│   ├── harvests.controller.ts
│   └── entities/harvest.entity.ts
│
├── contracts/
│   ├── contracts.module.ts
│   ├── contracts.service.ts   # Orchestrates escrow lifecycle
│   └── entities/contract.entity.ts
│
├── payments/
│   ├── payments.module.ts
│   ├── payments.service.ts    # Path payments, anchor withdrawals
│   └── entities/payment.entity.ts
│
├── oracle/
│   ├── oracle.module.ts
│   ├── oracle.service.ts      # Ingest IoT / satellite data
│   ├── oracle.controller.ts   # Webhook endpoint for sensor data
│   └── oracle.processor.ts    # BullMQ worker → triggers escrow release
│
└── marketplace/
    ├── marketplace.module.ts
    ├── marketplace.service.ts
    └── marketplace.controller.ts
```

### Authentication — Stellar Challenge-Response

Users prove ownership of their Stellar keypair without transmitting private keys.

```typescript
// auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private stellarService: StellarService,
    private jwtService: JwtService,
    private farmersService: FarmersService,
  ) {}

  async getChallenge(publicKey: string): Promise<{ challenge: string; transaction: string }> {
    // SEP-10 Web Auth: generate a challenge transaction the user must sign
    const challengeTx = await this.stellarService.buildChallengeTransaction(publicKey);
    const challenge = randomBytes(32).toString('hex');
    await this.cacheManager.set(`challenge:${publicKey}`, challenge, 300_000);
    return { challenge, transaction: challengeTx.toEnvelope().toXDR('base64') };
  }

  async verifyAndLogin(publicKey: string, signedXdr: string): Promise<{ accessToken: string }> {
    const isValid = await this.stellarService.verifyChallengeTransaction(
      signedXdr,
      publicKey,
    );
    if (!isValid) throw new UnauthorizedException('Invalid Stellar signature');

    let farmer = await this.farmersService.findByPublicKey(publicKey);
    if (!farmer) {
      farmer = await this.farmersService.create({ stellarPublicKey: publicKey });
    }

    const payload = { sub: farmer.id, publicKey };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
```

### Harvest Tokenization Service

```typescript
// harvests/harvests.service.ts
@Injectable()
export class HarvestsService {
  constructor(
    @InjectRepository(Harvest) private harvestRepo: Repository<Harvest>,
    private sorobanService: SorobanService,
    private stellarService: StellarService,
  ) {}

  async tokenizeHarvest(
    farmer: Farmer,
    dto: CreateHarvestDto,
  ): Promise<{ harvest: Harvest; batchId: bigint }> {
    // 1. Call Soroban harvest-token contract
    const batchId = await this.sorobanService.invokeContract({
      contractId: process.env.HARVEST_TOKEN_CONTRACT_ID,
      method: 'create_batch',
      args: [
        nativeToScVal(farmer.stellarPublicKey, { type: 'address' }),
        xdr.ScVal.scvSymbol(dto.commodity),
        xdr.ScVal.scvSymbol(dto.grade),
        nativeToScVal(dto.weightKg, { type: 'u64' }),
        nativeToScVal(dto.locationGeohash, { type: 'string' }),
        nativeToScVal(Math.floor(new Date(dto.harvestDate).getTime() / 1000), { type: 'u64' }),
      ],
      signerSecret: process.env.PLATFORM_SIGNER_SECRET, // relayer pattern
    });

    // 2. Persist to database
    const harvest = this.harvestRepo.create({
      farmerId: farmer.id,
      stellarBatchId: batchId.toString(),
      commodity: dto.commodity,
      grade: dto.grade,
      weightKg: dto.weightKg,
      locationGeohash: dto.locationGeohash,
      harvestDate: dto.harvestDate,
      status: HarvestStatus.TOKENIZED,
    });
    await this.harvestRepo.save(harvest);

    return { harvest, batchId };
  }
}
```

### Oracle Processor (BullMQ)

```typescript
// oracle/oracle.processor.ts
@Processor('oracle-events')
export class OracleProcessor {
  constructor(
    private contractsService: ContractsService,
    private sorobanService: SorobanService,
    private notificationsService: NotificationsService,
  ) {}

  @Process('iot-delivery-confirmed')
  async handleDeliveryConfirm(job: Job<OracleDeliveryPayload>) {
    const { contractId, sensorData } = job.data;

    // Validate sensor data integrity (signature from IoT device)
    const isValid = await this.validateSensorSignature(sensorData);
    if (!isValid) throw new Error('Invalid sensor signature');

    // Verify weight matches contract terms (within 2% tolerance)
    const contract = await this.contractsService.findByStellarId(contractId);
    const toleranceOk = Math.abs(sensorData.weightKg - contract.expectedWeightKg)
      / contract.expectedWeightKg < 0.02;

    if (!toleranceOk) {
      await this.contractsService.flagDispute(contractId, 'Weight mismatch');
      return;
    }

    // Invoke Soroban escrow to release funds
    await this.sorobanService.invokeContract({
      contractId: process.env.ESCROW_CONTRACT_ID,
      method: 'confirm_delivery',
      args: [
        nativeToScVal(process.env.ORACLE_PUBLIC_KEY, { type: 'address' }),
        nativeToScVal(BigInt(contractId), { type: 'u64' }),
      ],
      signerSecret: process.env.ORACLE_SIGNER_SECRET,
    });

    // Notify farmer
    await this.notificationsService.sendSMS(
      contract.farmer.phone,
      `✅ Delivery confirmed. Your payment of $${contract.amountUsdc} has been released.`,
    );
  }
}
```

---

## Frontend — Angular

### Angular Project Setup

```bash
ng new agrochain-frontend \
  --routing --style=scss \
  --standalone \
  --ssr=false
cd agrochain-frontend
ng add @angular/material
ng add @angular/pwa
npm install @stellar/stellar-sdk @ngrx/store @ngrx/effects ngx-echarts tailwindcss
```

### Wallet Connection Service

```typescript
// core/services/wallet.service.ts
import { isConnected, getPublicKey, signTransaction } from '@stellar/freighter-api';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private publicKey$ = new BehaviorSubject<string | null>(null);
  readonly connected$ = this.publicKey$.pipe(map(k => !!k));

  async connect(): Promise<string> {
    const connected = await isConnected();
    if (!connected) {
      throw new Error('Please install the Freighter wallet extension.');
    }
    const publicKey = await getPublicKey();
    this.publicKey$.next(publicKey);
    return publicKey;
  }

  async signTransaction(xdr: string, network: 'TESTNET' | 'PUBLIC'): Promise<string> {
    return signTransaction(xdr, { networkPassphrase: network });
  }

  getPublicKey(): string | null {
    return this.publicKey$.getValue();
  }
}
```

### Harvest Tokenization Component

```typescript
// features/harvests/create-harvest/create-harvest.component.ts
@Component({
  selector: 'app-create-harvest',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatSelectModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>Commodity</mat-label>
        <mat-select formControlName="commodity">
          <mat-option value="MAIZE">Maize</mat-option>
          <mat-option value="COFFEE">Coffee</mat-option>
          <mat-option value="COCOA">Cocoa</mat-option>
          <mat-option value="SOYBEAN">Soybean</mat-option>
          <mat-option value="CASSAVA">Cassava</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field>
        <mat-label>Weight (kg)</mat-label>
        <input matInput type="number" formControlName="weightKg" />
      </mat-form-field>

      <mat-form-field>
        <mat-label>Expected Harvest Date</mat-label>
        <input matInput [matDatepicker]="picker" formControlName="harvestDate" />
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading()">
        {{ loading() ? 'Tokenizing on Stellar...' : 'Tokenize Harvest' }}
      </button>
    </form>
  `,
})
export class CreateHarvestComponent {
  loading = signal(false);

  form = this.fb.group({
    commodity: ['', Validators.required],
    grade: ['AA', Validators.required],
    weightKg: [null, [Validators.required, Validators.min(50)]],
    harvestDate: [null, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private harvestsService: HarvestsService,
    private snackBar: MatSnackBar,
    private store: Store,
  ) {}

  async onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    try {
      const harvest = await firstValueFrom(
        this.harvestsService.create(this.form.value as CreateHarvestDto)
      );
      this.store.dispatch(HarvestActions.tokenizeSuccess({ harvest }));
      this.snackBar.open(`✅ Harvest tokenized! Batch ID: ${harvest.stellarBatchId}`, 'Close');
    } catch (err) {
      this.snackBar.open(`❌ Tokenization failed: ${err.message}`, 'Close');
    } finally {
      this.loading.set(false);
    }
  }
}
```

### NgRx State — Harvests

```typescript
// store/harvests/harvests.actions.ts
export const HarvestActions = createActionGroup({
  source: 'Harvests',
  events: {
    'Load Harvests': emptyProps(),
    'Load Harvests Success': props<{ harvests: Harvest[] }>(),
    'Tokenize Success': props<{ harvest: Harvest }>(),
    'Create Escrow': props<{ harvestId: string; buyerPublicKey: string; amountUsdc: number }>(),
    'Escrow Created': props<{ contract: EscrowContract }>(),
  },
});

// store/harvests/harvests.reducer.ts
export const harvestsReducer = createReducer(
  initialState,
  on(HarvestActions.loadHarvestsSuccess, (state, { harvests }) => ({
    ...state,
    items: harvests,
    loading: false,
  })),
  on(HarvestActions.tokenizeSuccess, (state, { harvest }) => ({
    ...state,
    items: [...state.items, harvest],
  })),
);
```

---

## Off-chain Integrations

### IoT Weight Sensor Oracle

Delivery is confirmed when IoT sensors at the aggregation point report weight within 2% of contracted amount. The sensor signs its payload with an ed25519 key registered on-chain.

```typescript
// POST /oracle/delivery-confirmed
@Post('delivery-confirmed')
async deliveryConfirmed(@Body() payload: OracleDeliveryDto) {
  // Verify IoT device signature
  await this.oracleService.verifyAndEnqueue(payload);
  return { queued: true };
}
```

### Satellite NDVI Yield Oracle

Integrates with the [NASA Harvest API](https://nasaharvest.org) and [Sentinel Hub](https://www.sentinel-hub.com) to provide yield forecasts. Used by lenders to assess loan risk and by buyers for purchase planning.

```typescript
// oracle/ndvi.service.ts
@Injectable()
export class NdviService {
  async getYieldForecast(geohash: string, commodity: string): Promise<YieldForecast> {
    const bbox = geohashToBbox(geohash);
    const ndvi = await this.sentinelHub.getNdvi(bbox, lastNDays(30));
    return {
      geohash,
      commodity,
      estimatedYieldKgPerHa: this.modelYield(ndvi, commodity),
      confidence: ndvi.cloudCoverPct < 20 ? 'HIGH' : 'MEDIUM',
      updatedAt: new Date(),
    };
  }
}
```

### Mobile Money Anchor Integration

The platform uses Stellar anchor servers to allow farmers to withdraw USDC as mobile money.

```typescript
// stellar/anchor.service.ts
@Injectable()
export class AnchorService {
  // SEP-6 deposit / SEP-24 interactive withdrawal
  async initiateWithdrawal(
    farmerPublicKey: string,
    amountUsdc: string,
    anchorId: 'mpesa' | 'mtn_momo' | 'flutterwave',
    mobileNumber: string,
  ): Promise<{ url: string; id: string }> {
    const anchor = this.anchors[anchorId];
    return anchor.sep24.withdraw({
      asset_code: 'USDC',
      amount: amountUsdc,
      account: farmerPublicKey,
      extra_fields: { mobile_number: mobileNumber },
    });
  }
}
```

---

## Data Models

### PostgreSQL Schema (TypeORM Entities)

```typescript
// Farmer entity
@Entity()
export class Farmer {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) stellarPublicKey: string;
  @Column({ nullable: true }) phone: string;
  @Column({ nullable: true }) nationalIdHash: string; // hashed KYC
  @Column({ default: 'KE' }) countryCode: string;
  @Column({ default: 0 }) onChainCreditScore: number; // mirrors on-chain
  @OneToMany(() => Harvest, h => h.farmer) harvests: Harvest[];
  @CreateDateColumn() createdAt: Date;
}

// Harvest entity
@Entity()
export class Harvest {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() stellarBatchId: string;   // On-chain ID
  @Column() commodity: string;
  @Column() grade: string;
  @Column('decimal') weightKg: number;
  @Column() locationGeohash: string;
  @Column() harvestDate: Date;
  @Column({ type: 'enum', enum: HarvestStatus }) status: HarvestStatus;
  @ManyToOne(() => Farmer, f => f.harvests) farmer: Farmer;
  @OneToOne(() => EscrowContract, e => e.harvest) escrow: EscrowContract;
  @CreateDateColumn() createdAt: Date;
}

// EscrowContract entity
@Entity()
export class EscrowContract {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() stellarContractId: string;
  @Column() buyerPublicKey: string;
  @Column('decimal') amountUsdc: number;
  @Column({ type: 'enum', enum: ContractStatus }) status: ContractStatus;
  @Column({ nullable: true }) deliveryConfirmedAt: Date;
  @OneToOne(() => Harvest) harvest: Harvest;
  @CreateDateColumn() createdAt: Date;
}
```

---

## API Reference

Full Swagger docs available at `/api/docs` when running the backend.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/challenge` | Get SEP-10 challenge transaction | Public |
| `POST` | `/auth/verify` | Verify signed transaction, return JWT | Public |
| `GET` | `/farmers/me` | Get authenticated farmer profile | JWT |
| `PUT` | `/farmers/me` | Update profile (phone, country) | JWT |
| `POST` | `/harvests` | Tokenize a new harvest batch | JWT |
| `GET` | `/harvests` | List farmer's harvests | JWT |
| `GET` | `/harvests/:id` | Get harvest details + on-chain data | JWT |
| `POST` | `/contracts` | Create escrow contract | JWT |
| `GET` | `/contracts/:id` | Get contract + escrow status | JWT |
| `POST` | `/contracts/:id/dispute` | Raise a dispute | JWT |
| `GET` | `/marketplace` | Browse available harvest lots | Public |
| `GET` | `/marketplace/:id` | Get lot details + NDVI forecast | Public |
| `POST` | `/payments/withdraw` | Initiate anchor withdrawal (MoMo) | JWT |
| `GET` | `/payments/history` | Payment history | JWT |
| `POST` | `/oracle/delivery-confirmed` | IoT sensor delivery webhook | API Key |
| `GET` | `/oracle/ndvi/:geohash` | Get NDVI yield forecast | JWT |
| `GET` | `/credit/:publicKey` | Get on-chain credit score | JWT |

---

## Environment Variables

### Backend (`.env`)

```env
# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# Database
DATABASE_URL=postgresql://agrochain:password@localhost:5432/agrochain_db
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY=7d

# Stellar
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_RPC_URL=https://soroban-testnet.stellar.org

# Contract IDs (populated after deployment)
HARVEST_TOKEN_CONTRACT_ID=
ESCROW_CONTRACT_ID=
CREDIT_SCORE_CONTRACT_ID=
LOAN_CONTRACT_ID=

# Platform signer (relay transactions on behalf of users)
PLATFORM_SIGNER_SECRET=

# Oracle signer (IoT oracle authority keypair)
ORACLE_PUBLIC_KEY=
ORACLE_SIGNER_SECRET=

# Anchors
MPESA_ANCHOR_URL=https://anchor.mpesa.example.com
MTN_MOMO_ANCHOR_URL=https://anchor.mtnmomo.example.com

# External APIs
SENTINEL_HUB_CLIENT_ID=
SENTINEL_HUB_CLIENT_SECRET=
NASA_HARVEST_API_KEY=
```

### Frontend (`environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  stellarNetwork: 'TESTNET',
  stellarHorizonUrl: 'https://horizon-testnet.stellar.org',
  contractIds: {
    harvestToken: '',
    escrow: '',
    creditScore: '',
    loan: '',
  },
};
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker + Docker Compose
- Rust + `stellar-cli` (`cargo install stellar-cli`)
- Freighter Wallet browser extension (for frontend dev)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/agrochain-africa.git
cd agrochain-africa
```

### 2. Start infrastructure

```bash
docker compose up -d postgres redis
```

### 3. Deploy Soroban contracts to Testnet

```bash
cd contracts

# Build
stellar contract build

# Generate testnet keypairs
stellar keys generate --network testnet admin
stellar keys generate --network testnet oracle

# Fund them
stellar keys fund admin --network testnet
stellar keys fund oracle --network testnet

# Deploy
HARVEST_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/harvest_token.wasm \
  --source admin --network testnet)

ESCROW_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --source admin --network testnet)

echo "HARVEST_TOKEN_CONTRACT_ID=$HARVEST_ID"
echo "ESCROW_CONTRACT_ID=$ESCROW_ID"
```

### 4. Run the backend

```bash
cd apps/backend
cp .env.example .env
# Fill in contract IDs and keypairs from step 3

npm install
npm run migration:run
npm run start:dev
# API available at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
```

### 5. Run the frontend

```bash
cd apps/frontend
npm install
npm run start
# App available at http://localhost:4200
```

---

## Testing

### Backend unit + integration tests

```bash
cd apps/backend

# Unit tests
npm run test

# Integration tests (requires running DB and Redis)
npm run test:e2e

# Coverage report
npm run test:cov
```

### Smart contract tests

```bash
cd contracts/escrow
cargo test

cd contracts/harvest-token
cargo test
```

### Frontend tests

```bash
cd apps/frontend
npm run test         # Karma unit tests
npm run e2e          # Playwright e2e tests
```

---

## Deployment

### Docker Compose (staging)

```bash
docker compose -f docker/docker-compose.prod.yml up -d
```

### GitHub Actions CI/CD

The pipeline (`.github/workflows/deploy.yml`) runs on every push to `main`:

1. Lint + test backend
2. Lint + test frontend
3. Build + test Soroban contracts
4. Build Docker images and push to ECR
5. Deploy to AWS ECS

---

## Roadmap

### Phase 1 — Core
- [x] Architecture design
- [ ] Soroban contract development + testnet deployment
- [ ] NestJS backend: auth, farmers, harvests, escrow
- [ ] Angular PWA: farmer onboarding, harvest tokenization, escrow view
- [ ] M-Pesa anchor integration

### Phase 2 — Financing
- [ ] Credit score contract
- [ ] Loan contract + lender dashboard
- [ ] IoT oracle integration (pilot with 3 co-ops)
- [ ] USSD gateway for feature phones

### Phase 3 — Scale
- [ ] Satellite NDVI oracle
- [ ] Multi-country expansion (NG, GH, TZ, CIV)
- [ ] DEX-based commodity futures (tokenized forward contracts)
- [ ] Mobile app (Angular + Capacitor)
- [ ] Mainnet launch

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
# make your changes
git commit -m "feat: add satellite oracle integration"
git push origin feature/your-feature-name
# open a PR
```

Please make sure to update tests alongside any code changes.

---

## License

[MIT](LICENSE) © 2025 AgroChain Africa

---

> *"The farmer is the only person in the world who buys everything at retail, sells everything at wholesale, and pays the freight both ways." — John F. Kennedy*
>
> AgroChain Africa is built to change that.
