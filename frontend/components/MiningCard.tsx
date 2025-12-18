'use client';

import { useEffect, useState } from 'react';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import { getContractAddresses, ABIS, formatTokenAmount } from '@/lib/contracts';

interface MiningCardProps {
  account: string | null;
  chainId: number | null;
}

interface MinerStats {
  isActive: boolean;
  totalMined: string;
  blocksMined: number;
  miningPower: number;
  startTime: number;
  lastClaimTime: number;
}

export function MiningCard({ account, chainId }: MiningCardProps) {
  const [stats, setStats] = useState<MinerStats | null>(null);
  const [globalStats, setGlobalStats] = useState({
    currentBlock: 0,
    totalMined: '0',
    activeMiners: 0,
    currentReward: '0',
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [miningPower, setMiningPower] = useState(50);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMiningInfo = async () => {
    if (!account || !chainId || !window.ethereum) {
      setLoading(false);
      return;
    }

    const addresses = getContractAddresses(chainId);
    if (!addresses?.mining) {
      setLoading(false);
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const mining = new Contract(addresses.mining, ABIS.mining, provider);

      const [minerStats, global] = await Promise.all([
        mining.getMinerStats(account),
        mining.getGlobalStats(),
      ]);

      setStats({
        isActive: minerStats[0],
        totalMined: formatEther(minerStats[1]),
        blocksMined: Number(minerStats[2]),
        miningPower: Number(minerStats[3]),
        startTime: Number(minerStats[4]),
        lastClaimTime: Number(minerStats[5]),
      });

      setGlobalStats({
        currentBlock: Number(global[0]),
        totalMined: formatEther(global[1]),
        activeMiners: Number(global[3]),
        currentReward: formatEther(global[4]),
      });
    } catch (error) {
      console.error('Error fetching mining info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMiningInfo();
  }, [account, chainId]);

  const handleStartMining = async () => {
    if (!account || !chainId || !window.ethereum) return;

    const addresses = getContractAddresses(chainId);
    if (!addresses?.mining) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const mining = new Contract(addresses.mining, ABIS.mining, signer);

      const tx = await mining.startMining(miningPower);
      await tx.wait();

      setMessage({ type: 'success', text: `Mining started at ${miningPower}% power!` });
      await fetchMiningInfo();
    } catch (error: unknown) {
      console.error('Error starting mining:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: errorMessage.includes('user rejected')
        ? 'Transaction cancelled'
        : 'Failed to start mining' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopMining = async () => {
    if (!account || !chainId || !window.ethereum) return;

    const addresses = getContractAddresses(chainId);
    if (!addresses?.mining) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const mining = new Contract(addresses.mining, ABIS.mining, signer);

      const tx = await mining.stopMining();
      await tx.wait();

      setMessage({ type: 'success', text: 'Mining stopped!' });
      await fetchMiningInfo();
    } catch (error: unknown) {
      console.error('Error stopping mining:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: errorMessage.includes('user rejected')
        ? 'Transaction cancelled'
        : 'Failed to stop mining' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimBonus = async () => {
    if (!account || !chainId || !window.ethereum) return;

    const addresses = getContractAddresses(chainId);
    if (!addresses?.mining) return;

    setActionLoading(true);
    setMessage(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const mining = new Contract(addresses.mining, ABIS.mining, signer);

      const tx = await mining.claimDailyBonus();
      await tx.wait();

      setMessage({ type: 'success', text: 'Daily bonus claimed!' });
      await fetchMiningInfo();
    } catch (error: unknown) {
      console.error('Error claiming bonus:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage({ type: 'error', text: errorMessage.includes('user rejected')
        ? 'Transaction cancelled'
        : 'Failed to claim bonus' });
    } finally {
      setActionLoading(false);
    }
  };

  const addresses = chainId ? getContractAddresses(chainId) : null;

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Mining System</h2>

      {!addresses?.mining ? (
        <div className="text-center py-4 text-gray-400">
          <p>Mining not available on this network</p>
          <p className="text-sm mt-2">Deploy contracts first or switch network</p>
        </div>
      ) : loading ? (
        <div className="text-center py-4 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Global Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-dark rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Total Mined</p>
              <p className="font-bold text-sm">{formatTokenAmount(globalStats.totalMined)}</p>
            </div>
            <div className="bg-dark rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400">Active Miners</p>
              <p className="font-bold text-sm">{globalStats.activeMiners}</p>
            </div>
          </div>

          {/* Your Stats */}
          {stats && (
            <div className="bg-dark rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Status</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  stats.isActive ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'
                }`}>
                  {stats.isActive ? 'Mining' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Your Total Mined</span>
                <span className="font-bold">{formatTokenAmount(stats.totalMined)} MTK42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Blocks Found</span>
                <span className="font-bold">{stats.blocksMined}</span>
              </div>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-lg mb-4 ${
              message.type === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* Actions */}
          {stats?.isActive ? (
            <div className="space-y-3">
              <button
                onClick={handleStopMining}
                disabled={actionLoading}
                className="btn-secondary w-full disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Stop Mining'}
              </button>
              <button
                onClick={handleClaimBonus}
                disabled={actionLoading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Claim Daily Bonus'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">
                  Mining Power: {miningPower}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={miningPower}
                  onChange={(e) => setMiningPower(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <button
                onClick={handleStartMining}
                disabled={actionLoading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Start Mining'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
