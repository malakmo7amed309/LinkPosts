import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { getErrorMessage } from '../../api'

export default function Home() {
  const [postsList, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [posting, setPosting] = useState(false)
  const fileRef = useRef(null)
  const [likes, setLikes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('linkposts-likes')) || [] } catch { return [] }
  })
  const [query, setQuery] = useState('')

  function toggleLike(id) {
    setLikes((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      localStorage.setItem('linkposts-likes', JSON.stringify(next))
      return next
    })
  }

  async function createPost(e) {
    e.preventDefault()
    if (!text.trim()) return
    setPosting(true)
    try {
      const form = new FormData()
      form.append('body', text.trim())
      if (file) form.append('image', file)
      await api.post('/posts', form)
      setText(''); setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      toast.success('Post published')
      await getAllPosts()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not publish the post.'))
    } finally {
      setPosting(false)
    }
  }

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

  const shown = postsList.filter((p) => !query.trim() || (p.body || '').toLowerCase().includes(query.trim().toLowerCase()) || (p.user?.name || '').toLowerCase().includes(query.trim().toLowerCase()))

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
      <form onSubmit={createPost} className="p-5 my-5 rounded-3xl bg-gray-900">
        <label htmlFor="newPost" className="sr-only">Write a post</label>
        <textarea
          id="newPost"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="What's on your mind?"
          className="w-full bg-gray-800 text-white rounded-xl p-3 placeholder-gray-500 border border-gray-700 focus:border-blue-500 outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} className="text-sm text-gray-400" aria-label="Attach an image" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{text.length}/500</span>
            <button type="submit" disabled={posting || !text.trim()} className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts..."
        aria-label="Search posts"
        className="w-full bg-gray-900 text-white rounded-xl p-3 placeholder-gray-500 border border-gray-700 focus:border-blue-500 outline-none"
      />

      {shown.length === 0 && (
        <p className="text-center text-gray-400 py-16">{postsList.length ? 'No posts match your search.' : 'No posts yet. Write the first one above.'}</p>
      )}

      {shown.map((post) => {
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
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => toggleLike(_id)} aria-pressed={likes.includes(_id)} aria-label={likes.includes(_id) ? 'Unlike' : 'Like'} className={`inline-flex items-center gap-1 text-sm ${likes.includes(_id) ? 'text-pink-400' : 'text-gray-400 hover:text-white'}`}>
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.800-8 11-8 11z" fill={likes.includes(_id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
                  {likes.includes(_id) ? 'Liked' : 'Like'}
                </button>
                <span className="text-gray-400 text-sm">{comments.length} comments</span>
              </div>
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
