'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, Coins, Zap, DollarSign } from 'lucide-react'
import { MiningCard } from './mining-card'
import { useMiningStore } from '@/store/mining-store'
import { formatNumber, formatCurrency } from '@/lib/utils'
import { useAccount, useBalance } from 'wagmi'
import { TOKEN_CONFIG } from '@/lib/config'

export function UserStats() {
  const { stats } = useMiningStore()
  const { address } = useAccount()
  const [walletBalance, setWalletBalance] = useState(0)

  // Simulation du prix en temps réel
  const [tokenPrice, setTokenPrice] = useState(0.042)

  useEffect(() => {
    const interval = setInterval(() => {
      setTokenPrice(prev => {
        const variation = (Math.random() - 0.5) * 0.005
        return Math.max(0.01, prev + variation)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Mock wallet balance pour la démo
  useEffect(() => {
    if (address) {
      // Simulation d'un solde wallet
      setWalletBalance(stats.totalMined)
    }
  }, [address, stats.totalMined])

  const statsData = [
    {
      label: 'MTK42 possédés',
      value: formatNumber(walletBalance),
      icon: Coins,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
    },
    {
      label: 'Total miné',
      value: formatNumber(stats.totalMined),
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/20',
    },
    {
      label: 'Taux de minage',
      value: `${stats.miningRate.toFixed(1)} MTK42/h`,
      icon: Zap,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
    },
    {
      label: 'Valeur estimée',
      value: formatCurrency(walletBalance * tokenPrice),
      icon: DollarSign,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
  ]

  return (
    <MiningCard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Vos Statistiques</h3>
        </div>

        {/* Prix actuel du token */}
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Prix MTK42</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-400">
                {formatCurrency(tokenPrice)}
              </div>
              <div className={`text-sm ${tokenPrice > 0.042 ? 'text-emerald-400' : 'text-red-400'}`}>
                {tokenPrice > 0.042 ? '+' : ''}{((tokenPrice - 0.042) / 0.042 * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques en grille */}
        <div className="grid grid-cols-2 gap-4">
          {statsData.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className={`text-lg font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Gains journaliers estimés */}
        <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-xl border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm mb-1">Gains quotidiens estimés</div>
              <div className="text-xl font-bold text-white">
                {formatNumber(stats.miningRate * 24)} MTK42
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm mb-1">Valeur USD</div>
              <div className="text-xl font-bold text-emerald-400">
                {formatCurrency(stats.miningRate * 24 * tokenPrice)}
              </div>
            </div>
          </div>
        </div>

        {/* Statut de connexion */}
        {address ? (
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Wallet connecté: {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Connectez votre wallet pour voir le solde réel
          </div>
        )}
      </div>
    </MiningCard>
  )
}