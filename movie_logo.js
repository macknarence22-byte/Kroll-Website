const startBtn = document.getElementById('startBtn');
const box = document.getElementById('animationBox');

let animationId;
let running = false;

const pixelSize = 4;
const totalPixels = 1000;
const TOTAL_TIME = 5000; // EXACT 5 seconds

const colors = [];
for (let i = 0; i < 5; i++) colors.push(`rgb(${180+i*15},0,0)`);
for (let i = 0; i < 5; i++) colors.push(`rgb(255,${60+i*15},0)`);
for (let i = 0; i < 5; i++) colors.push(`rgb(${50+i*20},${50+i*20},${50+i*20})`);
for (let i = 0; i < 5; i++) colors.push(`rgb(0,0,0)`);

startBtn.onclick = () => {
    if (!running) {
        running = true;
        startBtn.textContent = "Stop Animation";
        startAnimation();
    } else {
        stopAnimation();
    }
};

function startAnimation() {

    box.innerHTML = "";

    const boxW = box.clientWidth;
    const boxH = box.clientHeight;

    // Create canvas for PERFECT font sampling
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 200;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.font = "bold 160px GateKeeperAOE";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("RONNIE", canvas.width/2, canvas.height/2);

    const data = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    const points = [];

    for (let y = 0; y < canvas.height; y += 2) {
        for (let x = 0; x < canvas.width; x += 2) {
            const i = (y * canvas.width + x) * 4;
            if (data[i + 3] > 128) {
                points.push({x, y});
            }
        }
    }

    // Shuffle points so distribution is even
    for (let i = points.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [points[i], points[j]] = [points[j], points[i]];
    }

    const xOffset = (boxW - canvas.width) / 2;
    const yOffset = (boxH - canvas.height) / 2;

    const pixels = [];

    for (let i = 0; i < totalPixels; i++) {

        const div = document.createElement("div");
        div.style.position = "absolute";
        div.style.width = pixelSize + "px";
        div.style.height = pixelSize + "px";
        div.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];

        // spawn from wall
        const side = Math.floor(Math.random()*4);
        let sx, sy;

        if (side === 0) { sx = 0; sy = Math.random()*boxH; }
        if (side === 1) { sx = boxW; sy = Math.random()*boxH; }
        if (side === 2) { sx = Math.random()*boxW; sy = 0; }
        if (side === 3) { sx = Math.random()*boxW; sy = boxH; }

        const target = points[i % points.length];

        const tx = target.x + xOffset;
        const ty = target.y + yOffset;

        div.startX = sx;
        div.startY = sy;
        div.targetX = tx;
        div.targetY = ty;

        div.style.left = sx + "px";
        div.style.top = sy + "px";

        box.appendChild(div);
        pixels.push(div);
    }

    const startTime = performance.now();

    function animate(now) {

        const elapsed = now - startTime;
        const t = Math.min(elapsed / TOTAL_TIME, 1);

        // smooth cubic ease-out
        const ease = 1 - Math.pow(1 - t, 3);

        pixels.forEach(p => {
            const nx = p.startX + (p.targetX - p.startX) * ease;
            const ny = p.startY + (p.targetY - p.startY) * ease;

            p.style.left = nx + "px";
            p.style.top = ny + "px";
        });

        if (t < 1 && running) {
            animationId = requestAnimationFrame(animate);
        }
    }

    animationId = requestAnimationFrame(animate);
}

function stopAnimation() {
    running = false;
    cancelAnimationFrame(animationId);
    box.innerHTML = "";
    startBtn.textContent = "Start Animation";
}
