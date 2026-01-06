
# Web3 Message Board Setup Instructions

## 1. Install Dependencies
Run this in the root directory:
```bash
npm install hardhat @nomicfoundation/hardhat-toolbox ethers dotenv lucide-react @heroicons/react @google/genai
```

## 2. Start a Local Ethereum Node
Open a separate terminal and run:
```bash
npx hardhat node
```
This starts a local blockchain on `http://127.0.0.1:8545`. It will list several accounts; one of them is the public Hardhat account used in our config.

## 3. Deploy the Smart Contract
In your main terminal, deploy to the local network:
```bash
npx hardhat run scripts/deploy.ts --network localhost
```
**Important:** Copy the address output (e.g., `0x5Fb...`) and update the `CONTRACT_ADDRESS` constant in `constants.tsx`.

## 4. Run the Frontend
```bash
npm run dev
```
Open the browser at the provided URL (usually `http://localhost:5173`).

## 5. Deploy to Sepolia Testnet
1. Create a `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your `PRIVATE_KEY`, `SEPOLIA_RPC_URL`, and `ETHERSCAN_API_KEY`.
3. Run the deployment:
   ```bash
   npx hardhat run scripts/deploy.ts --network sepolia
   ```
4. Verify on Etherscan (optional):
   ```bash
   npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>
   ```

## 6. Vercel Deployment
Vercel will automatically detect the Vite project. Ensure you add your `.env` variables to the Vercel Project Settings (specifically `SEPOLIA_RPC_URL` and `API_KEY` if used client-side, though for true Web3 security, client-side keys should be handled with caution).
