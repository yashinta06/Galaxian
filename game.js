// ==========================================
// 1. SETUP CANVAS & KONSTANTA
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

const GAME_WIDTH = 500;
const GAME_HEIGHT = 600;

// DIBUAT LEBIH CEPAT
const PLAYER_SPEED = 7;


// ==========================================
// 2. ELEMEN HTML
// ==========================================

const scoreDisplay = document.getElementById('score-display');
const livesDisplay = document.getElementById('lives-display');
const waveDisplay = document.getElementById('wave-display');
const hiDisplay = document.getElementById('hi-display');

const startBtn = document.getElementById('start-btn');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const btnFire = document.getElementById('btn-fire');

const overlay = document.getElementById('overlay');


// ==========================================
// 3. VARIABEL GAME
// ==========================================

let gameState = 'START';
let player = null;
let aliens = [];
let playerBullets = [];
let alienBullets = [];
let score = 0;
let lives = 3;
let wave = 1;
let highScore = 0;


// ==========================================
// 4. INPUT
// ==========================================

const inputState = {
    left: false,
    right: false,
    fire: false
};


// ==========================================
// 5. WAVE / LEVEL
// ==========================================

let alienDirection = 1;
let alienSpeed = 1.2;
let alienDrop = 8;
let waveMessage = '';
let waveMessageTimer = 0;


// ==========================================
// 6. CLASS BULLET
// ==========================================

class Bullet {
    constructor(x, y, speed, color) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = speed;
        this.color = color;
        this.alive = true;
    }

    update() {
        this.y += this.speed;
        if (this.y < -20 || this.y > GAME_HEIGHT + 20) {
            this.alive = false;
        }
    }

    draw() {
        if (!this.alive) return;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}


// ==========================================
// 7. CLASS PLAYER
// ==========================================

class Player {
    constructor() {
        this.width = 40;
        this.height = 25;
        this.x = GAME_WIDTH / 2 - this.width / 2;
        this.y = GAME_HEIGHT - 55;
        this.speed = PLAYER_SPEED;
        this.cooldown = 0;
        this.invincible = 0;
    }

    update() {
        if (inputState.left) this.x -= this.speed;
        if (inputState.right) this.x += this.speed;

        if (this.x < 5) this.x = 5;
        if (this.x > GAME_WIDTH - this.width - 5) {
            this.x = GAME_WIDTH - this.width - 5;
        }

        if (this.cooldown > 0) this.cooldown--;
        if (this.invincible > 0) this.invincible--;
    }

    draw() {
        if (this.invincible > 0 && Math.floor(this.invincible / 5) % 2 === 0) {
            return;
        }

        const x = this.x;
        const y = this.y;

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ffff';
        ctx.fillRect(x + 10, y + 10, 20, 15);
        ctx.fillRect(x + 15, y, 10, 20);
        ctx.fillRect(x + 18, y - 6, 4, 7);

        ctx.fillStyle = '#00ffff';
        ctx.fillRect(x, y + 17, 12, 7);
        ctx.fillRect(x + 28, y + 17, 12, 7);
        ctx.shadowBlur = 0;
    }

    shoot() {
        if (this.cooldown <= 0) {
            playerBullets.push(new Bullet(this.x + this.width / 2 - 2, this.y - 8, -10, '#ffff00'));
            this.cooldown = 12;
        }
    }
}


// ==========================================
// 8. CLASS ALIEN
// ==========================================

class Alien {
    constructor(x, y, type, row, col) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 22;
        this.type = type;
        this.row = row;
        this.col = col;
        this.alive = true;
    }

    draw() {
        if (!this.alive) return;

        const colors = ['#ff0088', '#00ffff', '#00ff66'];
        const color = colors[this.type];

        ctx.fillStyle = color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;

        ctx.fillRect(this.x + 4, this.y + 5, 22, 13);
        ctx.fillRect(this.x + 8, this.y, 14, 7);
        ctx.fillRect(this.x + 2, this.y + 16, 6, 6);
        ctx.fillRect(this.x + 22, this.y + 16, 6, 6);

        ctx.fillStyle = '#000000';
        ctx.fillRect(this.x + 9, this.y + 7, 4, 4);
        ctx.fillRect(this.x + 17, this.y + 7, 4, 4);
        ctx.shadowBlur = 0;
    }
}


// ==========================================
// 9. BACKGROUND BINTANG
// ==========================================

const stars = [];
const NUM_STARS = 80;

