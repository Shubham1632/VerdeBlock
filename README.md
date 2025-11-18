# VerdeBlock – Milan CRE Tokenization

This repository contains a Hardhat + Next.js monorepo. The Solidity contracts implement VerdeBlock’s dual-token architecture for tokenizing commercial real estate assets:

- E-Token (EquityToken): fractional SPV equity with compliance-restricted transfers, snapshot support for dividend distributions.
- G-Token (GreenBondToken): retrofit debt token with compliance-restricted transfers, snapshot support for coupon distributions, and ESG bonus hints.
- ComplianceManager: centralized KYC/AML whitelist registry (global + per-project).
- ESGOracle: stores verified ESG performance metrics per project.
- DistributionManager: creates ETH-funded distribution rounds based on token snapshots; holders claim pro-rata.
- Marketplace: fixed-price ask marketplace with KYC-enforced secondary trades and trading window control.
- SPVFactory: registers projects (SPVs) with metadata and token/oracle references, and sets `projectId` on tokens.

All core contracts are upgradeable (UUPS) and use OpenZeppelin libraries. Business logic for cash flows is separated from tokens.

## Structure

Contracts live under `contracts/`:

- `contracts/tokens/EquityToken.sol`
- `contracts/tokens/GreenBondToken.sol`
- `contracts/compliance/ComplianceManager.sol`
- `contracts/oracles/ESGOracle.sol`
- `contracts/distribution/DistributionManager.sol`
- `contracts/marketplace/Marketplace.sol`
- `contracts/spv/SPVFactory.sol`
- `contracts/interfaces/*`

## Quick start

1. Install dependencies

```powershell
pnpm install
```

2. Copy and edit env

```powershell
Copy-Item .env.example .env
# edit .env values for your network/accounts
```

3. Compile and test

```powershell
pnpm test
```

4. Deploy locally or to a testnet

```powershell
npx hardhat run scripts/deploy_verdeblock.ts --network hardhat
```

The deploy script will:

- Deploy upgradeable proxies for ComplianceManager, ESGOracle, DistributionManager, EquityToken, GreenBondToken, SPVFactory, and Marketplace.
- Grant the factory permission to set `projectId` on tokens.
- Register a sample SPV with metadata from `.env`.

## Design notes

- Compliance/whitelisting: enforced by tokens on each transfer through `ComplianceManager` (global + per-project).
- Distributions: created and funded by SPV manager on `DistributionManager` with a token `snapshotId`. Holders claim their share of ETH based on snapshot balances. This avoids iterating all holders on-chain.
- ESG: `ESGOracle` stores verified metrics and emits events when updated. Managers can include bonuses in distribution amounts; `GreenBondToken` exposes a read-only `currentBonusBps` hint for UIs.
- Upgradeability: all core contracts are UUPS proxies (via `@openzeppelin/hardhat-upgrades`).

## Tests

See `test/verdeblock.test.ts` for a basic flow: minting, whitelist enforcement, snapshot, distribution, and claims.

## Next steps / extensions

- Full ERC-3643/1400 partition features (current tokens are ERC20 with transfer restrictions and snapshots).
- Stablecoin-based distributions and automated accrual scheduling.
- NAV-based buybacks and auction-style marketplace orders.
- Optional governance (OZ Governor + Votes) using E-Token as voting power.
