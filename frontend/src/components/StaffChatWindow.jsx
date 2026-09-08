
import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import axiosInstance from '../api/axiosInstance'
import { useSelector } from 'react-redux'
import { Baby, School } from 'lucide-react'

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  auth: {
    token: localStorage.getItem('token')
  }
})

socket.on('connect', () => {
  console.log('Socket connected:', socket.id)
})

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message)
})


const StaffChatWindow = ({
  daycareId,
  parentId,
  staffId,
  otherUserName,
  designation,
  daycareName,
  childName
}) => {

  const { user } = useSelector((state) => state.auth)

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [online, setOnline] = useState(false)
  const [typing, setTyping] = useState(false)

  const messagesEndRef = useRef(null)

  const roomId = `staff_${daycareId}_${parentId}_${staffId}`

  const otherUserId =
    String(user.id) === String(parentId)
      ? String(staffId)
      : String(parentId)

  useEffect(() => {
    socket.emit('userOnline')

    axiosInstance
      .get(`/staff-messages/${daycareId}/${parentId}/${staffId}`)
      .then((res) => {
        setMessages(res.data.data)
      })
      .catch((error) => {
        console.log('Get staff messages error:', error)
      })

    socket.emit('joinStaffRoom', roomId)

    if (otherUserId) {
      socket.emit('checkUserStatus', otherUserId)
    }

    socket.on('newStaffMessage', (message) => {
      const messageDaycareId = String(message.daycare)
      const messageParentId = String(message.parent)
      const messageStaffId = String(message.staff)

      if (
        messageDaycareId === String(daycareId) &&
        messageParentId === String(parentId) &&
        messageStaffId === String(staffId)
      ) {
        setMessages((prev) => [...prev, message])
      }
    })

    socket.on('userStatus', (data) => {
      if (String(data.userId) === String(otherUserId)) {
        setOnline(data.status === 'online')
      }
    })

    socket.on('staffMessageRead', (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(data.messageId)
            ? { ...msg, read: true }
            : msg
        )
      )
    })

    socket.on('staffUserTyping', (data) => {
      if (String(data.userId) === String(otherUserId)) {
        setTyping(true)
      }
    })

    socket.on('staffUserStoppedTyping', (data) => {
      if (String(data.userId) === String(otherUserId)) {
        setTyping(false)
      }
    })

    return () => {
      socket.off('newStaffMessage')
      socket.off('userStatus')
      socket.off('staffMessageRead')
      socket.off('staffUserTyping')
      socket.off('staffUserStoppedTyping')
    }

  }, [daycareId, parentId, staffId, otherUserId, user.id, roomId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

    messages.forEach((message) => {
      if (String(message.sender) !== String(user.id) && !message.read) {
        socket.emit('staffMessageRead', {
          messageId: message._id,
          roomId
        })
      }
    })
  }, [messages, user.id, roomId])

  const handleSend = () => {
    if (!text.trim()) return

    socket.emit('sendStaffMessage', {
      roomId,
      daycare: daycareId,
      parent: parentId,
      staff: staffId,
      
      text: text.trim()
    })

    socket.emit('staffStopTyping', {
      roomId,
      userId: user.id
    })

    setText('')
  }

  return (
    <div className="flex flex-col h-[32rem] rounded-[2rem] bg-white/90 backdrop-blur-sm border border-white/60 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] overflow-hidden font-nunito">

      {/* HEADER */}
      <div className="px-5 py-4 border-b border-dc-border bg-gradient-to-r from-dc-mist/70 to-transparent">

        <div className="flex items-center">

          <div className="relative flex-shrink-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center font-bold text-white text-sm shadow-[0_4px_10px_-3px_rgba(74,144,164,0.5)]">
              {otherUserName?.charAt(0).toUpperCase()}
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                online ? 'bg-dc-green' : 'bg-dc-border'
              }`}
            />
          </div>

          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold font-baloo text-dc-ink text-sm truncate">
                {otherUserName || 'Staff'}
              </p>
              <span className={`text-[11px] font-semibold ${online ? 'text-dc-green' : 'text-dc-muted'}`}>
                {online ? '● Online' : '● Offline'}
              </span>
            </div>

            {designation && (
              <p className="text-xs text-dc-muted">{designation}</p>
            )}
          </div>

        </div>

        {/* Context badges */}
        {(childName || daycareName) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {childName && (
              <span className="inline-flex items-center gap-1.5 bg-dc-hover text-dc-ink text-xs font-semibold px-3 py-1 rounded-full">
                <Baby size={13} strokeWidth={2.4} className="text-dc-blue" />
                {childName}
              </span>
            )}
            {daycareName && (
              <span className="inline-flex items-center gap-1.5 bg-dc-hover text-dc-ink text-xs font-semibold px-3 py-1 rounded-full">
                <School size={13} strokeWidth={2.4} className="text-dc-green" />
                {daycareName}
              </span>
            )}
          </div>
        )}

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
              <div>{msg.text}</div>

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

        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value)

            if (e.target.value.trim()) {
              socket.emit('staffTyping', { roomId, userId: user.id })
            } else {
              socket.emit('staffStopTyping', { roomId, userId: user.id })
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSend()
            }
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
        />

        <button
          onClick={handleSend}
          className="bg-gradient-to-br from-dc-blue to-dc-green text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition transform hover:scale-[1.03]"
        >
          Send
        </button>

      </div>

    </div>
  )
}

export default StaffChatWindow