function initStars() {
    stars.length = 0;
    for (let i = 0; i < NUM_STARS; i++) {
        stars.push({
            x: Math.random() * GAME_WIDTH,
            y: Math.random() * GAME_HEIGHT,
            speed: Math.random() * 1.2 + 0.2,
            size: Math.random() < 0.2 ? 2 : 1
        });
    }
}

function updateStars() {
    for (let star of stars) {
        star.y += star.speed;
        if (star.y > GAME_HEIGHT) {
            star.y = 0;
            star.x = Math.random() * GAME_WIDTH;
        }
    }
}

function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let star of stars) {
        ctx.globalAlpha = 0.4 + star.speed * 0.3;
        ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.globalAlpha = 1;
}


// ==========================================
// 10. UPDATE HUD
// ==========================================

function updateHUD() {
    if (scoreDisplay) scoreDisplay.textContent = 'SCORE: ' + String(score).padStart(4, '0');
    if (livesDisplay) livesDisplay.textContent = '🤍 ' + lives;
    if (waveDisplay) waveDisplay.textContent = 'WAVE: ' + wave;
    if (hiDisplay) hiDisplay.textContent = 'HI: ' + String(highScore).padStart(4, '0');
}


// ==========================================
// 11. BUAT ALIEN
// ==========================================

function createAliens() {
    aliens = [];
    for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 8; col++) {
            let type = row === 0 ? 0 : (row < 3 ? 1 : 2);
            const x = 45 + col * 55;
            const y = 50 + row * 38;
            aliens.push(new Alien(x, y, type, row, col));
        }
    }
}


// ==========================================
// 12. INIT GAME
// ==========================================

function initGame() {
    player = new Player();
    playerBullets = [];
    alienBullets = [];
    score = 0;
    lives = 3;
    wave = 1;
    alienDirection = 1;
    alienSpeed = 1.2;
    waveMessage = '';
    waveMessageTimer = 0;
    createAliens();
    updateHUD();
}


// ==========================================
// 13. WAVE BERIKUTNYA
// ==========================================

function nextWave() {
    wave++;
    score += 500;
    alienSpeed += 0.3;
    alienDirection = 1;
    playerBullets = [];
    alienBullets = [];
    createAliens();
    waveMessage = 'WAVE ' + wave;
    waveMessageTimer = 120;
    updateHUD();
}


// ==========================================
// 14. UPDATE ALIEN (DIPERBAIKI: FORMASI UTUH)
// ==========================================

function updateAliens() {
    let hitEdge = false;

    // LANGKAH 1: CEK EDGE DULU (SEMUA ALIEN, HIDUP MAUPUN MATI)
    for (let alien of aliens) {
        const nextX = alien.x + (alienDirection * alienSpeed);
        if (nextX <= 5 || nextX + alien.width >= GAME_WIDTH - 5) {
            hitEdge = true;
            break;
        }
    }

    // LANGKAH 2: JIKA KENA EDGE, BALIK ARAH & TURUNKAN SEMUA ALIEN
    if (hitEdge) {
        alienDirection *= -1;
        for (let alien of aliens) {
            alien.y += alienDrop;
        }
    }

    // LANGKAH 3: GERAKKAN SEMUA ALIEN (HIDUP MAUPUN MATI)
    for (let alien of aliens) {
        alien.x += alienDirection * alienSpeed;
    }

    // LANGKAH 4: CEK GAME OVER (HANYA ALIEN YANG HIDUP)
    for (let alien of aliens) {
        if (alien.alive && alien.y + alien.height >= player.y) {
            loseLife();
            return;
        }
    }
}


// ==========================================
// 15. ALIEN MENEMBAK
// ==========================================

function alienShoot() {
    if (gameState !== 'PLAYING') return;

    if (Math.random() < 0.025) {
        const aliveAliens = aliens.filter(alien => alien.alive);
        if (aliveAliens.length === 0) return;

        const alien = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
        alienBullets.push(new Bullet(alien.x + alien.width / 2, alien.y + alien.height, 5, '#ff3333'));
    }
}


// ==========================================
// 16. UPDATE BULLET
// ==========================================

function updateBullets() {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        playerBullets[i].update();
        if (!playerBullets[i].alive) playerBullets.splice(i, 1);
    }

    for (let i = alienBullets.length - 1; i >= 0; i--) {
        alienBullets[i].update();
        if (!alienBullets[i].alive) alienBullets.splice(i, 1);
    }
}


// ==========================================
// 17. DRAW BULLET
// ==========================================

