
import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import axiosInstance from '../api/axiosInstance'
import { useSelector } from 'react-redux'
import { Baby, School, Paperclip, FileText, Loader2, Send, Image, Music, Video, File } from 'lucide-react'

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
  const [uploading, setUploading] = useState(false)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)

  // =========================
  // CALL STATE
  // =========================

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
  const fileInputRef = useRef(null)
  const audioInputRef = useRef(null)
  const videoInputRef = useRef(null)
  const docInputRef = useRef(null)
  const menuRef = useRef(null)

  const roomId = `staff_${daycareId}_${parentId}_${staffId}`

  const otherUserId =
    String(user.id) === String(parentId)
      ? String(staffId)
      : String(parentId)


  // =========================
  // STAFF CHAT
  // =========================

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


    // NEW MESSAGE

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


    // USER ONLINE / OFFLINE

    socket.on('userStatus', (data) => {

      if (String(data.userId) === String(otherUserId)) {
        setOnline(data.status === 'online')
      }

    })


    // MESSAGE READ

    socket.on('staffMessageRead', (data) => {

      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(data.messageId)
            ? { ...msg, read: true }
            : msg
        )
      )

    })


    // TYPING

    socket.on('staffUserTyping', (data) => {

      if (String(data.userId) === String(otherUserId)) {
        setTyping(true)
      }

    })


    // STOP TYPING

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

  }, [
    daycareId,
    parentId,
    staffId,
    otherUserId,
    user.id,
    roomId
  ])


  // =========================
  // MESSAGE READ + SCROLL
  // =========================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    })


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


  // =========================
  // SEND MESSAGE
  // =========================


  const handleSend = () => {

    if (!text.trim()) return

    socket.emit('sendStaffMessage', {

      roomId,

      daycare: daycareId,

      parent: parentId,

      staff: staffId,

      sender: user.id,
      text: text.trim(),
      messageType: 'text',
      fileUrl: null,
      fileName: null,

      sender: user.id,

      text: text.trim()

    })

    socket.emit('staffStopTyping', {
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

      socket.emit('sendStaffMessage', {
        roomId,
        daycare: daycareId,
        parent: parentId,
        staff: staffId,
        sender: user.id,
        text: '',
        messageType,
        fileUrl,
        fileName
      })

    } catch (error) {
      console.log('Staff file upload error:', error)
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


  // =========================
  // CREATE WEBRTC CONNECTION
  // =========================

  const createPeerConnection = () => {

    const peer = new RTCPeerConnection({

      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302'
        }
      ]

    })

    peerRef.current = peer

    return peer

  }


  // =========================
  // START CALL
  // =========================

  const startCall = async (type) => {

    pendingIceCandidatesRef.current = []

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({

          audio: true,

          video: type === 'video'

        })


      localStreamRef.current = stream


      // Reset call controls

      setIsMuted(false)

      setIsCameraOn(type === 'video')


      setCallType(type)

      setCallActive(true)


      const peer = createPeerConnection()


      // Add microphone / camera tracks

      stream.getTracks().forEach((track) => {

        peer.addTrack(track, stream)

      })


      // Receive remote audio/video

      peer.ontrack = (event) => {

        if (remoteVideoRef.current) {

          remoteVideoRef.current.srcObject =
            event.streams[0]

        }

      }


      // ICE candidates

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


      // Create offer

      const offer =
        await peer.createOffer()


      // Set local offer

      await peer.setLocalDescription(offer)


      // Send incoming call notification

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

      alert(
        'Please allow microphone/camera access.'
      )

    }

  }


  // =========================
  // ACCEPT CALL
  // =========================

  const acceptCall = async () => {

    try {

      const {
        signal,
        callType: type,
        from
      } = incomingCall


      const stream =
        await navigator.mediaDevices.getUserMedia({

          audio: true,

          video: type === 'video'

        })


      localStreamRef.current = stream


      // Reset call controls

      setIsMuted(false)

      setIsCameraOn(type === 'video')


      setCallType(type)

      setCallActive(true)

      setIncomingCall(null)


      const peer = createPeerConnection()


      // Add microphone / camera tracks

      stream.getTracks().forEach((track) => {

        peer.addTrack(track, stream)

      })


      // Receive caller's audio/video

      peer.ontrack = (event) => {

        if (remoteVideoRef.current) {

          remoteVideoRef.current.srcObject =
            event.streams[0]

        }

      }


      // Send ICE candidates to caller

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


      // Set caller's offer

      await peer.setRemoteDescription(

        new RTCSessionDescription(signal)

      )


      // Add ICE candidates received earlier

      for (
        const candidate
        of pendingIceCandidatesRef.current
      ) {

        await peer.addIceCandidate(

          new RTCIceCandidate(candidate)

        )

      }

      pendingIceCandidatesRef.current = []


      // Create answer

      const answer =
        await peer.createAnswer()


      // Set local answer

      await peer.setLocalDescription(answer)


      // Send answer to caller

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

      alert(
        'Please allow microphone/camera access.'
      )

    }

  }


  // =========================
  // REJECT CALL
  // =========================

  const rejectCall = () => {

    if (incomingCall) {

      socket.emit('staffCallRejected', {

        roomId,

        to: incomingCall.from

      })

    }

    setIncomingCall(null)

  }


  // =========================
  // TOGGLE MUTE
  // =========================

  const toggleMute = () => {

    const stream = localStreamRef.current

    if (!stream) return


    const audioTrack =
      stream.getAudioTracks()[0]


    if (audioTrack) {

      audioTrack.enabled =
        !audioTrack.enabled

      setIsMuted(!audioTrack.enabled)

    }

  }


  // =========================
  // TOGGLE CAMERA
  // =========================

  const toggleCamera = () => {

    const stream = localStreamRef.current

    if (!stream) return


    const videoTrack =
      stream.getVideoTracks()[0]


    if (videoTrack) {

      videoTrack.enabled =
        !videoTrack.enabled

      setIsCameraOn(videoTrack.enabled)

    }

  }


  // =========================
  // END CALL
  // =========================

  const endCall = (notify = true) => {

    const peer = peerRef.current

    peerRef.current = null


    if (peer) {

      peer.close()

    }


    if (localStreamRef.current) {

      localStreamRef.current
        .getTracks()
        .forEach((track) => {

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


  // =========================
  // SHOW LOCAL VIDEO
  // =========================

  useEffect(() => {

    if (
      callActive &&
      callType === 'video' &&
      localVideoRef.current &&
      localStreamRef.current
    ) {

      localVideoRef.current.srcObject =
        localStreamRef.current

    }

  }, [callActive, callType])


  // =========================
  // CALL SIGNALING
  // =========================

  useEffect(() => {

    // =========================
    // INCOMING CALL
    // =========================

    socket.on('staffIncomingCall', (data) => {

      if (
        String(data.to) === String(user.id)
      ) {

        setIncomingCall(data)

      }

    })


    // =========================
    // ANSWER / ICE CANDIDATE
    // =========================

    socket.on('staffCallSignal', async (data) => {

      if (
        String(data.to) !== String(user.id)
      ) {
        return
      }


      const peer = peerRef.current


      // =========================
      // OFFER
      // =========================

      if (data.signal.type === 'offer') {

        if (!peer) return

        try {

          await peer.setRemoteDescription(

            new RTCSessionDescription(
              data.signal
            )

          )


          const answer =
            await peer.createAnswer()


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

          console.log(
            'Offer handling error:',
            error
          )

        }

      }


      // =========================
      // ANSWER
      // =========================

      if (data.signal.type === 'answer') {

        if (!peer) return

        try {

          await peer.setRemoteDescription(

            new RTCSessionDescription(
              data.signal
            )

          )


          // Add queued ICE candidates

          for (
            const candidate
            of pendingIceCandidatesRef.current
          ) {

            await peer.addIceCandidate(

              new RTCIceCandidate(candidate)

            )

          }

          pendingIceCandidatesRef.current = []

        } catch (error) {

          console.log(
            'Answer error:',
            error
          )

        }

      }


      // =========================
      // ICE CANDIDATE
      // =========================

      if (
        data.signal.type === 'ice-candidate'
      ) {

        if (!peer) {

          pendingIceCandidatesRef.current.push(

            data.signal.candidate

          )

          return

        }


        try {

          // If remote description is not ready,
          // store candidate for later

          if (!peer.remoteDescription) {

            pendingIceCandidatesRef.current.push(

              data.signal.candidate

            )

            return

          }


          await peer.addIceCandidate(

            new RTCIceCandidate(
              data.signal.candidate
            )

          )

        } catch (error) {

          console.log(
            'ICE candidate error:',
            error
          )

        }

      }

    })


    // =========================
    // CALL ENDED
    // =========================

    socket.on('staffCallEnded', () => {

      endCall(false)

    })


    // =========================
    // CALL REJECTED
    // =========================

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

>>>>>>> main

  return (

    <div className="flex flex-col h-[32rem] rounded-[2rem] bg-white/90 backdrop-blur-sm border border-white/60 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] overflow-hidden font-nunito">


      {/* =========================
          HEADER
      ========================= */}

      <div className="px-5 py-4 border-b border-dc-border bg-gradient-to-r from-dc-mist/70 to-transparent">

        <div className="flex items-center">
<<<<<<< HEAD
=======


          {/* PROFILE */}

>>>>>>> main
          <div className="relative flex-shrink-0">

            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center font-bold text-white text-sm shadow-[0_4px_10px_-3px_rgba(74,144,164,0.5)]">

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


          {/* USER INFO */}

          <div className="ml-3 flex-1 min-w-0">

            <div className="flex items-center gap-2">

              <p className="font-semibold font-baloo text-dc-ink text-sm truncate">

                {otherUserName || 'Staff'}

              </p>


              <span
                className={`text-[11px] font-semibold ${
                  online
                    ? 'text-dc-green'
                    : 'text-dc-muted'
                }`}
              >

                {online
                  ? '● Online'
                  : '● Offline'}

              </span>

            </div>


            {designation && (

              <p className="text-xs text-dc-muted">

                {designation}

              </p>

            )}

          </div>


          {/* CALL BUTTONS */}

          <div className="flex items-center gap-2 ml-2">

            {/* AUDIO CALL */}

            <button
              type="button"
              onClick={() => startCall('audio')}
              disabled={!online || callActive}
              title="Audio call"
              className="w-9 h-9 rounded-full bg-dc-hover flex items-center justify-center hover:bg-dc-blue hover:text-white transition disabled:opacity-40"
            >
              📞
            </button>


            {/* VIDEO CALL */}

            <button
              type="button"
              onClick={() => startCall('video')}
              disabled={!online || callActive}
              title="Video call"
              className="w-9 h-9 rounded-full bg-dc-hover flex items-center justify-center hover:bg-dc-green hover:text-white transition disabled:opacity-40"
            >
              🎥
            </button>

          </div>
        </div>

<<<<<<< HEAD
=======

        {/* CONTEXT BADGES */}

>>>>>>> main
        {(childName || daycareName) && (

          <div className="flex flex-wrap gap-2 mt-3">

            {/* CHILD */}

            {childName && (

              <span className="inline-flex items-center gap-1.5 bg-dc-hover text-dc-ink text-xs font-semibold px-3 py-1 rounded-full">

                <Baby
                  size={13}
                  strokeWidth={2.4}
                  className="text-dc-blue"
                />

                {childName}

              </span>

            )}

<<<<<<< HEAD
=======

            {/* DAYCARE */}

>>>>>>> main
            {daycareName && (

              <span className="inline-flex items-center gap-1.5 bg-dc-hover text-dc-ink text-xs font-semibold px-3 py-1 rounded-full">

                <School
                  size={13}
                  strokeWidth={2.4}
                  className="text-dc-green"
                />

                {daycareName}

              </span>

            )}

          </div>

        )}

      </div>


      {/* =========================
          MESSAGES
      ========================= */}

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

<<<<<<< HEAD
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
=======
              <div>
                {msg.text}
              </div>

>>>>>>> main

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


      {/* =========================
          TYPING
      ========================= */}

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


      {/* =========================
          INPUT
      ========================= */}

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

              socket.emit('staffTyping', {
                roomId,
                userId: user.id
              })

            } else {

              socket.emit('staffStopTyping', {
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


      {/* =========================
          INCOMING CALL
      ========================= */}

      {incomingCall && (

        <div className="absolute inset-0 z-50 bg-black/40 flex items-center justify-center">

          <div className="bg-white rounded-3xl p-6 w-80 text-center shadow-2xl">

            <div className="text-4xl mb-3">

              {incomingCall.callType === 'video'
                ? '🎥'
                : '📞'}

            </div>


            <h3 className="font-bold text-lg text-dc-ink">

              Incoming{' '}

              {incomingCall.callType === 'video'
                ? 'Video'
                : 'Audio'}

              {' '}Call

            </h3>


            <p className="text-sm text-dc-muted mt-1">

              {otherUserName}

            </p>


            <div className="flex gap-3 mt-5">

              <button
                onClick={rejectCall}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-semibold"
              >
                Reject
              </button>


              <button
                onClick={acceptCall}
                className="flex-1 py-2.5 rounded-full bg-dc-green text-white font-semibold"
              >
                Accept
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =========================
          ACTIVE CALL
      ========================= */}

      {callActive && (

        <div className="absolute inset-0 z-40 bg-black flex flex-col">

          {/* =========================
              VIDEO CALL
          ========================= */}

          {callType === 'video' && (

            <>

              {/* REMOTE VIDEO */}

              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />


              {/* LOCAL VIDEO */}

              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute top-4 right-4 w-28 h-40 object-cover rounded-xl border-2 border-white"
              />

            </>

          )}


          {/* =========================
              AUDIO CALL
          ========================= */}

          {callType === 'audio' && (

            <div className="flex-1 flex flex-col items-center justify-center text-white">

              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center text-4xl">

                {otherUserName?.charAt(0).toUpperCase()}

              </div>


              <h2 className="text-xl font-bold mt-4">

                {otherUserName}

              </h2>


              <p className="text-sm text-white/70 mt-1">

                Audio call

              </p>


              <audio
                ref={remoteVideoRef}
                autoPlay
              />

            </div>

          )}


          {/* =========================
              CALL CONTROLS
          ========================= */}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">

            {/* MUTE */}

            <button
              onClick={toggleMute}
              className="w-12 h-12 rounded-full bg-white text-black shadow-xl"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🎤'}
            </button>


            {/* CAMERA ON/OFF */}

            {callType === 'video' && (

              <button
                onClick={toggleCamera}
                className="w-12 h-12 rounded-full bg-white text-black shadow-xl"
                title={
                  isCameraOn
                    ? 'Turn camera off'
                    : 'Turn camera on'
                }
              >
                {isCameraOn ? '📹' : '🚫'}
              </button>

            )}


            {/* END CALL */}

            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-500 text-white text-xl shadow-xl"
              title="End call"
            >
              📵
            </button>

          </div>

        </div>

      )}

    </div>

  )
}

export default StaffChatWindow

