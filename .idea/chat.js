//imports
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql2');
//configs
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var conexiones = 0;
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    port: 3306,
    database: "exfinal_g7",

});
//con db
conn.connect(function (err) {
    if (err){
        console.log(err);
    } else {
        console.log("conexion exitosa");
    }

})
//server init
server.listen(3000,function(){
    console.log("Servidor corriendo en el puerto 3000");
});

app.get('/chatroom',function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log("Usuario Conectado");
    conexiones++;
    io.emit('rpta', conexiones);

    socket.on('disconnect', function () {
        console.log('Usuario Desconectado');
        conexiones--;
        io.emit('rpta', conexiones);
        delete users[socket.id];
        io.emit('users', users);
    });

    socket.on('chat_message', function (data) {
        console.log(socket.id + ": " + data);
        socket.broadcast.emit('chat', data, users[socket.id]);
    });

    socket.on('username', function (username) {
        users[socket.id] = username;
        io.emit('users', users);
    })
    socket.on('escribiendo', () => {
        socket.broadcast.emit('escribiendo', {
            username: socket.username
        });
    });

});