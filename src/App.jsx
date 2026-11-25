import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './Components/Layout/Layout'
import Login from './Pages/Login/Login'
import Register from './Pages/Register/Register'
import NotFound from './Components/NotFound/NotFound'
import Home from './Pages/Home/Home'
import PostDetails from './Pages/PostDetails/PostDetails'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'post/:id', element: <PostDetails /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" />
    </>
  )
}
