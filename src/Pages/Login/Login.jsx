import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import * as z from 'zod'
import api, { getErrorMessage } from '../../api'

const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must be at least 8 characters and include uppercase, lowercase, a number and a special character',
    ),
})

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/')
    }
  }, [navigate])

  async function handleLogin(values) {
    setLoading(true)
    try {
      const { data } = await api.post('/users/signin', values)
      if (data.message === 'success') {
        localStorage.setItem('token', data.token)
        toast.success('Welcome back!')
        navigate('/')
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not log you in. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400'

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">Login</h1>

      <form onSubmit={handleSubmit(handleLogin)} noValidate>
        <div className="mb-5">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-white">
            Your email
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className={inputClass}
            placeholder="name@example.com"
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">
            Your password
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className={inputClass}
            placeholder="********"
          />
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="text-gray-400 text-sm mt-6 text-center">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-blue-400 hover:text-blue-300">
          Create one
        </Link>
      </p>
    </div>
  )
}
