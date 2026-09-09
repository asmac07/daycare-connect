

require('dotenv').config()

const http = require('http')
const { Server } = require('socket.io')

const app = require('./app')
const connectDB = require('./config/db')
const Message = require('./models/Message')
const StaffMessage = require('./models/StaffMessage')

const expireEnrollments = require('./jobs/enrollmentExpiryJob')

const jwt = require('jsonwebtoken')
const User = require('./models/User')

// To track online users
const onlineUsers = new Map()

const PORT = process.env.PORT || 5000

connectDB()

expireEnrollments()

// Attach Express app with HTTP server
const server = http.createServer(app)


// Create Socket.IO server and attach it to HTTP server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
})

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error('Authentication required'))
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    const user = await User.findById(decoded.id).select(
      '_id role isBlocked'
    )

    if (!user) {
      return next(new Error('User not found'))
    }

    if (user.isBlocked) {
      return next(new Error('User is blocked'))
    }

    socket.user = user

    next()

  } catch (error) {
    console.log(
      'Socket authentication error:',
      error.message
    )

    next(new Error('Invalid authentication token'))
  }
})

// When a client connects to Socket.IO
io.on('connection', (socket) => {

  console.log('User Connected:', socket.id)
  console.log('Authenticated user:', String(socket.user._id))
  console.log('Role:', socket.user.role)

  // User online
  socket.on('userOnline', () => {

  const userId = String(socket.user._id)

  socket.userId = userId

  onlineUsers.set(userId, socket.id)

  console.log('User online:', userId)

  socket.broadcast.emit('userStatus', {
    userId,
    status: 'online'
  })
})


  // Check user online status
  socket.on('checkUserStatus', (userId) => {

    const isOnline = onlineUsers.has(userId)

    socket.emit('userStatus', {
      userId,
      status: isOnline ? 'online' : 'offline'
    })
  })


  // Join chat room
  socket.on('joinRoom', (roomId) => {

    socket.join(roomId)

    console.log(`Socket ${socket.id} joined room ${roomId}`)
  })


  // Typing
  socket.on('typing', (data) => {

    socket.to(data.roomId).emit('userTyping', {
      userId: data.userId
    })
  })


  // Stop typing
  socket.on('stopTyping', (data) => {

    socket.to(data.roomId).emit('userStoppedTyping', {
      userId: data.userId
    })
  })


  // Send message
  socket.on('sendMessage', async (data) => {

    try {

      const message = await Message.create({
        daycare: data.daycare,
        parent: data.parent,
        sender: data.sender,
        
        text: data.text || '',
        messageType: data.messageType || 'text',
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null
      })

      // Send new message to room
      io.to(data.roomId).emit('newMessage', message)


      // Mark message as delivered
      message.delivered = true

      await message.save()


      // Notify both users
      io.to(data.roomId).emit('messageDelivered', {
        messageId: message._id
      })

    } catch (error) {

      console.log('Send message error:', error)

    }
  })


  // Message read
  socket.on('messageRead', async (data) => {

    try {

      const message = await Message.findById(data.messageId)

      if (!message) return


      // Mark message as read
      message.read = true
      message.readAt = new Date()

      await message.save()


      // Notify both users
      io.to(data.roomId).emit('messageRead', {
        messageId: message._id
      })

    } catch (error) {

      console.log('Message read error:', error)

    }
  })

    
  // Parent ↔ Staff Chat


  // Join staff chat room
  socket.on('joinStaffRoom', (roomId) => {

    socket.join(roomId)

    console.log(`Socket ${socket.id} joined staff room ${roomId}`)
  })


  // Staff chat typing
  socket.on('staffTyping', (data) => {

    socket.to(data.roomId).emit('staffUserTyping', {
      userId: data.userId
    })

  })


  // Staff chat stop typing
  socket.on('staffStopTyping', (data) => {

    socket.to(data.roomId).emit('staffUserStoppedTyping', {
      userId: data.userId
    })

  })


  // Send staff message
  socket.on('sendStaffMessage', async (data) => {

    try {

      const message = await StaffMessage.create({
        daycare: data.daycare,
        parent: data.parent,
        staff: data.staff,
        sender: data.sender,
         text: data.text || '',
        messageType: data.messageType || 'text',
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null
      })

      // Send message to staff chat room
      io.to(data.roomId).emit('newStaffMessage', message)

      // Mark as delivered
      message.delivered = true

      await message.save()

      // Notify both users
      io.to(data.roomId).emit('staffMessageDelivered', {
        messageId: message._id
      })

    } catch (error) {

      console.log('Send staff message error:', error)

    }

  })


  // Staff chat message read
  socket.on('staffMessageRead', async (data) => {

    try {

      const message = await StaffMessage.findById(data.messageId)

      if (!message) return

      message.read = true
      message.readAt = new Date()

      await message.save()

      io.to(data.roomId).emit('staffMessageRead', {
        messageId: message._id
      })

    } catch (error) {

      console.log('Staff message read error:', error)

    }

  })

  // User disconnected
  socket.on('disconnect', () => {

    console.log('User Disconnected:', socket.id)

    if (socket.userId) {

      onlineUsers.delete(socket.userId)

      socket.broadcast.emit('userStatus', {
        userId: socket.userId,
        status: 'offline'
      })
    }
  })

})



// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

