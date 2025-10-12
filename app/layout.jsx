import './globals.css'
import DarkModeToggle from './DarkModeToggle'

export const metadata = {
  title: 'Sys-ASLPDC-T2B2',
  description: 'Aplikasi layanan praktikum terintegrasi',
  other: {
    "permissions-policy":
      "geolocation=(self), camera=(), microphone=(), fullscreen=(self)",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* fallback untuk browser yang tidak baca metadata */}
        <meta httpEquiv="Permissions-Policy" content="geolocation=(self)" />
      </head>
      <body className="bg-gray-100 text-gray-900 transition-colors duration-500 dark:bg-gray-900 dark:text-gray-100">
        <DarkModeToggle />
        {children}
      </body>
    </html>
  )
}
