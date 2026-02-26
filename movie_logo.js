const startBtn = document.getElementById('startBtn');
const box = document.getElementById('animationBox');

let squares = [];
let animationId = null;
let running = false;

const pixelSize = 4;
const totalSquares = 1000;

// Precompute color shades: 20 shades from red → orange → black/gray
const colors = [];
for (let i = 0; i < 5; i++) colors.push(`rgb(${200+i*10},0,0)`);        // red
for (let i = 0; i < 5; i++) colors.push(`rgb(${255},${50+i*10},0)`);     // orange
for (let i = 0; i < 5; i++) colors.push(`rgb(${50+i*20},${50+i*20},${50+i*20})`); // gray
for (let i = 0; i < 5; i++) colors.push(`rgb(0,0,0)`);                  // black

startBtn.addEventListener('click', () => {
    if (!running) {
        startBtn.textContent = "Stop Animation";
        running = true;
        startAnimation();
    } else {
        startBtn.textContent = "Start Animation";
        running = false;
        stopAnimation();
    }
});

function createSquares() {
    const boxWidth = box.clientWidth;
    const boxHeight = box.clientHeight;

    // Remove existing squares
    box.innerHTML = '';
    squares = [];

    // Create 1000 squares
    for (let i = 0; i < totalSquares; i++) {
        const square = document.createElement('div');
        square.style.width = pixelSize + 'px';
        square.style.height = pixelSize + 'px';
        square.style.position = 'absolute';
        square.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];

        square.x = Math.random() * (boxWidth - pixelSize);
        square.y = Math.random() * (boxHeight - pixelSize);
        square.vx = (Math.random() - 0.5) * 3;
        square.vy = (Math.random() - 0.5) * 3;

        box.appendChild(square);
        squares.push(square);
    }
}

function startAnimation() {
    createSquares();

    // Compute target pixels for "RONNIE" using small canvas
    const canvas = document.createElement('canvas');
    const cols = 100, rows = 40;
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.font = 'bold 20px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText("RONNIE", 2, 2);

    const data = ctx.getImageData(0,0,cols,rows).data;
    const targets = [];
    for (let y=0; y<rows; y++){
        for (let x=0; x<cols; x++){
            const idx = (y*cols+x)*4;
            if (data[idx+3]>128) targets.push({x:x*pixelSize*1.5, y:y*pixelSize*1.5}); // stretch for rectangle
        }
    }

    const startTime = performance.now();
    const duration = 8000; // 8 seconds to form letters

    function animate() {
        const now = performance.now();
        const elapsed = now - startTime;
        const attractionStrength = Math.min(elapsed/duration,1); // 0 → 1 over 8s

        const boxWidth = box.clientWidth;
        const boxHeight = box.clientHeight;

        for (let i=0; i<squares.length; i++){
            const sq = squares[i];

            // Move square
            sq.x += sq.vx;
            sq.y += sq.vy;

            // Bounce walls
            if (sq.x < 0 || sq.x > boxWidth-pixelSize) sq.vx *= -1;
            if (sq.y < 0 || sq.y > boxHeight-pixelSize) sq.vy *= -1;

            // Attraction toward target during formation
            if (targets[i % targets.length]){
                const t = targets[i % targets.length];
                sq.vx += (t.x - sq.x) * 0.02 * attractionStrength;
                sq.vy += (t.y - sq.y) * 0.02 * attractionStrength;
            }

            sq.style.left = sq.x + 'px';
            sq.style.top = sq.y + 'px';
        }

        if (running) animationId = requestAnimationFrame(animate);
    }

    animate();
}

function stopAnimation(){
    cancelAnimationFrame(animationId);
    animationId = null;
}
