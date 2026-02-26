const startBtn = document.getElementById('startBtn');
const box = document.getElementById('animationBox');

let squares = [];
let animationId = null;
let running = false;
let converged = false;

const pixelSize = 4;
const totalSquares = 1000;

// 20 shades: red → orange → black/gray
const colors = [];
for (let i=0;i<5;i++) colors.push(`rgb(${200+i*10},0,0)`);           // reds
for (let i=0;i<5;i++) colors.push(`rgb(255,${50+i*10},0)`);          // oranges
for (let i=0;i<5;i++) colors.push(`rgb(${50+i*20},${50+i*20},${50+i*20})`); // grays
for (let i=0;i<5;i++) colors.push(`rgb(0,0,0)`);                     // black

startBtn.addEventListener('click', () => {
    if (!running) {
        startBtn.textContent = "Stop Animation";
        running = true;
        startAnimation();
    } else {
        running = false;
        stopAnimation();
    }
});

function createSquares(targets){
    const boxWidth = box.clientWidth;
    const boxHeight = box.clientHeight;

    box.innerHTML = '';
    squares = [];

    for(let i=0;i<totalSquares;i++){
        const square = document.createElement('div');
        square.style.width = pixelSize+'px';
        square.style.height = pixelSize+'px';
        square.style.position='absolute';
        square.style.backgroundColor=colors[Math.floor(Math.random()*colors.length)];

        // start along walls
        const side = Math.floor(Math.random()*4);
        if(side===0){ square.x = 0; square.y = Math.random()*boxHeight; }
        if(side===1){ square.x = boxWidth-pixelSize; square.y = Math.random()*boxHeight; }
        if(side===2){ square.x = Math.random()*boxWidth; square.y = 0; }
        if(side===3){ square.x = Math.random()*boxWidth; square.y = boxHeight-pixelSize; }

        // initial velocity
        square.vx = (Math.random()-0.5)*4;
        square.vy = (Math.random()-0.5)*4;

        square.target = targets[i % targets.length];
        square.arrived = false;

        box.appendChild(square);
        squares.push(square);
    }
}

function startAnimation(){
    // Hidden canvas to extract exact font pixels
    const cols = 200, rows = 80;
    const canvas = document.createElement('canvas');
    canvas.width=cols; canvas.height=rows;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle='black';
    ctx.font='bold 60px GateKeeperAOE';
    ctx.textBaseline='top';
    ctx.fillText('RONNIE', 0,0);

    const data = ctx.getImageData(0,0,cols,rows).data;
    const targets = [];

    for(let y=0;y<rows;y++){
        for(let x=0;x<cols;x++){
            const idx=(y*cols+x)*4;
            if(data[idx+3]>128){ // opaque pixel
                targets.push({x: x*4, y: y*4});
            }
        }
    }

    createSquares(targets);

    const startTime = performance.now();
    const duration = 5000; // 5 sec for convergence

    function animate(){
        const now = performance.now();
        const elapsed = now-startTime;
        const attraction = Math.min(elapsed/duration,1);

        const boxWidth = box.clientWidth;
        const boxHeight = box.clientHeight;

        let allArrived = true;

        for(let sq of squares){
            if(!sq.arrived){
                allArrived=false;

                // attraction to target
                const dx = sq.target.x - sq.x;
                const dy = sq.target.y - sq.y;

                sq.vx += dx*0.03*attraction;
                sq.vy += dy*0.03*attraction;

                // move
                sq.x += sq.vx;
                sq.y += sq.vy;

                // bounce inside box
                if(sq.x < 0){ sq.x=0; sq.vx*=-1; }
                if(sq.x > boxWidth-pixelSize){ sq.x=boxWidth-pixelSize; sq.vx*=-1; }
                if(sq.y < 0){ sq.y=0; sq.vy*=-1; }
                if(sq.y > boxHeight-pixelSize){ sq.y=boxHeight-pixelSize; sq.vy*=-1; }

                // check if close enough to target
                if(Math.abs(dx)<1 && Math.abs(dy)<1){
                    sq.x = sq.target.x;
                    sq.y = sq.target.y;
                    sq.arrived=true;
                    sq.vx=0;
                    sq.vy=0;
                }

                sq.style.left = sq.x+'px';
                sq.style.top = sq.y+'px';
            }
        }

        if(running && !allArrived) animationId=requestAnimationFrame(animate);
    }

    animate();
}

function stopAnimation(){
    cancelAnimationFrame(animationId);
    animationId=null;
    box.innerHTML='';
    startBtn.textContent='Start Animation';
    running=false;
}
