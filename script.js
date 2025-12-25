// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
    rows: 3,
    cols: 3,
    totalPieces: 9,
    imageSrc: 'assets/foto_puzzle.jpg'  // CAMBIA ESTO si es necesario
};

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const canvas = document.getElementById('puzzle-canvas');
const ctx = canvas.getContext('2d');
const piecesContainer = document.getElementById('pieces-container');
const canvasOverlay = document.getElementById('canvas-overlay');

// ============================================
// ESTADO DEL JUEGO
// ============================================
const game = {
    pieces: [],
    placedPieces: 0,
    moves: 0,
    startTime: null,
    timerInterval: null,
    image: null,
    pieceWidth: 200,  // FIJO: 600/3 = 200
    pieceHeight: 133  // FIJO: 400/3 ≈ 133
};

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Puzzle Navideño iniciando...');
    initGame();
});

function initGame() {
    // 1. Configurar canvas (tamaño FIJO)
    setupCanvas();
    
    // 2. Iniciar temporizador
    startTimer();
    
    // 3. Cargar imagen
    loadImage();
    
    // 4. Configurar eventos DEL CANVAS (IMPORTANTE)
    setupCanvasEvents();
    
    // 5. Configurar botones
    setupButtons();
    
    console.log('✅ Juego inicializado');
}

// ============================================
// 1. CONFIGURAR CANVAS
// ============================================
function setupCanvas() {
    // Tamaño FIJO del canvas
    canvas.width = 600;
    canvas.height = 400;
    
    // Dibujar cuadrícula inicial
    drawGrid();
    
    console.log('📐 Canvas:', canvas.width, 'x', canvas.height);
    console.log('📏 Pieza:', game.pieceWidth, 'x', game.pieceHeight);
}

function drawGrid() {
    // Fondo
    ctx.fillStyle = 'rgba(0, 40, 70, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Líneas de cuadrícula
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    
    // Verticales
    for (let i = 1; i < CONFIG.cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * game.pieceWidth, 0);
        ctx.lineTo(i * game.pieceWidth, canvas.height);
        ctx.stroke();
    }
    
    // Horizontales
    for (let i = 1; i < CONFIG.rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * game.pieceHeight);
        ctx.lineTo(canvas.width, i * game.pieceHeight);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
}

// ============================================
// 2. TEMPORIZADOR
// ============================================
function startTimer() {
    game.startTime = new Date();
    game.timerInterval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - game.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('time').textContent = `${minutes}:${seconds}`;
    }, 1000);
}

// ============================================
// 3. CARGAR IMAGEN Y CREAR PIEZAS
// ============================================
function loadImage() {
    console.log('🖼️ Cargando imagen desde:', CONFIG.imageSrc);
    
    showLoadingMessage();
    
    const img = new Image();
    
    img.onload = function() {
        console.log(`✅ Imagen cargada: ${this.width}x${this.height}`);
        game.image = this;
        
        // Ocultar overlay
        hideLoadingMessage();
        
        // Crear piezas
        createPuzzlePieces();
    };
    
    img.onerror = function() {
        console.error('❌ Error cargando imagen. Creando imagen de respaldo...');
        createFallbackImage();
    };
    
    img.src = CONFIG.imageSrc;
}

