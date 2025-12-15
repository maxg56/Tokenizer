'use client';

import { useState, useEffect } from 'react';
import { Contract, BrowserProvider, formatEther, parseEther } from 'ethers';
import { getContractAddresses, ABIS } from '@/lib/contracts';

export function useContracts(provider: BrowserProvider | null, chainId: number | null) {
  const [contracts, setContracts] = useState<{
    token: Contract | null;
    mining: Contract | null;
    faucet: Contract | null;
  }>({
    token: null,
    mining: null,
    faucet: null,
  });

  useEffect(() => {
    const initContracts = async () => {
      if (!provider || !chainId) {
        setContracts({ token: null, mining: null, faucet: null });
        return;
      }

      const addresses = getContractAddresses(chainId);
      if (!addresses) {
        console.warn('No contract addresses found for chain:', chainId);
        setContracts({ token: null, mining: null, faucet: null });
        return;
      }

      try {
        const signer = await provider.getSigner();

        const token = addresses.token
          ? new Contract(addresses.token, ABIS.token, signer)
          : null;

        const mining = addresses.mining
          ? new Contract(addresses.mining, ABIS.mining, signer)
          : null;

        const faucet = addresses.faucet
          ? new Contract(addresses.faucet, ABIS.faucet, signer)
          : null;

        setContracts({ token, mining, faucet });
      } catch (error) {
        console.error('Error initializing contracts:', error);
      }
    };

    initContracts();
  }, [provider, chainId]);

  return contracts;
}

// Token specific hooks
export function useTokenBalance(
  tokenContract: Contract | null,
  account: string | null
) {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!tokenContract || !account) {
        setBalance('0');
        return;
      }

      setLoading(true);
      try {
        const bal = await tokenContract.balanceOf(account);
        setBalance(formatEther(bal));
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance('0');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [tokenContract, account]);

  return { balance, loading };
}

export function useTokenInfo(tokenContract: Contract | null) {
  const [info, setInfo] = useState({
    name: '',
    symbol: '',
    totalSupply: '0',
    maxSupply: '0',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      if (!tokenContract) return;

      setLoading(true);
      try {
        const [name, symbol, totalSupply, maxSupply] = await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
          tokenContract.totalSupply(),
          tokenContract.MAX_SUPPLY(),
        ]);

        setInfo({
          name,
          symbol,
          totalSupply: formatEther(totalSupply),
          maxSupply: formatEther(maxSupply),
        });
      } catch (error) {
        console.error('Error fetching token info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [tokenContract]);

  return { info, loading };
}

// Faucet hooks
export function useFaucet(faucetContract: Contract | null, account: string | null) {
  const [canClaim, setCanClaim] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const checkCanClaim = async () => {
      if (!faucetContract || !account) return;

      setLoading(true);
      try {
        const result = await faucetContract.canDrip(account);
        setCanClaim(result[0]);
        setTimeRemaining(Number(result[1]));
      } catch (error) {
        console.error('Error checking faucet:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCanClaim();
  }, [faucetContract, account]);

  const claim = async () => {
    if (!faucetContract) return;

    setClaiming(true);
    try {
      const tx = await faucetContract.drip();
      await tx.wait();
      setCanClaim(false);
      setTimeRemaining(24 * 60 * 60); // 24 hours
    } catch (error) {
      console.error('Error claiming from faucet:', error);
      throw error;
    } finally {
      setClaiming(false);
    }
  };

  return { canClaim, timeRemaining, loading, claiming, claim };
}
