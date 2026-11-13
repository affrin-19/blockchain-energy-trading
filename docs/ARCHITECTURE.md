# Architecture — Blockchain-Enabled Energy Trading System

## System Overview

The Blockchain-Enabled Energy Trading System is a decentralized platform that facilitates peer-to-peer (P2P) energy transactions between prosumers and consumers. The system consists of four primary layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                       Presentation Layer                        │
│                    React DApp + MetaMask                         │
├─────────────────────────────────────────────────────────────────┤
│                       Application Layer                         │
│           Smart Contracts (Solidity on Ethereum)                │
│     EnergyToken │ EnergyMarket │ DynamicPricing                 │
├─────────────────────────────────────────────────────────────────┤
│                       Consensus Layer                           │
│            Proof-of-Stake (PoS) / PBFT                         │
│          Ethereum Mainnet / Hyperledger Fabric                  │
├─────────────────────────────────────────────────────────────────┤
│                       Physical Layer                            │
│     IoT Smart Meters │ Sensors │ Energy Sources                 │
│      MQTT / Zigbee / LoRaWAN Communication                     │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Smart Contracts

| Contract | Purpose | Key Functions |
|----------|---------|---------------|
| **EnergyToken** | ERC-20 token representing 1 kWh | `mint()`, `burn()`, `transfer()` |
| **EnergyMarket** | P2P trading marketplace | `createSellOrder()`, `buyEnergy()`, `cancelOrder()` |
| **DynamicPricing** | Price oracle based on supply/demand | `getCurrentPrice()`, `recordTrade()` |

### 2. IoT Integration

Smart meters collect real-time data and feed it to the blockchain:

- **Energy Production**: Solar panel output, wind turbine generation
- **Energy Consumption**: Household/industrial usage patterns
- **Environmental Data**: Temperature, humidity, light intensity

### 3. Trading Flow

```
Prosumer                    Blockchain                   Consumer
   │                            │                            │
   │  1. Generate Energy        │                            │
   │ ──────────────────────►    │                            │
   │                            │                            │
   │  2. Mint ENRG Tokens       │                            │
   │ ──────────────────────►    │                            │
   │                            │                            │
   │  3. Create Sell Order       │                            │
   │ ──────────────────────►    │                            │
   │                            │  4. Browse Orders          │
   │                            │ ◄──────────────────────── │
   │                            │                            │
   │                            │  5. Buy Energy (ETH)       │
   │                            │ ◄──────────────────────── │
   │                            │                            │
   │  6. Receive ETH Payment    │  7. Receive ENRG Tokens    │
   │ ◄──────────────────────   │ ────────────────────────► │
   │                            │                            │
   │                            │  8. Update Dynamic Price   │
   │                            │ ────────────────────────   │
```

### 4. Security Model

- **Data Integrity**: All transactions are immutable on-chain
- **Encryption**: SHA-3 + AES for enhanced security
- **Access Control**: Role-based (Owner, Minter, Trader)
- **Reentrancy Protection**: ReentrancyGuard on all payable functions
- **Price Bounds**: MIN_PRICE and MAX_PRICE to prevent manipulation

## Performance Targets

| Metric | Target |
|--------|--------|
| Transaction Validation | < 90 ms |
| Smart Contract Execution | < 50 ms |
| Throughput | 35 tx/sec |
| CPU Overhead | < 45% |
| Storage Efficiency | 320 MB / 1000 tx |
