import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { DEMO_FLAG } from '../../api'
import Navbar from '../Navbar/Navbar'

export default function Layout() {
  const [demo, setDemo] = useState(() => localStorage.getItem(DEMO_FLAG) === '1')
  useEffect(() => {
    const on = () => setDemo(true)
    window.addEventListener('linkposts-demo', on)
    return () => window.removeEventListener('linkposts-demo', on)
  }, [])
  return (
    <div className="min-h-screen">
      <Navbar />
      {demo && (
        <p className="bg-amber-500/15 text-amber-300 text-center text-sm py-2 px-4" role="status">
          Demo mode: the live API is unreachable, so posts and accounts are stored in this browser only.
        </p>
      )}
      <main className="py-6">
        <Outlet />
      </main>
    </div>
  )
}
