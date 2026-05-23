"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const VIEW_WIDTH = canvas.width;
const VIEW_HEIGHT = canvas.height;
const WORLD_WIDTH = 2360;
const GROUND_Y = 470;
const GRAVITY = 0.72;

const keys = new Set();
const pressed = new Set();

const footprintLines = [
  "土管の向こうで、漢は一歩目を刻んだ。",
  "雲より高い足場に、二歩目の気合が残った。",
  "そして今、三歩目がこのステージへ続いている。",
];

const platforms = [
  { x: 0, y: GROUND_Y, w: 420, h: 70 },
  { x: 520, y: GROUND_Y, w: 360, h: 70 },
  { x: 960, y: GROUND_Y, w: 410, h: 70 },
  { x: 1460, y: GROUND_Y, w: 900, h: 70 },
  { x: 700, y: 380, w: 130, h: 28 },
  { x: 1110, y: 345, w: 150, h: 28 },
  { x: 1540, y: 390, w: 160, h: 28 },
  { x: 1860, y: 330, w: 170, h: 28 },
];

const initialEnemies = [
  { x: 620, y: GROUND_Y - 32, w: 36, h: 32, left: 560, right: 820, speed: 0.8 },
  { x: 1210, y: GROUND_Y - 32, w: 36, h: 32, left: 1030, right: 1340, speed: 1 },
  { x: 1710, y: GROUND_Y - 32, w: 36, h: 32, left: 1520, right: 1840, speed: 0.9 },
];

const goal = { x: 2200, y: GROUND_Y - 122, w: 34, h: 122 };

let state = "start";
let lastTime = 0;
let cameraX = 0;
let lives = 3;
let clearTime = 0;

let player;
let enemies;

function resetPlayer() {
  player = {
    x: 80,
    y: GROUND_Y - 54,
    w: 34,
    h: 54,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1,
  };
  cameraX = 0;
}

function resetEnemies() {
  enemies = initialEnemies.map((enemy) => ({ ...enemy, alive: true, dir: 1 }));
}

function startGame() {
  state = "play";
  lives = 3;
  resetPlayer();
  resetEnemies();
}

function restartAfterMiss() {
  resetPlayer();
  resetEnemies();
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function isJumpPressed() {
  return pressed.has("Space") || pressed.has("KeyW") || pressed.has("ArrowUp");
}

function isEnterPressed() {
  return pressed.has("Enter");
}

function update(dt) {
  if (state === "start" && isEnterPressed()) {
    startGame();
    return;
  }

  if ((state === "clear" || state === "gameover") && isEnterPressed()) {
    state = "start";
    return;
  }

  if (state !== "play") {
    return;
  }

  updatePlayer(dt);
  updateEnemies(dt);
  resolveEnemyCollisions();

  if (player.y > VIEW_HEIGHT + 120) {
    loseLife();
    return;
  }

  if (rectsOverlap(player, goal)) {
    state = "clear";
    clearTime = 0;
  }

  cameraX = Math.max(0, Math.min(player.x - 280, WORLD_WIDTH - VIEW_WIDTH));
}

function updatePlayer(dt) {
  const left = keys.has("ArrowLeft") || keys.has("KeyA");
  const right = keys.has("ArrowRight") || keys.has("KeyD");
  const acceleration = 0.85 * dt;
  const friction = player.onGround ? 0.82 : 0.94;
  const maxSpeed = 6.2;

  if (left) {
    player.vx -= acceleration;
    player.facing = -1;
  }
  if (right) {
    player.vx += acceleration;
    player.facing = 1;
  }
  if (!left && !right) {
    player.vx *= friction;
  }

  player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));

  if (isJumpPressed() && player.onGround) {
    player.vy = -14.6;
    player.onGround = false;
  }

  player.vy += GRAVITY * dt;
  player.vy = Math.min(player.vy, 16);

  moveOnAxis("x", player.vx * dt);
  moveOnAxis("y", player.vy * dt);

  player.x = Math.max(0, Math.min(WORLD_WIDTH - player.w, player.x));
}

function moveOnAxis(axis, amount) {
  player[axis] += amount;

  if (axis === "y") {
    player.onGround = false;
  }

  for (const platform of platforms) {
    if (!rectsOverlap(player, platform)) {
      continue;
    }

    if (axis === "x") {
      if (amount > 0) {
        player.x = platform.x - player.w;
      } else if (amount < 0) {
        player.x = platform.x + platform.w;
      }
      player.vx = 0;
    } else if (amount > 0) {
      player.y = platform.y - player.h;
      player.vy = 0;
      player.onGround = true;
    } else if (amount < 0) {
      player.y = platform.y + platform.h;
      player.vy = 0;
    }
  }
}

