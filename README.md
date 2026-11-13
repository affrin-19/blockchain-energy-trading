<div align="center">

# ⚡ Blockchain-Enabled Energy Trading System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.x-FFF100?logo=hardhat)](https://hardhat.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![CI](https://github.com/affrin-19/blockchain-energy-trading/actions/workflows/ci.yml/badge.svg)](https://github.com/affrin-19/blockchain-energy-trading/actions)

**A decentralized peer-to-peer energy trading platform leveraging blockchain technology, smart contracts, and IoT-enabled smart meters for secure, transparent, and efficient energy transactions.**

[📄 Paper](#research-paper) · [🚀 Getting Started](#getting-started) · [📖 Documentation](docs/) · [🤝 Contributing](CONTRIBUTING.md)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Smart Contracts](#smart-contracts)
- [IoT Integration](#iot-integration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Performance Benchmarks](#performance-benchmarks)
- [Research Paper](#research-paper)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Overview

Traditional energy markets rely on centralized grid operators, resulting in inefficiencies, high operational costs, and limited flexibility in energy distribution. The **Blockchain-Enabled Energy Trading System** addresses these challenges by providing a decentralized peer-to-peer (P2P) energy marketplace.

By integrating **blockchain technology**, **smart contracts**, and **IoT-enabled smart meters**, this system enables prosumers (entities that both produce and consume energy) and consumers to trade surplus energy directly — eliminating intermediaries and fostering a decentralized energy ecosystem.

> [!NOTE]
> This project accompanies a research paper published in the IEEE conference proceedings. See the [Research Paper](#research-paper) section for details.

## Key Features

| Feature | Description |
|---------|-------------|
| 🔗 **Decentralized Ledger** | Tamper-proof transaction records via blockchain (Ethereum / Hyperledger) |
| 📜 **Smart Contracts** | Automated trade execution with predefined conditions — no intermediaries |
| 📊 **Real-Time Monitoring** | IoT-enabled smart meters for live energy production & consumption tracking |
| 💰 **Dynamic Pricing** | Supply-demand-based pricing for fair and competitive energy markets |
| 🔒 **Enhanced Security** | SHA-3 + AES encryption, multi-factor authentication, PoS/PBFT consensus |
| 🔋 **Energy Storage Integration** | Battery management for surplus energy storage and grid reliability |
| 🌐 **IoT Protocols** | MQTT, Zigbee, LoRaWAN support for seamless device communication |
| 📈 **Analytics Dashboard** | Real-time transaction analytics, demand forecasting, and market insights |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React DApp)                 │
│              Web3.js / Ethers.js Interface               │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Smart Contract Layer                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│  │ EnergyToken  │ │ EnergyMarket │ │  DynamicPricing  │ │
│  │   (ERC-20)   │ │  (Trading)   │ │   (Oracle)       │ │
│  └──────────────┘ └──────────────┘ └──────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  Blockchain Network                      │
│          Ethereum / Hyperledger Fabric                    │
│     Consensus: Proof-of-Stake (PoS) / PBFT              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  IoT & Data Layer                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│  │ Smart Meters  │ │ Energy Flow  │ │  Environmental   │ │
│  │ (Zigbee/MQTT) │ │   Sensors    │ │    Sensors       │ │
│  └──────────────┘ └──────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Ethereum, Solidity ^0.8.20, OpenZeppelin |
| **Development** | Hardhat, Ethers.js, Waffle |
| **Frontend** | React 18, Web3.js, TailwindCSS |
| **IoT** | MQTT, Zigbee, LoRaWAN, Arduino/ESP32 |
| **Sensors** | DHT22 (Temperature), BH1750 (Light), ACS712 (Current) |
| **Analytics** | Power BI, Custom Dashboards |
| **Testing** | Chai, Mocha, Hardhat Network |
| **CI/CD** | GitHub Actions |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.x
- [npm](https://www.npmjs.com/) >= 9.x or [yarn](https://yarnpkg.com/) >= 1.22
- [Git](https://git-scm.com/)
- [MetaMask](https://metamask.io/) browser extension (for DApp interaction)

### Installation

```bash
# Clone the repository
git clone https://github.com/affrin-19/blockchain-energy-trading.git
cd blockchain-energy-trading

# Install dependencies
npm install

# Compile smart contracts
npx hardhat compile

# Run local blockchain node
npx hardhat node

# Deploy contracts to local network (in a new terminal)
npx hardhat run scripts/deploy.js --network localhost
```

### Environment Setup

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# DEPLOYER_PRIVATE_KEY=your_private_key_here
# ETHERSCAN_API_KEY=your_api_key_here
# INFURA_PROJECT_ID=your_project_id_here
```

### Run the Frontend

```bash
cd frontend
npm install
npm start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
blockchain-energy-trading/
├── .github/
│   ├── workflows/
│   │   └── ci.yml                  # CI/CD pipeline
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md           # Bug report template
│       └── feature_request.md      # Feature request template
├── contracts/
│   ├── EnergyToken.sol             # ERC-20 energy token contract
│   ├── EnergyMarket.sol            # P2P energy marketplace contract
│   └── DynamicPricing.sol          # Dynamic pricing oracle contract
├── scripts/
│   └── deploy.js                   # Deployment script
├── test/
│   └── EnergyMarket.test.js        # Smart contract tests
├── frontend/
│   └── src/
│       └── App.js                  # React DApp entry point
├── iot/
│   └── smart_meter.ino             # Arduino/ESP32 smart meter firmware
├── docs/
│   ├── ARCHITECTURE.md             # Detailed architecture documentation
│   └── images/                     # Documentation images
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules
├── .editorconfig                   # Editor configuration
├── .solhint.json                   # Solidity linter configuration
├── hardhat.config.js               # Hardhat configuration
├── package.json                    # Node.js dependencies
├── CONTRIBUTING.md                 # Contribution guidelines
├── CODE_OF_CONDUCT.md              # Code of conduct
├── SECURITY.md                     # Security policy
├── CHANGELOG.md                    # Version changelog
├── LICENSE                         # MIT License
└── README.md                       # This file
```

## Smart Contracts

### EnergyToken (ERC-20)

The `EnergyToken` contract implements an ERC-20 compliant token representing tradeable energy units.

```solidity
// Mint tokens representing generated energy
energyToken.mint(prosumer, energyAmount);

// Transfer tokens for energy purchase
energyToken.transfer(seller, paymentAmount);
```

### EnergyMarket

The `EnergyMarket` contract manages the P2P energy marketplace, handling order creation, matching, and settlement.

```solidity
// List energy for sale
energyMarket.createSellOrder(energyAmount, pricePerUnit);

// Purchase available energy
energyMarket.buyEnergy(orderId);
```

### DynamicPricing

The `DynamicPricing` contract implements a supply-demand-based pricing oracle.

```solidity
// Get current energy price based on market conditions
uint256 currentPrice = dynamicPricing.getCurrentPrice();
```

## IoT Integration

The system integrates with IoT-enabled smart meters using Arduino/ESP32 microcontrollers:

- **DHT22** — Temperature & humidity monitoring
- **BH1750** — Light intensity for solar panel optimization
- **ACS712** — Current sensing for real-time energy flow measurement
- **Communication** — MQTT protocol for data transmission to blockchain nodes

See [`iot/smart_meter.ino`](iot/smart_meter.ino) for the firmware implementation.

## Testing

```bash
# Run all smart contract tests
npx hardhat test

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test

# Run tests with coverage
npx hardhat coverage
```

## Deployment

### Local Development

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet (Sepolia)

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet

```bash
npx hardhat run scripts/deploy.js --network mainnet
```

> [!WARNING]
> Ensure you have sufficient ETH for gas fees and have thoroughly tested on testnets before mainnet deployment.

## Performance Benchmarks

| Metric | Existing Systems | This System | Improvement |
|--------|:---:|:---:|:---:|
| Transaction Validation Time | 150 ms | 90 ms | **40% faster** |
| Smart Contract Execution Time | 80 ms | 50 ms | **37.5% faster** |
| Trading Throughput | 20 tx/sec | 35 tx/sec | **75% higher** |
| CPU Usage | 70% | 45% | **35.7% lower** |
| Storage per 1000 tx | 500 MB | 320 MB | **36% smaller** |
| Security Mechanism | SHA-256 | SHA-3 + AES | **Enhanced** |
| Logic Verification Latency | 4 cycles | 1 cycle | **75% faster** |

## Research Paper

This repository accompanies the research paper:

> **"Blockchain Enabled Energy Trading System"**
> M. Menaka, M. Tharani, M. Pemila, S. Affrin Wills, M. Abishek, G. S. Ajay Adithya
> *Department of Electronics and Communication Engineering*
> *Veltech High Tech Dr Rangarajan Dr Sakunthala Engineering College, Avadi, Tamil Nadu, India*

The paper covers the complete theoretical framework, literature survey, system methodology, hardware/software components, and simulation results.

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) before submitting pull requests.

## Authors

| Name | Email | Role |
|------|-------|------|
| **M. Menaka** | m.menaka@velhightech.com | Faculty Advisor |
| **M. Tharani** | tharani.adhiyamaan@gmail.com | Faculty Advisor |
| **M. Pemila** | m.pemila@velhightech.com | Faculty Advisor |
| **S. Affrin Wills** | affrinwills@gmail.com | Developer |
| **M. Abishek** | sai248627@gmail.com | Developer |
| **G. S. Ajay Adithya** | ajayadhithyag@gmail.com | Developer |

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [Hardhat](https://hardhat.org/) for the Ethereum development environment
- [Ethereum Foundation](https://ethereum.org/) for blockchain infrastructure
- Veltech High Tech Dr Rangarajan Dr Sakunthala Engineering College for institutional support

---

<div align="center">

**⭐ If you find this project useful, please consider giving it a star!**

Made with ❤️ by the Blockchain Energy Trading Team

</div>
