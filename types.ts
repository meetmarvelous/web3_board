
export interface Message {
  sender: string;
  content: string;
  timestamp: bigint;
}

export interface Web3State {
  address: string | null;
  chainId: string | null;
  isConnected: boolean;
}
