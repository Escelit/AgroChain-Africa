# Stellar & Soroban Integration Guide

## Network Configuration

| Environment | Horizon URL | Soroban RPC | Network Passphrase |
|---|---|---|---|
| Testnet | https://horizon-testnet.stellar.org | https://soroban-testnet.stellar.org | `Test SDF Network ; September 2015` |
| Mainnet | https://horizon.stellar.org | https://soroban.stellar.org | `Public Global Stellar Network ; September 2015` |

## Contract Deployment

```bash
# 1. Build all contracts
cd contracts
stellar contract build

# 2. Generate keypairs
stellar keys generate --network testnet admin
stellar keys generate --network testnet oracle
stellar keys fund admin --network testnet
stellar keys fund oracle --network testnet

# 3. Deploy contracts
HARVEST_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/harvest_token.wasm \
  --source admin --network testnet)

ESCROW_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --source admin --network testnet)

CREDIT_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/credit_score.wasm \
  --source admin --network testnet)

LOAN_ID=$(stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/loan.wasm \
  --source admin --network testnet)

# 4. Initialize contracts
stellar contract invoke --id $ESCROW_ID --source admin --network testnet \
  -- initialize --usdc_address <USDC_CONTRACT_ADDRESS>

stellar contract invoke --id $CREDIT_ID --source admin --network testnet \
  -- initialize --escrow_contract $ESCROW_ID
```

## USDC on Testnet

The USDC contract address on Stellar Testnet:
```
GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

## Path Payments (Currency Conversion)

Buyers pay in USDC; farmers receive local currency via Stellar DEX path payments:

```
USDC → [DEX path] → KES (Kenya)
USDC → [DEX path] → NGN (Nigeria)  
USDC → [DEX path] → GHS (Ghana)
```

## Anchor Integration (SEP-24)

Mobile money withdrawal flow:
1. Backend calls `POST /sep24/transactions/withdraw/interactive`
2. Anchor returns interactive URL
3. User completes KYC/confirmation on anchor UI
4. Anchor initiates Stellar payment from farmer's account
5. Mobile money credited within minutes

## Oracle Architecture

IoT sensors sign delivery confirmations with ed25519 keys registered on-chain:

```
IoT Device → POST /oracle/delivery-confirmed (x-api-key)
           → BullMQ queue
           → OracleProcessor validates weight (±2% tolerance)
           → Soroban escrow.confirm_delivery()
           → Funds released to farmer
           → SMS notification via Africa's Talking
```
