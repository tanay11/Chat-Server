const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const cors = require('cors');

const PORT = process.env.PORT || 5000;
const router = require('./router');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const app = express();
app.use(router); //middleware
app.use(cors);
const server = http.createServer(app);//creating server

const io = socketIO(server); // running socket io on 5000

io.on('connection', (socket) => {
    console.log("we have new connection");
    socket.on('join', ({name, room}, callback) => {
        
        const { error, user } = addUser({id : socket.id, name, room})
        console.log(user)
        if (error) return callback(error);
        socket.emit('message', { user:'admin', text:`${user.name} welcome to the room ${user.room}`} ); // tp the new user
        socket.broadcast.to(user.room).emit('message',{ user:'admin', text:`${user.name} has joined!!`}); // to recipients

        socket.join(user.room);
        callback();
    })
    socket.on('sendMessage',(message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', { user:user.name, text:message})
        callback();
    })
    socket.on('disconnect',() => {
        console.log("user had left")
    })
})

server.listen(PORT,() => console.log(`server has startedon port ${PORT}`));