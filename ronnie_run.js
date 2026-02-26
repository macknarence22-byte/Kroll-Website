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

/* ===== LOAD CORRECT FILES ===== */

loadImage("road1", "assets/Road1.png");
loadImage("road2", "assets/Road2.png");

loadImage("barrier", "assets/barrier_obstical.png");
loadImage("sign_low", "assets/sign_low_obstical.png");

loadImage("run", "assets/character.png");
loadImage("idle", "assets/character_idle.png");
loadImage("jump", "assets/character_jump.png");
loadImage("duck", "assets/character_duck.png");

/* ===== PLAYER ===== */

const player = {
    x: 120,
    y: groundY,
    width: 50,
    height: 70,
    vy: 0,
    gravity: 0.7,
    jumpPower: -14,
    state: "idle"
};

let obstacles = [];

/* ===== ROAD SCROLL ===== */

let roadX1 = 0;
let roadX2 = canvas.width;

/* ===== INPUT ===== */

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && player.state !== "jump") {
        player.vy = player.jumpPower;
        player.state = "jump";
    }

    if (e.key === "ArrowDown" && player.state !== "jump") {
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

/* ===== SPAWN ===== */

function spawnObstacle() {
    const type = Math.random() > 0.5 ? "barrier" : "sign_low";

    if (type === "barrier") {
        obstacles.push({
            type: "barrier",
            width: 70,
            height: 60,
            x: canvas.width,
            y: groundY
        });
    } else {
        obstacles.push({
            type: "sign_low",
            width: 120,
            height: 40,
            x: canvas.width,
            y: groundY - 80
        });
    }
}

/* ===== COLLISION ===== */

function isColliding(p, o) {
    let playerHeight = p.state === "duck" ? 40 : 70;
    let playerTop = p.y - playerHeight;

    return (
        p.x < o.x + o.width &&
        p.x + p.width > o.x &&
        playerTop < o.y &&
        p.y > o.y - o.height
    );
}

/* ===== UPDATE LOOP ===== */

function update() {

    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* ---- Scroll Road ---- */

    roadX1 -= speed;
    roadX2 -= speed;

    if (roadX1 <= -canvas.width) roadX1 = canvas.width;
    if (roadX2 <= -canvas.width) roadX2 = canvas.width;

    ctx.drawImage(assets.road1, roadX1, 0, canvas.width, canvas.height);
    ctx.drawImage(assets.road2, roadX2, 0, canvas.width, canvas.height);

    /* ---- Player Physics ---- */

    player.vy += player.gravity;
    player.y += player.vy;

    if (player.y >= groundY) {
        player.y = groundY;
        player.vy = 0;
        if (player.state !== "duck") player.state = "idle";
    }

    /* ---- Draw Player ---- */

    let sprite = assets.idle;

    if (player.state === "jump") sprite = assets.jump;
    else if (player.state === "duck") sprite = assets.duck;
    else if (player.state === "idle") sprite = assets.run;

    let drawHeight = player.state === "duck" ? 40 : 70;

    ctx.drawImage(
        sprite,
        player.x,
        player.y - drawHeight,
        player.width,
        drawHeight
    );

    /* ---- Spawn ---- */

    spawnTimer++;
    if (spawnTimer > 110) {
        spawnObstacle();
        spawnTimer = 0;
    }

    /* ---- Obstacles ---- */

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

        if (isColliding(player, o)) {
            gameRunning = false;
        }

        if (o.x + o.width < 0) {
            obstacles.splice(i, 1);
        }
    }

    /* ---- Score ---- */

    score++;
    if (score % 600 === 0) speed += 0.5;

    scoreEl.textContent = "Score: " + score;
    speedEl.textContent = "Speed: " + speed.toFixed(1);

    requestAnimationFrame(update);
}

update();
