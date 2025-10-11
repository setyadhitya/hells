'use client'

import { useState, useEffect } from 'react'

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      setDarkMode(true)
    }
  }, [])

  const toggleDarkMode = () => {
    const html = document.documentElement
    html.classList.toggle('dark')
    const isDark = html.classList.contains('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    setDarkMode(isDark)
  }

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 px-3 py-2 rounded-xl shadow hover:shadow-lg transition-all z-50"
    >
      {darkMode ? '🌙 Dark' : '☀️ Light'}
    </button>
  )
}
