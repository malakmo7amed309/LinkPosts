import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <p className="text-6xl font-bold text-blue-500">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-white">Page not found</h1>
      <p className="mt-2 text-gray-400">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Back to home
      </Link>
    </div>
  )
}
