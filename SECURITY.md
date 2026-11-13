# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

## Reporting a Vulnerability

We take the security of the Blockchain-Enabled Energy Trading System seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities.
2. Email us at **affrinwills@gmail.com** with:
   - A description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Any suggested fixes (optional)

### What to Expect

- **Acknowledgement**: We will acknowledge receipt within **48 hours**.
- **Assessment**: We will assess the vulnerability and determine its severity within **7 days**.
- **Fix**: Critical vulnerabilities will be patched within **14 days**.
- **Disclosure**: We will coordinate public disclosure after a fix is available.

### Smart Contract Security

Since this project involves smart contracts handling energy tokens and financial transactions, we pay special attention to:

- **Reentrancy attacks** — All state changes occur before external calls
- **Integer overflow/underflow** — Solidity 0.8.x built-in checks
- **Access control** — Owner-only admin functions, authorized minters
- **Front-running** — Order matching design considerations
- **Oracle manipulation** — Dynamic pricing bounds (MIN_PRICE / MAX_PRICE)

### Scope

The following are in scope for security reports:

- Smart contracts (`contracts/` directory)
- Deployment scripts (`scripts/` directory)
- Frontend DApp security (XSS, injection)
- IoT firmware security (`iot/` directory)
- Dependency vulnerabilities

### Out of Scope

- Issues in third-party dependencies (report upstream)
- Social engineering attacks
- Denial of service attacks on test networks

## Security Best Practices for Users

- **Never share your private keys** or `.env` file
- **Always verify contract addresses** before interacting
- **Use hardware wallets** for mainnet deployments
- **Test thoroughly on testnets** before mainnet deployment
- **Keep dependencies updated** (`npm audit`)

---

Thank you for helping keep this project secure! 🔒