function updateEnemies(dt) {
  for (const enemy of enemies) {
    if (!enemy.alive) {
      continue;
    }

    enemy.x += enemy.speed * enemy.dir * dt;
    if (enemy.x < enemy.left) {
      enemy.x = enemy.left;
      enemy.dir = 1;
    } else if (enemy.x + enemy.w > enemy.right) {
      enemy.x = enemy.right - enemy.w;
      enemy.dir = -1;
    }
  }
}

function resolveEnemyCollisions() {
  for (const enemy of enemies) {
    if (!enemy.alive || !rectsOverlap(player, enemy)) {
      continue;
    }

    const playerBottomBefore = player.y + player.h - player.vy;
    const stomped = player.vy > 0 && playerBottomBefore <= enemy.y + 10;

    if (stomped) {
      enemy.alive = false;
      player.vy = -9.5;
      player.onGround = false;
    } else {
      loseLife();
    }
    return;
  }
}

function loseLife() {
  lives -= 1;
  if (lives <= 0) {
    state = "gameover";
    return;
  }

  restartAfterMiss();
}

function draw() {
  if (state === "start") {
    drawStartScreen();
  } else if (state === "play") {
    drawPlayScreen();
  } else if (state === "clear") {
    drawClearScreen();
  } else if (state === "gameover") {
    drawGameOverScreen();
  }
}

function drawStartScreen() {
  drawSky(0);
  drawMountains(0);
  drawTitle("スーパーマリ漢＜OTOKO＞", 74);

  ctx.fillStyle = "#f7f1dd";
  ctx.font = "28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("マリ漢がたどってきた足跡", VIEW_WIDTH / 2, 210);

  ctx.font = "22px sans-serif";
  footprintLines.forEach((line, index) => {
    drawFootprints(VIEW_WIDTH / 2 - 285, 260 + index * 42, index);
    ctx.fillText(line, VIEW_WIDTH / 2, 265 + index * 42);
  });

  drawPrompt("Enterで開始", 440);
  drawSmallText("左右移動: ← → / A D　ジャンプ: Space / W / ↑", 486);
}

function drawPlayScreen() {
  drawSky(cameraX);
  drawMountains(cameraX);
  drawWorld();
  drawHud();
}

function drawClearScreen() {
  drawSky(0);
  drawMountains(0);
  drawTitle("クリア！", 98);

  clearTime += 1;
  ctx.fillStyle = "#f7f1dd";
  ctx.textAlign = "center";
  ctx.font = "28px sans-serif";
  ctx.fillText("マリ漢は三歩目の先へ、堂々と駆け抜けた。", VIEW_WIDTH / 2, 220);

  ctx.font = "52px sans-serif";
  const bounce = Math.sin(clearTime / 14) * 8;
  ctx.fillText("漢", VIEW_WIDTH / 2, 330 + bounce);

  drawPrompt("Enterでスタートへ", 440);
}

function drawGameOverScreen() {
  drawSky(0);
  drawMountains(0);
  drawTitle("ゲームオーバー", 100);
  drawSmallText("漢の道は険しい。だが、足跡は消えない。", 245);
  drawPrompt("Enterでスタートへ", 400);
}

function drawSky(offset) {
  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  sky.addColorStop(0, "#79c8f5");
  sky.addColorStop(0.58, "#bfe9ff");
  sky.addColorStop(1, "#f6e5a7");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  ctx.fillStyle = "rgba(255, 255, 255, 0.86)";
  for (let i = 0; i < 8; i += 1) {
    const x = ((i * 210 - offset * 0.22) % 1180) - 80;
    drawCloud(x, 72 + (i % 3) * 46);
  }
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 22, 0, Math.PI * 2);
  ctx.arc(x + 24, y - 10, 26, 0, Math.PI * 2);
  ctx.arc(x + 55, y, 22, 0, Math.PI * 2);
  ctx.arc(x + 28, y + 10, 24, 0, Math.PI * 2);
  ctx.fill();
}

