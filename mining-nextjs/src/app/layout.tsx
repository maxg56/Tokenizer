import type { Metadata } from 'next'
import { Orbitron, Rajdhani } from 'next/font/google'
import './globals.css'
import { Web3Provider } from '@/providers/web3-provider'

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MaxToken42 Mining Platform',
  description: 'Mine MaxToken42 (MTK42) with our advanced web3 mining interface',
  keywords: ['blockchain', 'mining', 'cryptocurrency', 'MaxToken42', 'MTK42', 'BSC'],
  authors: [{ name: 'MaxToken42 Team' }],
  openGraph: {
    title: 'MaxToken42 Mining Platform',
    description: 'The next generation of token mining on BSC',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MaxToken42 Mining Platform',
    description: 'Mine MaxToken42 (MTK42) with our advanced web3 mining interface',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <body className="font-rajdhani antialiased">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
