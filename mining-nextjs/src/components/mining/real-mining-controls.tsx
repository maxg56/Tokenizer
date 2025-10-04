'use client'

import { useState, useEffect } from 'react'
import { Play, Square, Zap, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MiningCard } from './mining-card'
import { useMining } from '@/hooks/useMining'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'

export function RealMiningControls() {
  const { address } = useAccount()
  const {
    minerStats,
    globalStats,
    calculatedReward,
    isSearchingNonce,
    startMining,
    stopMining,
    mineBlock,
  } = useMining()

  const [selectedPower, setSelectedPower] = useState(50)
  const [miningProgress, setMiningProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState('Prêt à commencer')

  const isActive = minerStats?.isActive || false
  const currentPower = minerStats?.power || 0

  // Effet pour simuler la progression pendant la recherche de nonce
  useEffect(() => {
    if (isSearchingNonce) {
      setStatusMessage('Recherche d\'un nonce valide...')
      const interval = setInterval(() => {
        setMiningProgress(prev => {
          const newProgress = prev + 1
          return newProgress >= 100 ? 0 : newProgress
        })
      }, 100)

      return () => clearInterval(interval)
    } else {
      setMiningProgress(0)
      if (isActive) {
        setStatusMessage('Prêt à miner')
      } else {
        setStatusMessage('Minage arrêté')
      }
    }
  }, [isSearchingNonce, isActive])

  const handleStartMining = async () => {
    try {
      await startMining(selectedPower)
      setStatusMessage('Minage démarré')
    } catch (error) {
      console.error('Error starting mining:', error)
      setStatusMessage('Erreur lors du démarrage')
    }
  }

  const handleStopMining = async () => {
    try {
      await stopMining()
      setStatusMessage('Minage arrêté')
    } catch (error) {
      console.error('Error stopping mining:', error)
      setStatusMessage('Erreur lors de l\'arrêt')
    }
  }

  const handleMineBlock = async () => {
    try {
      await mineBlock((nonce) => {
        setMiningProgress((nonce % 1000) / 10)
      })
      setStatusMessage('Bloc miné avec succès!')
    } catch (error) {
      console.error('Error mining block:', error)
      setStatusMessage('Échec du minage de bloc')
    }
  }

  const handlePowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPower(parseInt(e.target.value))
  }

  if (!address) {
    return (
      <MiningCard className="col-span-1 md:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Wallet non connecté</h3>
            <p className="text-gray-400">
              Connectez votre wallet pour commencer le minage
            </p>
          </div>
        </div>
      </MiningCard>
    )
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
            <h3 className="text-xl font-bold text-white">Minage Blockchain</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              isActive ? 'bg-emerald-500' : 'bg-red-500'
            } animate-pulse`} />
            <span className="text-sm text-gray-400">
              {isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>

        {/* Statistiques en temps réel */}
        {globalStats && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-xl">
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400">
                {globalStats.currentBlock}
              </div>
              <div className="text-xs text-gray-400">Bloc actuel</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">
                {globalStats.difficulty.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Difficulté</div>
            </div>
          </div>
        )}

        {/* Contrôle de puissance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-gray-300 font-medium">
              Puissance de minage
            </label>
            <span className="text-2xl font-bold text-cyan-400">
              {isActive ? currentPower : selectedPower}%
            </span>
          </div>

          <div className="relative">
            <input
              type="range"
              min="1"
              max="100"
              value={isActive ? currentPower : selectedPower}
              onChange={handlePowerChange}
              disabled={isActive || isSearchingNonce}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #10b981 ${
                  isActive ? currentPower : selectedPower
                }%, #374151 ${
                  isActive ? currentPower : selectedPower
                }%, #374151 100%)`
              }}
            />
          </div>
        </div>

        {/* Récompense estimée */}
        {calculatedReward > 0 && (
          <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-1">
                {calculatedReward.toFixed(2)} MTK42
              </div>
              <div className="text-sm text-gray-400">
                Récompense estimée pour le prochain bloc
              </div>
            </div>
          </div>
        )}

        {/* Barre de progression */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{statusMessage}</span>
            <span className="text-cyan-400 font-mono">
              {miningProgress.toFixed(0)}%
            </span>
          </div>

          <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${miningProgress}%` }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* Boutons de contrôle */}
        <div className="space-y-3">
          {!isActive ? (
            <Button
              onClick={handleStartMining}
              disabled={isSearchingNonce}
              className="w-full"
              variant="primary"
            >
              <Play className="h-4 w-4 mr-2" />
              Commencer le minage
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={handleMineBlock}
                disabled={isSearchingNonce}
                className="flex-1"
                variant="success"
              >
                {isSearchingNonce ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Minage...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Miner bloc
                  </>
                )}
              </Button>

              <Button
                onClick={handleStopMining}
                disabled={isSearchingNonce}
                variant="secondary"
              >
                <Square className="h-4 w-4 mr-2" />
                Arrêter
              </Button>
            </div>
          )}
        </div>

        {/* Informations de performance */}
        {minerStats && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Blocs trouvés</div>
              <div className="text-lg font-bold text-emerald-400">
                {minerStats.blocksFound}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-1">Total miné</div>
              <div className="text-lg font-bold text-cyan-400">
                {minerStats.totalMined.toFixed(2)} MTK42
              </div>
            </div>
          </div>
        )}

        {/* Aide */}
        <div className="text-xs text-gray-500 p-3 bg-gray-800/30 rounded-lg">
          💡 <strong>Comment ça marche :</strong> Le minage utilise un système de proof-of-work.
          Plus votre puissance est élevée, plus vous avez de chances de trouver un bloc valide.
          La difficulté s'ajuste automatiquement selon l'activité du réseau.
        </div>
      </div>
    </MiningCard>
  )
}