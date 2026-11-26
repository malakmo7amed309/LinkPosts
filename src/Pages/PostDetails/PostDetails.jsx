import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { getErrorMessage } from '../../api'

export default function PostDetails() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  // The feed passes the post through router state so the page renders
  // instantly; we still fetch the fresh version (with comments) by id.
  const [post, setPost] = useState(location.state?.post ?? null)
  const [loading, setLoading] = useState(!location.state?.post)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)

  async function addComment(e) {
    e.preventDefault()
    if (!comment.trim()) return
    setSending(true)
    try {
      await api.post('/comments', { content: comment.trim(), post: id })
      const { data } = await api.get(`/posts/${id}`)
      setPost(data.post)
      setComment('')
      toast.success('Comment added')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not add the comment.'))
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login')
      return
    }

    let cancelled = false

    async function getPost() {
      try {
        const { data } = await api.get(`/posts/${id}`)
        if (!cancelled && data.message === 'success') {
          setPost(data.post)
        }
      } catch (err) {
        if (!cancelled && !location.state?.post) {
          setError(getErrorMessage(err, 'Could not load this post.'))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    getPost()
    return () => {
      cancelled = true
    }
  }, [id, navigate, location.state])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-600 border-t-blue-500" role="status">
          <span className="sr-only">Loading post...</span>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-400">{error || 'Post not found.'}</p>
        <Link to="/" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
          Back to feed
        </Link>
      </div>
    )
  }

  const { body, image, user: { name, photo } = {}, createdAt, comments = [] } = post

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors">
        &larr; Back to feed
      </Link>

      <article className="p-5 my-5 rounded-3xl bg-gray-900">
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
      </article>

      <section className="my-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Comments ({comments.length})
        </h2>

        <form onSubmit={addComment} className="mb-5 flex gap-2">
          <label htmlFor="newComment" className="sr-only">Write a comment</label>
          <input id="newComment" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={300} placeholder="Write a comment..." className="flex-1 bg-gray-900 text-white rounded-xl p-3 placeholder-gray-500 border border-gray-700 focus:border-blue-500 outline-none" />
          <button type="submit" disabled={sending || !comment.trim()} className="px-5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">Send</button>
        </form>

        {comments.length === 0 ? (
          <p className="text-gray-400">No comments yet.</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => {
              const creator = comment.commentCreator ?? {}
              return (
                <li key={comment._id} className="p-4 rounded-2xl bg-gray-900 flex gap-3">
                  {creator.photo && (
                    <img
                      src={creator.photo}
                      alt={creator.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">
                      {creator.name ?? 'Unknown user'}
                      <span className="text-gray-500 font-normal ms-2">
                        {comment.createdAt && new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-gray-300 mt-1">{comment.content}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
