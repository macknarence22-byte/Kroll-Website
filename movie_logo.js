const startBtn = document.getElementById('startBtn');
const box = document.getElementById('animationBox');

startBtn.addEventListener('click', () => {
    startBtn.disabled = true; // prevent multiple clicks
    createAnimation();
});

function createAnimation() {
    const letters = "RONNIE";
    const pixelSize = 6;
    const columns = 50;
    const rows = 25;

    const boxWidth = box.clientWidth;
    const boxHeight = box.clientHeight;

    // Map to store target pixels for "Ronnie"
    const targets = [];

    // Simple method: draw letters as pixels on canvas (grid)
    const canvas = document.createElement('canvas');
    canvas.width = columns;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.font = 'bold 20px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText("RONNIE", 2, 2);

    const imageData = ctx.getImageData(0, 0, columns, rows).data;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const idx = (y * columns + x) * 4;
            const alpha = imageData[idx + 3];
            if (alpha > 128) {
                targets.push({x: x * pixelSize, y: y * pixelSize});
            }
        }
    }

    // Create moving squares
    const squares = [];
    const totalSquares = 200;

    for (let i = 0; i < totalSquares; i++) {
        const square = document.createElement('div');
        square.style.width = pixelSize + 'px';
        square.style.height = pixelSize + 'px';
        square.style.position = 'absolute';
        square.style.backgroundColor = Math.random() > 0.5 ? 'red' : 'black';

        square.x = Math.random() * (boxWidth - pixelSize);
        square.y = Math.random() * (boxHeight - pixelSize);
        square.vx = (Math.random() - 0.5) * 4;
        square.vy = (Math.random() - 0.5) * 4;
        square.target = targets[i % targets.length];

        box.appendChild(square);
        squares.push(square);
    }

    function animate() {
        let allSettled = true;
        for (let sq of squares) {
            if (!sq.settled) {
                allSettled = false;

                sq.x += sq.vx;
                sq.y += sq.vy;

                // bounce off edges
                if (sq.x < 0 || sq.x > boxWidth - pixelSize) sq.vx *= -1;
                if (sq.y < 0 || sq.y > boxHeight - pixelSize) sq.vy *= -1;

                // move gradually toward target
                const dx = sq.target.x - sq.x;
                const dy = sq.target.y - sq.y;
                sq.vx += dx * 0.01;
                sq.vy += dy * 0.01;

                // stop near target
                if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
                    sq.settled = true;
                    sq.style.left = sq.target.x + 'px';
                    sq.style.top = sq.target.y + 'px';
                    continue;
                }

                sq.style.left = sq.x + 'px';
                sq.style.top = sq.y + 'px';
            }
        }

        if (!allSettled) requestAnimationFrame(animate);
    }

    animate();
}
