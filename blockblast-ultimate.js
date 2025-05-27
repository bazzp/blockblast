class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.initAudio();
    }

    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API nie jest wspierane');
            this.enabled = false;
        }
    }

    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    playTone(frequency, duration = 0.2, type = 'sine', volume = 0.3) {
        if (!this.enabled || !this.audioContext) return;

        this.resumeContext();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // 🎵 DŹWIĘKI GRY

    placePiece() {
        if (!this.enabled) return;
        // Przyjemny dźwięk postawienia klocka
        this.playTone(440, 0.1, 'square', 0.2);
    }

    clearLine() {
        if (!this.enabled) return;
        // Melodyjny dźwięk usunięcia linii
        setTimeout(() => this.playTone(523, 0.15, 'sine', 0.4), 0);
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.4), 100);
        setTimeout(() => this.playTone(784, 0.2, 'sine', 0.4), 200);
    }

    multiClear(count) {
        if (!this.enabled) return;
        // Epicki dźwięk za multiple clear
        const notes = [523, 659, 784, 988, 1175];
        for (let i = 0; i < count && i < notes.length; i++) {
            setTimeout(() => {
                this.playTone(notes[i], 0.3, 'triangle', 0.5);
            }, i * 80);
        }
    }

    bombExplosion() {
        if (!this.enabled) return;
        // Wybuchowy dźwięk bomby
        this.playTone(150, 0.3, 'sawtooth', 0.6);
        setTimeout(() => this.playTone(100, 0.2, 'sawtooth', 0.4), 100);
    }

    starEffect() {
        if (!this.enabled) return;
        // Magiczny dźwięk gwiazdy
        const notes = [440, 554, 659, 831, 1047];
        notes.forEach((note, i) => {
            setTimeout(() => {
                this.playTone(note, 0.4, 'triangle', 0.3);
            }, i * 150);
        });
    }

    rainbowEffect() {
        if (!this.enabled) return;
        // Tęczowy dźwięk
        const notes = [261, 294, 330, 349, 392, 440, 494, 523];
        notes.forEach((note, i) => {
            setTimeout(() => {
                this.playTone(note, 0.2, 'sine', 0.25);
            }, i * 80);
        });
    }

    selectPiece() {
        if (!this.enabled) return;
        // Delikatny klik
        this.playTone(800, 0.05, 'square', 0.15);
    }

    cannotPlace() {
        if (!this.enabled) return;
        // Dźwięk błędu
        this.playTone(200, 0.2, 'sawtooth', 0.3);
        setTimeout(() => this.playTone(150, 0.2, 'sawtooth', 0.3), 100);
    }

    gameOver() {
        if (!this.enabled) return;
        // Smutny dźwięk końca gry
        const notes = [523, 466, 415, 392, 349, 311, 277, 247];
        notes.forEach((note, i) => {
            setTimeout(() => {
                this.playTone(note, 0.4, 'triangle', 0.3);
            }, i * 200);
        });
    }

    newGame() {
        if (!this.enabled) return;
        // Radosny dźwięk nowej gry
        const notes = [261, 330, 392, 523];
        notes.forEach((note, i) => {
            setTimeout(() => {
                this.playTone(note, 0.3, 'triangle', 0.4);
            }, i * 100);
        });
    }

    powerupActivate() {
        if (!this.enabled) return;
        // Dźwięk aktywacji power-upa
        this.playTone(1000, 0.1, 'square', 0.3);
        setTimeout(() => this.playTone(1200, 0.15, 'square', 0.3), 50);
    }

    specialPiecePlace() {
        if (!this.enabled) return;
        // Specjalny dźwięk dla magicznych klocków
        this.playTone(659, 0.1, 'triangle', 0.3);
        setTimeout(() => this.playTone(831, 0.1, 'triangle', 0.3), 50);
        setTimeout(() => this.playTone(1047, 0.15, 'triangle', 0.3), 100);
    }

    scoreBonus() {
        if (!this.enabled) return;
        // Dźwięk bonusowych punktów
        this.playTone(831, 0.1, 'sine', 0.25);
        setTimeout(() => this.playTone(1047, 0.15, 'sine', 0.25), 80);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

class BlockBlastPremium {
    constructor() {
        this.BOARD_SIZE = 8;
        this.CELL_SIZE = 60;
        this.board = [];
        this.score = 0;
        this.selectedPiece = null;
        this.pieces = [];
        this.currentTheme = 'classic';
        this.activePowerup = null;

        // 🎵 SOUND MANAGER
        this.soundManager = new SoundManager();

        this.powerups = {
            bomb: 3,
            star: 2,
            destroy: 1
        };

        this.themes = {
            classic: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB347', '#87CEEB'],
            neon: ['#00ff88', '#ff0088', '#00ffff', '#ffff00', '#ff8800', '#8800ff', '#ff0044', '#44ff00'],
            sunset: ['#ff7e5f', '#feb47b', '#fa709a', '#fee140', '#ffecd2', '#fcb69f', '#ff9a9e', '#fecfef'],
            ocean: ['#2193b0', '#6dd5ed', '#108dc7', '#ef8e38', '#74b9ff', '#0984e3', '#6c5ce7', '#a29bfe'],
            forest: ['#134e5e', '#71b280', '#2d5016', '#61892f', '#86ac41', '#a2c523', '#7f8c8d', '#95a5a6']
        };

        this.canvas = document.getElementById('gameBoard');
        this.ctx = this.canvas.getContext('2d');
        this.pieceCanvases = [
            document.getElementById('piece1'),
            document.getElementById('piece2'),
            document.getElementById('piece3')
        ];

        this.initGame();
        this.setupEventListeners();
    }

    initGame() {
        this.board = Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(0));
        this.score = 0;
        this.activePowerup = null;
        this.highlightPosition = null;

        this.powerups = {
            bomb: 3,
            star: 2,
            destroy: 1
        };

        this.updateScore();
        this.updatePowerupCounts();
        this.generateNewPieces();
        this.draw();
        document.getElementById('gameOver').style.display = 'none';

        document.querySelectorAll('.powerup-btn').forEach(btn => {
            btn.style.background = '#28a745';
        });
        this.canvas.style.cursor = 'default';

        // 🎵 DŹWIĘK NOWEJ GRY
        this.soundManager.newGame();
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleBoardClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseleave', () => {
            this.highlightPosition = null;
            this.draw();
        });

        this.pieceCanvases.forEach((canvas, index) => {
            canvas.addEventListener('click', () => this.selectPiece(index));
        });
    }

    changeTheme(themeName) {
        this.currentTheme = themeName;

        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.theme-${themeName}`).classList.add('active');

        this.drawPieces();
        this.draw();
    }

    getCurrentColors() {
        return this.themes[this.currentTheme];
    }

    generateNewPieces() {
        this.pieces = [];
        const pieceShapes = [
            [[1]],
            [[1, 1]], [[1, 1, 1]], [[1, 1, 1, 1]], [[1, 1, 1, 1, 1]],
            [[1], [1]], [[1], [1], [1]], [[1], [1], [1], [1]],
            [[1, 1], [1, 1]],
            [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
            [[1, 0], [1, 0], [1, 1]], [[1, 1, 1], [1, 0, 0]],
            [[1, 1], [1, 0], [1, 0]], [[0, 0, 1], [1, 1, 1]],
            [[1, 1, 1], [0, 1, 0]], [[0, 1], [1, 1], [0, 1]],
            [[1, 1, 0], [0, 1, 1]], [[0, 1], [1, 1], [1, 0]],
            [[1, 0, 1], [1, 1, 1]],
            [[1, 1, 1, 1], [0, 1, 1, 0]],
            [[1, 0, 0], [1, 1, 0], [0, 1, 1]],
        ];

        const colors = this.getCurrentColors();

        for (let i = 0; i < 3; i++) {
            const shapeIndex = Math.floor(Math.random() * pieceShapes.length);
            const shape = pieceShapes[shapeIndex];
            const color = colors[Math.floor(Math.random() * colors.length)];

            const isSpecial = Math.random() < 0.15;
            let specialType = null;

            if (isSpecial) {
                const specialTypes = ['bomb', 'star', 'rainbow'];
                specialType = specialTypes[Math.floor(Math.random() * specialTypes.length)];
            }

            this.pieces.push({
                shape: shape,
                color: color,
                used: false,
                special: specialType
            });
        }

        this.drawPieces();
        this.updatePieceContainers();
    }

    selectPiece(index) {
        if (this.pieces[index].used) return;

        this.selectedPiece = index;
        this.updatePieceContainers();

        // 🎵 DŹWIĘK WYBORU KLOCKA
        this.soundManager.selectPiece();
    }

    updatePieceContainers() {
        const containers = document.querySelectorAll('.piece-container');
        containers.forEach((container, index) => {
            container.classList.remove('selected', 'disabled', 'special');

            const oldIndicator = container.querySelector('.powerup-indicator');
            if (oldIndicator) oldIndicator.remove();

            if (this.pieces[index].used) {
                container.classList.add('disabled');
            } else {
                if (index === this.selectedPiece) {
                    container.classList.add('selected');
                }

                if (this.pieces[index].special) {
                    container.classList.add('special');
                    const indicator = document.createElement('div');
                    indicator.className = 'powerup-indicator';

                    const icons = { bomb: '💎', star: '🌟', rainbow: '🌈' };
                    indicator.textContent = icons[this.pieces[index].special] || '✨';
                    container.appendChild(indicator);
                }
            }
        });
    }

    handleBoardClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.CELL_SIZE);
        const y = Math.floor((e.clientY - rect.top) / this.CELL_SIZE);

        if (x < 0 || x >= this.BOARD_SIZE || y < 0 || y >= this.BOARD_SIZE) return;

        if (this.activePowerup) {
            this.usePowerupOnBoard(x, y);
            return;
        }

        if (this.selectedPiece === null) return;

        if (this.canPlacePiece(this.pieces[this.selectedPiece], x, y)) {
            const piece = this.pieces[this.selectedPiece];
            const pieceSpecial = piece.special;

            this.placePiece(piece, x, y);
            this.pieces[this.selectedPiece].used = true;
            this.selectedPiece = null;

            // 🎵 DŹWIĘK POSTAWIENIA KLOCKA
            if (pieceSpecial) {
                this.soundManager.specialPiecePlace();
            } else {
                this.soundManager.placePiece();
            }

            if (pieceSpecial) {
                this.triggerSpecialEffect(pieceSpecial, x, y, piece.color);
            }

            this.clearLines();
            this.updatePieceContainers();
            this.draw();

            if (this.allPiecesUsed()) {
                this.generateNewPieces();
            }

            if (this.isGameOver()) {
                this.endGame();
            }
        } else {
            // 🎵 DŹWIĘK BŁĘDU (nie można postawić)
            this.soundManager.cannotPlace();
        }
    }

    triggerSpecialEffect(specialType, x, y, color) {
        switch (specialType) {
            case 'bomb':
                setTimeout(() => {
                    this.explodeArea(x, y, 1);
                    this.createParticleExplosion(x * this.CELL_SIZE + this.CELL_SIZE/2,
                        y * this.CELL_SIZE + this.CELL_SIZE/2, '#FFD700');
                    // 🎵 DŹWIĘK EKSPLOZJI
                    this.soundManager.bombExplosion();
                }, 1000);
                break;

            case 'star':
                setTimeout(() => {
                    this.removeColorBlocks(color);
                    this.createStarEffect();
                    // 🎵 DŹWIĘK GWIAZDY
                    this.soundManager.starEffect();
                }, 1000);
                break;

            case 'rainbow':
                setTimeout(() => {
                    this.rainbowEffect(x, y);
                    // 🎵 DŹWIĘK TĘCZY
                    this.soundManager.rainbowEffect();
                }, 1000);
                break;
        }
    }

    explodeArea(centerX, centerY, radius) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const newX = centerX + dx;
                const newY = centerY + dy;

                if (newX >= 0 && newX < this.BOARD_SIZE &&
                    newY >= 0 && newY < this.BOARD_SIZE) {
                    if (this.board[newY][newX] !== 0) {
                        this.board[newY][newX] = 0;
                        this.score += 25;
                    }
                }
            }
        }
        this.updateScore();
        this.draw();
    }

    removeColorBlocks(color) {
        let removed = 0;
        for (let y = 0; y < this.BOARD_SIZE; y++) {
            for (let x = 0; x < this.BOARD_SIZE; x++) {
                if (this.board[y][x] === color) {
                    this.board[y][x] = 0;
                    removed++;

                    this.createParticleExplosion(x * this.CELL_SIZE + this.CELL_SIZE/2,
                        y * this.CELL_SIZE + this.CELL_SIZE/2, color, 5);
                }
            }
        }
        this.score += removed * 50;
        this.updateScore();
        this.draw();
    }

    rainbowEffect(x, y) {
        const colors = this.getCurrentColors();
        const newColor = colors[Math.floor(Math.random() * colors.length)];

        for (let i = 0; i < this.BOARD_SIZE; i++) {
            if (this.board[y][i] !== 0) {
                this.board[y][i] = newColor;
            }
        }

        for (let i = 0; i < this.BOARD_SIZE; i++) {
            if (this.board[i][x] !== 0) {
                this.board[i][x] = newColor;
            }
        }

        this.createRainbowParticles(x, y);
        this.score += 100;
        this.updateScore();
        this.draw();
    }

    usePowerup(type) {
        if (this.powerups[type] <= 0) return;

        this.activePowerup = type;
        this.canvas.style.cursor = 'crosshair';

        document.querySelectorAll('.powerup-btn').forEach(btn => btn.style.background = '#28a745');
        document.getElementById(`${type}Btn`).style.background = '#dc3545';

        // 🎵 DŹWIĘK AKTYWACJI POWER-UPA
        this.soundManager.powerupActivate();
    }

    usePowerupOnBoard(x, y) {
        if (x < 0 || x >= this.BOARD_SIZE || y < 0 || y >= this.BOARD_SIZE) return;

        switch (this.activePowerup) {
            case 'bomb':
                if (this.powerups.bomb > 0) {
                    this.explodeArea(x, y, 1);
                    this.createParticleExplosion(x * this.CELL_SIZE + this.CELL_SIZE/2,
                        y * this.CELL_SIZE + this.CELL_SIZE/2, '#FFD700');
                    this.powerups.bomb--;
                    // 🎵 DŹWIĘK BOMBY
                    this.soundManager.bombExplosion();
                }
                break;

            case 'star':
                if (this.powerups.star > 0 && this.board[y][x] !== 0) {
                    this.removeColorBlocks(this.board[y][x]);
                    this.powerups.star--;
                    // 🎵 DŹWIĘK GWIAZDY
                    this.soundManager.starEffect();
                }
                break;

            case 'destroy':
                if (this.powerups.destroy > 0 && this.board[y][x] !== 0) {
                    const color = this.board[y][x];
                    this.board[y][x] = 0;
                    this.createParticleExplosion(x * this.CELL_SIZE + this.CELL_SIZE/2,
                        y * this.CELL_SIZE + this.CELL_SIZE/2, color, 8);
                    this.score += 30;
                    this.powerups.destroy--;
                    this.updateScore();
                    this.draw();
                    // 🎵 DŹWIĘK POSTAWIENIA (niszczenie)
                    this.soundManager.placePiece();
                }
                break;
        }

        this.activePowerup = null;
        this.canvas.style.cursor = 'default';
        this.updatePowerupCounts();

        document.querySelectorAll('.powerup-btn').forEach(btn => btn.style.background = '#28a745');
    }

    // Pozostałe funkcje (createParticleExplosion, createStarEffect, etc.) pozostają bez zmian...
    createParticleExplosion(x, y, color, count = 12) {
        const particleContainer = document.getElementById('particles');

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.backgroundColor = color;
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';

            const angle = (i / count) * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const finalX = x + Math.cos(angle) * distance;
            const finalY = y + Math.sin(angle) * distance;

            particle.style.setProperty('--final-x', finalX + 'px');
            particle.style.setProperty('--final-y', finalY + 'px');

            particleContainer.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }

    createStarEffect() {
        const colors = ['#FFD700', '#FFA500', '#FFFF00', '#FF69B4'];
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const x = Math.random() * this.canvas.width;
                const y = Math.random() * this.canvas.height;
                const color = colors[Math.floor(Math.random() * colors.length)];
                this.createParticleExplosion(x, y, color, 6);
            }, i * 100);
        }
    }

    createRainbowParticles(centerX, centerY) {
        const colors = this.getCurrentColors();

        for (let x = 0; x < this.BOARD_SIZE; x++) {
            const color = colors[x % colors.length];
            this.createParticleExplosion(x * this.CELL_SIZE + this.CELL_SIZE/2,
                centerY * this.CELL_SIZE + this.CELL_SIZE/2, color, 3);
        }

        for (let y = 0; y < this.BOARD_SIZE; y++) {
            const color = colors[y % colors.length];
            this.createParticleExplosion(centerX * this.CELL_SIZE + this.CELL_SIZE/2,
                y * this.CELL_SIZE + this.CELL_SIZE/2, color, 3);
        }
    }

    handleMouseMove(e) {
        if (this.selectedPiece === null && !this.activePowerup) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const x = Math.floor(mouseX / this.CELL_SIZE);
        const y = Math.floor(mouseY / this.CELL_SIZE);

        if (x >= 0 && x < this.BOARD_SIZE && y >= 0 && y < this.BOARD_SIZE) {
            this.highlightPosition = { x, y };
        } else {
            this.highlightPosition = null;
        }

        this.draw();
    }

    canPlacePiece(piece, startX, startY) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] === 1) {
                    const boardX = startX + x;
                    const boardY = startY + y;

                    if (boardX < 0 || boardX >= this.BOARD_SIZE ||
                        boardY < 0 || boardY >= this.BOARD_SIZE ||
                        this.board[boardY][boardX] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placePiece(piece, startX, startY) {
        let blocksPlaced = 0;
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x] === 1) {
                    this.board[startY + y][startX + x] = piece.color;
                    blocksPlaced++;
                }
            }
        }

        let baseScore = blocksPlaced * 10;
        if (piece.special) baseScore *= 2;

        this.score += baseScore;
        this.updateScore();

        // Pokazuj popup z punktami
        this.showScorePopup(baseScore, startX * this.CELL_SIZE, startY * this.CELL_SIZE);
    }

    showScorePopup(points, x, y) {
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = `+${points}`;
        popup.style.left = (x + this.CELL_SIZE/2) + 'px';
        popup.style.top = y + 'px';

        document.getElementById('particles').appendChild(popup);

        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 1000);
    }

    clearLines() {
        let linesCleared = 0;
        const rowsToKeep = [];
        const colsToKeep = Array(this.BOARD_SIZE).fill(true);
        const clearedCells = [];

        // Sprawdź rzędy
        for (let y = 0; y < this.BOARD_SIZE; y++) {
            let fullRow = true;
            for (let x = 0; x < this.BOARD_SIZE; x++) {
                if (this.board[y][x] === 0) {
                    fullRow = false;
                    break;
                }
            }
            if (fullRow) {
                linesCleared++;
                this.score += 100;

                for (let x = 0; x < this.BOARD_SIZE; x++) {
                    clearedCells.push({
                        x: x * this.CELL_SIZE + this.CELL_SIZE/2,
                        y: y * this.CELL_SIZE + this.CELL_SIZE/2,
                        color: this.board[y][x]
                    });
                }
            } else {
                rowsToKeep.push(y);
            }
        }

        // Sprawdź kolumny
        for (let x = 0; x < this.BOARD_SIZE; x++) {
            let fullCol = true;
            for (let y = 0; y < this.BOARD_SIZE; y++) {
                if (this.board[y][x] === 0) {
                    fullCol = false;
                    break;
                }
            }
            if (fullCol) {
                linesCleared++;
                colsToKeep[x] = false;
                this.score += 100;

                for (let y = 0; y < this.BOARD_SIZE; y++) {
                    if (!clearedCells.some(cell =>
                        Math.abs(cell.x - (x * this.CELL_SIZE + this.CELL_SIZE/2)) < 5 &&
                        Math.abs(cell.y - (y * this.CELL_SIZE + this.CELL_SIZE/2)) < 5)) {
                        clearedCells.push({
                            x: x * this.CELL_SIZE + this.CELL_SIZE/2,
                            y: y * this.CELL_SIZE + this.CELL_SIZE/2,
                            color: this.board[y][x]
                        });
                    }
                }
            }
        }

        // 🎵 DŹWIĘKI CZYSZCZENIA LINII
        if (linesCleared > 0) {
            if (linesCleared === 1) {
                this.soundManager.clearLine();
            } else {
                this.soundManager.multiClear(linesCleared);
            }
        }

        // Efekty cząsteczkowe
        clearedCells.forEach((cell, index) => {
            setTimeout(() => {
                this.createParticleExplosion(cell.x, cell.y, cell.color, 8);
            }, index * 50);
        });

        // Usuń pełne rzędy
        if (rowsToKeep.length < this.BOARD_SIZE) {
            const newBoard = Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(0));
            rowsToKeep.forEach((oldY, newY) => {
                for (let x = 0; x < this.BOARD_SIZE; x++) {
                    newBoard[newY][x] = this.board[oldY][x];
                }
            });
            this.board = newBoard;
        }

        // Usuń pełne kolumny
        for (let y = 0; y < this.BOARD_SIZE; y++) {
            for (let x = 0; x < this.BOARD_SIZE; x++) {
                if (!colsToKeep[x]) {
                    this.board[y][x] = 0;
                }
            }
        }

        if (linesCleared > 1) {
            this.score += linesCleared * 50;

            if (linesCleared >= 3) {
                this.powerups.bomb++;
                // 🎵 BONUS DŹWIĘK
                this.soundManager.scoreBonus();
            }
            if (linesCleared >= 4) {
                this.powerups.star++;
                // 🎵 BONUS DŹWIĘK
                this.soundManager.scoreBonus();
            }
        }

        this.updateScore();
        this.updatePowerupCounts();
    }

    allPiecesUsed() {
        return this.pieces.every(piece => piece.used);
    }

    isGameOver() {
        for (let piece of this.pieces) {
            if (piece.used) continue;

            for (let y = 0; y < this.BOARD_SIZE; y++) {
                for (let x = 0; x < this.BOARD_SIZE; x++) {
                    if (this.canPlacePiece(piece, x, y)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    endGame() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'flex';

        // 🎵 DŹWIĘK KOŃCA GRY
        this.soundManager.gameOver();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Rysuj siatkę
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.BOARD_SIZE; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.CELL_SIZE, 0);
            this.ctx.lineTo(i * this.CELL_SIZE, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.CELL_SIZE);
            this.ctx.lineTo(this.canvas.width, i * this.CELL_SIZE);
            this.ctx.stroke();
        }

        // Rysuj bloki na planszy
        for (let y = 0; y < this.BOARD_SIZE; y++) {
            for (let x = 0; x < this.BOARD_SIZE; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBlock(x * this.CELL_SIZE, y * this.CELL_SIZE, this.board[y][x]);
                }
            }
        }

        // Podgląd umieszczenia
        if (this.highlightPosition) {
            if (this.selectedPiece !== null) {
                const piece = this.pieces[this.selectedPiece];
                if (this.canPlacePiece(piece, this.highlightPosition.x, this.highlightPosition.y)) {
                    this.ctx.globalAlpha = 0.6;
                    for (let y = 0; y < piece.shape.length; y++) {
                        for (let x = 0; x < piece.shape[y].length; x++) {
                            if (piece.shape[y][x] === 1) {
                                const drawX = (this.highlightPosition.x + x) * this.CELL_SIZE;
                                const drawY = (this.highlightPosition.y + y) * this.CELL_SIZE;
                                this.drawBlock(drawX, drawY, piece.color);
                            }
                        }
                    }
                    this.ctx.globalAlpha = 1;
                } else {
                    this.ctx.globalAlpha = 0.3;
                    for (let y = 0; y < piece.shape.length; y++) {
                        for (let x = 0; x < piece.shape[y].length; x++) {
                            if (piece.shape[y][x] === 1) {
                                const drawX = (this.highlightPosition.x + x) * this.CELL_SIZE;
                                const drawY = (this.highlightPosition.y + y) * this.CELL_SIZE;
                                this.drawBlock(drawX, drawY, '#FF4444');
                            }
                        }
                    }
                    this.ctx.globalAlpha = 1;
                }
            } else if (this.activePowerup) {
                this.ctx.globalAlpha = 0.3;
                const x = this.highlightPosition.x * this.CELL_SIZE;
                const y = this.highlightPosition.y * this.CELL_SIZE;

                if (this.activePowerup === 'bomb') {
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const drawX = x + dx * this.CELL_SIZE;
                            const drawY = y + dy * this.CELL_SIZE;
                            if (drawX >= 0 && drawX < this.canvas.width &&
                                drawY >= 0 && drawY < this.canvas.height) {
                                this.drawBlock(drawX, drawY, '#FFD700');
                            }
                        }
                    }
                } else {
                    this.drawBlock(x, y, '#FF4444');
                }
                this.ctx.globalAlpha = 1;
            }
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + 2, y + 2, this.CELL_SIZE - 4, this.CELL_SIZE - 4);

        const gradient = this.ctx.createLinearGradient(x, y, x + this.CELL_SIZE, y + this.CELL_SIZE);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + 2, y + 2, this.CELL_SIZE - 4, this.CELL_SIZE - 4);

        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 2, y + 2, this.CELL_SIZE - 4, this.CELL_SIZE - 4);
    }

    drawPieces() {
        this.pieceCanvases.forEach((canvas, index) => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (!this.pieces[index] || this.pieces[index].used) return;

            const piece = this.pieces[index];
            const cellSize = 25;
            const offsetX = (canvas.width - piece.shape[0].length * cellSize) / 2;
            const offsetY = (canvas.height - piece.shape.length * cellSize) / 2;

            for (let y = 0; y < piece.shape.length; y++) {
                for (let x = 0; x < piece.shape[y].length; x++) {
                    if (piece.shape[y][x] === 1) {
                        const drawX = offsetX + x * cellSize;
                        const drawY = offsetY + y * cellSize;

                        if (piece.special) {
                            ctx.shadowColor = piece.color;
                            ctx.shadowBlur = 10;
                        }

                        ctx.fillStyle = piece.color;
                        ctx.fillRect(drawX + 1, drawY + 1, cellSize - 2, cellSize - 2);

                        const gradient = ctx.createLinearGradient(drawX, drawY, drawX + cellSize, drawY + cellSize);
                        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
                        ctx.fillStyle = gradient;
                        ctx.fillRect(drawX + 1, drawY + 1, cellSize - 2, cellSize - 2);

                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(drawX + 1, drawY + 1, cellSize - 2, cellSize - 2);

                        ctx.shadowBlur = 0;
                    }
                }
            }
        });
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    updatePowerupCounts() {
        document.getElementById('bombCount').textContent = this.powerups.bomb;
        document.getElementById('starCount').textContent = this.powerups.star;
        document.getElementById('destroyCount').textContent = this.powerups.destroy;

        document.getElementById('bombBtn').disabled = this.powerups.bomb <= 0;
        document.getElementById('starBtn').disabled = this.powerups.star <= 0;
        document.getElementById('destroyBtn').disabled = this.powerups.destroy <= 0;
    }
}

// Globalne funkcje
let game;

function initGame() {
    game = new BlockBlastPremium();
}

function resetGame() {
    game.initGame();
}

function changeTheme(themeName) {
    game.changeTheme(themeName);
}

function usePowerup(type) {
    game.usePowerup(type);
}

// 🎵 FUNKCJA TOGGLE DŹWIĘKU
function toggleSound() {
    const soundBtn = document.getElementById('soundToggle');
    const enabled = game.soundManager.toggle();

    soundBtn.textContent = enabled ? '🔊' : '🔇';
    soundBtn.classList.toggle('muted', !enabled);

    // Krótki feedback dźwiękowy przy włączaniu
    if (enabled) {
        setTimeout(() => game.soundManager.selectPiece(), 100);
    }
}

window.addEventListener('load', initGame);