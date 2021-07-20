const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql2');
const sha256 = require('js-sha256');
const bodyParser = require('body-parser');
var session = require('express-session');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var conexiones = 0;
var hash = sha256.create();
const multer = require('multer')
let upload = multer();
let crypto = require('crypto');
let usuario='';


let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'exfinal_g7',
    port: 3306,
    typeCast: function (field, next) {
        if (field.type === 'BIT') {
            return (field.buffer()[0] === 1);
        } else {
            return next();
        }
    }
});

conn.connect(function (err) {
    if (err) throw err;
    console.log("Conexión exitosa a base de datos");
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.post('/acceder', function (req, res) {
    let usuario = req.body.usuario;
    let contra = req.body.contra;
    var hashpassword = crypto.createHash("sha256");
    hashpassword.update(contra);
    var sha256c = hashpassword.digest("hex"); // mostrado como hexadecimal
    console.log(sha256c);
    var params = [usuario, sha256c];
    if (usuario && contra) {
        var sql = "select * from usuario where nombre =? and contra =?";
        conn.query(sql, params, function (error, results) {
            console.log(results);
            if (error) {
                res.redirect('/login');
            }
            if (results[0] == null) {
                res.redirect('/login');
                console.log(error);
            } else {
                console.log("exito");
                res.sendFile(__dirname + '/chat.html');
            }
            //res.end();
        });
    } else {
        res.send('Los campos deben estar llenos');
        res.end();
    }
});
app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/login.html');
});

app.listen(3000, function () {
    console.log("Servidor corriendo en el puerto 3000");
});


io.on('connection', function (socket) {
    console.log("Usuario Conectado");
    conexiones++;
    io.emit('rpta', conexiones);
    io.emit('userConect',usuario);

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