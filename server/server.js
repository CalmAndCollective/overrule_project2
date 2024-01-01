
var path = require("path"); // this will find the path of any folder of our game
var http = require("http"); // for starting an online server
// npm install libraryName
var express = require("express"); // sending and recieving files // we need to download it
var socketIO = require("socket.io"); // sending and recieving information/data // we need to download it
var Victor = require("victor");

var publicPath = path.join(__dirname, '../client'); // it simply adds two paths together ("E:/") joins ("class/client") = ("E:/class/client") 
var port = process.env.PORT || 2000; // this is the port that our server is using on a computer
var app = express(); // we initialize express library and we call it app
var server = http.createServer(app); // we create the server and the file responsibility is on app(express library)
var io = socketIO(server); // connecting the socket.io library to our server
app.use(express.static(publicPath)); // this sends client folder to each client who connects

var players = [];

// we run the server and we make sure it is started on the PORT
server.listen(port, function() {
    console.log("Server successfully runned on port " + port); // this will log something to the therminal
});

// the clients information will be stored in socket parameter
io.on('connection', function(socket) {
    console.log('someone conencted, Id: ' + socket.id);
    var player;
    
    socket.on("imReady", (data) => {
        player = new Player(socket.id, data.name, Math.random() * 500, Math.random() * 500);
        players.push(player);

        socket.emit("yourId", {id: player.id});
        socket.broadcast.emit('newPlayer', player.getInitPack());

        var initPack = [];
        for(var i in players) {
            initPack.push(players[i].getInitPack());
        }
        socket.emit("initPack", {initPack: initPack});
    });

    socket.on("disconnect", () => {
        io.emit('someoneLeft', {id: socket.id});
        for(var i in players) {
            if(players[i].id === socket.id) {
                players.splice(i, 1);
            }
        }
    });

})


// The player object constructor
var Player = function(id, name, x, y) {
    this.id = id;
    this.name = name;
    this.location = new Victor(x, y);
    this.force = new Victor(0, 0);
    this.acceleration = new Victor(0, 0);
    this.speed = new Victor(0, 0);
    this.mouseMaxForce = 0.1;
    this.maxAcceleration = 3;
    this.maxSpeed = 3;
    this.mass = 1;

    // amountOfForce is a vector
    this.addForce = function(amountOfForce) {
        var force = amountOfForce;
        this.force = force.divide(new Victor(mass, mass));
    }

    this.accelerate = function() {
        this.acceleration.add(this.force);
        this.acceleration = limitVector(this.acceleration, this.maxAcceleration);
    }

    this.speedUp = function() {
        this.speed.add(this.acceleration);
        this.speed = limitVector(this.speed, this.maxSpeed);
    }

    this.move = function() {
        this.location.add(this.speed);
    }

    this.zeroOutAcceleration = function() {
        this.acceleration = new Victor(0, 0);
    }

    this.update = function() {
        //this.addForce(this.getMouseForce());
        this.accelerate();
        this.speedUp();
        this.move();
        this.zeroOutAcceleration();
    }

    this.getInitPack = function () {
        return {
            id: this.id,
            name: this.name,
            x: this.location.x,
            y: this.location.y
        }
    }
    
    return this;
}

function limitVector(v, max) {
    var vec = v;
    var length = v.magnitude();
    vec = v * max / length;
    vec = v * max / length;
    return vec;
}