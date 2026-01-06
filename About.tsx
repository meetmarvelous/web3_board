import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, CpuChipIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

const About: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 text-slate-200">
      <header className="w-full max-w-4xl flex items-center mb-12 animate-in fade-in slide-in-from-top duration-700">
        <Link to="/" className="flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Board</span>
        </Link>
      </header>

      <main className="w-full max-w-3xl space-y-12">
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            How It Works
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed">
            The Web3 Message Board is a decentralized application (dApp) that combines the transparency of blockchain with the privacy of modern encryption.
          </p>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
            <CpuChipIcon className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Contracts</h3>
            <p className="text-slate-400 text-sm">
              Built on Ethereum (Sepolia Testnet) using Solidity. Every public message is permanently stored on the blockchain, immutable and uncensorable.
            </p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
            <ShieldCheckIcon className="w-10 h-10 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">End-to-End Encryption</h3>
            <p className="text-slate-400 text-sm">
              Secret messages are encrypted off-chain using your wallet's public key. Only your private key (via MetaMask) can decrypt them. Not even we can read them.
            </p>
          </div>
          <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl backdrop-blur-sm">
            <GlobeAltIcon className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Decentralized Storage</h3>
            <p className="text-slate-400 text-sm">
              No central database controls your data. The "Public Key Registry" on-chain ensures anyone can find your encryption key to send you private messages securely.
            </p>
          </div>
        </div>

        <section className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 space-y-6">
          <h2 className="text-2xl font-bold text-white">Technology Stack</h2>
          <ul className="grid grid-cols-2 gap-4 text-slate-400">
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              <span>React & Vite</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              <span>Hardhat & Solidity</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              <span>Ethers.js</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              <span>MetaMask RPC</span>
            </li>

            <li className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" />
              <span>Tailwind CSS</span>
            </li>
          </ul>
        </section>
      </main>

      <footer className="mt-20 text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Web3 Message Board</p>
      </footer>
    </div>
  );
};

export default About;
