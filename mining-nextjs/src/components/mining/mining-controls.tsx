'use client'

import { useState, useEffect } from 'react'
import { Play, Square, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MiningCard } from './mining-card'
import { useMiningStore } from '@/store/mining-store'
import { motion } from 'framer-motion'

export function MiningControls() {
  const {
    isMining,
    miningPower,
    miningProgress,
    startMining,
    stopMining,
    setMiningPower,
    updateProgress,
  } = useMiningStore()

  const [localProgress, setLocalProgress] = useState(miningProgress)

  // Simulation du minage avec intervalle
  useEffect(() => {
    if (!isMining) return

    const interval = setInterval(() => {
      setLocalProgress((prev) => {
        const newProgress = prev + (miningPower / 100) * 2
        if (newProgress >= 100) {
          const reward = updateProgress(100)
          return 0
        }
        updateProgress(newProgress)
        return newProgress
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isMining, miningPower, updateProgress])

  // Synchroniser avec le store
  useEffect(() => {
    setLocalProgress(miningProgress)
  }, [miningProgress])

  const handlePowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const power = parseInt(e.target.value)
    setMiningPower(power)
  }

  return (
    <MiningCard className="col-span-1 md:col-span-2 lg:col-span-1">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Zap className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Centre de Minage</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isMining ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-sm text-gray-400">
              {isMining ? 'En cours' : 'Arrêté'}
            </span>
          </div>
        </div>

        {/* Contrôle de puissance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-gray-300 font-medium">Puissance de minage</label>
            <span className="text-2xl font-bold text-cyan-400">{miningPower}%</span>
          </div>

          <div className="relative">
            <input
              type="range"
              min="10"
              max="100"
              value={miningPower}
              onChange={handlePowerChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #10b981 ${miningPower}%, #374151 ${miningPower}%, #374151 100%)`
              }}
            />
            <style jsx>{`
              .slider::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: linear-gradient(45deg, #06b6d4, #10b981);
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
              }
              .slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: linear-gradient(45deg, #06b6d4, #10b981);
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
              }
            `}</style>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {isMining ? 'Minage en cours...' : 'Prêt à commencer'}
            </span>
            <span className="text-cyan-400 font-mono">
              {Math.floor(localProgress)}%
            </span>
          </div>

          <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${localProgress}%` }}
              transition={{ duration: 0.3 }}
            >
              {/* Effet de brillance sur la barre */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Boutons de contrôle */}
        <div className="flex gap-3">
          <Button
            variant={isMining ? 'secondary' : 'primary'}
            onClick={isMining ? stopMining : startMining}
            className="flex-1"
          >
            {isMining ? (
              <>
                <Square className="h-4 w-4" />
                Arrêter le minage
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Commencer le minage
              </>
            )}
          </Button>
        </div>

        {/* Informations de performance */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Taux actuel</div>
            <div className="text-lg font-bold text-emerald-400">
              {isMining ? (miningPower / 10 + Math.random() * 2).toFixed(1) : '0.0'} MTK42/h
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Efficacité</div>
            <div className="text-lg font-bold text-cyan-400">
              {isMining ? Math.min(95, miningPower + Math.random() * 10).toFixed(0) : '0'}%
            </div>
          </div>
        </div>
      </div>
    </MiningCard>
  )
}