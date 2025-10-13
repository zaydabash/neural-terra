import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Neural Terra — Living Simulation of Earth',
  description: 'A real-time, AI-powered, interactive digital twin of Earth that lets you simulate events, predict ripple effects, and see the planet think.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
