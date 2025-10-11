import './globals.css'
import DarkModeToggle from './DarkModeToggle'

export const metadata = {
  title: 'Next Tailwind Starter',
  description: 'Tailwind ready Next.js app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 transition-colors duration-500 dark:bg-gray-900 dark:text-gray-100">
        <DarkModeToggle />
        {children}
      </body>
    </html>
  )
}
