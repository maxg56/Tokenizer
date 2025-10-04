'use client'

import { useState, useEffect } from 'react'
import { Gift, Clock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MiningCard } from './mining-card'
import { useMiningStore } from '@/store/mining-store'
import { canClaimDailyReward, getTimeDifference } from '@/lib/utils'
import { motion } from 'framer-motion'

export function RewardsPanel() {
  const { stats, claimReward } = useMiningStore()
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState('')

  // Vérifier si on peut réclamer le bonus quotidien
  const canClaim = canClaimDailyReward(stats.lastClaimTime)

  // Mettre à jour le compte à rebours
  useEffect(() => {
    if (canClaim) {
      setTimeUntilNextClaim('')
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const nextClaimTime = stats.lastClaimTime + (24 * 60 * 60 * 1000)
      const remaining = nextClaimTime - now

      if (remaining <= 0) {
        setTimeUntilNextClaim('')
        return
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      setTimeUntilNextClaim(`${hours}h ${minutes}m`)
    }, 1000)

    return () => clearInterval(interval)
  }, [stats.lastClaimTime, canClaim])

  const handleClaimDaily = () => {
    if (!canClaim) return

    claimReward(100)
    // Animation de récompense
    const confetti = document.createElement('div')
    confetti.className = 'fixed inset-0 pointer-events-none z-50'
    confetti.innerHTML = Array(20).fill(0).map(() =>
      `<div class="absolute animate-bounce" style="left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation-delay: ${Math.random() * 2}s;">🎉</div>`
    ).join('')
    document.body.appendChild(confetti)
    setTimeout(() => document.body.removeChild(confetti), 3000)
  }

  const rewards = [
    {
      id: 'daily',
      title: 'Bonus Quotidien',
      amount: 100,
      currency: 'MTK42',
      description: 'Récompense journalière',
      canClaim,
      timeRemaining: timeUntilNextClaim,
      onClick: handleClaimDaily,
    },
    {
      id: 'weekly',
      title: 'Bonus Hebdomadaire',
      amount: 500,
      currency: 'MTK42',
      description: 'Récompense hebdomadaire',
      canClaim: false,
      timeRemaining: '5j 12h',
      onClick: () => {},
    },
    {
      id: 'achievement',
      title: 'Objectif de Minage',
      amount: 1000,
      currency: 'MTK42',
      description: 'Miner 10,000 MTK42',
      canClaim: stats.totalMined >= 10000,
      timeRemaining: '',
      onClick: () => {
        if (stats.totalMined >= 10000) {
          claimReward(1000)
        }
      },
    }
  ]

  return (
    <MiningCard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <Gift className="h-6 w-6 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Récompenses</h3>
        </div>

        {/* Liste des récompenses */}
        <div className="space-y-3">
          {rewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              className={`
                p-4 rounded-xl border transition-all duration-300
                ${reward.canClaim
                  ? 'bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20'
                  : 'bg-gray-800/50 border-gray-700'
                }
              `}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white">
                      {reward.title}
                    </h4>
                    {reward.canClaim && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                  </div>

                  <div className="text-gray-400 text-sm mb-2">
                    {reward.description}
                  </div>

                  <div className="text-lg font-bold text-cyan-400">
                    +{reward.amount.toLocaleString()} {reward.currency}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {reward.canClaim ? (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={reward.onClick}
                      className="min-w-[100px]"
                    >
                      <Gift className="h-4 w-4" />
                      Réclamer
                    </Button>
                  ) : reward.timeRemaining ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-700 px-3 py-2 rounded-lg">
                      <Clock className="h-4 w-4" />
                      {reward.timeRemaining}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Check className="h-4 w-4" />
                      Réclamé
                    </div>
                  )}
                </div>
              </div>

              {/* Barre de progression pour l'objectif */}
              {reward.id === 'achievement' && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Progression</span>
                    <span>{Math.min(stats.totalMined, 10000).toLocaleString()} / 10,000</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stats.totalMined / 10000) * 100, 100)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Stats de récompenses */}
        <div className="pt-4 border-t border-gray-700 space-y-3">
          <div className="text-sm text-gray-400 mb-2">Statistiques de récompenses</div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">
                {Math.floor(stats.totalMined / 100)}
              </div>
              <div className="text-gray-400">Bonus réclamés</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400">
                {(stats.totalMined * 0.042).toFixed(2)}$
              </div>
              <div className="text-gray-400">Valeur totale</div>
            </div>
          </div>
        </div>
      </div>
    </MiningCard>
  )
}