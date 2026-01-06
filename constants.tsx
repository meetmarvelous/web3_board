
// The contract address after deployment. 
// UPDATE THIS after running: npx hardhat run scripts/deploy.ts --network localhost
export const CONTRACT_ADDRESS = "0xA2E506118CEFEDc7361f5604dd5Ee189b4f642d1";

export const CONTRACT_ABI = [
  "function sendMessage(string memory _content) public",
  "function getMessages() public view returns (tuple(address sender, string content, uint256 timestamp)[])",
  "function getMessageCount() public view returns (uint256)",
  "function registerPublicKey(string memory _pubKey) public",
  "function getPublicKey(address _user) public view returns (string memory)",
  "function sendPrivateMessage(address _to, string memory _encryptedContent) public",
  "function getMyPrivateMessages() public view returns (tuple(address sender, string encryptedContent, uint256 timestamp)[])",
  "event NewMessage(address indexed sender, string content, uint256 timestamp)",
  "event NewPrivateMessage(address indexed sender, address indexed receiver, uint256 timestamp)",
  "event PublicKeyRegistered(address indexed user, string pubKey)"
];

export const SEPOLIA_CHAIN_ID = "0xaa36a7";
export const LOCALHOST_CHAIN_ID = "0x7a69"; // Hardhat default is 31337 (0x7a69)
export const HARDHAT_NETWORK_ID = "0x539"; // 1337

export const NETWORK_NAMES: Record<string, string> = {
  "0x1": "Ethereum Mainnet",
  [SEPOLIA_CHAIN_ID]: "Sepolia Testnet",
  [LOCALHOST_CHAIN_ID]: "Hardhat Local",
  [HARDHAT_NETWORK_ID]: "Hardhat Local"
};
