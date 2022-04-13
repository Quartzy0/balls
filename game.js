const desiredFps = 60;
const maxFrameSkip = 10;
const skipTicks = 1000 / desiredFps;

let mouseX = 9999, mouseY = 9999;
let ctx = {};
let canvas = {};
let gameOverText = {};
let timerEl = {};
let dodgeEl = {};

let playtime = 0;
let dodges = 0;
let fps = 0;

let dead = false;
let balls = [];
let timeStart = new Date().getTime();
const difficultyTimeMultiplier = 70;

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
*/
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function undead(){
    dead = false;
    gameOverText.style.display = "none";
    timeStart = new Date().getTime();
    playtime = 0;
    timerEl.innerText = "0s";
    dodges = 0;
    dodgeEl.innerText = "Dodges: 0";
}

function generateNewBall(){
    let radius = getRandomInt(10, 70);

    let randomX = 0;
    do{
        randomX = getRandomInt(radius, canvas.width - radius);
    }while(Math.abs(randomX - mouseX) < radius + 100);

    let randomY = 0;
    do{
        randomY = getRandomInt(radius, canvas.height - radius);
    }while(Math.abs(randomY - mouseY) < radius + 100);

    let velX_ = mouseX - randomX;
    let velY_ = mouseY - randomY;

    let norm = Math.sqrt(velX_ * velX_ + velY_ * velY_);
    let dirX = velX_/norm;
    let dirY = velY_/norm;

    let speed = getRandomInt(2, 8);
    let velX = speed*dirX;
    let velY = speed*dirY;

    balls.push({x: randomX, y: randomY, radius: radius, velX: velX, velY: velY});
}

function init(){
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    gameOverText = document.getElementById("gameover");
    gameOverText.style.display = "none";
    timerEl = document.getElementById("timer");
    dodgeEl = document.getElementById("dodged");

    canvas.addEventListener('mousemove', e => {
        var rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    window.addEventListener('resize', e => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    timeStart = new Date().getTime();
}

let lastBall = 0;
let timeToNewBall = 0;
function update(){
    if (dead){
        balls = [];
        return;
    }
    let timeAdd = ((new Date().getTime() - timeStart) / 1000) * difficultyTimeMultiplier;
    if(new Date().getTime()-lastBall > timeToNewBall) {
        lastBall = new Date().getTime();
        timeToNewBall = getRandomInt(800 - timeAdd, 2000 - timeAdd);
        generateNewBall();
    }

    for (let i = 0; i < balls.length; i++) {
        if(Math.abs(balls[i].x - mouseX) < balls[i].radius && Math.abs(balls[i].y - mouseY) < balls[i].radius) {
            console.log("You died");
            dead = true;
            gameOverText.style.display = "block";
            break;
        }
        
        if(balls[i].x - balls[i].radius > canvas.width || balls[i].y - balls[i].radius > canvas.height ||
            balls[i].x + balls[i].radius < 0 || balls[i].y + balls[i].radius < 0) {
                balls.splice(i, 1);
                dodges++;
                dodgeEl.innerText = "Dodges: " + dodges;
                continue;
        }
        balls[i].x += balls[i].velX;
        balls[i].y += balls[i].velY;
    }
}

function render(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FF0000';
    ctx.strokeStyle = '#000000';

    if(!dead){
        for(let i = 0; i < balls.length; i++){
            ctx.beginPath();
            ctx.arc(balls[i].x, balls[i].y, balls[i].radius, 0, 2*Math.PI);
            ctx.fill();
        }
    }
}


let lastTick = new Date().getTime();
let lastFpsMeasure = new Date().getTime();
// https://stackoverflow.com/a/16580064/
function run(){
    update();
    render();

    fps++;
    if(new Date().getTime()-lastFpsMeasure > 1000){
        console.log("fps: " + fps + " balls: " + balls.length);
        fps = 0;
        lastFpsMeasure = new Date().getTime();
        if(!dead){
            playtime++;
            timerEl.innerText = playtime + "s";
        }
    }
}

(function() {
    var onEachFrame;
    if (window.requestAnimationFrame) {
       onEachFrame = function(cb) {
          var _cb = function() {
                cb();
             requestAnimationFrame(_cb);
          };
          _cb();
       };
    } else if (window.webkitRequestAnimationFrame) {
       onEachFrame = function(cb) {
          var _cb = function() {
             cb();
             webkitRequestAnimationFrame(_cb);
          };
          _cb();
       };
    } else if (window.mozRequestAnimationFrame) {
        onEachFrame = function(cb) {
            var _cb = function() {
                cb();
                mozRequestAnimationFrame(_cb);
            };
            _cb();
        };
    } else {
        onEachFrame = function(cb) {
            setInterval(cb, skipTicks);
        };
    }

    window.onEachFrame = onEachFrame;
})();
