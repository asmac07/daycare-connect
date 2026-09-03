
require('dotenv').config()

const http = require("http")
const { Server } = require("socket.io")

const app = require('./app')
const connectDB = require('./config/db')
const Message = require('./models/Message')

 // to track the online users
const onlineUsers = new Map()

const PORT = process.env.PORT || 5000

connectDB()

// attach express app with http server
const server = http.createServer(app)

   // creates a socket.io server nd it attach to the http server
const io = new Server(server, { //configure socket.io
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

// when a client connects to the socket.io , run this function
// socket is a connection of specific user

io.on("connection", (socket) => {  

   console.log("User Connected:", socket.id) 

    socket.on("userOnline", (userId) => {
      socket.userId = userId
      onlineUsers.set(userId, socket.id)
      console.log("User online:", userId)
      socket.broadcast.emit("userStatus", { userId, status: "online" })
    }) 

    socket.on("checkUserStatus", (userId) => {
      const isOnline = onlineUsers.has(userId)
      socket.emit("userStatus", { userId, status: isOnline ? "online" : "offline" })
    })

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId)
      console.log(`Socket ${socket.id} joined room ${roomId}`)
    })

    socket.on("typing", (data) => {
      socket.to(data.roomId).emit("userTyping", {
        userId: data.userId
      })
    })

    socket.on("stopTyping", (data) => {
      socket.to(data.roomId).emit("userStoppedTyping", {
        userId: data.userId
      })
    })

    socket.on("sendMessage", async (data) => {
      try {
        const message = await Message.create({
          daycare: data.daycare,
          parent: data.parent,
          sender: data.sender,
          text: data.text
        })
        
        io.to(data.roomId).emit("newMessage", message) 
        // Mark message as delivered

        message.delivered = true
         await message.save()

         // Notify both users
          io.to(data.roomId).emit("messageDelivered", { 
            messageId: message._id 
          })
        } catch (error) {
           console.log("Send message error:", error) 
          } 
        })

    socket.on("messageRead", async (data) => {
      try {

        const message = await Message.findById(data.messageId)

        if (!message) return

        // Mark message as read
        message.read = true
        message.readAt = new Date()

        await message.save()

        // Notify both users
        io.to(data.roomId).emit("messageRead", {
          messageId: message._id
        })

   } catch (error) {
     console.log("Message read error:", error)
  }
})


    socket.on("disconnect", () => {
      console.log("User Disconnected:", socket.id)
      if (socket.userId) {
        onlineUsers.delete(socket.userId)
        socket.broadcast.emit("userStatus", { userId: socket.userId, status: "offline" })
      }
    })
})
// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

