'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useReadContract, useBlockNumber } from 'wagmi'
import { formatUnits } from 'viem'
import { TOKEN_CONFIG } from '@/lib/config'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  Coins,
  TrendingUp,
  Wallet,
  Globe,
  Copy,
  ExternalLink,
  Info,
  Zap,
  DollarSign,
  Users,
  Activity
} from 'lucide-react'

export default function TokenInfoPage() {
  const { address, isConnected } = useAccount()
  const { data: blockNumber } = useBlockNumber({ watch: true })
  const [copiedAddress, setCopiedAddress] = useState(false)

  // Lectures des données du contrat
  const { data: tokenName } = useReadContract({
    ...TOKEN_CONFIG,
    functionName: 'name',
  })

  const { data: tokenSymbol } = useReadContract({
    ...TOKEN_CONFIG,
    functionName: 'symbol',
  })

  const { data: decimals } = useReadContract({
    ...TOKEN_CONFIG,
    functionName: 'decimals',
  })

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    ...TOKEN_CONFIG,
    functionName: 'totalSupply',
  })

  const { data: maxSupply } = useReadContract({
    ...TOKEN_CONFIG,
    functionName: 'MAX_SUPPLY',
  })

  const { data: remainingSupply, refetch: refetchRemainingSupply } = useReadContract({
    ...TOKEN_CONFIG,
    functionName: 'remainingSupply',
  })

  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    ...TOKEN_CONFIG,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Rafraîchir les données à chaque nouveau bloc
  useEffect(() => {
    if (blockNumber) {
      refetchTotalSupply()
      refetchRemainingSupply()
      refetchBalance()
    }
  }, [blockNumber, refetchTotalSupply, refetchRemainingSupply, refetchBalance])

  const formatTokenAmount = (amount: bigint | undefined, decimalsValue: number | undefined) => {
    if (!amount || decimalsValue === undefined) return '0'
    return parseFloat(formatUnits(amount, decimalsValue)).toLocaleString('fr-FR', {
      maximumFractionDigits: 2
    })
  }

  const calculateProgress = () => {
    if (!totalSupply || !maxSupply) return 0
    return (Number(totalSupply) / Number(maxSupply)) * 100
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }
    }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "cyan" }: {
    icon: any,
    title: string,
    value: string,
    subtitle?: string,
    color?: string
  }) => (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
      <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 h-full">
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-br from-${color}-500/20 to-${color}-600/20 border border-${color}-500/30`}>
            <Icon className={`h-6 w-6 text-${color}-400`} />
          </div>
          <div>
            <h3 className="text-slate-300 text-sm font-medium">{title}</h3>
            <div className={`text-2xl font-bold text-${color}-400 font-orbitron`}>{value}</div>
          </div>
        </div>
        {subtitle && (
          <p className="text-slate-400 text-sm">{subtitle}</p>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Animated Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.div
            variants={cardVariants}
            className="inline-flex items-center gap-3 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-6 py-3 mb-6"
          >
            <Coins className="h-6 w-6 text-cyan-400" />
            <span className="text-slate-300 font-medium">Token Analytics</span>
          </motion.div>

          <motion.h1
            variants={cardVariants}
            className="text-6xl md:text-8xl font-bold font-orbitron mb-4"
          >
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              {tokenName || 'MaxToken42'}
            </span>
          </motion.h1>

          <motion.p
            variants={cardVariants}
            className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto"
          >
            Découvrez toutes les métriques et statistiques de votre token {tokenSymbol || 'MTK42'}
          </motion.p>

          <motion.div variants={cardVariants}>
            <ConnectButton />
          </motion.div>
        </motion.div>

        {/* Main Stats Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12"
        >
          <StatCard
            icon={Coins}
            title="Supply Totale"
            value={totalSupply ? `${formatTokenAmount(totalSupply, decimals)}` : '...'}
            subtitle={`${tokenSymbol || 'MTK42'} tokens en circulation`}
            color="cyan"
          />

          <StatCard
            icon={TrendingUp}
            title="Supply Maximum"
            value={maxSupply ? `${formatTokenAmount(maxSupply, decimals)}` : '...'}
            subtitle="Limite maximale de tokens"
            color="emerald"
          />

          <StatCard
            icon={Zap}
            title="Supply Restante"
            value={remainingSupply ? `${formatTokenAmount(remainingSupply, decimals)}` : '...'}
            subtitle="Tokens encore mintables"
            color="orange"
          />

          <StatCard
            icon={Activity}
            title="Progression"
            value={`${calculateProgress().toFixed(1)}%`}
            subtitle="Du supply maximum atteint"
            color="purple"
          />
        </motion.div>

        {/* User Balance & Contract Info */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {/* User Balance */}
          <motion.div variants={cardVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
                  <Wallet className="h-8 w-8 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white font-orbitron">Votre Balance</h3>
                  <p className="text-slate-400">Tokens détenus</p>
                </div>
              </div>

              {isConnected ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-cyan-400 mb-2 font-orbitron">
                      {userBalance ? formatTokenAmount(userBalance, decimals) : '0'}
                    </div>
                    <div className="text-slate-400 text-lg">{tokenSymbol}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                    <div className="text-center">
                      <div className="text-sm text-slate-400">% du Supply</div>
                      <div className="text-lg font-semibold text-white">
                        {totalSupply && userBalance
                          ? ((Number(userBalance) / Number(totalSupply)) * 100).toFixed(4)
                          : '0'}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-400">Adresse</div>
                      <div className="text-lg font-mono text-cyan-400">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400 text-lg">Connectez votre wallet pour voir votre balance</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Contract Information */}
          <motion.div variants={cardVariants} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30">
                  <Info className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white font-orbitron">Contrat</h3>
                  <p className="text-slate-400">Informations techniques</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Nom</span>
                  <span className="text-white font-semibold">{tokenName || 'Loading...'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Symbole</span>
                  <span className="text-white font-semibold">{tokenSymbol || 'Loading...'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Décimales</span>
                  <span className="text-white font-semibold">{decimals?.toString() || 'Loading...'}</span>
                </div>

                <div className="border-t border-slate-700/50 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Adresse du contrat</span>
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() => copyToClipboard(TOKEN_CONFIG.address)}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Copy className="h-4 w-4 text-slate-400" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-cyan-400 mt-2 bg-slate-800/50 rounded-lg p-3">
                    {TOKEN_CONFIG.address}
                  </div>
                  <AnimatePresence>
                    {copiedAddress && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs text-green-400 mt-2"
                      >
                        ✓ Adresse copiée !
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Supply Progress */}
        <motion.div
          variants={cardVariants}
          className="relative group mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30">
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white font-orbitron">Progression du Supply</h3>
                <p className="text-slate-400">Évolution du minting</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2 font-orbitron">
                  {calculateProgress().toFixed(2)}%
                </div>
                <div className="text-slate-400">Progression</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2 font-orbitron">
                  {totalSupply ? formatTokenAmount(totalSupply, decimals) : '0'}
                </div>
                <div className="text-slate-400">Tokens mintés</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2 font-orbitron">
                  {remainingSupply ? formatTokenAmount(remainingSupply, decimals) : '0'}
                </div>
                <div className="text-slate-400">Tokens restants</div>
              </div>
            </div>

            <div className="relative">
              <div className="w-full h-4 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress()}%` }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>0</span>
                <span>{maxSupply ? `${formatTokenAmount(maxSupply, decimals)} ${tokenSymbol}` : ''}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Network Stats */}
        <motion.div
          variants={cardVariants}
          className="relative group mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/30">
                <Globe className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white font-orbitron">Réseau</h3>
                <p className="text-slate-400">Informations blockchain</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2 font-orbitron">
                  {blockNumber?.toString() || '...'}
                </div>
                <div className="text-slate-400">Bloc actuel</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2 font-orbitron">
                  Localhost
                </div>
                <div className="text-slate-400">Réseau</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2 font-orbitron">
                  31337
                </div>
                <div className="text-slate-400">Chain ID</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={cardVariants}
          className="text-center"
        >
          <motion.a
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-semibold text-white text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/25"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap className="h-5 w-5" />
            Retour au minage
          </motion.a>
        </motion.div>
      </div>
    </div>
  )
}