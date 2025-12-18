'use client';

import { useEffect, useState } from 'react';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import { getContractAddresses, ABIS, formatTokenAmount, NETWORKS } from '@/lib/contracts';

interface TokenInfoProps {
  account: string | null;
  chainId: number | null;
}

export function TokenInfo({ account, chainId }: TokenInfoProps) {
  const [balance, setBalance] = useState<string>('0');
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const [maxSupply, setMaxSupply] = useState<string>('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!account || !chainId || !window.ethereum) {
        setLoading(false);
        return;
      }

      const addresses = getContractAddresses(chainId);
      if (!addresses?.token) {
        setLoading(false);
        return;
      }

      try {
        const provider = new BrowserProvider(window.ethereum);
        const token = new Contract(addresses.token, ABIS.token, provider);

        const [bal, supply, max] = await Promise.all([
          token.balanceOf(account),
          token.totalSupply(),
          token.MAX_SUPPLY(),
        ]);

        setBalance(formatEther(bal));
        setTotalSupply(formatEther(supply));
        setMaxSupply(formatEther(max));
      } catch (error) {
        console.error('Error fetching token info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenInfo();
  }, [account, chainId]);

  const networkName = chainId ? NETWORKS[chainId]?.name || `Chain ${chainId}` : 'Unknown';

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold">Token Info</h2>
        <span className="text-sm px-3 py-1 bg-dark rounded-full text-primary">
          {networkName}
        </span>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Your Balance</p>
            <p className="text-2xl font-bold text-primary">
              {formatTokenAmount(balance)} <span className="text-base">MTK42</span>
            </p>
          </div>
          <div className="bg-dark rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Supply</p>
            <p className="text-2xl font-bold">
              {formatTokenAmount(totalSupply)} <span className="text-base text-gray-400">MTK42</span>
            </p>
          </div>
          <div className="bg-dark rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Max Supply</p>
            <p className="text-2xl font-bold">
              {formatTokenAmount(maxSupply)} <span className="text-base text-gray-400">MTK42</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
