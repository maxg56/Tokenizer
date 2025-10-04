'use client'

import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi'
import { MINING_CONFIG, TOKEN_CONFIG } from '@/lib/config'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { formatEther, parseEther, keccak256, AbiCoder } from 'ethers'

export function useMining() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()
  const [isSearchingNonce, setIsSearchingNonce] = useState(false)

  // Lire les statistiques du mineur
  const { data: minerStats, refetch: refetchMinerStats } = useReadContract({
    ...MINING_CONFIG,
    functionName: 'getMinerStats',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refetch toutes les 5 secondes
    },
  })

  // Lire les statistiques globales
  const { data: globalStats, refetch: refetchGlobalStats } = useReadContract({
    ...MINING_CONFIG,
    functionName: 'getGlobalStats',
    query: {
      refetchInterval: 10000, // Refetch toutes les 10 secondes
    },
  })

  // Lire la récompense calculée
  const { data: calculatedReward } = useReadContract({
    ...MINING_CONFIG,
    functionName: 'calculateReward',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && minerStats?.[5], // isActive
      refetchInterval: 5000,
    },
  })

  // Lire le solde de tokens
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    ...TOKEN_CONFIG,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  })

  // Écouter les événements de minage
  useWatchContractEvent({
    ...MINING_CONFIG,
    eventName: 'BlockMined',
    onLogs: (logs) => {
      console.log('Block mined:', logs)
      refetchMinerStats()
      refetchGlobalStats()
      refetchTokenBalance()
    },
  })

  useWatchContractEvent({
    ...MINING_CONFIG,
    eventName: 'DailyBonusClaimed',
    onLogs: (logs) => {
      console.log('Daily bonus claimed:', logs)
      refetchMinerStats()
      refetchTokenBalance()
    },
  })

  // Fonctions d'interaction avec le contrat
  const startMining = async (power: number) => {
    if (!address) throw new Error('Wallet not connected')

    try {
      await writeContract({
        ...MINING_CONFIG,
        functionName: 'startMining',
        args: [BigInt(power)],
      })
    } catch (error) {
      console.error('Error starting mining:', error)
      throw error
    }
  }

  const stopMining = async () => {
    if (!address) throw new Error('Wallet not connected')

    try {
      await writeContract({
        ...MINING_CONFIG,
        functionName: 'stopMining',
      })
    } catch (error) {
      console.error('Error stopping mining:', error)
      throw error
    }
  }

  const claimDailyBonus = async () => {
    if (!address) throw new Error('Wallet not connected')

    try {
      await writeContract({
        ...MINING_CONFIG,
        functionName: 'claimDailyBonus',
      })
    } catch (error) {
      console.error('Error claiming daily bonus:', error)
      throw error
    }
  }

  // Fonction pour trouver un nonce valide (proof-of-work)
  const findValidNonce = async (
    blockNumber: bigint,
    difficulty: bigint,
    onProgress?: (nonce: number) => void
  ): Promise<number> => {
    return new Promise((resolve, reject) => {
      setIsSearchingNonce(true)

      const worker = () => {
        let nonce = Math.floor(Math.random() * 1000000)
        const maxIterations = 100000

        for (let i = 0; i < maxIterations; i++) {
          const timestamp = Math.floor(Date.now() / 1000)

          // Calculer le hash comme dans le contrat
          const encodedData = AbiCoder.defaultAbiCoder().encode(
            ['uint256', 'address', 'uint256', 'uint256'],
            [blockNumber, address, nonce, timestamp]
          )

          const hash = keccak256(encodedData)
          const hashValue = BigInt(hash)
          const target = (BigInt(2) ** BigInt(256)) / difficulty

          if (hashValue < target) {
            setIsSearchingNonce(false)
            resolve(nonce)
            return
          }

          nonce++

          if (i % 1000 === 0 && onProgress) {
            onProgress(i)
          }
        }

        // Si aucun nonce trouvé, retry
        setTimeout(worker, 10)
      }

      worker()

      // Timeout après 30 secondes
      setTimeout(() => {
        setIsSearchingNonce(false)
        reject(new Error('Nonce search timeout'))
      }, 30000)
    })
  }

  const mineBlock = async (onProgress?: (nonce: number) => void) => {
    if (!address) throw new Error('Wallet not connected')
    if (!globalStats) throw new Error('Global stats not loaded')

    try {
      const currentBlock = globalStats[0]
      const difficulty = globalStats[2]

      console.log('Finding valid nonce for block:', currentBlock.toString())
      console.log('Current difficulty:', difficulty.toString())

      const nonce = await findValidNonce(currentBlock, difficulty, onProgress)

      console.log('Found valid nonce:', nonce)

      await writeContract({
        ...MINING_CONFIG,
        functionName: 'mineBlock',
        args: [BigInt(nonce)],
      })
    } catch (error) {
      console.error('Error mining block:', error)
      throw error
    }
  }

  // Formatter les données pour l'UI
  const formattedMinerStats = minerStats ? {
    power: Number(minerStats[0]),
    totalMined: parseFloat(formatEther(minerStats[1])),
    blocksFound: Number(minerStats[2]),
    joinedAt: Number(minerStats[3]),
    estimatedReward: parseFloat(formatEther(minerStats[4])),
    isActive: minerStats[5],
    canClaimDaily: minerStats[6],
  } : null

  const formattedGlobalStats = globalStats ? {
    currentBlock: Number(globalStats[0]),
    totalMined: parseFloat(formatEther(globalStats[1])),
    difficulty: Number(globalStats[2]),
    activeMiners: Number(globalStats[3]),
    currentReward: parseFloat(formatEther(globalStats[4])),
    nextDifficultyAdjustment: Number(globalStats[5]),
  } : null

  const formattedTokenBalance = tokenBalance ?
    parseFloat(formatEther(tokenBalance)) : 0

  const formattedCalculatedReward = calculatedReward ?
    parseFloat(formatEther(calculatedReward)) : 0

  return {
    // Data
    minerStats: formattedMinerStats,
    globalStats: formattedGlobalStats,
    tokenBalance: formattedTokenBalance,
    calculatedReward: formattedCalculatedReward,
    isSearchingNonce,

    // Actions
    startMining,
    stopMining,
    mineBlock,
    claimDailyBonus,

    // Utils
    refetch: () => {
      refetchMinerStats()
      refetchGlobalStats()
      refetchTokenBalance()
    },
  }
}