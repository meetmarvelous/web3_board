import { Buffer } from 'buffer';
import * as ethSigUtil from '@metamask/eth-sig-util';

// Ensure Buffer is available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

export const getEncryptionPublicKey = async (account: string): Promise<string> => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  try {
    const key = await window.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [account],
    });
    return key;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error("User rejected the request.");
    }
    throw error;
  }
};

export const encryptMessage = (publicKey: string, data: string): string => {
  // Hex encode the data to ensure safe transport
  const hexData = Buffer.from(data).toString('hex');

  const encrypted = ethSigUtil.encrypt({
    publicKey: publicKey,
    data: hexData,
    version: 'x25519-xsalsa20-poly1305',
  });

  // Convert the object to a hex string for storage on-chain
  return '0x' + Buffer.from(JSON.stringify(encrypted)).toString('hex');
};

export const decryptMessage = async (account: string, encryptedHex: string): Promise<string> => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  try {
    const decrypted = await window.ethereum.request({
      method: 'eth_decrypt',
      params: [encryptedHex, account],
    });

    // Check if the decrypted string is hex (new format)
    const isHex = /^[0-9a-fA-F]+$/.test(decrypted);
    if (isHex) {
      return Buffer.from(decrypted, 'hex').toString('utf8');
    }
    
    // Fallback for old messages (Base64)
    return Buffer.from(decrypted, 'base64').toString('utf8');
  } catch (error: any) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt message.");
  }
};
