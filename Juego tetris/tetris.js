const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 40; // Tamaño de cada bloque en píxeles
let TICK_INTERVAL = 500; // Tiempo en ms para actualizar el juego
let level = 1;
let score = 0;
let gameInterval;
let isGameRunning = false;

const tetrominoes = [
    { shape: [[1, 1, 1, 1]], color: '#00f' }, // I
    { shape: [[1, 1], [1, 1]], color: '#ff0' }, // O
    { shape: [[0, 1, 1], [1, 1, 0]], color: '#0f0' }, // S
    { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00' }, // Z
    { shape: [[1, 0, 0], [1, 1, 1]], color: '#f90' }, // L
    { shape: [[0, 0, 1], [1, 1, 1]], color: '#00f' }, // J
    { shape: [[0, 1, 0], [1, 1, 1]], color: '#f0f' } // T
];

let board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
let currentPiece;
let currentX;
let currentY;

document.getElementById('start-button').addEventListener('click', startGame);

function startGame() {
    board = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
    level = 1;
    score = 0;
    TICK_INTERVAL = 500;
    document.getElementById('level').textContent = `Nivel: ${level}`;
    document.getElementById('score').textContent = `Puntuación: ${score}`;
    currentPiece = getRandomPiece();
    currentX = Math.floor(COLUMNS / 2) - 1;
    currentY = 0;
    isGameRunning = true;
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    gameInterval = setInterval(update, TICK_INTERVAL);
}

function getRandomPiece() {
    return tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
}

function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLUMNS; x++) {
            if (board[y][x]) {
                context.fillStyle = '#fff';
                context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeStyle = '#333';
                context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function drawPiece() {
    const piece = currentPiece.shape;
    context.fillStyle = currentPiece.color;
    context.strokeStyle = '#333';
    context.lineWidth = 2;
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
                context.fillRect((currentX + x) * BLOCK_SIZE, (currentY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                context.strokeRect((currentX + x) * BLOCK_SIZE, (currentY + y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
}

function movePiece(dx, dy) {
    currentX += dx;
    currentY += dy;
    if (collides()) {
        currentX -= dx;
        currentY -= dy;
        return false;
    }
    return true;
}

function collides() {
    const piece = currentPiece.shape;
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
                const boardX = currentX + x;
                const boardY = currentY + y;
                if (boardX < 0 || boardX >= COLUMNS || boardY >= ROWS || board[boardY][boardX]) {
                    return true;
                }
            }
        }
    }
    return false;
}

function rotatePiece() {
    const piece = currentPiece.shape;
    const rotatedPiece = piece[0].map((_, i) => piece.map(row => row[i])).reverse();
    const tempPiece = currentPiece.shape;
    currentPiece.shape = rotatedPiece;
    if (collides()) {
        currentPiece.shape = tempPiece;
    }
}

function mergePiece() {
    const piece = currentPiece.shape;
    for (let y = 0; y < piece.length; y++) {
        for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
                board[currentY + y][currentX + x] = 1;
            }
        }
    }
}

function clearLines() {
    const linesToClear = board.filter(row => row.every(cell => cell !== 0));
    score += linesToClear.length * 100;
    document.getElementById('score').textContent = `Puntuación: ${score}`;
    board = board.filter(row => !row.every(cell => cell !== 0));
    while (board.length < ROWS) {
        board.unshift(Array(COLUMNS).fill(0));
    }
    if (linesToClear.length > 0) {
        level = Math.floor(score / 1000) + 1;
        document.getElementById('level').textContent = `Nivel: ${level}`;
        TICK_INTERVAL = Math.max(100, 500 - (level - 1) * 50);
        clearInterval(gameInterval);
        gameInterval = setInterval(update, TICK_INTERVAL);
    }
}

function checkWin() {
    if (level >= 10) {
        showMessage('win', '¡Felicidades, has ganado!');
        isGameRunning = false;
    }
}

function showMessage(type, text) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.className = type; // 'win' o 'lose'
    document.getElementById('message-container').style.display = 'flex'; // Asegúrate de que el contenedor sea visible

    setTimeout(() => {
        document.getElementById('message-container').style.display = 'none'; // Oculta el contenedor después de 4 segundos
    }, 4000); // Duración de la animación
}


function update() {
    if (!movePiece(0, 1)) {
        mergePiece();
        clearLines();
        currentPiece = getRandomPiece();
        currentX = Math.floor(COLUMNS / 2) - 1;
        currentY = 0;
        if (collides()) {
            showMessage('lose', 'Game Over!');
            clearInterval(gameInterval);
            isGameRunning = false;
        }
    }
    drawBoard();
    drawPiece();
    checkWin(); // Verifica la condición de victoria en cada actualización
}

function checkWin() {
    if (level >= 10) { // Cambia el nivel de victoria según tu preferencia
        showMessage('win', '¡Felicidades, has ganado!');
        isGameRunning = false;
        clearInterval(gameInterval);
    }
}


document.addEventListener('keydown', (e) => {
    if (isGameRunning) {
        if (e.key === 'ArrowLeft') movePiece(-1, 0);
        if (e.key === 'ArrowRight') movePiece(1, 0);
        if (e.key === 'ArrowDown') movePiece(0, 1);
        if (e.key === 'ArrowUp') rotatePiece();
        drawBoard();
        drawPiece();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const fallingPiecesContainer = document.getElementById('falling-pieces');
    const pieceTypes = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const numPieces = 30; // Número total de piezas a mostrar

    function createPiece(type) {
        const piece = document.createElement('div');
        piece.classList.add('piece', type);
        piece.style.left = `${Math.random() * 100}vw`; // Posición horizontal aleatoria
        piece.style.top = `${Math.random() * -100}vh`; // Posición vertical inicial fuera de la vista
        fallingPiecesContainer.appendChild(piece);
    }

    function createPieces() {
        for (let i = 0; i < numPieces; i++) {
            const type = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
            createPiece(type);
        }
    }

    createPieces();
});


