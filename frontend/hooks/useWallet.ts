'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

interface WalletState {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    account: null,
    chainId: null,
    isConnected: false,
    provider: null,
    signer: null,
  });

  // Handle account changes
  const handleAccountsChanged = useCallback(async (accounts: unknown) => {
    const accountList = isStringArray(accounts) ? accounts : [];
    if (accountList.length === 0) {
      setState({
        account: null,
        chainId: null,
        isConnected: false,
        provider: null,
        signer: null,
      });
    } else if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      setState({
        account: accountList[0],
        chainId: Number(network.chainId),
        isConnected: true,
        provider,
        signer,
      });
    }
  }, []);

  // Handle chain changes
  const handleChainChanged = useCallback(async () => {
    if (window.ethereum) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        // Try to get the current account
        const rawAccounts = await window.ethereum.request({ method: 'eth_accounts' });
        const accounts = isStringArray(rawAccounts) ? rawAccounts : [];
        setState({
          account: accounts.length > 0 ? accounts[0] : null,
          chainId: Number(network.chainId),
          isConnected: accounts.length > 0,
          provider,
          signer,
        });
      } catch (error) {
        // If something goes wrong, reset state
        setState({
          account: null,
          chainId: null,
          isConnected: false,
          provider: null,
          signer: null,
        });
      }
    } else {
      setState({
        account: null,
        chainId: null,
        isConnected: false,
        provider: null,
        signer: null,
      });
    }
  }, []);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application');
      return;
    }

    try {
      const rawAccounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      const accounts = isStringArray(rawAccounts) ? rawAccounts : [];

      if (accounts.length > 0) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();

        setState({
          account: accounts[0],
          chainId: Number(network.chainId),
          isConnected: true,
          provider,
          signer,
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setState({
      account: null,
      chainId: null,
      isConnected: false,
      provider: null,
      signer: null,
    });
  }, []);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const rawAccounts = await window.ethereum.request({
            method: 'eth_accounts',
          });
          const accounts = isStringArray(rawAccounts) ? rawAccounts : [];

          if (accounts.length > 0) {
            const provider = new BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const network = await provider.getNetwork();

            setState({
              account: accounts[0],
              chainId: Number(network.chainId),
              isConnected: true,
              provider,
              signer,
            });
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum?.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

  return {
    ...state,
    connect,
    disconnect,
  };
}
