import './globals.css'

export const metadata = {
  title: "Next JWT Auth Demo",
}

export default function AdminLayout({ children }) {
  return (
    <div className="bg-gray-100 text-gray-900 min-h-screen">
      {children}
    </div>
  )
}

