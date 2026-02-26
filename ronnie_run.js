const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const speedEl = document.getElementById("speed");
const restartBtn = document.getElementById("restartBtn");

let gameRunning = true;

const groundY = 350;
let score = 0;
let speed = 4;
let spawnTimer = 0;

const assets = {};

function loadImage(name, src) {
    const img = new Image();
    img.src = src;
    assets[name] = img;
}

loadImage("ronnie_idle", "assets/charatcter_idle.png");
loadImage("ronnie_jump", "assets/character_jump.png");
loadImage("ronnie_duck", "assets/character_duck.png");
loadImage("car", "assets/car_obstical.png");
loadImage("barrier", "assets/barrier_obstical.png");
loadImage("sign_low", "assets/sign_low_obstical.png");
loadImage("Roud1", "assets/Road1.png");
loadImage("Road2", "assets/Road2.png");
const player = {
    x: 100,
    y: groundY,
    width: 40,
    height: 60,
    vy: 0,
    gravity: 0.6,
    jumpPower: -12,
    state: "idle"
};

let obstacles = [];

const obstacleTypes = [
    { type: "car", width: 80, height: 40, action: "jump" },
    { type: "barrier", width: 60, height: 50, action: "jump" },
    { type: "sign_low", width: 120, height: 40, action: "duck", yOffset: 60 }
];

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && player.state !== "jump") {
        player.vy = player.jumpPower;
        player.state = "jump";
    }
    if (e.key === "ArrowDown") {
        player.state = "duck";
    }
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowDown") {
        player.state = "idle";
    }
});

restartBtn.onclick = () => {
    obstacles = [];
    score = 0;
    speed = 4;
    gameRunning = true;
};

function spawnObstacle() {
    const rand = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    obstacles.push({
        ...rand,
        x: canvas.width,
        y: groundY - (rand.yOffset || 0)
    });
}

function update() {

    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Road
    ctx.fillStyle = "#222";
    ctx.fillRect(0, groundY + 20, canvas.width, 10);

    // Player physics
    player.vy += player.gravity;
    player.y += player.vy;

    if (player.y >= groundY) {
        player.y = groundY;
        player.vy = 0;
        if (player.state !== "duck") player.state = "idle";
    }

    // Draw player sprite
    let sprite = assets["ronnie_idle"];
    if (player.state === "jump") sprite = assets["ronnie_jump"];
    if (player.state === "duck") sprite = assets["ronnie_duck"];

    let drawHeight = player.state === "duck" ? 40 : 60;

    ctx.drawImage(
        sprite,
        player.x,
        player.y - drawHeight,
        40,
        drawHeight
    );

    // Spawn logic
    spawnTimer++;
    if (spawnTimer > 100) {
        spawnObstacle();
        spawnTimer = 0;
    }

    // Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.x -= speed;

        ctx.drawImage(
            assets[o.type],
            o.x,
            o.y - o.height,
            o.width,
            o.height
        );

        // Collision
        if (
            player.x < o.x + o.width &&
            player.x + 40 > o.x &&
            player.y - 60 < o.y &&
            player.y > o.y - o.height
        ) {
            gameRunning = false;
        }

        if (o.x + o.width < 0) {
            obstacles.splice(i, 1);
        }
    }

    score++;
    if (score % 500 === 0) speed += 0.5;

    scoreEl.textContent = "Score: " + score;
    speedEl.textContent = "Speed: " + speed.toFixed(1);

    requestAnimationFrame(update);
}

update();
