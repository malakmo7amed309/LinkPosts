import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  // Re-render on every route change so the auth links stay in sync.
  useLocation()
  const isLoggedIn = Boolean(localStorage.getItem('token'))

  function handleLogout() {
    localStorage.removeItem('token')
    setMenuOpen(false)
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `block py-2 px-3 rounded-md transition-colors ${
      isActive ? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-white'
    }`

  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center gap-2 text-white text-xl font-bold">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="LinkPosts logo" className="h-8 w-8" />
          LinkPosts
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-gray-400 rounded-lg md:hidden hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          aria-controls="main-menu"
          aria-expanded={menuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1h15M1 7h15M1 13h15" />
          </svg>
        </button>

        <div id="main-menu" className={`${menuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`}>
          <ul className="font-medium flex flex-col md:flex-row md:items-center md:gap-2 mt-4 md:mt-0">
            {isLoggedIn ? (
              <>
                <li>
                  <NavLink to="/" end className={linkClass} onClick={() => setMenuOpen(false)}>
                    Home
                  </NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left md:w-auto py-2 px-3 rounded-md text-gray-300 hover:text-white md:bg-red-600 md:text-white md:hover:bg-red-700 md:px-4 transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/login" className={linkClass} onClick={() => setMenuOpen(false)}>
                    Login
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/register" className={linkClass} onClick={() => setMenuOpen(false)}>
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}
