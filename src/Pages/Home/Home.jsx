import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../../api'

export default function Home() {
  const [postsList, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const getAllPosts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/posts?limit=50')
      if (data.message === 'success') {
        setPosts(data.posts)
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load the posts. Please try again.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
      return
    }
    getAllPosts()
  }, [getAllPosts, navigate])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500" role="status">
          <span className="sr-only">Loading posts...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400">{error}</p>
        <button
          type="button"
          onClick={getAllPosts}
          className="mt-4 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {postsList.length === 0 && (
        <p className="text-center text-gray-400 py-16">No posts yet.</p>
      )}

      {postsList.map((post) => {
        const { _id, body, image, user: { name, photo } = {}, createdAt, comments = [] } = post

        return (
          <article key={_id} className="p-5 my-5 rounded-3xl bg-gray-900">
            <div className="flex items-center gap-4">
              <img className="w-10 h-10 rounded-full object-cover" src={photo} alt={name} />
              <div className="font-medium text-white">
                <div>{name}</div>
                <div className="text-sm text-gray-400">
                  {new Date(createdAt).toLocaleDateString()} {new Date(createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <p className="text-gray-300 my-5">{body}</p>

            {image && (
              <img src={image} className="w-full rounded-2xl" alt={body} />
            )}

            <div className="mt-5 flex items-center justify-between">
              <span className="text-gray-400 text-sm">{comments.length} comments</span>
              <Link
                to={`/post/${_id}`}
                state={{ post }}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                See Post Details
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}
