'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MiningCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function MiningCard({ children, className, hover = true }: MiningCardProps) {
  return (
    <motion.div
      className={cn(
        `
        relative bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30
        rounded-3xl p-6 overflow-hidden
        before:absolute before:inset-0 before:bg-gradient-to-br
        before:from-cyan-500/5 before:via-transparent before:to-emerald-500/5
        before:rounded-3xl before:pointer-events-none
        `,
        hover && `
          transition-all duration-300 ease-out
          hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-500/10
          hover:-translate-y-1
        `,
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={hover ? { scale: 1.02 } : {}}
    >
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {children}
    </motion.div>
  )
}