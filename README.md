# Web3 Message Board

A decentralized message board application built with React, Hardhat, and Ethereum (Sepolia Testnet). It supports public posts stored on-chain and end-to-end encrypted secret messages between users.

## Features

- **Public Board**: Post messages that are permanently stored on the blockchain.
- **Secret Inbox**: Send and receive end-to-end encrypted messages using your wallet's encryption keys.
- **Decentralized**: No central server for message storage.
- **Secure**: Private messages are encrypted off-chain and can only be decrypted by the intended recipient.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MetaMask](https://metamask.io/) browser extension

## Setup

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the root directory (copy from `.env.example`):

    ```bash
    cp .env.example .env
    ```

    Fill in your details:

    - `SEPOLIA_RPC_URL`: Your Alchemy/Infura RPC URL for Sepolia.
    - `PRIVATE_KEY`: Your wallet private key (for deployment only).
    - `ETHERSCAN_API_KEY`: For verifying contracts.

3.  **Run Locally (Frontend)**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## Smart Contract

The contract is located in `contracts/MessageBoard.sol`.

- **Compile**: `npx hardhat compile`
- **Deploy to Sepolia**: `npx hardhat run scripts/deploy.js --network sepolia`
- **Run Local Node**: `npx hardhat node`

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, Ethers.js
- **Blockchain**: Hardhat, Solidity
- **Encryption**: @metamask/eth-sig-util (x25519-xsalsa20-poly1305)
