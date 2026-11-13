# Contributing to Blockchain Energy Trading System

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inclusive experience for everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/affrin-19/blockchain-energy-trading/issues).
2. If not, create a new issue using the **Bug Report** template.
3. Include as much detail as possible: steps to reproduce, expected vs. actual behavior, screenshots, and environment details.

### Suggesting Features

1. Check existing [Issues](https://github.com/affrin-19/blockchain-energy-trading/issues) for similar suggestions.
2. Create a new issue using the **Feature Request** template.
3. Describe the feature, its use case, and how it aligns with the project goals.

### Submitting Code

1. Fork the repository.
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes, following the [Coding Standards](#coding-standards).
4. Write or update tests for your changes.
5. Ensure all tests pass:
   ```bash
   npx hardhat test
   ```
6. Submit a pull request.

## Development Setup

```bash
# Clone your fork
git clone https://github.com/affrin-19/blockchain-energy-trading.git
cd blockchain-energy-trading

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
```

## Pull Request Process

1. Ensure your PR description clearly explains the changes and references any related issues.
2. Update documentation if your changes affect it.
3. Add tests for new functionality.
4. Ensure the CI pipeline passes (linting, tests, coverage).
5. Request a review from at least one maintainer.
6. Once approved, a maintainer will merge your PR.

## Coding Standards

### Solidity

- Use Solidity `^0.8.20`.
- Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html).
- Use NatSpec documentation for all public/external functions.
- Run the linter before committing:
  ```bash
  npm run lint:sol
  ```

### JavaScript

- Use ES6+ syntax.
- Use `async/await` over raw promises.
- Run Prettier before committing:
  ```bash
  npm run format
  ```

### General

- Keep functions focused and under 50 lines where possible.
- Write meaningful variable and function names.
- Comment complex logic, but prefer self-documenting code.

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `test` — Adding or updating tests
- `refactor` — Code refactoring (no feature change)
- `chore` — Maintenance tasks
- `ci` — CI/CD changes

**Examples:**
```
feat(contracts): add dynamic pricing oracle
fix(market): resolve reentrancy vulnerability in buyEnergy
docs(readme): update deployment instructions
test(token): add tests for minter authorization
```

---

Thank you for contributing! 🎉