function drawBullets() {
    for (let bullet of playerBullets) bullet.draw();
    for (let bullet of alienBullets) bullet.draw();
}


// ==========================================
// 18. COLLISION
// ==========================================

function checkCollisions() {
    // PELURU PLAYER -> ALIEN
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        for (let alien of aliens) {
            if (!alien.alive) continue;

            const hit = bullet.x < alien.x + alien.width &&
                bullet.x + bullet.width > alien.x &&
                bullet.y < alien.y + alien.height &&
                bullet.y + bullet.height > alien.y;

            if (hit) {
                alien.alive = false;
                bullet.alive = false;
                score += 100;
                if (score > highScore) highScore = score;
                updateHUD();
                break;
            }
        }
    }
    playerBullets = playerBullets.filter(bullet => bullet.alive);

    // PELURU ALIEN -> PLAYER
    if (player && player.invincible <= 0) {
        for (let i = alienBullets.length - 1; i >= 0; i--) {
            const bullet = alienBullets[i];
            const hit = bullet.x < player.x + player.width &&
                bullet.x + bullet.width > player.x &&
                bullet.y < player.y + player.height &&
                bullet.y + bullet.height > player.y;

            if (hit) {
                alienBullets.splice(i, 1);
                loseLife();
                break;
            }
        }
    }
}


// ==========================================
// 19. KEHILANGAN NYAWA
// ==========================================

function loseLife() {
    if (player && player.invincible > 0) return;

    lives--;
    updateHUD();

    if (lives > 0) {
        player.x = GAME_WIDTH / 2 - player.width / 2;
        player.y = GAME_HEIGHT - 55;
        player.invincible = 120;
        alienBullets = [];
        waveMessage = 'LIFE LOST!';
        waveMessageTimer = 80;
    } else {
        gameOver();
    }
}


// ==========================================
// 20. CEK WAVE
// ==========================================

function checkWave() {
    const aliveAliens = aliens.filter(alien => alien.alive);
    if (aliveAliens.length === 0) {
        nextWave();
    }
}


// ==========================================
// 21. START GAME (DIPERBAIKI)
// ==========================================

function startGame() {
    initGame();
    gameState = 'PLAYING';

    if (overlay) overlay.classList.add('hidden');
    if (startBtn) startBtn.classList.add('hidden');

    // Sembunyikan tombol restart saat mulai game
    const restartBtn = document.getElementById('btn-restart-dynamic');
    if (restartBtn) {
        restartBtn.style.display = 'none';
    }
}


// ==========================================
// 22. GAME OVER (DIPERBAIKI)
// ==========================================

function gameOver() {
    gameState = 'GAMEOVER';

    if (score > highScore) {
        highScore = score;
    }
    updateHUD();

    // Pastikan overlay start TETAP tersembunyi agar tulisan GAME OVER di canvas terlihat
    if (overlay) overlay.classList.add('hidden');
    if (startBtn) startBtn.classList.add('hidden');

    // Buat tombol restart dinamis jika belum ada (tanpa perlu ubah HTML)
    let restartBtn = document.getElementById('btn-restart-dynamic');
    if (!restartBtn) {
        restartBtn = document.createElement('button');
        restartBtn.id = 'btn-restart-dynamic';
        restartBtn.textContent = 'MAIN LAGI';
        restartBtn.style.cssText = `
            position: absolute;
            top: 62%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 12px 30px;
            font-size: 18px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            background: #00ff66;
            color: #000;
            border: 2px solid #00ff66;
            border-radius: 8px;
            cursor: pointer;
            z-index: 100;
            box-shadow: 0 0 15px #00ff66;
        `;
        restartBtn.addEventListener('click', startGame);

        const gameContainer = document.getElementById('game-container') || document.body;
        gameContainer.appendChild(restartBtn);
    }

    // Tampilkan tombol restart
    restartBtn.style.display = 'block';
}


// ==========================================
// 23. GAME OVER SCREEN
// ==========================================

function drawGameOverScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.80)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff0055';
    ctx.font = 'bold 34px Courier New';
    ctx.fillText('GAME OVER', GAME_WIDTH / 2, 250);

    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Courier New';
    ctx.fillText('SCORE: ' + score, GAME_WIDTH / 2, 295);

    ctx.fillStyle = '#00ffff';
    ctx.font = '14px Courier New';
    ctx.fillText('TEKAN TOMBOL DI BAWAH UNTUK MAIN LAGI', GAME_WIDTH / 2, 340);
}


// ==========================================
// 24. TULISAN WAVE / LIFE
// ==========================================

