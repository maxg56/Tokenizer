'use client';

import { useState, useEffect } from 'react';
import { getContractAddresses, NETWORKS, formatAddress } from '@/lib/contracts';

interface DeploymentsData {
  version: string;
  lastUpdated: string | null;
  networks: {
    [key: string]: Array<{
      timestamp: string;
      deployer: string;
      chainId: number;
      networkName: string;
      contracts: {
        token?: { name: string; address: string; symbol?: string };
        mining?: { name: string; address: string };
        faucet?: { name: string; address: string };
        multiSig?: { name: string; address: string };
      };
    }>;
  };
}

export function ContractAddresses() {
  const [deployments, setDeployments] = useState<DeploymentsData | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Try to load deployments.json
    fetch('/deployments.json')
      .then(res => res.json())
      .then(data => {
        setDeployments(data);
        const networks = Object.keys(data.networks || {});
        if (networks.length > 0) {
          setSelectedNetwork(networks[0]);
        }
      })
      .catch(() => {
        // If deployments.json doesn't exist, show placeholder
        setDeployments(null);
      });
  }, []);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const latestDeployment = deployments?.networks[selectedNetwork]?.[0];
  const networkKeys = Object.keys(deployments?.networks || {});

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Contract Addresses</h2>
        {networkKeys.length > 1 && (
          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            className="input text-sm"
          >
            {networkKeys.map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        )}
      </div>

      {!deployments || networkKeys.length === 0 ? (
        <div className="text-center py-4 text-gray-400">
          <p>No deployments found</p>
          <p className="text-sm mt-2">Deploy contracts using:</p>
          <code className="block mt-2 text-xs bg-dark p-2 rounded">
            make deploy-local
          </code>
        </div>
      ) : latestDeployment ? (
        <>
          <div className="text-xs text-gray-500 mb-4">
            Deployed: {new Date(latestDeployment.timestamp).toLocaleString()}
          </div>

          <div className="space-y-3">
            {latestDeployment.contracts.token && (
              <AddressRow
                label="Token (MTK42)"
                address={latestDeployment.contracts.token.address}
                copied={copied === 'token'}
                onCopy={() => copyToClipboard(latestDeployment.contracts.token!.address, 'token')}
              />
            )}
            {latestDeployment.contracts.mining && (
              <AddressRow
                label="Mining Contract"
                address={latestDeployment.contracts.mining.address}
                copied={copied === 'mining'}
                onCopy={() => copyToClipboard(latestDeployment.contracts.mining!.address, 'mining')}
              />
            )}
            {latestDeployment.contracts.faucet && (
              <AddressRow
                label="Faucet"
                address={latestDeployment.contracts.faucet.address}
                copied={copied === 'faucet'}
                onCopy={() => copyToClipboard(latestDeployment.contracts.faucet!.address, 'faucet')}
              />
            )}
            {latestDeployment.contracts.multiSig && (
              <AddressRow
                label="MultiSig Wallet"
                address={latestDeployment.contracts.multiSig.address}
                copied={copied === 'multiSig'}
                onCopy={() => copyToClipboard(latestDeployment.contracts.multiSig!.address, 'multiSig')}
              />
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-4 text-gray-400">
          <p>No deployment for {selectedNetwork}</p>
        </div>
      )}
    </div>
  );
}

interface AddressRowProps {
  label: string;
  address: string;
  copied: boolean;
  onCopy: () => void;
}

function AddressRow({ label, address, copied, onCopy }: AddressRowProps) {
  return (
    <div className="flex justify-between items-center bg-dark rounded-lg p-3">
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-mono text-sm">{formatAddress(address)}</p>
      </div>
      <button
        onClick={onCopy}
        className="text-xs px-3 py-1 bg-secondary rounded hover:bg-gray-600 transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
