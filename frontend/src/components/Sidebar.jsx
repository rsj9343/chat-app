import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'

export default function Sidebar({ onlineUsers }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const { authUser, setAuthUser, selectedUser, setSelectedUser } = useAuthStore()

  useEffect(() => {
    const getUsers = async () => {
      try {
        setLoading(true)
        const { data } = await axios.get('/api/message/users')
        setUsers(data)
      } catch (error) {
        toast.error('Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }
    getUsers()
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout')
      setAuthUser(null)
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  return (
    <div className="flex w-80 flex-col border-r bg-white">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <img
            src={authUser?.profilePic}
            alt={authUser?.fullName}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="font-medium">{authUser?.fullName}</span>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-gray-500">Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-sm text-gray-500">No users found</div>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`mb-2 flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors ${
                selectedUser?._id === user._id
                  ? 'bg-primary-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="relative">
                <img
                  src={user.profilePic}
                  alt={user.fullName}
                  className="h-10 w-10 rounded-full object-cover"
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                )}
              </div>
              <div>
                <p className="font-medium">{user.fullName}</p>
                <p className="text-sm text-gray-500">
                  {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}