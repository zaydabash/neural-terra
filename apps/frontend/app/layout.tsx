import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Neural Terra | Living Simulation of Earth',
  description:
    'A real-time, AI-powered, interactive digital twin of Earth that lets you simulate events, predict ripple effects, and see the planet think.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-ink-950">{children}</body>
    </html>
  )
}
