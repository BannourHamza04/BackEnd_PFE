const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 4000
const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json()) //Pour forcer le format de req en json 
const cors = require('cors');

const http = require('http')
const { Server } = require('socket.io')
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
app.use(cors({
    credentials: true // enable set cookie
}))

// Store connected users
let connectedUsers = {};

io.on('connection', (socket) => {
    socket.on('register', (userId) => {
        connectedUsers[userId] = socket.id;
        console.log(`a user connected : ${userId}`);
    });
    socket.on('disconnect', () => {
        for (let userId in connectedUsers) {
            if (connectedUsers[userId] === socket.id) {
                delete connectedUsers[userId];
                break;
            }
        }
        console.log('user disconnected');
    });
});


app.use('/uploads', express.static('uploads'))
const jwt = require('jsonwebtoken')

mongoose.connect('mongodb://127.0.0.1:27017/SocialMedia');
const db = mongoose.connection;
db.on('error', (error) => {
    console.error('Connection error:', error);
});

db.once('open', function () {
    console.log('Database connected successfully')
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

const router = require('./Routes/Routes')
const adminRouter = require('./Routes/AdminRoutes')
app.use('/', router)
app.use('/Admin', adminRouter(io, connectedUsers))
