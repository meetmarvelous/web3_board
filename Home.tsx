import React, { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  WalletIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowPathIcon, 
  UserCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LinkIcon,
  BriefcaseIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import { CONTRACT_ADDRESS, CONTRACT_ABI, NETWORK_NAMES, SEPOLIA_CHAIN_ID, LOCALHOST_CHAIN_ID } from './constants';
import { Message, Web3State } from './types';
import { getEncryptionPublicKey, encryptMessage, decryptMessage } from './services/encryptionService';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const Home: React.FC = () => {
  const [web3, setWeb3] = useState<Web3State>({
    address: null,
    chainId: null,
    isConnected: false,
  });
  const [hasProvider, setHasProvider] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newContent, setNewContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Secret Message State
  const [activeTab, setActiveTab] = useState<'public' | 'inbox'>('public');
  const [privateMessages, setPrivateMessages] = useState<any[]>([]);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [myPublicKey, setMyPublicKey] = useState<string | null>(null);
  const [decryptedContent, setDecryptedContent] = useState<Record<number, string>>({});

  const fetchMessages = useCallback(async () => {
    if (!window.ethereum) return;
    
    setIsLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const data = await contract.getMessages();
      
      const formattedMessages: Message[] = data.map((msg: any) => ({
        sender: msg.sender || msg[0],
        content: msg.content || msg[1],
        timestamp: BigInt(msg.timestamp || msg[2]),
      })).reverse();

      setMessages(formattedMessages);
      setError(null);
    } catch (err: any) {
      console.warn("Fetch Messages Warning:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPrivateMessages = useCallback(async () => {
    if (!web3.isConnected || !window.ethereum) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Check if user has registered a public key
      const pubKey = await contract.getPublicKey(web3.address);
      setMyPublicKey(pubKey || null);

      const data = await contract.getMyPrivateMessages();
      const formatted = data.map((msg: any, index: number) => ({
        id: index,
        sender: msg.sender,
        encryptedContent: msg.encryptedContent,
        timestamp: BigInt(msg.timestamp),
      })).reverse();
      setPrivateMessages(formatted);
    } catch (err) {
      console.error("Error fetching private messages:", err);
    }
  }, [web3.address, web3.isConnected]);

  useEffect(() => {
    if (activeTab === 'inbox') {
      fetchPrivateMessages();
    }
  }, [activeTab, fetchPrivateMessages]);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length > 0) {
      setWeb3(prev => ({ ...prev, address: accounts[0], isConnected: true }));
      fetchMessages();
    } else {
      setWeb3({ address: null, chainId: null, isConnected: false });
    }
  }, [fetchMessages]);

  const handleChainChanged = useCallback((chainId: string) => {
    setWeb3(prev => ({ ...prev, chainId }));
    fetchMessages();
  }, [fetchMessages]);

  const switchNetwork = async (targetChainId: string) => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        setError("This network is not available in your wallet. Please add it manually.");
      } else {
        console.error("Failed to switch network:", switchError);
        setError("Failed to switch network.");
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("No Ethereum wallet detected. Please install MetaMask.");
      return;
    }

    localStorage.removeItem('isDisconnected');
    setIsConnecting(true);
    setError(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      
      // Force account selection
      await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);
      const accounts = await provider.send("eth_requestAccounts", []);
      
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const network = await provider.getNetwork();
      const chainIdHex = `0x${network.chainId.toString(16)}`;
      
      setWeb3({
        address: accounts[0],
        chainId: chainIdHex,
        isConnected: true,
      });

      fetchMessages();
    } catch (err: any) {
      console.error("Connection error:", err);
      if (err.code === 4001) {
        setError("User rejected the connection request.");
      } else {
        setError(err.message || "Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const checkIfWalletIsConnected = useCallback(async () => {
    if (localStorage.getItem('isDisconnected')) return;

    if (window.ethereum) {
      setHasProvider(true);
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          const chainIdHex = `0x${network.chainId.toString(16)}`;
          
          setWeb3({
            address: accounts[0].address,
            chainId: chainIdHex,
            isConnected: true,
          });
          fetchMessages();
        }
      } catch (err) {
        console.error("Auto-connect check failed:", err);
      }
    } else {
      setHasProvider(false);
    }
  }, [fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || !web3.isConnected) return;

    setIsPosting(true);
    setError(null);
    try {
      if (!window.ethereum) throw new Error("Web3 provider not found");
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.sendMessage(newContent);
      await tx.wait();

      setNewContent('');
      await fetchMessages();
    } catch (err: any) {
      console.error("Post Error:", err);
      setError(err.reason || err.message || "Transaction failed. Make sure the contract is deployed.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleRegisterPublicKey = async () => {
    if (!web3.address) return;
    try {
      const key = await getEncryptionPublicKey(web3.address);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const tx = await contract.registerPublicKey(key);
      await tx.wait();
      setMyPublicKey(key);
      alert("Public Key Registered! You can now receive secret messages.");
    } catch (err: any) {
      console.error("Registration failed:", err);
      alert("Failed to register key: " + err.message);
    }
  };

  const handleSendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientAddress || !newContent.trim()) return;

    setIsPosting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Get recipient's public key
      const recipientKey = await contract.getPublicKey(recipientAddress);
      if (!recipientKey) {
        throw new Error("Recipient has not registered for secret messages yet.");
      }

      // Encrypt
      const encrypted = encryptMessage(recipientKey, newContent);

      // Send
      const tx = await contract.sendPrivateMessage(recipientAddress, encrypted);
      await tx.wait();
      
      setNewContent('');
      setRecipientAddress('');
      alert("Secret message sent!");
    } catch (err: any) {
      console.error("Failed to send private message:", err);
      setError(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDecrypt = async (msgId: number, encryptedContent: string) => {
    if (!web3.address) return;
    try {
      const decrypted = await decryptMessage(web3.address, encryptedContent);
      setDecryptedContent(prev => ({ ...prev, [msgId]: decrypted }));
    } catch (err: any) {
      alert("Decryption failed: " + err.message);
    }
  };



  useEffect(() => {
    checkIfWalletIsConnected();
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
    const timeout = setTimeout(() => {
      if (window.ethereum) {
        setHasProvider(true);
      }
    }, 1000);
    
    return () => {
      clearTimeout(timeout);
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [checkIfWalletIsConnected, handleAccountsChanged, handleChainChanged]);

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  const formatTime = (ts: bigint) => new Date(Number(ts) * 1000).toLocaleString();

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      {/* Header */}
      <header className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-8 gap-4 animate-in fade-in slide-in-from-top duration-700">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Web3 Board
          </h1>
        </div>

        {web3.isConnected ? (
          <div className="flex items-center space-x-4 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-sm font-medium text-slate-300">
               {NETWORK_NAMES[web3.chainId || ''] || (
                 <button 
                   onClick={() => switchNetwork(SEPOLIA_CHAIN_ID)}
                   className="text-amber-400 hover:text-amber-300 underline decoration-dashed underline-offset-4"
                 >
                   Switch Network
                 </button>
               )}
             </span>
             <span className="text-sm font-bold text-indigo-400">
               {formatAddress(web3.address!)}
             </span>
             <button
               onClick={() => {
                 setWeb3({ address: null, chainId: null, isConnected: false });
                 localStorage.setItem('isDisconnected', 'true');
               }}
               className="p-1 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-red-400"
               title="Disconnect"
               aria-label="Disconnect Wallet"
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
               </svg>
             </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-6 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/30 disabled:opacity-70"
          >
            {isConnecting ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <WalletIcon className="w-5 h-5" />
            )}
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        )}
      </header>

      {/* Navigation Tabs */}
      <div className="flex w-full max-w-2xl space-x-2 md:space-x-4 mb-8 bg-slate-800/50 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('public')}
          className={`flex-1 px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${activeTab === 'public' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Public Board
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex-1 px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${activeTab === 'inbox' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Secret Inbox
        </button>
      </div>

      <main className="w-full max-w-2xl space-y-8">
        {!hasProvider && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-4 rounded-xl text-sm flex items-center space-x-3">
            <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0" />
            <p>MetaMask or a Web3 browser is required. If you have one installed, please refresh the page or make sure it is enabled.</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-start space-x-2 animate-pulse">
             <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
             <div>
               <span className="font-bold">Notice:</span>
               <span className="ml-1">{error}</span>
             </div>
          </div>
        )}

        {activeTab === 'public' ? (
          <>
            {/* Public Post Box */}
            <section className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder={web3.isConnected ? "What's on your mind? (Stored on-chain)" : "Connect your wallet to post..."}
                    disabled={!web3.isConnected || isPosting}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none h-32 disabled:opacity-50 text-white"
                    maxLength={280}
                  />
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    {/* AI Button Removed */}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                   <div className="text-xs text-slate-500 font-medium">
                      {newContent.length} / 280 characters
                   </div>
                   <button
                    type="submit"
                    disabled={!web3.isConnected || isPosting || !newContent.trim()}
                    className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-slate-900 font-bold py-2.5 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
                  >
                    {isPosting ? (
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    ) : (
                      <PlusIcon className="w-5 h-5" />
                    )}
                    <span>Post Message</span>
                  </button>
                </div>
              </form>
            </section>

            {/* Public Messages List */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                   <span>Recent Messages</span>
                   <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">{messages.length}</span>
                 </h2>
                 <button 
                  onClick={fetchMessages}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-indigo-400 transition-colors"
                  aria-label="Refresh Messages"
                 >
                   <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                 </button>
              </div>

              {isLoading && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-slate-500 text-sm animate-pulse">Scanning the blockchain...</p>
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg, i) => (
                  <div 
                    key={`${msg.sender}-${i}`}
                    className="group relative bg-slate-800/30 border border-slate-700/40 rounded-3xl p-4 md:p-6 transition-all hover:bg-slate-800/50 hover:border-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/5 animate-in slide-in-from-bottom duration-500"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-indigo-400">
                           <UserCircleIcon className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-200">{formatAddress(msg.sender)}</h4>
                          <div className="flex items-center space-x-1 text-xs text-slate-500">
                            <ClockIcon className="w-3 h-3" />
                            <span>{formatTime(msg.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      {msg.sender.toLowerCase() === web3.address?.toLowerCase() && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-md">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed break-words">
                      {msg.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">
                    {web3.isConnected ? "No messages yet. Be the first to post!" : "Connect your wallet to see messages."}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {!myPublicKey ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Enable Secret Messages</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  To receive secret messages, you need to register your encryption key on-chain. This allows others to encrypt messages specifically for you.
                  <br /><br />
                  <span className="text-indigo-400 font-medium">Safe & Secure:</span> This process only shares your <strong>Public Encryption Key</strong>. Your Private Key remains safe in your wallet and is never exposed.
                </p>
                <button
                  onClick={handleRegisterPublicKey}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105"
                >
                  Register My Key
                </button>
              </div>
            ) : (
              <>
                {/* Private Send Box */}
                <section className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
                  <h3 className="text-lg font-bold text-white mb-4">Send Secret Message</h3>
                  <form onSubmit={handleSendPrivateMessage} className="space-y-4">
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="Recipient Address (0x...)"
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white font-mono"
                    />
                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Secret message..."
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24 text-white"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isPosting || !recipientAddress || !newContent}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl transition-all disabled:opacity-50"
                      >
                        {isPosting ? 'Encrypting & Sending...' : 'Send Secretly'}
                      </button>
                    </div>
                  </form>
                </section>

                {/* Private Inbox */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-200">Your Inbox</h3>
                  {privateMessages.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No secret messages yet.</p>
                  ) : (
                    privateMessages.map((msg) => (
                      <div key={msg.id} className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-xs text-indigo-400 font-bold uppercase">From</span>
                            <div className="text-sm font-mono text-slate-300">{msg.sender}</div>
                          </div>
                          <div className="text-xs text-slate-500">{formatTime(msg.timestamp)}</div>
                        </div>
                        
                        {decryptedContent[msg.id] ? (
                          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-100">
                            {decryptedContent[msg.id]}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl">
                            <span className="text-slate-500 italic text-sm">Message is encrypted</span>
                            <button
                              onClick={() => handleDecrypt(msg.id, msg.encryptedContent)}
                              className="text-indigo-400 hover:text-indigo-300 text-sm font-bold underline"
                            >
                              Decrypt
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 space-y-4 md:space-y-0 pb-8">
        <p>&copy; {new Date().getFullYear()} Web3 Message Board. Powered by Ethereum.</p>
        <div className="flex items-center space-x-6">
           <Link to="/about" className="flex items-center space-x-1 hover:text-indigo-400 transition-colors">
             <InformationCircleIcon className="w-4 h-4" />
             <span>About System</span>
           </Link>
           <a href="https://bio.link/meetmarvelous" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-indigo-400 transition-colors">
             <LinkIcon className="w-4 h-4" />
             <span>Bio</span>
           </a>
           <a href="https://www.linkedin.com/in/meetmarvelous" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-indigo-400 transition-colors">
             <BriefcaseIcon className="w-4 h-4" />
             <span>LinkedIn</span>
           </a>
           <a href="https://github.com/meetmarvelous" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 hover:text-indigo-400 transition-colors">
             <CodeBracketIcon className="w-4 h-4" />
             <span>GitHub</span>
           </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
