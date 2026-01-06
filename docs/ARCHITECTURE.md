# System Architecture

This document explains the technical architecture of the Web3 Message Board, detailing how the frontend, blockchain, and encryption services interact.

## High-Level Overview

The application is a **Decentralized Application (dApp)**. It does not rely on a traditional backend server or database. Instead, it uses:

- **Ethereum Blockchain (Sepolia)**: For data storage (messages) and identity (public keys).
- **User Wallet (MetaMask)**: For authentication, signing transactions, and encryption/decryption.
- **Client-Side (React)**: For the user interface and logic.

## Technology Stack

| Component                  | Technology              | Purpose                                         |
| :------------------------- | :---------------------- | :---------------------------------------------- |
| **Frontend**               | React, Vite, TypeScript | User Interface                                  |
| **Styling**                | Tailwind CSS            | Responsive Design                               |
| **Blockchain Interaction** | Ethers.js               | Communicating with the Smart Contract           |
| **Smart Contract**         | Solidity, Hardhat       | On-chain logic and storage                      |
| **Encryption**             | @metamask/eth-sig-util  | Off-chain encryption (x25519-xsalsa20-poly1305) |

## Encryption & Privacy Flow

The "Secret Messages" feature uses **End-to-End Encryption (E2EE)**. Here is the flow:

### 1. Registration

1.  User clicks "Register My Key".
2.  App requests `eth_getEncryptionPublicKey` from MetaMask.
3.  User approves. MetaMask returns their **x25519 public key**.
4.  App calls `contract.registerPublicKey(key)` to store it on-chain.

### 2. Sending a Secret Message

1.  Sender enters Recipient Address and Message.
2.  App fetches Recipient's Public Key from the contract (`getPublicKey`).
3.  App encrypts the message locally using `eth-sig-util`:
    - `encrypted = encrypt({ publicKey: recipientKey, data: message, version: 'x25519-xsalsa20-poly1305' })`
4.  App hex-encodes the encrypted data.
5.  App calls `contract.sendPrivateMessage(recipient, encryptedHex)`.
6.  **Note:** The contract _never_ sees the plain text. Only the encrypted hex is stored.

### 3. Decrypting a Message

1.  Recipient opens "Secret Inbox".
2.  App calls `contract.getMyPrivateMessages()` to fetch encrypted messages.
3.  User clicks "Decrypt".
4.  App requests `eth_decrypt` from MetaMask.
5.  User approves (MetaMask asks for signature/decrypt permission).
6.  MetaMask uses the user's **Private Key** to decrypt the message and returns the plain text.

## Directory Structure

```
web3-message-board/
├── contracts/          # Solidity Smart Contracts
├── scripts/            # Deployment scripts
├── src/                # Frontend Source Code
│   ├── services/       # Helper services (encryption)
│   ├── App.tsx         # Main Router
│   ├── Home.tsx        # Main Dashboard
│   └── About.tsx       # Documentation Page
├── docs/               # Documentation (You are here)
└── hardhat.config.cjs  # Hardhat Configuration
```
