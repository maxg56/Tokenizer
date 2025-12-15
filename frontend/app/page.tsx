'use client';

import { useState, useEffect } from 'react';
import { ConnectWallet } from '@/components/ConnectWallet';
import { TokenInfo } from '@/components/TokenInfo';
import { FaucetCard } from '@/components/FaucetCard';
import { MiningCard } from '@/components/MiningCard';
import { ContractAddresses } from '@/components/ContractAddresses';
import { useWallet } from '@/hooks/useWallet';

export default function Home() {
  const { account, chainId, isConnected, connect, disconnect } = useWallet();

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Tokenizer42</h1>
            <p className="text-gray-400">MaxToken42 (MTK42) Dashboard</p>
          </div>
          <ConnectWallet
            account={account}
            isConnected={isConnected}
            onConnect={connect}
            onDisconnect={disconnect}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {!isConnected ? (
          // Not connected state
          <div className="card text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Welcome to Tokenizer42</h2>
            <p className="text-gray-400 mb-6">
              Connect your wallet to interact with MTK42 smart contracts
            </p>
            <button onClick={connect} className="btn-primary text-lg px-8 py-3">
              Connect MetaMask
            </button>
            <div className="mt-8">
              <ContractAddresses />
            </div>
          </div>
        ) : (
          // Connected state
          <div className="space-y-6">
            {/* Token Info */}
            <TokenInfo account={account} chainId={chainId} />

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <FaucetCard account={account} chainId={chainId} />
              <MiningCard account={account} chainId={chainId} />
            </div>

            {/* Contract Addresses */}
            <ContractAddresses />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-12 text-center text-gray-500 text-sm">
        <p>Tokenizer42 - ERC20 Token with Mining System</p>
        <p className="mt-1">
          Built with Next.js, ethers.js, and Hardhat
        </p>
      </footer>
    </main>
  );
}
