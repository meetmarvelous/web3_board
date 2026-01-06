# Vercel Deployment Guide

This guide explains how to deploy the Web3 Message Board frontend to Vercel. Since the frontend is a static React application (Vite) that interacts with the blockchain via MetaMask, deployment is straightforward.

## Prerequisites

1.  **GitHub Repository**: Ensure your code is pushed to GitHub (which you have already done).
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com) if you haven't already.

## Deployment Steps

### Option 1: Automatic Deployment (Recommended)

1.  **Log in to Vercel**: Go to your Vercel dashboard.
2.  **Add New Project**: Click **"Add New..."** -> **"Project"**.
3.  **Import Git Repository**:
    - Select your GitHub account.
    - Find the `web3_board` repository.
    - Click **"Import"**.
4.  **Configure Project**:
    - **Framework Preset**: Vercel should automatically detect **Vite**. If not, select it manually.
    - **Root Directory**: Leave as `./` (default).
    - **Build Command**: `npm run build` (default).
    - **Output Directory**: `dist` (default).
    - **Environment Variables**:
      - Since your `CONTRACT_ADDRESS` is hardcoded in `src/constants.tsx` and you are using MetaMask for the provider, **you do not need to add any environment variables** for the basic frontend to work.
      - _Note: If you decide to add server-side features later that use `PRIVATE_KEY` or `SEPOLIA_RPC_URL`, NEVER add those to the public frontend variables._
5.  **Deploy**: Click **"Deploy"**.

Vercel will build your project and provide you with a live URL (e.g., `https://web3-message-board.vercel.app`).

### Option 2: Vercel CLI

If you prefer the command line:

1.  **Install CLI**:
    ```bash
    npm install -g vercel
    ```
2.  **Login**:
    ```bash
    vercel login
    ```
3.  **Deploy**:
    Run this command in your project root:
    ```bash
    vercel
    ```
4.  **Follow Prompts**:
    - Set up and deploy? **Yes**
    - Which scope? **[Your Name]**
    - Link to existing project? **No**
    - Project name? **web3-message-board**
    - Directory? **./**
    - Auto-detect settings? **Yes**

## Post-Deployment Verification

1.  **Visit the URL**: Open your new Vercel link.
2.  **Connect Wallet**: Click "Connect Wallet". MetaMask should pop up.
3.  **Check Network**: Ensure you are connected to **Sepolia**. The app should show "Sepolia Testnet" in the header.
4.  **Test**: Try posting a message or checking the Secret Inbox.

## Troubleshooting

- **"404 Not Found" on Refresh**:
  - Since this is a Single Page App (SPA) using `react-router-dom`, refreshing on a non-root path (like `/about`) might cause a 404.
  - **Fix**: Create a `vercel.json` file in your root directory with the following content:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```
  - Push this change to GitHub, and Vercel will automatically redeploy.
