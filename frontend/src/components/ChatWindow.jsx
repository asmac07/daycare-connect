import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import axiosInstance from '../api/axiosInstance'
import { useSelector } from 'react-redux'
import { Paperclip, FileText, Loader2, Send, Image, Music, Video, File } from 'lucide-react'

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  auth: {
    token: localStorage.getItem('token')
  }
})

const ChatWindow = ({ daycareId, parentId, ownerId, otherUserName }) => {

  const { user } = useSelector((state) => state.auth)

  const otherUserId =
    String(user.id) === String(parentId)
      ? String(ownerId)
      : String(parentId)

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [online, setOnline] = useState(false)
  const [typing, setTyping] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)

  const roomId = `${daycareId}_${parentId}`

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const audioInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const docInputRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    socket.emit('userOnline')

    axiosInstance
      .get(`/messages/${daycareId}/${parentId}`)
      .then((res) => {
        setMessages(res.data.data)
      })
      .catch((err) => {
        console.log(err)
      })

    socket.emit('joinRoom', roomId)

    if (otherUserId) {
      socket.emit('checkUserStatus', otherUserId)
    }

    socket.on('newMessage', (message) => {
      const messageDaycareId = String(message.daycare)
      const messageParentId = String(message.parent)

      const currentDaycareId = String(daycareId)
      const currentParentId = String(parentId)

      if (
        messageDaycareId === currentDaycareId &&
        messageParentId === currentParentId
      ) {
        setMessages((prev) => [...prev, message])
      }
    })

    socket.on('userStatus', (data) => {
      if (data.userId === otherUserId) {
        setOnline(data.status === 'online')
      }
    })

    socket.on('messageRead', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(data.messageId)
            ? { ...msg, read: true }
            : msg
        )
      )
    })

    socket.on('userTyping', (data) => {
      if (data.userId === otherUserId) {
        setTyping(true)
      }
    })

    socket.on('userStoppedTyping', (data) => {
      if (data.userId === otherUserId) {
        setTyping(false)
      }
    })

    return () => {
      socket.off('newMessage')
      socket.off('userStatus')
      socket.off('userTyping')
      socket.off('userStoppedTyping')
      socket.off('messageRead')
    }
  }, [daycareId, parentId, otherUserId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

    messages.forEach((message) => {
      if (
        String(message.sender) !== String(user.id) &&
        !message.read
      ) {
        socket.emit('messageRead', {
          messageId: message._id,
          roomId
        })
      }
    })
  }, [messages, user.id, roomId])

  // Close attachment menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAttachmentMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSend = () => {
    if (!text.trim()) return

    socket.emit('sendMessage', {
      roomId,
      daycare: daycareId,
      parent: parentId,
      sender: user.id,
      text: text.trim(),
      messageType: 'text',
      fileUrl: null,
      fileName: null
    })

    socket.emit('stopTyping', {
      roomId,
      userId: user.id
    })

    setText('')
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', file)

      const response = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const { fileUrl, fileName } = response.data

      let messageType = 'file'

      if (file.type.startsWith('image/')) {
        messageType = 'image'
      } else if (file.type.startsWith('audio/')) {
        messageType = 'audio'
      } else if (file.type.startsWith('video/')) {
        messageType = 'video'
      }

      socket.emit('sendMessage', {
        roomId,
        daycare: daycareId,
        parent: parentId,
        sender: user.id,
        text: '',
        messageType,
        fileUrl,
        fileName
      })

    } catch (error) {
      console.log('File upload error:', error)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const attachmentOptions = [
    { label: 'Image', icon: Image, color: 'text-purple-500', bg: 'bg-purple-50', ref: fileInputRef },
    { label: 'Audio', icon: Music, color: 'text-amber-500', bg: 'bg-amber-50', ref: audioInputRef },
    { label: 'Video', icon: Video, color: 'text-rose-500', bg: 'bg-rose-50', ref: videoInputRef },
    { label: 'Document', icon: File, color: 'text-dc-blue', bg: 'bg-dc-mist', ref: docInputRef },
  ]

  return (
    <div className="flex flex-col h-[32rem] rounded-[2rem] bg-white/90 backdrop-blur-sm border border-white/60 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] overflow-hidden font-nunito">

      {/* HEADER */}
      <div className="flex items-center px-5 py-4 border-b border-dc-border bg-white/70">

        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center font-bold text-white text-sm">
            {otherUserName?.charAt(0).toUpperCase()}
          </div>
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              online ? 'bg-dc-green' : 'bg-dc-border'
            }`}
          />
        </div>

        <div className="ml-3">
          <p className="font-semibold font-baloo text-dc-ink text-sm">
            {otherUserName || 'Chat'}
          </p>
          <p className="text-xs text-dc-muted">
            {online ? 'Online' : 'Offline'}
          </p>
        </div>

      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-5 space-y-2.5 bg-gradient-to-b from-dc-mist/40 to-transparent">

        {messages.map((msg) => {
          const isMine = String(msg.sender) === String(user.id)

          return (
            <div
              key={msg._id}
              className={`max-w-xs p-3 rounded-2xl text-sm ${
                isMine
                  ? 'bg-gradient-to-br from-dc-blue to-dc-green text-white ml-auto rounded-br-md'
                  : 'bg-white text-dc-ink border border-dc-border rounded-bl-md'
              }`}
            >

              {msg.messageType === 'image' && msg.fileUrl && (
                <img
                  src={msg.fileUrl}
                  alt={msg.fileName || 'Image'}
                  className="max-w-full rounded-xl mb-2 cursor-pointer"
                  onClick={() => window.open(msg.fileUrl, '_blank')}
                />
              )}

              {msg.messageType === 'file' && msg.fileUrl && (
                
                  <a href={msg.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                    isMine ? 'bg-white/20' : 'bg-dc-field'
                  }`}
                >
                  <FileText size={16} strokeWidth={2.2} className="flex-shrink-0" />
                  <span className="text-xs font-semibold truncate">
                    {msg.fileName || 'Attachment'}
                  </span>
                </a>
              )}

              {msg.messageType === 'audio' && msg.fileUrl && (
                <audio controls src={msg.fileUrl} className="w-full mb-2" />
              )}

              {msg.messageType === 'video' && msg.fileUrl && (
                <video controls src={msg.fileUrl} className="max-w-full max-h-64 rounded-xl mb-2" />
              )}

              {msg.text && (
                <div className="break-words">{msg.text}</div>
              )}

              {isMine && (
                <div className="text-[11px] text-right mt-1 text-white/80">
                  {msg.read ? '✓✓ Read' : msg.delivered ? '✓✓' : '✓'}
                </div>
              )}

            </div>
          )
        })}

        <div ref={messagesEndRef} />

      </div>

      {/* TYPING */}
      {typing && (
        <div className="px-5 py-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-dc-blue animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-dc-blue animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-dc-blue animate-bounce" />
          <span className="text-xs text-dc-muted ml-1">typing...</span>
        </div>
      )}

      {/* INPUT */}
      <div className="flex items-center gap-2 border-t border-dc-border p-3 bg-white/70">

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
        <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" className="hidden" onChange={handleFileChange} />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowAttachmentMenu((prev) => !prev)}
            disabled={uploading}
            title="Attach"
            className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full border-[1.5px] transition disabled:opacity-50 ${
              showAttachmentMenu
                ? 'bg-dc-blue border-dc-blue text-white'
                : 'bg-white border-dc-border text-dc-blue hover:bg-dc-hover'
            }`}
          >
            {uploading ? (
              <Loader2 size={17} strokeWidth={2.2} className="animate-spin" />
            ) : (
              <Paperclip size={17} strokeWidth={2.2} className={showAttachmentMenu ? 'rotate-45 transition-transform' : 'transition-transform'} />
            )}
          </button>

          {showAttachmentMenu && (
            <div className="absolute bottom-14 left-0 w-48 bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)] border border-dc-border p-2 z-50">
              {attachmentOptions.map(({ label, icon: Icon, color, bg, ref }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    ref.current?.click()
                    setShowAttachmentMenu(false)
                  }}
                  className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-dc-hover text-left transition"
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bg}`}>
                    <Icon size={15} strokeWidth={2.2} className={color} />
                  </span>
                  <span className="text-sm font-semibold text-dc-ink">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value)

            if (e.target.value.trim()) {
              socket.emit('typing', { roomId, userId: user.id })
            } else {
              socket.emit('stopTyping', { roomId, userId: user.id })
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend()
            }
          }}
          placeholder={uploading ? 'Uploading...' : 'Type a message...'}
          disabled={uploading}
          className="flex-1 rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition disabled:opacity-60"
        />

        <button
          onClick={handleSend}
          disabled={uploading}
          className="bg-gradient-to-br from-dc-blue to-dc-green text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition transform hover:scale-[1.03] disabled:opacity-50 flex items-center gap-1.5"
        >
          <Send size={15} strokeWidth={2.4} />
          Send
        </button>

      </div>

    </div>
  )
}

export default ChatWindow