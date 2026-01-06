# Smart Contract Development

The core of the Web3 Message Board is the `MessageBoard.sol` smart contract. This document outlines its design, data structures, and functionality.

## Contract Overview

**Contract Name:** `MessageBoard`
**Network:** Sepolia Testnet (and Local Hardhat Network)
**Solidity Version:** `^0.8.28`

The contract serves two main purposes:

1.  **Public Messaging:** A permanent, immutable ledger of public messages.
2.  **Private Messaging:** A secure registry for public keys and a relay for encrypted messages.

## Data Structures

### 1. Public Messages

```solidity
struct Message {
    address sender;
    string content;
    uint256 timestamp;
}
Message[] public messages;
```

- Stores all public posts in a dynamic array.
- `content` is stored as a plain string (visible to everyone).

### 2. Private Messages

```solidity
struct PrivateMessage {
    address sender;
    string encryptedContent;
    uint256 timestamp;
}
mapping(address => PrivateMessage[]) private privateMessages;
```

- Maps a recipient's address to their array of private messages.
- `encryptedContent` stores the hex-encoded encrypted string.
- **Privacy:** Only the recipient can retrieve their messages via `getMyPrivateMessages`.

### 3. Key Registry

```solidity
mapping(address => string) public pubKeys;
```

- Maps a user's Ethereum address to their **Public Encryption Key** (x25519).
- Required for other users to encrypt messages for them.

## Key Functions

### Public Actions

- **`sendMessage(string memory _content)`**: Adds a new public message to the `messages` array. Emits `NewMessage`.
- **`getMessages()`**: Returns all public messages.

### Private Actions

- **`registerPublicKey(string memory _pubKey)`**: Associates a public encryption key with the caller's address. Emits `PublicKeyRegistered`.
- **`getPublicKey(address _user)`**: Retrieves the registered public key for a specific user.
- **`sendPrivateMessage(address _recipient, string memory _encryptedContent)`**: Sends an encrypted message to a registered user.
  - **Checks:** Ensures the recipient has a registered public key.
  - **Emits:** `NewPrivateMessage`.
- **`getMyPrivateMessages()`**: Returns all private messages sent to the caller (`msg.sender`).

## Events

Events are emitted to allow off-chain applications (like our frontend) to index and react to changes.

- `event NewMessage(address indexed sender, uint256 timestamp, string content);`
- `event PublicKeyRegistered(address indexed user, string pubKey);`
- `event NewPrivateMessage(address indexed sender, address indexed receiver, uint256 timestamp);`
