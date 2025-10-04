'use client'

import { motion } from 'framer-motion'
import { Coins, TrendingUp, Users, Zap } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { CosmicBackground } from '@/components/layout/cosmic-background'
import { MiningControls } from '@/components/mining/mining-controls'
import { UserStats } from '@/components/mining/user-stats'
import { RewardsPanel } from '@/components/mining/rewards-panel'
import { MiningCard } from '@/components/mining/mining-card'

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <CosmicBackground />
      <Header />

      <main className="relative z-10 pt-24">
        {/* Section Hero */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contenu principal */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <motion.h1
                  className="text-6xl lg:text-7xl font-orbitron font-black"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                >
                  <span className="text-transparent bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 bg-clip-text">
                    Mine
                  </span>
                  <br />
                  <span className="text-white">MaxToken42</span>
                </motion.h1>

                <motion.p
                  className="text-xl text-gray-300 max-w-lg leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Rejoignez la révolution blockchain et commencez à miner MTK42 dès maintenant.
                  Une interface moderne, sécurisée et efficace pour maximiser vos gains.
                </motion.p>
              </div>

              {/* Statistiques Hero */}
              <motion.div
                className="grid grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <div className="text-center">
                  <div className="text-3xl font-orbitron font-bold text-cyan-400">1M</div>
                  <div className="text-sm text-gray-400">Total Supply</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-orbitron font-bold text-emerald-400">$0.042</div>
                  <div className="text-sm text-gray-400">Prix actuel</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-orbitron font-bold text-orange-400">2.8K</div>
                  <div className="text-sm text-gray-400">Mineurs actifs</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Animation visuelle */}
            <motion.div
              className="relative h-96 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              <div className="relative">
                {/* Cercles animés */}
                <motion.div
                  className="absolute inset-0 w-80 h-80 border-2 border-cyan-500/20 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-4 w-72 h-72 border-2 border-emerald-500/20 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-8 w-64 h-64 border-2 border-orange-500/20 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />

                {/* Coins flottants */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                      rotate: 360,
                      x: Math.cos((i * 60 * Math.PI) / 180) * 120,
                      y: Math.sin((i * 60 * Math.PI) / 180) * 120,
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                      delay: i * 0.3,
                    }}
                  >
                    <motion.div
                      className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Coins className="w-4 h-4 text-white" />
                    </motion.div>
                  </motion.div>
                ))}

                {/* Logo central */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <Coins className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section Minage */}
        <section id="mining" className="container mx-auto px-4 py-16">
          <motion.h2
            className="text-4xl font-orbitron font-bold text-center mb-12 text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Centre de Minage
          </motion.h2>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <MiningControls />
            </div>
            <div className="space-y-8">
              <UserStats />
              <RewardsPanel />
            </div>
          </div>
        </section>

        {/* Section Statistiques du réseau */}
        <section id="stats" className="container mx-auto px-4 py-16">
          <motion.h2
            className="text-4xl font-orbitron font-bold text-center mb-12 text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Statistiques du Réseau
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, label: 'Temps de fonctionnement', value: '99.9%', color: 'text-emerald-400' },
              { icon: Zap, label: 'Hash rate total', value: '15.7k', color: 'text-cyan-400' },
              { icon: Coins, label: 'Blocs minés', value: '1.2M', color: 'text-orange-400' },
              { icon: Users, label: 'Mineurs actifs', value: '2,847', color: 'text-purple-400' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <MiningCard className="text-center hover:scale-105">
                  <div className="space-y-4">
                    <div className={`mx-auto w-16 h-16 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center`}>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                    <div>
                      <div className={`text-3xl font-orbitron font-bold ${stat.color} mb-2`}>
                        {stat.value}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </MiningCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-gray-900/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Coins className="h-8 w-8 text-cyan-400" />
                  <span className="text-xl font-orbitron font-bold text-white">MaxToken42</span>
                </div>
                <p className="text-gray-400">
                  La prochaine génération de tokens décentralisés sur BSC.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Liens utiles</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors">
                    Documentation
                  </a>
                  <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors">
                    Whitepaper
                  </a>
                  <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors">
                    GitHub
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Communauté</h4>
                <div className="space-y-2">
                  <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors">
                    Discord
                  </a>
                  <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors">
                    Telegram
                  </a>
                  <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors">
                    Twitter
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 MaxToken42. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
