import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MiningStats {
  totalMined: number
  miningRate: number
  estimatedEarnings: number
  lastClaimTime: number
}

interface MiningState {
  // État du minage
  isMining: boolean
  miningPower: number
  miningProgress: number

  // Statistiques utilisateur
  stats: MiningStats

  // Actions
  startMining: () => void
  stopMining: () => void
  setMiningPower: (power: number) => void
  updateProgress: (progress: number) => void
  updateStats: (stats: Partial<MiningStats>) => void
  claimReward: (amount: number) => void
  reset: () => void
}

const initialStats: MiningStats = {
  totalMined: 0,
  miningRate: 0,
  estimatedEarnings: 0,
  lastClaimTime: 0,
}

export const useMiningStore = create<MiningState>()(
  persist(
    (set, get) => ({
      // État initial
      isMining: false,
      miningPower: 50,
      miningProgress: 0,
      stats: initialStats,

      // Actions
      startMining: () => {
        set({ isMining: true })
        const { miningPower } = get()
        const miningRate = (miningPower / 10) + Math.random() * 2
        const estimatedEarnings = miningRate * 0.042 // Prix simulé

        set((state) => ({
          stats: {
            ...state.stats,
            miningRate,
            estimatedEarnings,
          }
        }))
      },

      stopMining: () => {
        set({
          isMining: false,
          miningProgress: 0,
          stats: {
            ...get().stats,
            miningRate: 0,
            estimatedEarnings: 0,
          }
        })
      },

      setMiningPower: (power: number) => {
        set({ miningPower: power })

        // Mettre à jour le taux si on mine
        if (get().isMining) {
          const miningRate = (power / 10) + Math.random() * 2
          const estimatedEarnings = miningRate * 0.042

          set((state) => ({
            stats: {
              ...state.stats,
              miningRate,
              estimatedEarnings,
            }
          }))
        }
      },

      updateProgress: (progress: number) => {
        set({ miningProgress: progress })

        // Si progression complète, ajouter récompense
        if (progress >= 100 && get().isMining) {
          const { miningPower } = get()
          const reward = (miningPower / 10) + Math.random() * 5

          set((state) => ({
            miningProgress: 0,
            stats: {
              ...state.stats,
              totalMined: state.stats.totalMined + reward,
            }
          }))

          return reward
        }
        return 0
      },

      updateStats: (newStats: Partial<MiningStats>) => {
        set((state) => ({
          stats: {
            ...state.stats,
            ...newStats,
          }
        }))
      },

      claimReward: (amount: number) => {
        set((state) => ({
          stats: {
            ...state.stats,
            totalMined: state.stats.totalMined + amount,
            lastClaimTime: Date.now(),
          }
        }))
      },

      reset: () => {
        set({
          isMining: false,
          miningPower: 50,
          miningProgress: 0,
          stats: initialStats,
        })
      },
    }),
    {
      name: 'mining-storage',
      partialize: (state) => ({
        stats: state.stats,
        miningPower: state.miningPower,
      }),
    }
  )
)