import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/solid'

export default function MessageContainer({ socket }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const authUser = useAuthStore((state) => state.authUser)
  const selectedUser = useAuthStore((state) => state.selectedUser)

  useEffect(() => {
    socket?.on('newMessage', (message) => {
      if (
        message.senderId === selectedUser?._id ||
        message.receiverId === selectedUser?._id
      ) {
        setMessages((prev) => [...prev, message])
      }
    })

    return () => socket?.off('newMessage')
  }, [socket, selectedUser?._id])

  useEffect(() => {
    const getMessages = async () => {
      if (!selectedUser?._id) return
      try {
        setLoading(true)
        const { data } = await axios.get(`/api/message/${selectedUser._id}`)
        setMessages(data)
      } catch (error) {
        toast.error('Failed to fetch messages')
      } finally {
        setLoading(false)
      }
    }
    getMessages()
  }, [selectedUser?._id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if ((!messageText.trim() && !selectedImage) || sending) return

    try {
      setSending(true)
      let image = null
      if (selectedImage) {
        const reader = new FileReader()
        reader.readAsDataURL(selectedImage)
        image = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result)
        })
      }

      const { data } = await axios.post(`/api/message/send/${selectedUser._id}`, {
        text: messageText.trim(),
        image,
      })

      setMessages((prev) => [...prev, data])
      setMessageText('')
      setSelectedImage(null)
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (!selectedUser) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a user to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-white">
      <div className="flex items-center border-b p-4">
        <div className="flex items-center gap-2">
          <img
            src={selectedUser.profilePic}
            alt={selectedUser.fullName}
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="font-medium">{selectedUser.fullName}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`mb-4 flex ${
                message.senderId === authUser._id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === authUser._id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {message.text && <p className="mb-1">{message.text}</p>}
                {message.image && (
                  <img
                    src={message.image}
                    alt="Message attachment"
                    className="max-h-60 rounded-lg object-contain"
                  />
                )}
                <p
                  className={`text-right text-xs ${
                    message.senderId === authUser._id
                      ? 'text-primary-100'
                      : 'text-gray-500'
                  }`}
                >
                  {format(new Date(message.createdAt), 'HH:mm')}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="border-t p-4">
        {selectedImage && (
          <div className="mb-2">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Selected"
              className="h-20 rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="mt-1 text-xs text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="input flex-1"
            disabled={sending}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files[0])}
            className="hidden"
            ref={fileInputRef}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn bg-gray-100 hover:bg-gray-200"
            disabled={sending}
          >
            <PhotoIcon className="h-5 w-5" />
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={(!messageText.trim() && !selectedImage) || sending}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  )
}