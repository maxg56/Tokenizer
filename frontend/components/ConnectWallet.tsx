'use client';

import { formatAddress } from '@/lib/contracts';

interface ConnectWalletProps {
  account: string | null;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectWallet({
  account,
  isConnected,
  onConnect,
  onDisconnect,
}: ConnectWalletProps) {
  if (isConnected && account) {
    return (
      <div className="flex items-center gap-3">
        <div className="card py-2 px-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-mono">{formatAddress(account)}</span>
          </div>
        </div>
        <button onClick={onDisconnect} className="btn-secondary text-sm">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={onConnect} className="btn-primary">
      Connect Wallet
    </button>
  );
}
