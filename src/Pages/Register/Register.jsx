import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import * as z from 'zod'
import api, { getErrorMessage } from '../../api'

const schema = z
  .object({
    name: z.string().min(1, 'Name is required').min(3, 'Name must be at least 3 characters').max(20, 'Name must be at most 20 characters'),
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
    rePassword: z.string().min(1, 'Please confirm your password'),
    gender: z.string().min(1, 'Please select your gender').regex(/^(male|female)$/, 'Please select your gender'),
    dateOfBirth: z.coerce.date().refine((value) => {
      const age = new Date().getFullYear() - value.getFullYear()
      return age >= 19
    }, 'You must be at least 19 years old'),
  })
  .refine((data) => data.password === data.rePassword, {
    message: 'Passwords do not match',
    path: ['rePassword'],
  })

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleRegister(values) {
    setLoading(true)
    try {
      const { data } = await api.post('/users/signup', values)
      if (data.message === 'success') {
        toast.success('Account created successfully')
        navigate('/login')
      }
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not create the account. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-400'
  const labelClass = 'block mb-2 text-sm font-medium text-white'
  const errorClass = 'text-red-400 text-sm mt-1'

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">Create your account</h1>

      <form onSubmit={handleSubmit(handleRegister)} noValidate>
        <div className="mb-5">
          <label htmlFor="name" className={labelClass}>
            Your name
          </label>
          <input {...register('name')} type="text" id="name" className={inputClass} placeholder="Your full name" />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div className="mb-5">
          <label htmlFor="email" className={labelClass}>
            Your email
          </label>
          <input {...register('email')} type="email" id="email" className={inputClass} placeholder="name@example.com" />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div className="mb-5">
          <label htmlFor="password" className={labelClass}>
            Your password
          </label>
          <input {...register('password')} type="password" id="password" className={inputClass} placeholder="********" />
          {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        </div>

        <div className="mb-5">
          <label htmlFor="rePassword" className={labelClass}>
            Confirm password
          </label>
          <input {...register('rePassword')} type="password" id="rePassword" className={inputClass} placeholder="********" />
          {errors.rePassword && <p className={errorClass}>{errors.rePassword.message}</p>}
        </div>

        <div className="mb-5">
          <label htmlFor="gender" className={labelClass}>
            Gender
          </label>
          <select {...register('gender')} id="gender" className={inputClass} defaultValue="">
            <option value="" disabled>
              Select your gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          {errors.gender && <p className={errorClass}>{errors.gender.message}</p>}
        </div>

        <div className="mb-5">
          <label htmlFor="dateOfBirth" className={labelClass}>
            Date of birth
          </label>
          <input {...register('dateOfBirth')} type="date" id="dateOfBirth" className={inputClass} />
          {errors.dateOfBirth && <p className={errorClass}>{errors.dateOfBirth.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="text-gray-400 text-sm mt-6 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-400 hover:text-blue-300">
          Login
        </Link>
      </p>
    </div>
  )
}
