import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { useAuthStore } from './store/authStore'

const Login = lazy(() => import('./pages/Login'))
const SignUp = lazy(() => import('./pages/SignUp'))
const Home = lazy(() => import('./pages/Home'))

function App() {
  const authUser = useAuthStore(state => state.authUser)

  return (
    <div className="h-screen bg-gray-100 p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={authUser ? <Home /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!authUser ? <SignUp /> : <Navigate to="/" />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App