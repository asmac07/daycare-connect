

import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import axiosInstance from '../api/axiosInstance'
import { useSelector } from 'react-redux'

const socket = io('http://localhost:5000')

const ChatWindow = ({ daycareId, parentId, ownerId, otherUserName }) => {
  const { user } = useSelector((state) => state.auth)

  const otherUserId =
    String(user.id) === String(parentId)
      ? String(ownerId)
      : String(parentId)

  console.log('My User ID:', user.id)
  console.log('Parent ID:', parentId)
  console.log('Owner ID:', ownerId)
  console.log('Other User ID:', otherUserId)

  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [online, setOnline] = useState(false)
  const [typing, setTyping] = useState(false)

  const roomId = `${daycareId}_${parentId}`

  const messagesEndRef = useRef(null)

  useEffect(() => {

    socket.emit('userOnline', user.id)

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

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    })


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


  const handleSend = () => {

    if (!text.trim()) return


    socket.emit('sendMessage', {

      roomId,
      daycare: daycareId,
      parent: parentId,
      sender: user.id,
      text

    })


    socket.emit('stopTyping', {
      roomId,
      userId: user.id
    })


    setText('')
  }


  return (

    <div className="flex flex-col h-[32rem] rounded-[2rem] bg-white/90 backdrop-blur-sm border border-white/60 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] overflow-hidden font-nunito">

      {/* Header */}

      <div className="flex items-center px-5 py-4 border-b border-dc-border bg-white/70">

        <div className="relative flex-shrink-0">

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center font-bold text-white text-sm">

            {otherUserName?.charAt(0).toUpperCase()}

          </div>


          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              online
                ? 'bg-dc-green'
                : 'bg-dc-border'
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


      {/* Messages */}

      <div className="flex-1 overflow-y-auto p-5 space-y-2.5 bg-gradient-to-b from-dc-mist/40 to-transparent">

        {messages.map((msg) => {

          const isMine =
            String(msg.sender) === String(user.id)

          return (

            <div
              key={msg._id}
              className={`max-w-xs p-3 rounded-2xl text-sm ${
                isMine
                  ? 'bg-gradient-to-br from-dc-blue to-dc-green text-white ml-auto rounded-br-md'
                  : 'bg-white text-dc-ink border border-dc-border rounded-bl-md'
              }`}
            >

              <div>
                {msg.text}
              </div>


              {isMine && (

                <div className="text-[11px] text-right mt-1 text-white/80">

                  {msg.read
                    ? '✓✓ Read'
                    : msg.delivered
                    ? '✓✓'
                    : '✓'}

                </div>

              )}

            </div>

          )

        })}


        <div ref={messagesEndRef} />

      </div>


      {/* Typing */}

      {typing && (

        <div className="px-5 py-1.5 flex items-center gap-1.5">

          <span className="w-1.5 h-1.5 rounded-full bg-dc-blue animate-bounce [animation-delay:-0.3s]" />

          <span className="w-1.5 h-1.5 rounded-full bg-dc-blue animate-bounce [animation-delay:-0.15s]" />

          <span className="w-1.5 h-1.5 rounded-full bg-dc-blue animate-bounce" />

          <span className="text-xs text-dc-muted ml-1">
            typing...
          </span>

        </div>

      )}


      {/* Input */}

      <div className="flex items-center gap-2 border-t border-dc-border p-3 bg-white/70">

        <input
          type="text"
          value={text}
          onChange={(e) => {

            setText(e.target.value)

            if (e.target.value.trim()) {

              socket.emit('typing', {
                roomId,
                userId: user.id
              })

            } else {

              socket.emit('stopTyping', {
                roomId,
                userId: user.id
              })

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

export default ChatWindow

