import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import Sidebar from '../components/Sidebar'
import MessageContainer from '../components/MessageContainer'
import { io } from 'socket.io-client'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function Home() {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const { authUser, setAuthUser } = useAuthStore()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get('/api/auth/check')
        setAuthUser(data)
      } catch (error) {
        setAuthUser(null)
      }
    }
    checkAuth()
  }, [setAuthUser])

  useEffect(() => {
    if (!authUser) return

    const socket = io('http://localhost:5000', {
      query: {
        userId: authUser._id,
      },
    })

    setSocket(socket)

    socket.on('getOnlineUsers', (users) => {
      setOnlineUsers(users)
    })

    socket.on('connect_error', () => {
      toast.error('Failed to connect to chat server')
    })

    return () => socket.close()
  }, [authUser])

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-lg bg-gray-50 shadow-xl">
      <Sidebar onlineUsers={onlineUsers} />
      <MessageContainer socket={socket} />
    </div>
  )
}