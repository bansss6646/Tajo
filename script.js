const canvas = document.querySelector('#game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.querySelector('#score');
const highScoreElement = document.querySelector('#high-score');
const statusElement = document.querySelector('#status');
const startButton = document.querySelector('#start-btn');
const restartButton = document.querySelector('#restart-btn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
const baseSpeed = 135;
const minSpeed = 70;

let worm;
let direction;
let nextDirection;
let food;
let score;
let speed;
let gameTimer;
let isPlaying = false;

const highScoreKey = 'worm-game-high-score';
let highScore = Number(localStorage.getItem(highScoreKey)) || 0;
highScoreElement.textContent = String(highScore);

function randomCell() {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
  };
}

function spawnFood() {
  let nextFood = randomCell();

  while (worm.some((segment) => segment.x === nextFood.x && segment.y === nextFood.y)) {
    nextFood = randomCell();
  }

  food = nextFood;
}

function resetGame() {
  worm = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  score = 0;
  speed = baseSpeed;
  isPlaying = false;
  clearInterval(gameTimer);
  spawnFood();
  updateScore();
  statusElement.textContent = '시작 버튼을 눌러 게임을 시작하세요.';
  draw();
}

function updateScore() {
  scoreElement.textContent = String(score);
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(highScoreKey, String(highScore));
    highScoreElement.textContent = String(highScore);
  }
}

function drawCell(x, y, color) {
  const pad = 1;
  ctx.fillStyle = color;
  ctx.fillRect(x * gridSize + pad, y * gridSize + pad, gridSize - pad * 2, gridSize - pad * 2);
}

function drawGrid() {
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= tileCount; i += 1) {
    const pos = i * gridSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function draw() {
  drawGrid();

  worm.forEach((segment, index) => {
    const isHead = index === 0;
    drawCell(segment.x, segment.y, isHead ? '#22c55e' : '#86efac');
  });

  drawCell(food.x, food.y, '#f97316');
}

function isCollision(head) {
  const outOfBounds = head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount;
  if (outOfBounds) {
    return true;
  }

  return worm.some((segment) => segment.x === head.x && segment.y === head.y);
}

function increaseDifficulty() {
  speed = Math.max(minSpeed, baseSpeed - Math.floor(score / 4) * 6);
}

function tick() {
  direction = nextDirection;
  const head = { x: worm[0].x + direction.x, y: worm[0].y + direction.y };

  if (isCollision(head)) {
    clearInterval(gameTimer);
    isPlaying = false;
    statusElement.textContent = `게임 오버! 점수: ${score}. 다시 시작을 눌러 재도전하세요.`;
    return;
  }

  worm.unshift(head);

  const ateFood = head.x === food.x && head.y === food.y;

  if (ateFood) {
    score += 1;
    updateScore();
    spawnFood();
    increaseDifficulty();

    clearInterval(gameTimer);
    gameTimer = setInterval(tick, speed);
  } else {
    worm.pop();
  }

  statusElement.textContent = '진행 중... 벽이나 몸통에 부딪히지 마세요!';
  draw();
}

function startGame() {
  if (isPlaying) {
    return;
  }

  isPlaying = true;
  statusElement.textContent = '게임 시작!';
  clearInterval(gameTimer);
  gameTimer = setInterval(tick, speed);
}

function changeDirection(newDirection) {
  if (!isPlaying) {
    startGame();
  }

  const reversing =
    newDirection.x === -direction.x &&
    newDirection.y === -direction.y;

  if (reversing) {
    return;
  }

  nextDirection = newDirection;
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();

  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
    event.preventDefault();
  }

  if (key === 'arrowup' || key === 'w') {
    changeDirection({ x: 0, y: -1 });
  } else if (key === 'arrowdown' || key === 's') {
    changeDirection({ x: 0, y: 1 });
  } else if (key === 'arrowleft' || key === 'a') {
    changeDirection({ x: -1, y: 0 });
  } else if (key === 'arrowright' || key === 'd') {
    changeDirection({ x: 1, y: 0 });
  }
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', resetGame);

resetGame();
