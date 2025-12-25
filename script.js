const CONFIG = {
    rows: 3,
    cols: 3,
    totalPieces: 9,
    imageSrc: 'assets/foto_puzzle.jpg' 
};

const canvas = document.getElementById('puzzle-canvas');
const ctx = canvas.getContext('2d');
const piecesContainer = document.getElementById('pieces-container');
const canvasOverlay = document.getElementById('canvas-overlay');

const game = {
    pieces: [],
    placedPieces: 0,
    moves: 0,
    startTime: null,
    timerInterval: null,
    image: null,
    pieceWidth: 200, 
    pieceHeight: 133 
};

document.addEventListener('DOMContentLoaded', () => initGame());

function initGame() {
    setupCanvas();
    startTimer();
    loadImage();
    setupCanvasEvents();
    setupButtons();
}

function setupCanvas() {
    canvas.width = 600;
    canvas.height = 400;
    drawGrid();
}

function drawGrid() {
    ctx.fillStyle = 'rgba(0, 40, 70, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
    ctx.setLineDash([5, 3]);
    for (let i = 1; i < CONFIG.cols; i++) {
        ctx.beginPath(); ctx.moveTo(i * game.pieceWidth, 0); ctx.lineTo(i * game.pieceWidth, canvas.height); ctx.stroke();
    }
    for (let i = 1; i < CONFIG.rows; i++) {
        ctx.beginPath(); ctx.moveTo(0, i * game.pieceHeight); ctx.lineTo(canvas.width, i * game.pieceHeight); ctx.stroke();
    }
    ctx.setLineDash([]);
}

function startTimer() {
    game.startTime = new Date();
    game.timerInterval = setInterval(() => {
        const elapsed = Math.floor((new Date() - game.startTime) / 1000);
        const min = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const sec = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('time').textContent = `${min}:${sec}`;
    }, 1000);
}

function loadImage() {
    const img = new Image();
    img.onload = () => { game.image = img; createPuzzlePieces(); };
    img.src = CONFIG.imageSrc;
}

function createPuzzlePieces() {
    piecesContainer.innerHTML = '';
    game.pieces = [];
    const pieceSize = 120;
    for (let r = 0; r < CONFIG.rows; r++) {
        for (let c = 0; c < CONFIG.cols; c++) {
            const id = r * CONFIG.cols + c;
            const piece = document.createElement('div');
            piece.className = 'piece';
            piece.style.width = piece.style.height = `${pieceSize}px`;
            
            const pCanvas = document.createElement('canvas');
            pCanvas.width = pCanvas.height = pieceSize;
            const pCtx = pCanvas.getContext('2d');
            pCtx.drawImage(game.image, c*(game.image.width/3), r*(game.image.height/3), game.image.width/3, game.image.height/3, 0, 0, pieceSize, pieceSize);
            
            piece.style.backgroundImage = `url(${pCanvas.toDataURL()})`;
            piece.style.backgroundSize = 'cover';
            piece.setAttribute('draggable', 'true');
            piece.dataset.id = id;
            
            piece.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text', id);
                piece.classList.add('dragging');
            });
            piece.addEventListener('dragend', () => piece.classList.remove('dragging'));
            
            game.pieces.push({ id, correctRow: r, correctCol: c, placed: false, element: piece });
            piecesContainer.appendChild(piece);
        }
        shufflePieces();
    }
}

function shufflePieces() {
    for (let i = piecesContainer.children.length; i >= 0; i--) {
        piecesContainer.appendChild(piecesContainer.children[Math.random() * i | 0]);
    }
}

function setupCanvasEvents() {
    canvas.addEventListener('dragover', (e) => e.preventDefault());
    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const id = parseInt(e.dataTransfer.getData('text'));
        const rect = canvas.getBoundingClientRect();
        const col = Math.floor((e.clientX - rect.left) / game.pieceWidth);
        const row = Math.floor((e.clientY - rect.top) / game.pieceHeight);
        
        const p = game.pieces.find(p => p.id === id);
        if (p && !p.placed && p.correctRow === row && p.correctCol === col) {
            placePiece(p, row, col);
        } else {
            game.moves++;
            document.getElementById('moves').textContent = game.moves;
        }
    });
}

function placePiece(p, row, col) {
    p.placed = true;
    p.element.classList.add('placed');
    p.element.style.visibility = 'hidden';
    ctx.drawImage(game.image, col*(game.image.width/3), row*(game.image.height/3), game.image.width/3, game.image.height/3, col*game.pieceWidth, row*game.pieceHeight, game.pieceWidth, game.pieceHeight);
    
    game.placedPieces++;
    game.moves++;
    document.getElementById('progress').textContent = `${game.placedPieces}/9`;
    document.getElementById('moves').textContent = game.moves;

    if (game.placedPieces === 9) setTimeout(completeGame, 500);
}

// FUNCIÓN DE VIDEO CORREGIDA PARA GITHUB
function completeGame() {
    clearInterval(game.timerInterval);
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('surprise-video');
    
    document.getElementById('final-time').textContent = document.getElementById('time').textContent;
    document.getElementById('final-moves').textContent = game.moves;
    
    modal.style.display = 'flex';
    
    if (video) {
        video.muted = true; // Asegura silencio para autoplay
        video.load();
        video.play().catch(error => console.log("Reproducción manual requerida"));
    }
}

function setupButtons() {
    document.getElementById('reset-btn').addEventListener('click', () => location.reload());
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('video-modal').style.display = 'none';
        document.getElementById('surprise-video').pause();
    });
    document.getElementById('new-game-btn').addEventListener('click', () => location.reload());
    document.getElementById('replay-btn').addEventListener('click', () => {
        const v = document.getElementById('surprise-video');
        v.currentTime = 0;
        v.play();
    });
}