function showLoadingMessage() {
    if (canvasOverlay) {
        canvasOverlay.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="width: 50px; height: 50px; border: 4px solid #2dd4bf; border-top: 4px solid transparent; border-radius: 50%; margin: 0 auto 20px; animation: spin 1s linear infinite;"></div>
                <p style="color: #2dd4bf; font-size: 1.2rem;">Cargando puzzle...</p>
            </div>
        `;
        canvasOverlay.style.display = 'flex';
        canvasOverlay.style.opacity = '1';
    }
}

function hideLoadingMessage() {
    if (canvasOverlay) {
        canvasOverlay.style.opacity = '0';
        setTimeout(() => {
            canvasOverlay.style.display = 'none';
        }, 300);
    }
}

function createFallbackImage() {
    console.log('🎨 Creando imagen de respaldo...');
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 800;
    tempCanvas.height = 600;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Fondo
    const gradient = tempCtx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#0a2e38');
    gradient.addColorStop(1, '#1a5f7a');
    tempCtx.fillStyle = gradient;
    tempCtx.fillRect(0, 0, 800, 600);
    
    // Árbol de navidad
    tempCtx.fillStyle = '#10b981';
    tempCtx.beginPath();
    tempCtx.moveTo(400, 100);
    tempCtx.lineTo(280, 500);
    tempCtx.lineTo(520, 500);
    tempCtx.closePath();
    tempCtx.fill();
    
    // Tronco
    tempCtx.fillStyle = '#92400e';
    tempCtx.fillRect(380, 500, 40, 50);
    
    // Decoraciones
    const balls = [
        {x: 400, y: 150, color: '#ef4444', size: 15},
        {x: 340, y: 220, color: '#fbbf24', size: 12},
        {x: 460, y: 220, color: '#3b82f6', size: 12},
        {x: 370, y: 320, color: '#8b5cf6', size: 14},
        {x: 430, y: 320, color: '#ec4899', size: 14},
        {x: 400, y: 400, color: '#10b981', size: 16}
    ];
    
    balls.forEach(ball => {
        tempCtx.fillStyle = ball.color;
        tempCtx.beginPath();
        tempCtx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
        tempCtx.fill();
    });
    
    // Estrella
    tempCtx.fillStyle = '#fbbf24';
    tempCtx.beginPath();
    tempCtx.arc(400, 80, 20, 0, Math.PI * 2);
    tempCtx.fill();
    
    // Texto
    tempCtx.fillStyle = 'white';
    tempCtx.font = 'bold 36px Arial';
    tempCtx.textAlign = 'center';
    tempCtx.fillText('🎄 ¡Feliz Navidad! 🎄', 400, 580);
    
    // Crear imagen
    const fallbackImg = new Image();
    fallbackImg.onload = function() {
        game.image = this;
        hideLoadingMessage();
        createPuzzlePieces();
    };
    fallbackImg.src = tempCanvas.toDataURL();
}

function createPuzzlePieces() {
    console.log('🧩 Creando piezas del puzzle...');
    
    // Limpiar contenedor
    piecesContainer.innerHTML = '';
    game.pieces = [];
    game.placedPieces = 0;
    game.moves = 0;
    
    // Tamaño para las piezas en el DOM
    const pieceSize = 120; // px
    
    // Crear cada pieza
    for (let row = 0; row < CONFIG.rows; row++) {
        for (let col = 0; col < CONFIG.cols; col++) {
            const pieceId = row * CONFIG.cols + col;
            
            // Crear elemento div para la pieza
            const pieceElement = document.createElement('div');
            pieceElement.className = 'piece';
            pieceElement.dataset.id = pieceId;
            pieceElement.dataset.row = row;
            pieceElement.dataset.col = col;
            
            // Tamaño fijo
            pieceElement.style.width = `${pieceSize}px`;
            pieceElement.style.height = `${pieceSize}px`;
            
            // Crear canvas para esta pieza
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = pieceSize;
            pieceCanvas.height = pieceSize;
            const pieceCtx = pieceCanvas.getContext('2d');
            
            // Calcular qué parte de la imagen original usar
            const srcPieceWidth = game.image.width / CONFIG.cols;
            const srcPieceHeight = game.image.height / CONFIG.rows;
            const srcX = col * srcPieceWidth;
            const srcY = row * srcPieceHeight;
            
            // Dibujar la sección correspondiente
            pieceCtx.drawImage(
                game.image,
                srcX, srcY, srcPieceWidth, srcPieceHeight,
                0, 0, pieceSize, pieceSize
            );
            
            // Añadir borde para mejor visibilidad
            pieceCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            pieceCtx.lineWidth = 2;
            pieceCtx.strokeRect(0, 0, pieceSize, pieceSize);
            
            // Usar el canvas como imagen de fondo
            pieceElement.style.backgroundImage = `url(${pieceCanvas.toDataURL()})`;
            pieceElement.style.backgroundSize = 'cover';
            
            // Configurar eventos de arrastre
            setupDragEvents(pieceElement, pieceId);
            
            // Guardar información de la pieza
            game.pieces.push({
                id: pieceId,
                element: pieceElement,
                correctRow: row,
                correctCol: col,
                placed: false,
                row: null,
                col: null
            });
            
            piecesContainer.appendChild(pieceElement);
        }
    }
    
    // Mezclar piezas
    shufflePieces();
    
    // Actualizar displays
    updateProgress();
    document.getElementById('moves').textContent = '0';
    
    console.log(`✅ ${CONFIG.totalPieces} piezas creadas y mezcladas`);
}

function setupDragEvents(element, pieceId) {
    element.setAttribute('draggable', 'true');
    
    element.addEventListener('dragstart', function(e) {
        if (this.classList.contains('placed')) return;
        
        playSound('drag');
        this.classList.add('dragging');
        e.dataTransfer.setData('text/plain', pieceId.toString());
        e.dataTransfer.effectAllowed = 'move';
        
        // DEBUG
        console.log(`📤 Iniciando arrastre de pieza ${pieceId}`);
        
        // Crear imagen fantasma para arrastrar
        const dragImg = this.cloneNode(true);
        dragImg.style.position = 'fixed';
        dragImg.style.top = '-1000px';
        document.body.appendChild(dragImg);
        e.dataTransfer.setDragImage(dragImg, 60, 60); // Mitad del tamaño (120/2)
        
        setTimeout(() => dragImg.remove(), 0);
    });
    
    element.addEventListener('dragend', function() {
        this.classList.remove('dragging');
        console.log(`📥 Fin de arrastre`);
    });
}

function shufflePieces() {
    const pieceElements = Array.from(piecesContainer.children);
    
    // Algoritmo de Fisher-Yates para mezclar
    for (let i = pieceElements.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        piecesContainer.appendChild(pieceElements[j]);
    }
}

// ============================================
// 4. EVENTOS DEL CANVAS (¡CORREGIDO!)
// ============================================
function setupCanvasEvents() {
    console.log('🔧 Configurando eventos del canvas...');
    
    // Permitir soltar en el canvas
    canvas.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // DEBUG: Mostrar coordenadas
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Cambiar color del borde para feedback
        this.style.borderColor = '#fbbf24';
    });
    
    canvas.addEventListener('dragleave', function() {
        this.style.borderColor = '#2dd4bf';
    });
    
    canvas.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#2dd4bf';
        
        // Obtener ID de la pieza arrastrada
        const pieceId = parseInt(e.dataTransfer.getData('text/plain'));
        console.log(`🎯 Pieza soltada: ${pieceId}`);
        
        // Calcular posición RELATIVA dentro del canvas
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // DEBUG: Mostrar coordenadas exactas
        console.log(`📍 Coordenadas: X=${x.toFixed(1)}, Y=${y.toFixed(1)}`);
        console.log(`📏 Tamaño celda: ${game.pieceWidth}x${game.pieceHeight}`);
        
        // Calcular fila y columna (¡ESTO ES LO IMPORTANTE!)
        const col = Math.floor(x / game.pieceWidth);
        const row = Math.floor(y / game.pieceHeight);
        
        console.log(`🎯 Celda calculada: Fila=${row}, Columna=${col}`);
        
        // Verificar límites
        if (col < 0 || col >= CONFIG.cols || row < 0 || row >= CONFIG.rows) {
            console.log('❌ Fuera de los límites del puzzle');
            playSound('wrong');
            showErrorEffect();
            return;
        }
        
        // Encontrar la pieza en el estado del juego
        const piece = game.pieces.find(p => p.id === pieceId);
        if (!piece) {
            console.log('❌ Pieza no encontrada');
            return;
        }
        
        if (piece.placed) {
            console.log('❌ Pieza ya colocada');
            return;
        }
        
        // Verificar si la posición es correcta
        const isCorrect = (piece.correctRow === row && piece.correctCol === col);
        
        // DEBUG
        console.log(`🔍 Verificación: Correcto? ${isCorrect}`);
        console.log(`   Posición correcta: [${piece.correctRow},${piece.correctCol}]`);
        console.log(`   Posición soltada: [${row},${col}]`);
        
        if (isCorrect) {
            // ¡CORRECTO! Colocar la pieza
            placePiece(piece, row, col);
            playSound('correct');
        } else {
            // Incorrecto
            console.log('❌ Posición incorrecta');
            playSound('wrong');
            game.moves++;
            document.getElementById('moves').textContent = game.moves;
            showErrorEffect();
        }
    });
}

function placePiece(piece, row, col) {
    console.log(`✅ Colocando pieza ${piece.id} en [${row},${col}]`);
    
    // Marcar pieza como colocada
    piece.placed = true;
    piece.row = row;
    piece.col = col;
    piece.element.classList.add('placed');
    piece.element.style.opacity = '0.3';
    
    // Calcular coordenadas de dibujo en el canvas
    const destX = col * game.pieceWidth;
    const destY = row * game.pieceHeight;
    
    // Calcular qué parte de la imagen original dibujar
    const srcPieceWidth = game.image.width / CONFIG.cols;
    const srcPieceHeight = game.image.height / CONFIG.rows;
    const srcX = piece.correctCol * srcPieceWidth;
    const srcY = piece.correctRow * srcPieceHeight;
    
    // DEBUG
    console.log(`🎨 Dibujando:`);
    console.log(`   Origen: [${srcX},${srcY}] (${srcPieceWidth}x${srcPieceHeight})`);
    console.log(`   Destino: [${destX},${destY}] (${game.pieceWidth}x${game.pieceHeight})`);
    
    // Dibujar la pieza en el canvas principal
    ctx.drawImage(
        game.image,
        srcX, srcY, srcPieceWidth, srcPieceHeight,
        destX, destY, game.pieceWidth, game.pieceHeight
    );
    
    // Actualizar contadores
    game.placedPieces++;
    game.moves++;
    
    updateProgress();
    document.getElementById('moves').textContent = game.moves;
    
    // Mostrar efecto visual
    showSuccessEffect();
    
    // Verificar si se completó el puzzle
    if (game.placedPieces === CONFIG.totalPieces) {
        console.log('🎉 ¡PUZZLE COMPLETADO!');
        setTimeout(completeGame, 1000);
    }
}

// ============================================
// 5. BOTONES Y CONTROLES
// ============================================
function setupButtons() {
    console.log('🔧 Configurando botones...');
    
    // Botón de reinicio
    document.getElementById('reset-btn').addEventListener('click', function() {
        playSound('click');
        if (confirm('¿Reiniciar el puzzle? Se perderá el progreso.')) {
            resetGame();
        }
    });
    
    // Botón de ayuda
    document.getElementById('hint-btn').addEventListener('click', function() {
        playSound('click');
        showHint();
    });
    
    // Botón de sonido
    document.getElementById('sound-btn').addEventListener('click', toggleSound);
    
    // Modal: Cerrar
    document.querySelector('.close-btn').addEventListener('click', closeModal);
    
    // Modal: Reproducir video
    document.getElementById('replay-btn').addEventListener('click', function() {
        playSound('click');
        replayVideo();
    });
    
    // Modal: Nuevo juego
    document.getElementById('new-game-btn').addEventListener('click', function() {
        playSound('click');
        newGame();
    });
}

function showHint() {
    // Encontrar piezas no colocadas
    const unplacedPieces = game.pieces.filter(p => !p.placed);
    if (unplacedPieces.length === 0) {
        console.log('ℹ️ Todas las piezas están colocadas');
        return;
    }
    
    // Seleccionar una pieza aleatoria
    const randomPiece = unplacedPieces[Math.floor(Math.random() * unplacedPieces.length)];
    
    console.log(`💡 Pista: Resaltando pieza ${randomPiece.id}`);
    
    // Resaltar la pieza
    randomPiece.element.style.boxShadow = '0 0 0 3px #fbbf24';
    randomPiece.element.style.transform = 'scale(1.1)';
    
    // Animación de pulso
    const animation = randomPiece.element.animate([
        { transform: 'scale(1.1)' },
        { transform: 'scale(1.2)' },
        { transform: 'scale(1.1)' }
    ], {
        duration: 500,
        iterations: 3
    });
    
    // Quitar el resaltado después de la animación
    animation.onfinish = () => {
        randomPiece.element.style.boxShadow = '';
        randomPiece.element.style.transform = '';
    };
}

let soundEnabled = true;

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('sound-btn');
    const icon = btn.querySelector('i');
    
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
        btn.title = 'Silenciar';
        console.log('🔊 Sonido activado');
    } else {
        icon.className = 'fas fa-volume-mute';
        btn.title = 'Activar sonido';
        console.log('🔇 Sonido desactivado');
    }
}

// ============================================
// 6. AUDIO Y EFECTOS VISUALES
// ============================================
function playSound(type) {
    if (!soundEnabled) return;
    
    try {
        let soundUrl;
        switch(type) {
            case 'correct':
                soundUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3';
                break;
            case 'wrong':
                soundUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3';
                break;
            case 'drag':
                soundUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-plastic-bubble-click-1124.mp3';
                break;
            case 'click':
                soundUrl = 'https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3';
                break;
            default:
                return;
        }
        
        const audio = new Audio(soundUrl);
        audio.volume = 0.5;
        audio.play().catch(e => {
            // Ignorar errores de autoplay (normales en algunos navegadores)
            console.log('Audio bloqueado (normal en algunos casos)');
        });
    } catch (error) {
        console.log('Error con audio:', error);
    }
}

function showSuccessEffect() {
    canvas.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
    canvas.style.borderColor = '#10b981';
    
    setTimeout(() => {
        canvas.style.boxShadow = '';
        canvas.style.borderColor = '#2dd4bf';
    }, 800);
}

function showErrorEffect() {
    canvas.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5)';
    canvas.style.borderColor = '#ef4444';
    
    // Animación de vibración
    canvas.animate([
        { transform: 'translateX(0)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(0)' }
    ], {
        duration: 300,
        easing: 'ease-in-out'
    });
    
    setTimeout(() => {
        canvas.style.boxShadow = '';
        canvas.style.borderColor = '#2dd4bf';
    }, 500);
}

// ============================================
// 7. FUNCIONES AUXILIARES
// ============================================
function updateProgress() {
    document.getElementById('progress').textContent = 
        `${game.placedPieces}/${CONFIG.totalPieces}`;
}

function resetGame() {
    console.log('🔄 Reiniciando juego...');
    
    // Detener temporizador
    clearInterval(game.timerInterval);
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    
    // Resetear estado del juego
    game.placedPieces = 0;
    game.moves = 0;
    
    // Resetear contadores
    document.getElementById('time').textContent = '00:00';
    document.getElementById('moves').textContent = '0';
    updateProgress();
    
    // Reiniciar temporizador
    game.startTime = new Date();
    startTimer();
    
    // Recrear piezas (si hay imagen cargada)
    if (game.image) {
        createPuzzlePieces();
    }
    
    console.log('✅ Juego reiniciado');
}

function completeGame() {
    console.log('🏆 Completando juego...');
    
    // Detener temporizador
    clearInterval(game.timerInterval);
    
    // Mostrar modal con estadísticas
    const modal = document.getElementById('video-modal');
    const finalTime = document.getElementById('final-time');
    const finalMoves = document.getElementById('final-moves');
    
    if (modal && finalTime && finalMoves) {
        finalTime.textContent = document.getElementById('time').textContent;
        finalMoves.textContent = game.moves;
        modal.style.display = 'flex';
        
        // Intentar reproducir el video
        const video = document.getElementById('surprise-video');
        if (video) {
            video.play().catch(e => {
                console.log('Autoplay de video bloqueado (normal en algunos navegadores)');
            });
        }
    }
    
    // Reproducir sonido de victoria
    playSound('correct');
}

function closeModal() {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('surprise-video');
    
    if (modal) {
        modal.style.display = 'none';
    }
    
    if (video) {
        video.pause();
        video.currentTime = 0;
    }
}

function replayVideo() {
    const video = document.getElementById('surprise-video');
    if (video) {
        video.currentTime = 0;
        video.play();
    }
}

function newGame() {
    closeModal();
    resetGame();
}

// ============================================
// 8. FUNCIONES DE DEPURACIÓN (opcional)
// ============================================
window.debugGame = {
    printState: function() {
        console.log('=== ESTADO DEL JUEGO ===');
        console.log('Piezas colocadas:', game.placedPieces, '/', CONFIG.totalPieces);
        console.log('Movimientos:', game.moves);
        console.log('Tiempo:', document.getElementById('time').textContent);
        console.log('Imagen cargada:', game.image ? 'Sí' : 'No');
        if (game.image) {
            console.log('Tamaño imagen:', game.image.width, 'x', game.image.height);
        }
    },
    
    printPieces: function() {
        console.log('=== PIEZAS ===');
        game.pieces.forEach(piece => {
            console.log(`Pieza ${piece.id}:`, {
                correctPosition: `[${piece.correctRow},${piece.correctCol}]`,
                placed: piece.placed,
                currentPosition: piece.placed ? `[${piece.row},${piece.col}]` : 'No colocada'
            });
        });
    },
    
    testDrop: function(x, y) {
        // Función para probar coordenadas
        const col = Math.floor(x / game.pieceWidth);
        const row = Math.floor(y / game.pieceHeight);
        console.log(`Prueba drop en X=${x}, Y=${y}:`);
        console.log(`  Celda calculada: [${row},${col}]`);
        console.log(`  Válida?: ${col >= 0 && col < CONFIG.cols && row >= 0 && row < CONFIG.rows}`);
    }
};

console.log('✅ script.js cargado completamente');