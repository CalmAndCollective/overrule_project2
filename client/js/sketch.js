
var socket;
var myPlayer;
var myId;


// everything about the (loading) before the game starts
function preload() {
    // write code
}

// this is the firs thing that is called when the game is started, and it only happens once (Setup)
function setup() {
    players = [];
    myId = 0;

    socket = io();
    
    socket.emit("imReady", {name: "Devlogerio"});

    socket.on("yourId", function(data) {
        myId = data.id;
    });

    socket.on("newPlayer", function(data) {
        var player = new Player(data.id, data.name, data.x, data.y);
        players.push(player);
    });

    socket.on("initPack", function(data) {
        for(var i in data.initPack) {
            var player = new Player(data.initPack[i].id, data.initPack[i].name, data.initPack[i].x, data.initPack[i].y);
            players.push(player);
            console.log(myId);
        }
    });

    socket.on("someoneLeft", function(data) {
        for(var i in players) {
            if(players[i].id === data.id) {
                players.splice(i, 1);
            }
        }
    });
    

    createCanvas(windowWidth, windowHeight);
}

// this is called alot of times per second (FPS, frame per second)
function draw() {
    background(51, 51, 255); // it gets a hex/rgb color

    // TODO optimize this section
    for(var i in players) {
        if(players[i].id === myId) {
            translate(width/2 - players[i].location.x, height/2 - players[i].location.y);
        }
    }
    
    fill(51);
    rect(0, 0, 600, 600);

    for(var i in players) {
        players[i].update();
        players[i].draw();
    }
}

// The player object constructor
var Player = function(id, name, x, y) {
    this.id = id;
    this.name = name;
    this.location = createVector(x, y);
    this.force = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.speed = createVector(0, 0);
    this.mouseMaxForce = 0.1;
    this.maxAcceleration = 3;
    this.maxSpeed = 3;
    this.mass = 1;

    this.getMouseForce = function() {
        var force = createVector(mouseX - windowWidth/2, mouseY - windowHeight/2);
        force.limit(this.mouseMaxForce);
        force.div(this.mass);
        return force;
    }

    // amountOfForce is a vector
    this.addForce = function(amountOfForce) {
        var force = amountOfForce;
        this.force = force;
    }

    this.accelerate = function() {
        this.acceleration.add(this.force);
        this.acceleration.limit(this.maxAcceleration);
    }

    this.speedUp = function() {
        this.speed.add(this.acceleration);
        this.speed.limit(this.maxSpeed);
    }

    this.move = function() {
        this.location.add(this.speed);
    }

    this.zeroOutAcceleration = function() {
        this.acceleration = createVector(0, 0);
    }

    this.update = function() {
        //this.addForce(this.getMouseForce());
        this.accelerate();
        this.speedUp();
        this.move();
        this.zeroOutAcceleration();
    }

    this.draw = function() {
        var angle = atan2(mouseY - windowHeight/2, mouseX - windowWidth/2);
    
        push();
        translate(this.location.x, this.location.y);
        rotate(angle);
        fill(255, 0, 0);
        beginShape();
        vertex(30 + 30, 0);
        vertex(30 + -70, 30);
        vertex(30 + -45, 0);
        vertex(30 + -70, -30);
        endShape(CLOSE);
        pop();
        
        // this.speedX = cos(angle) * 3; // cosine is never gonna get more than 1
        // this.speedY = sin(angle) * 3;

        // if(this.speedX > 3) {
        //     this.speedX = 3;
        // }
    
        // if(this.speedY > 3) {
        //     this.speedY = 3;
        // }
    
        // this.x += this.speedX;
        // this.y += this.speedY;
    }
    
    return this;
}


