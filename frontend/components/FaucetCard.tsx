'use client';

import { useEffect, useState } from 'react';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import { getContractAddresses, ABIS } from '@/lib/contracts';

interface FaucetCardProps {
  account: string | null;
  chainId: number | null;
}

export function FaucetCard({ account, chainId }: FaucetCardProps) {
  const [canClaim, setCanClaim] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [dripAmount, setDripAmount] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchFaucetInfo = async () => {
    if (!account || !chainId || !window.ethereum) {
      setLoading(false);
      return;
    }

    const addresses = getContractAddresses(chainId);
    if (!addresses?.faucet) {
      setLoading(false);
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const faucet = new Contract(addresses.faucet, ABIS.faucet, provider);

      const [canDripResult, amount] = await Promise.all([
        faucet.canDrip(account),
        faucet.dripAmount(),
      ]);

      setCanClaim(canDripResult[0]);
      setTimeRemaining(Number(canDripResult[1]));
      setDripAmount(formatEther(amount));
    } catch (error) {
      console.error('Error fetching faucet info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaucetInfo();
  }, [account, chainId]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setCanClaim(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleClaim = async () => {
    if (!account || !chainId || !window.ethereum) return;

    const addresses = getContractAddresses(chainId);
    if (!addresses?.faucet) return;

    setClaiming(true);
    setMessage(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const faucet = new Contract(addresses.faucet, ABIS.faucet, signer);

      const tx = await faucet.drip();
      await tx.wait();

      setMessage({ type: 'success', text: `Successfully claimed ${dripAmount} MTK42!` });
      setCanClaim(false);
      setTimeRemaining(24 * 60 * 60);
    } catch (error: unknown) {
      console.error('Error claiming from faucet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: errorMessage.includes('user rejected')
        ? 'Transaction cancelled'
        : 'Failed to claim tokens' });
    } finally {
      setClaiming(false);
    }
  };

  const addresses = chainId ? getContractAddresses(chainId) : null;

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Token Faucet</h2>

      {!addresses?.faucet ? (
        <div className="text-center py-4 text-gray-400">
          <p>Faucet not available on this network</p>
          <p className="text-sm mt-2">Deploy contracts first or switch network</p>
        </div>
      ) : loading ? (
        <div className="text-center py-4 text-gray-400">Loading...</div>
      ) : (
        <>
          <div className="bg-dark rounded-lg p-4 mb-4">
            <p className="text-gray-400 text-sm mb-1">Claimable Amount</p>
            <p className="text-2xl font-bold text-primary">{dripAmount} MTK42</p>
          </div>

          {message && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {canClaim ? (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {claiming ? 'Claiming...' : 'Claim Tokens'}
            </button>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 mb-2">Next claim available in:</p>
              <p className="text-xl font-mono text-primary">{formatTime(timeRemaining)}</p>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4 text-center">
            Cooldown: 24 hours between claims
          </p>
        </>
      )}
    </div>
  );
}
