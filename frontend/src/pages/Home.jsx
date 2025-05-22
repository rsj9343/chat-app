import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import Sidebar from '../components/Sidebar'
import MessageContainer from '../components/MessageContainer'
import { io } from 'socket.io-client'

export default function Home() {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const authUser = useAuthStore((state) => state.authUser)

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      query: {
        userId: authUser?._id,
      },
    })
    setSocket(socket)

    socket.on('getOnlineUsers', (users) => {
      setOnlineUsers(users)
    })

    return () => socket.close()
  }, [authUser?._id])

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden rounded-lg bg-white shadow-xl">
      <Sidebar onlineUsers={onlineUsers} />
      <MessageContainer socket={socket} />
    </div>
  )
}