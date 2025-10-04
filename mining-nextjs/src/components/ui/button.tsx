import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center gap-2 rounded-full font-semibold
      transition-all duration-300 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
    `

    const variants = {
      primary: `
        bg-gradient-to-r from-cyan-500 to-emerald-500 text-white
        hover:from-cyan-400 hover:to-emerald-400 hover:-translate-y-0.5
        hover:shadow-lg hover:shadow-cyan-500/25
        focus:ring-cyan-500
      `,
      secondary: `
        bg-white/10 text-white border border-white/20
        hover:bg-white/20 hover:-translate-y-0.5
        focus:ring-white/50
      `,
      success: `
        bg-gradient-to-r from-emerald-500 to-green-500 text-white
        hover:from-emerald-400 hover:to-green-400 hover:-translate-y-0.5
        hover:shadow-lg hover:shadow-emerald-500/25
        focus:ring-emerald-500
      `,
      warning: `
        bg-gradient-to-r from-amber-500 to-orange-500 text-white
        hover:from-amber-400 hover:to-orange-400 hover:-translate-y-0.5
        hover:shadow-lg hover:shadow-amber-500/25
        focus:ring-amber-500
      `,
      error: `
        bg-gradient-to-r from-red-500 to-pink-500 text-white
        hover:from-red-400 hover:to-pink-400 hover:-translate-y-0.5
        hover:shadow-lg hover:shadow-red-500/25
        focus:ring-red-500
      `,
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }