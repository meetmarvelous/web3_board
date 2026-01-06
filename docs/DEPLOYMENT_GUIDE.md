# Deployment Guide

This guide covers how to deploy the **MessageBoard** smart contract to the Sepolia testnet and how to prepare the frontend for production.

## 1. Smart Contract Deployment

### Prerequisites

Ensure you have a `.env` file with:

- `SEPOLIA_RPC_URL`: From Alchemy or Infura.
- `PRIVATE_KEY`: Your wallet's private key (must have Sepolia ETH).
- `ETHERSCAN_API_KEY`: For contract verification.

### Deploy to Sepolia

Run the deployment script:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

**Output:**

```
Deploying contract...
MessageBoard deployed to: 0x...
```

**Important:** Copy the new contract address and update `CONTRACT_ADDRESS` in `src/constants.tsx`.

### Verify on Etherscan

Verifying your contract allows others to read the source code on Etherscan.

```bash
npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
```

## 2. Frontend Deployment

The frontend is a static React application built with Vite. It can be deployed to any static hosting provider (Vercel, Netlify, GitHub Pages).

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder containing the optimized HTML, CSS, and JavaScript files.

### Deploying to Vercel (Recommended)

1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in the project root.
3.  Follow the prompts. Vercel will automatically detect the Vite settings.
4.  **Environment Variables:** If you used any `.env` variables in the frontend (prefixed with `VITE_`), make sure to add them in the Vercel project settings.

### Manual Deployment

You can drag and drop the `dist/` folder into Netlify or any static host's upload interface.
