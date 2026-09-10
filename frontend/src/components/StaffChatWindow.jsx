
import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import axiosInstance from '../api/axiosInstance'
import { useSelector } from 'react-redux'
import {
  Baby,
  School,
  Phone,
  Video,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  Send
} from 'lucide-react'

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

  const [callType, setCallType] = useState(null)
  const [incomingCall, setIncomingCall] = useState(null)
  const [callActive, setCallActive] = useState(false)

  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)

  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  const peerRef = useRef(null)
  const localStreamRef = useRef(null)

  const pendingIceCandidatesRef = useRef([])

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
      if (
        String(message.sender) !== String(user.id) &&
        !message.read
      ) {
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
      sender: user.id,
      text: text.trim()
    })

    socket.emit('staffStopTyping', {
      roomId,
      userId: user.id
    })

    setText('')
  }

  const createPeerConnection = () => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })

    peerRef.current = peer

    return peer
  }

  const startCall = async (type) => {
    pendingIceCandidatesRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      })

      localStreamRef.current = stream

      setIsMuted(false)
      setIsCameraOn(type === 'video')

      setCallType(type)
      setCallActive(true)

      const peer = createPeerConnection()

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream)
      })

      peer.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('staffCallSignal', {
            roomId,
            to: otherUserId,
            from: user.id,
            signal: {
              type: 'ice-candidate',
              candidate: event.candidate
            },
            callType: type
          })
        }
      }

      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)

      socket.emit('staffIncomingCall', {
        roomId,
        to: otherUserId,
        from: user.id,
        signal: {
          type: 'offer',
          sdp: offer.sdp
        },
        callType: type
      })

    } catch (error) {
      console.log('Start call error:', error)
      alert('Please allow microphone/camera access.')
    }
  }

  const acceptCall = async () => {
    try {
      const { signal, callType: type, from } = incomingCall

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      })

      localStreamRef.current = stream

      setIsMuted(false)
      setIsCameraOn(type === 'video')

      setCallType(type)
      setCallActive(true)
      setIncomingCall(null)

      const peer = createPeerConnection()

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream)
      })

      peer.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('staffCallSignal', {
            roomId,
            to: from,
            from: user.id,
            signal: {
              type: 'ice-candidate',
              candidate: event.candidate
            },
            callType: type
          })
        }
      }

      await peer.setRemoteDescription(new RTCSessionDescription(signal))

      for (const candidate of pendingIceCandidatesRef.current) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate))
      }

      pendingIceCandidatesRef.current = []

      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)

      socket.emit('staffCallSignal', {
        roomId,
        to: from,
        from: user.id,
        signal: {
          type: 'answer',
          sdp: answer.sdp
        },
        callType: type
      })

    } catch (error) {
      console.log('Accept call error:', error)
      alert('Please allow microphone/camera access.')
    }
  }

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit('staffCallRejected', {
        roomId,
        to: incomingCall.from
      })
    }

    setIncomingCall(null)
  }

  const toggleMute = () => {
    const stream = localStreamRef.current
    if (!stream) return

    const audioTrack = stream.getAudioTracks()[0]

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      setIsMuted(!audioTrack.enabled)
    }
  }

  const toggleCamera = () => {
    const stream = localStreamRef.current
    if (!stream) return

    const videoTrack = stream.getVideoTracks()[0]

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      setIsCameraOn(videoTrack.enabled)
    }
  }

  const endCall = (notify = true) => {
    const peer = peerRef.current
    peerRef.current = null

    if (peer) {
      peer.close()
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
      localStreamRef.current = null
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }

    pendingIceCandidatesRef.current = []

    if (notify) {
      socket.emit('staffCallEnded', {
        roomId,
        to: otherUserId
      })
    }

    setCallActive(false)
    setCallType(null)
    setIncomingCall(null)
    setIsMuted(false)
    setIsCameraOn(true)
  }

  useEffect(() => {
    if (
      callActive &&
      callType === 'video' &&
      localVideoRef.current &&
      localStreamRef.current
    ) {
      localVideoRef.current.srcObject = localStreamRef.current
    }
  }, [callActive, callType])

  useEffect(() => {
    socket.on('staffIncomingCall', (data) => {
      if (String(data.to) === String(user.id)) {
        setIncomingCall(data)
      }
    })

    socket.on('staffCallSignal', async (data) => {
      if (String(data.to) !== String(user.id)) {
        return
      }

      const peer = peerRef.current

      if (data.signal.type === 'offer') {
        if (!peer) return

        try {
          await peer.setRemoteDescription(new RTCSessionDescription(data.signal))

          const answer = await peer.createAnswer()
          await peer.setLocalDescription(answer)

          socket.emit('staffCallSignal', {
            roomId,
            to: data.from,
            from: user.id,
            signal: {
              type: 'answer',
              sdp: answer.sdp
            },
            callType: data.callType
          })

        } catch (error) {
          console.log('Offer handling error:', error)
        }
      }

      if (data.signal.type === 'answer') {
        if (!peer) return

        try {
          await peer.setRemoteDescription(new RTCSessionDescription(data.signal))

          for (const candidate of pendingIceCandidatesRef.current) {
            await peer.addIceCandidate(new RTCIceCandidate(candidate))
          }

          pendingIceCandidatesRef.current = []

        } catch (error) {
          console.log('Answer error:', error)
        }
      }

      if (data.signal.type === 'ice-candidate') {
        if (!peer) {
          pendingIceCandidatesRef.current.push(data.signal.candidate)
          return
        }

        try {
          if (!peer.remoteDescription) {
            pendingIceCandidatesRef.current.push(data.signal.candidate)
            return
          }

          await peer.addIceCandidate(new RTCIceCandidate(data.signal.candidate))

        } catch (error) {
          console.log('ICE candidate error:', error)
        }
      }
    })

    socket.on('staffCallEnded', () => {
      endCall(false)
    })

    socket.on('staffCallRejected', () => {
      alert('Call rejected')
      endCall(false)
    })

    return () => {
      socket.off('staffIncomingCall')
      socket.off('staffCallSignal')
      socket.off('staffCallEnded')
      socket.off('staffCallRejected')
    }

  }, [user.id])

  return (
    <div className="flex flex-col h-[32rem] rounded-[2rem] bg-white/90 backdrop-blur-sm border border-white/60 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] overflow-hidden font-nunito relative">

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

          <div className="flex items-center gap-2 ml-2 flex-shrink-0">

            <button
              type="button"
              onClick={() => startCall('audio')}
              disabled={!online || callActive}
              title="Audio call"
              className="w-9 h-9 rounded-full bg-dc-hover flex items-center justify-center text-dc-blue hover:bg-dc-blue hover:text-white transition disabled:opacity-40 disabled:hover:bg-dc-hover disabled:hover:text-dc-blue"
            >
              <Phone size={15} strokeWidth={2.3} />
            </button>

            <button
              type="button"
              onClick={() => startCall('video')}
              disabled={!online || callActive}
              title="Video call"
              className="w-9 h-9 rounded-full bg-dc-hover flex items-center justify-center text-dc-green hover:bg-dc-green hover:text-white transition disabled:opacity-40 disabled:hover:bg-dc-hover disabled:hover:text-dc-green"
            >
              <Video size={15} strokeWidth={2.3} />
            </button>

          </div>

        </div>

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
          className="bg-gradient-to-br from-dc-blue to-dc-green text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition transform hover:scale-[1.03] flex items-center gap-1.5"
        >
          <Send size={15} strokeWidth={2.4} />
          Send
        </button>

      </div>

      {/* INCOMING CALL */}
      {incomingCall && (
        <div className="absolute inset-0 z-50 bg-dc-ink/50 backdrop-blur-sm flex items-center justify-center rounded-[2rem]">

          <div className="bg-white rounded-3xl p-6 w-80 text-center shadow-[0_20px_50px_-12px_rgba(74,144,164,0.4)]">

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center mx-auto mb-4 shadow-[0_8px_20px_-6px_rgba(74,144,164,0.5)] animate-pulse">
              {incomingCall.callType === 'video' ? (
                <Video size={26} strokeWidth={2.2} className="text-white" />
              ) : (
                <Phone size={26} strokeWidth={2.2} className="text-white" />
              )}
            </div>

            <h3 className="font-semibold font-baloo text-lg text-dc-ink">
              Incoming {incomingCall.callType === 'video' ? 'Video' : 'Audio'} Call
            </h3>

            <p className="text-sm text-dc-muted mt-1">{otherUserName}</p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={rejectCall}
                className="flex-1 py-2.5 rounded-full bg-dc-error-text text-white font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-1.5"
              >
                <PhoneOff size={15} strokeWidth={2.3} />
                Reject
              </button>

              <button
                onClick={acceptCall}
                className="flex-1 py-2.5 rounded-full bg-dc-green text-white font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-1.5"
              >
                <Phone size={15} strokeWidth={2.3} />
                Accept
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ACTIVE CALL */}
      {callActive && (
        <div className="absolute inset-0 z-40 bg-dc-ink flex flex-col rounded-[2rem] overflow-hidden">

          {callType === 'video' && (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute top-4 right-4 w-28 h-40 object-cover rounded-xl border-2 border-white shadow-lg"
              />
            </>
          )}

          {callType === 'audio' && (
            <div className="flex-1 flex flex-col items-center justify-center text-white">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center text-3xl font-bold font-baloo shadow-[0_8px_20px_-6px_rgba(74,144,164,0.6)]">
                {otherUserName?.charAt(0).toUpperCase()}
              </div>

              <h2 className="text-xl font-semibold font-baloo mt-4">{otherUserName}</h2>
              <p className="text-sm text-white/70 mt-1">Audio call in progress</p>

              <audio ref={remoteVideoRef} autoPlay />
            </div>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">

            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition ${
                isMuted ? 'bg-dc-error-text text-white' : 'bg-white text-dc-ink'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={19} strokeWidth={2.2} /> : <Mic size={19} strokeWidth={2.2} />}
            </button>

            {callType === 'video' && (
              <button
                onClick={toggleCamera}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition ${
                  !isCameraOn ? 'bg-dc-error-text text-white' : 'bg-white text-dc-ink'
                }`}
                title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
              >
                {isCameraOn ? <Video size={19} strokeWidth={2.2} /> : <VideoOff size={19} strokeWidth={2.2} />}
              </button>
            )}

            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-dc-error-text text-white shadow-xl hover:opacity-90 transition flex items-center justify-center"
              title="End call"
            >
              <PhoneOff size={22} strokeWidth={2.3} />
            </button>

          </div>

        </div>
      )}

    </div>
  )
}

export default StaffChatWindow