function drawWaveMessage() {
    if (waveMessageTimer <= 0) return;
    waveMessageTimer--;
    ctx.textAlign = 'center';

    if (waveMessage.startsWith('WAVE')) {
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ffff';
        ctx.font = 'bold 42px Courier New';
        ctx.fillText(waveMessage, GAME_WIDTH / 2, 280);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Courier New';
        ctx.fillText('GET READY!', GAME_WIDTH / 2, 315);
    } else {
        ctx.fillStyle = '#ff0055';
        ctx.font = 'bold 30px Courier New';
        ctx.fillText(waveMessage, GAME_WIDTH / 2, 280);

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Courier New';
        ctx.fillText('LIVES LEFT: ' + lives, GAME_WIDTH / 2, 315);
    }
}


// ==========================================
// 25. KEYBOARD
// ==========================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        inputState.left = true;
    }
    if (e.key === 'ArrowRight') {
        e.preventDefault();
        inputState.right = true;
    }
    if (e.key === ' ') {
        e.preventDefault();
        inputState.fire = true;
        if (gameState === 'PLAYING' && player) player.shoot();
    }
});

document.addEventListener('keyup', function(e) {
    if (e.key === 'ArrowLeft') inputState.left = false;
    if (e.key === 'ArrowRight') inputState.right = false;
    if (e.key === ' ') inputState.fire = false;
});


// ==========================================
// 26. START BUTTON
// ==========================================

if (startBtn) {
    startBtn.addEventListener('click', startGame);
}


// ==========================================
// 27. TOMBOL KIRI
// ==========================================

if (btnLeft) {
    btnLeft.addEventListener('mousedown', function(e) {
        e.preventDefault();
        inputState.left = true;
    });
    btnLeft.addEventListener('mouseup', function() { inputState.left = false; });
    btnLeft.addEventListener('mouseleave', function() { inputState.left = false; });
    btnLeft.addEventListener('touchstart', function(e) {
        e.preventDefault();
        inputState.left = true;
    }, { passive: false });
    btnLeft.addEventListener('touchend', function(e) {
        e.preventDefault();
        inputState.left = false;
    }, { passive: false });
}


// ==========================================
// 28. TOMBOL KANAN
// ==========================================

if (btnRight) {
    btnRight.addEventListener('mousedown', function(e) {
        e.preventDefault();
        inputState.right = true;
    });
    btnRight.addEventListener('mouseup', function() { inputState.right = false; });
    btnRight.addEventListener('mouseleave', function() { inputState.right = false; });
    btnRight.addEventListener('touchstart', function(e) {
        e.preventDefault();
        inputState.right = true;
    }, { passive: false });
    btnRight.addEventListener('touchend', function(e) {
        e.preventDefault();
        inputState.right = false;
    }, { passive: false });
}


// ==========================================
// 29. TOMBOL FIRE
// ==========================================

if (btnFire) {
    btnFire.addEventListener('mousedown', function(e) {
        e.preventDefault();
        inputState.fire = true;
    });
    btnFire.addEventListener('mouseup', function() { inputState.fire = false; });
    btnFire.addEventListener('mouseleave', function() { inputState.fire = false; });
    btnFire.addEventListener('touchstart', function(e) {
        e.preventDefault();
        inputState.fire = true;
    }, { passive: false });
    btnFire.addEventListener('touchend', function(e) {
        e.preventDefault();
        inputState.fire = false;
    }, { passive: false });
    btnFire.addEventListener('click', function() {
        if (gameState === 'PLAYING' && player) player.shoot();
    });
}


// ==========================================
// 30. GAME LOOP
// ==========================================

function gameLoop() {
    if (!ctx) return;

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    updateStars();
    drawStars();

    if (gameState === 'PLAYING') {
        player.update();
        player.draw();

        if (inputState.fire) player.shoot();

        updateAliens();
        for (let alien of aliens) alien.draw();

        alienShoot();
        updateBullets();
        drawBullets();
        checkCollisions();
        checkWave();
        drawWaveMessage();
    }

    if (gameState === 'GAMEOVER') {
        for (let alien of aliens) alien.draw();
        if (player) player.draw();
        drawBullets();
        drawGameOverScreen(); // Tulisan GAME OVER akan muncul di sini
    }

    requestAnimationFrame(gameLoop);
}


// ==========================================
// 31. MULAI PROGRAM
// ==========================================

window.addEventListener('DOMContentLoaded', function() {
    initStars();
    initGame();
    updateHUD();
    gameLoop();
});