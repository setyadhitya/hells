import './globals.css'

export const metadata = {
  title: 'Next Tailwind Starter',
  description: 'Tailwind ready Next.js app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">{children}</body>
    </html>
  )
}
