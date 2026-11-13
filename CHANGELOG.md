# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2023-12-01

### Added

- **EnergyToken (ERC-20)**: Token contract representing tradeable energy units (kWh).
  - Authorized minter system for verified smart meters.
  - Burn functionality for consumed energy.
- **EnergyMarket**: Decentralized P2P energy marketplace.
  - Create, fulfill, and cancel sell orders.
  - Platform fee mechanism (configurable, max 10%).
  - Reentrancy protection on all payment functions.
  - Active order querying.
- **DynamicPricing**: On-chain pricing oracle.
  - Supply-demand-based price calculation.
  - Configurable price bounds (MIN_PRICE / MAX_PRICE).
  - Trade history recording.
- **IoT Smart Meter Firmware**: Arduino/ESP32 firmware.
  - ACS712 current sensing.
  - DHT22 temperature & humidity monitoring.
  - BH1750 light intensity measurement.
  - MQTT data publishing.
- **React Frontend DApp**: User interface for energy trading.
  - MetaMask wallet connection.
  - Dashboard with balances and pricing.
  - Sell order creation and energy purchasing.
- **Deployment Scripts**: Automated contract deployment with post-deployment configuration.
- **Comprehensive Test Suite**: Unit and integration tests for all smart contracts.
- **CI/CD Pipeline**: GitHub Actions workflow for automated testing.
- **Documentation**: README, architecture docs, contributing guidelines, security policy.

### Security

- SHA-3 + AES encryption for enhanced transaction security.
- Multi-factor authentication support.
- PoS/PBFT consensus mechanism compatibility.
- Reentrancy guard on all payable functions.

---

## [Unreleased]

### Planned

- Cross-chain energy trading support
- AI-driven demand forecasting
- Mobile application (React Native)
- Layer 2 scaling integration
- Enhanced analytics dashboard with Power BI integration
