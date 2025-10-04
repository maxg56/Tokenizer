'use client'

import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Coins, Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'Minage', href: '#mining' },
    { label: 'Statistiques', href: '#stats' },
    { label: 'Récompenses', href: '#rewards' },
  ]

  return (
    <motion.header
      className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-xl border-b border-cyan-500/30"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg">
              <Coins className="h-8 w-8 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text">
                MaxToken42
              </h1>
              <p className="text-xs text-gray-400">Mining Platform</p>
            </div>
          </motion.div>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium relative group"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </nav>

          {/* Boutons d'action */}
          <div className="flex items-center gap-4">
            {/* ConnectButton de RainbowKit */}
            <div className="hidden sm:block">
              <ConnectButton
                showBalance={false}
                chainStatus="icon"
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
              />
            </div>

            {/* Menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-cyan-400 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden mt-4 pb-4 border-t border-gray-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col gap-4 mt-4">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 font-medium py-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </motion.a>
              ))}

              {/* ConnectButton mobile */}
              <div className="sm:hidden mt-4">
                <ConnectButton
                  showBalance={false}
                  chainStatus="icon"
                  accountStatus="avatar"
                />
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}