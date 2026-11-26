// Local demo backend. Used only when the real API cannot be reached.
const DB = 'linkposts-demo-db'

function avatar(name, hue) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="hsl(${hue},55%,45%)"/><text x="40" y="53" font-size="36" font-family="Arial" font-weight="700" text-anchor="middle" fill="#fff">${name[0].toUpperCase()}</text></svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString()
const SEED_USERS = [
  { name: 'Sara Ali', hue: 200 }, { name: 'Omar Khaled', hue: 20 }, { name: 'Nour Hassan', hue: 150 },
]
function seed() {
  const [s, o, n] = SEED_USERS.map((u) => ({ name: u.name, photo: avatar(u.name, u.hue) }))
  const c = (u, content, h, i) => ({ _id: 'c' + i, content, createdAt: ago(h), commentCreator: u })
  return {
    users: [],
    posts: [
      { _id: 'p1', body: 'Shipped my first React project today. The feed, the auth and the routing all work. Feels great!', image: '', user: s, createdAt: ago(3), comments: [c(o, 'Congrats! Share the repo.', 2, 1), c(n, 'Well done!', 1, 2)] },
      { _id: 'p2', body: 'Tip: keep components small and name them after what they show, not how they look.', image: '', user: o, createdAt: ago(9), comments: [c(s, 'Needed this reminder.', 8, 3)] },
      { _id: 'p3', body: 'Anyone working remotely from Egypt? What tools keep you focused?', image: '', user: n, createdAt: ago(26), comments: [] },
    ],
  }
}
function read() {
  try { const d = JSON.parse(localStorage.getItem(DB)); if (d) return d } catch { /* ignore */ }
  const d = seed(); localStorage.setItem(DB, JSON.stringify(d)); return d
}
const write = (d) => localStorage.setItem(DB, JSON.stringify(d))
const me = () => {
  const t = localStorage.getItem('token') || ''
  const email = t.startsWith('demo-') ? t.slice(5) : ''
  return read().users.find((u) => u.email === email)
}
const fail = (status, message) => Promise.reject({ response: { status, data: { error: message, message } }, isMock: true })
const ok = (data) => Promise.resolve({ data: { message: 'success', ...data }, status: 200, isMock: true })

function bodyOf(config) {
  const b = config.data
  if (typeof b === 'string') { try { return JSON.parse(b) } catch { return {} } }
  if (b instanceof FormData) return b
  return b || {}
}

export async function handle(config) {
  const url = config.url.split('?')[0]
  const method = (config.method || 'get').toLowerCase()
  const db = read()
  const body = bodyOf(config)

  if (method === 'post' && url === '/users/signup') {
    if (db.users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) return fail(409, 'This email is already registered.')
    db.users.push({ name: body.name, email: body.email, password: body.password })
    write(db); return ok({})
  }
  if (method === 'post' && url === '/users/signin') {
    const u = db.users.find((x) => x.email.toLowerCase() === body.email.toLowerCase() && x.password === body.password)
    if (!u) return fail(401, 'Incorrect email or password.')
    return ok({ token: 'demo-' + u.email })
  }
  const u = me()
  if (!u) return fail(401, 'Please log in again.')
  const author = { name: u.name, photo: avatar(u.name, 260) }

  if (method === 'get' && url === '/posts') return ok({ posts: [...db.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) })
  const m = url.match(/^\/posts\/(.+)$/)
  if (m && method === 'get') {
    const post = db.posts.find((p) => p._id === m[1])
    return post ? ok({ post }) : fail(404, 'Post not found.')
  }
  if (method === 'post' && url === '/posts') {
    const text = body instanceof FormData ? body.get('body') : body.body
    const file = body instanceof FormData ? body.get('image') : null
    let image = ''
    if (file && file.size) image = await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file) })
    const post = { _id: 'p' + Date.now(), body: text, image, user: author, createdAt: new Date().toISOString(), comments: [] }
    db.posts.push(post); try { write(db) } catch { return fail(413, 'Image is too large for demo storage.') }
    return ok({ post })
  }
  if (m && method === 'delete') {
    const post = db.posts.find((p) => p._id === m[1])
    if (!post || post.user.name !== u.name) return fail(403, 'You can only delete your own posts.')
    db.posts = db.posts.filter((p) => p._id !== m[1]); write(db); return ok({})
  }
  if (method === 'post' && url === '/comments') {
    const post = db.posts.find((p) => p._id === body.post)
    if (!post) return fail(404, 'Post not found.')
    post.comments.push({ _id: 'c' + Date.now(), content: body.content, createdAt: new Date().toISOString(), commentCreator: author })
    write(db); return ok({ comments: post.comments })
  }
  return fail(404, 'Not available in demo mode.')
}

export function currentDemoUser() { return me() }
