const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const speedEl = document.getElementById("speed");
const restartBtn = document.getElementById("restartBtn");

let gameRunning = true;

const groundY = 350;

const player = {
    x: 100,
    y: groundY,
    width: 10,
    height: 20,
    vy: 0,
    gravity: 0.6,
    jumpPower: -10,
    isJumping: false,
    isDucking: false
};

let obstacles = [];
let spawnTimer = 0;
let score = 0;
let speed = 4;

document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && !player.isJumping) {
        player.vy = player.jumpPower;
        player.isJumping = true;
    }
    if (e.key === "ArrowDown") {
        player.isDucking = true;
        player.height = 10;
    }
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowDown") {
        player.isDucking = false;
        player.height = 20;
    }
});

restartBtn.onclick = () => {
    obstacles = [];
    score = 0;
    speed = 4;
    gameRunning = true;
};

function spawnObstacle() {

    const type = Math.random();

    let obstacle;

    if (type < 0.4) {
        // Car
        obstacle = { x: 1000, y: groundY, width: 40, height: 20, type: "car" };
    } else if (type < 0.7) {
        // Road barrier
        obstacle = { x: 1000, y: groundY, width: 20, height: 30, type: "barrier" };
    } else {
        // Low sign (duck)
        obstacle = { x: 1000, y: groundY - 40, width: 40, height: 20, type: "sign" };
    }

    obstacles.push(obstacle);
}

function update() {

    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw road
    ctx.fillStyle = "#222";
    ctx.fillRect(0, groundY + 20, canvas.width, 10);

    // Player physics
    player.vy += player.gravity;
    player.y += player.vy;

    if (player.y >= groundY) {
        player.y = groundY;
        player.vy = 0;
        player.isJumping = false;
    }

    // Draw player
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y - player.height, player.width, player.height);

    // Spawn obstacles
    spawnTimer++;
    if (spawnTimer > 90) {
        spawnObstacle();
        spawnTimer = 0;
    }

    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.x -= speed;

        ctx.fillStyle = "black";
        ctx.fillRect(o.x, o.y - o.height, o.width, o.height);

        // Collision detection
        if (
            player.x < o.x + o.width &&
            player.x + player.width > o.x &&
            player.y - player.height < o.y &&
            player.y > o.y - o.height
        ) {
            gameRunning = false;
        }

        if (o.x + o.width < 0) {
            obstacles.splice(i, 1);
        }
    }

    // Increase difficulty
    score++;
    if (score % 500 === 0) {
        speed += 0.5;
    }

    scoreEl.textContent = "Score: " + score;
    speedEl.textContent = "Speed: " + speed.toFixed(1);

    requestAnimationFrame(update);
}

update();