function drawMountains(offset) {
  ctx.fillStyle = "#78a96a";
  for (let i = 0; i < 8; i += 1) {
    const x = ((i * 360 - offset * 0.12) % 1260) - 160;
    ctx.beginPath();
    ctx.moveTo(x, GROUND_Y);
    ctx.lineTo(x + 150, 240);
    ctx.lineTo(x + 320, GROUND_Y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawWorld() {
  ctx.save();
  ctx.translate(-cameraX, 0);

  drawGoal();

  for (const platform of platforms) {
    drawPlatform(platform);
  }

  for (const enemy of enemies) {
    if (enemy.alive) {
      drawEnemy(enemy);
    }
  }

  drawPlayer();

  ctx.restore();
}

function drawPlatform(platform) {
  ctx.fillStyle = "#8c5a36";
  ctx.fillRect(platform.x, platform.y, platform.w, platform.h);
  ctx.fillStyle = "#3f9a54";
  ctx.fillRect(platform.x, platform.y, platform.w, 14);

  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  for (let x = platform.x + 24; x < platform.x + platform.w; x += 54) {
    ctx.fillRect(x, platform.y + 24, 24, 8);
  }
}

function drawPlayer() {
  ctx.fillStyle = "#ca3435";
  ctx.fillRect(player.x + 5, player.y + 17, player.w - 10, player.h - 17);
  ctx.fillStyle = "#f2bd78";
  ctx.fillRect(player.x + 7, player.y + 4, player.w - 14, 18);
  ctx.fillStyle = "#172030";
  ctx.fillRect(player.x + (player.facing > 0 ? 22 : 8), player.y + 10, 5, 5);
  ctx.fillStyle = "#1b4f9a";
  ctx.fillRect(player.x + 4, player.y + 40, 10, 14);
  ctx.fillRect(player.x + 20, player.y + 40, 10, 14);
  ctx.fillStyle = "#f5c84c";
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("漢", player.x + player.w / 2, player.y + 36);
}

function drawEnemy(enemy) {
  ctx.fillStyle = "#6e3f2a";
  ctx.fillRect(enemy.x, enemy.y + 6, enemy.w, enemy.h - 6);
  ctx.fillStyle = "#f4d2a0";
  ctx.fillRect(enemy.x + 7, enemy.y, enemy.w - 14, 12);
  ctx.fillStyle = "#111923";
  ctx.fillRect(enemy.x + 8, enemy.y + 14, 5, 5);
  ctx.fillRect(enemy.x + 23, enemy.y + 14, 5, 5);
}

function drawGoal() {
  ctx.fillStyle = "#1b4f9a";
  ctx.fillRect(goal.x, goal.y, 10, goal.h);
  ctx.fillStyle = "#f5c84c";
  ctx.fillRect(goal.x + 10, goal.y + 4, 72, 42);
  ctx.fillStyle = "#111923";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("漢", goal.x + 46, goal.y + 32);
}

function drawHud() {
  ctx.fillStyle = "rgba(17, 25, 35, 0.74)";
  ctx.fillRect(18, 18, 214, 42);
  ctx.fillStyle = "#f7f1dd";
  ctx.font = "22px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`残機 ${lives}`, 34, 46);

  ctx.textAlign = "right";
  ctx.fillText(`距離 ${Math.floor(player.x)}m`, VIEW_WIDTH - 28, 46);
}

function drawTitle(text, y) {
  ctx.fillStyle = "#111923";
  ctx.font = "64px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, VIEW_WIDTH / 2 + 4, y + 4);
  ctx.fillStyle = "#f5c84c";
  ctx.fillText(text, VIEW_WIDTH / 2, y);
}

function drawPrompt(text, y) {
  ctx.fillStyle = "rgba(17, 25, 35, 0.72)";
  ctx.fillRect(VIEW_WIDTH / 2 - 148, y - 34, 296, 54);
  ctx.fillStyle = "#f7f1dd";
  ctx.font = "26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, VIEW_WIDTH / 2, y);
}

function drawSmallText(text, y) {
  ctx.fillStyle = "#111923";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, VIEW_WIDTH / 2, y);
}

function drawFootprints(x, y, index) {
  ctx.fillStyle = "#8c5a36";
  for (let i = 0; i < 3; i += 1) {
    const stepX = x + i * 36 + index * 8;
    ctx.beginPath();
    ctx.ellipse(stepX, y - 4, 8, 13, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(stepX + 17, y + 5, 8, 13, 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
}

function gameLoop(time) {
  const dt = Math.min(2, (time - lastTime) / 16.666 || 1);
  lastTime = time;

  update(dt);
  draw();
  pressed.clear();

  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  const handledKeys = [
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "Space",
    "KeyA",
    "KeyD",
    "KeyW",
    "Enter",
  ];

  if (handledKeys.includes(event.code)) {
    event.preventDefault();
  }

  if (!keys.has(event.code)) {
    pressed.add(event.code);
  }
  keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

resetPlayer();
resetEnemies();
requestAnimationFrame(gameLoop);
