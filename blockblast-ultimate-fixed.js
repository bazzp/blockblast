// USTAWIENIA GLOBALNE
const gameSettings = {
    theme: 'classic',
    boardSize: 8,
    soundEnabled: true,
    volume: 0.7
};

// STAN GRY - NAPRAWIONY
let gameState = {
    isPaused: false,
    savedGameData: null,
    hasActiveGame: false
};

// MUZYKA TŁA - UPROSZCZONA
let backgroundMusic = {
    audio: null,
    isPlaying: false
};

// Załaduj ustawienia z localStorage
function loadSettings() {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
        Object.assign(gameSettings, JSON.parse(saved));
    }
}

// ZARZĄDZANIE MENU - NAPRAWIONE
function showMainMenu() {
    // Zapisz stan gry TYLKO jeśli jest aktywna i nie zakończona
    if (window.game && gameState.hasActiveGame && !window.game.isGameOver) {
        gameState.savedGameData = window.game.saveGameState();
        gameState.isPaused = true;
        document.getElementById('resumeBtn').style.display = 'block';
        console.log('✅ Stan gry zapisany'); // Debug
    } else {
        console.log('❌ Brak gry do zapisania'); // Debug
    }

    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('settingsPanel').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
}

function startNewGame() {
    console.log('🚀 Rozpoczynanie nowej gry'); // Debug
    gameState.isPaused = false;
    gameState.savedGameData = null;
    gameState.hasActiveGame = true;
    document.getElementById('resumeBtn').style.display = 'none';
    showGame();
}

function resumeGame() {
    console.log('▶️ Wznawianie gry', gameState.savedGameData ? 'DANE ISTNIEJĄ' : 'BRAK DANYCH'); // Debug
    if (gameState.savedGameData && window.game) {
        window.game.loadGameState(gameState.savedGameData);
        gameState.isPaused = false;
        gameState.hasActiveGame = true;
        showGame();
    }
}

function pauseToMenu() {
    console.log('⏸️ Pauzowanie gry'); // Debug
    showMainMenu();
}

function showGame() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'flex';

    // Inicjalizuj grę z aktualnych ustawień
    if (window.game) {
        if (!gameState.isPaused) {
            console.log('🔄 Inicjalizacja nowej gry'); // Debug
            window.game.updateBoardSize(gameSettings.boardSize);
            window.game.changeTheme(gameSettings.theme);
            window.game.initGame();
        } else {
            console.log('⏸️ Powrót do zapisanej gry'); // Debug
        }
    } else {
        console.log('🎮 Tworzenie nowej instancji gry'); // Debug
        initGame();
    }
}

function showSettings() {
    document.getElementById('settingsPanel').style.display = 'flex';
    loadSettingsUI();
}

function hideSettings() {
    document.getElementById('settingsPanel').style.display = 'none';
}

function showHighScores() {
    const scores = {
        6: localStorage.getItem('highScore6') || '0',
        8: localStorage.getItem('highScore8') || '0',
        10: localStorage.getItem('highScore10') || '0'
    };

    alert(`🏆 NAJLEPSZE WYNIKI:\n\n6×6 (Łatwy): ${scores[6]} pkt\n8×8 (Normalny): ${scores[8]} pkt\n10×10 (Trudny): ${scores[10]} pkt\n\n🎮 Zagraj więcej aby pobić rekordy!`);
}

function showAbout() {
    alert(`🎮 BLOCK BLAST ULTIMATE\n\n✨ Wersja: 4.1 Fixed\n👨‍💻 Autor: @bazzp\n📅 Data: 2025-05-27\n\n🎯 CEL GRY:\nUmieszczaj klocki na planszy i usuwaj pełne linie!\n\n🚀 FUNKCJE:\n• Pauza z zachowaniem stanu gry\n• Efekty kruszenia bloków\n• Naprawiona fizyka grawitacji\n• Muzyka tła z pliku\n• Punkty tylko za zniszczenie\n\n🎵 STEROWANIE:\n• Kliknij klocek → kliknij planszę\n• Używaj power-upów strategicznie\n• Menu = pauza z możliwością powrotu\n\n🎼 MUZYKA:\nUmieść plik background-music.mp3 w folderze gry\n\n💎 Powodzenia!`);
}

function restartGame() {
    console.log('🔄 Restart gry'); // Debug
    document.getElementById('gameOver').style.display = 'none';
    gameState.isPaused = false;
    gameState.savedGameData = null;
    gameState.hasActiveGame = true;
    document.getElementById('resumeBtn').style.display = 'none';
    if (window.game) {
        window.game.initGame();
    }
}

// MUZYKA TŁA - UPROSZCZONA DO PLIKU
function initBackgroundMusic() {
    backgroundMusic.audio = document.getElementById('backgroundMusic');
    if (backgroundMusic.audio) {
        backgroundMusic.audio.volume = gameSettings.volume * 0.3;
        backgroundMusic.audio.addEventListener('canplay', () => {
            document.getElementById('musicStatus').textContent = 'Muzyka gotowa do odtwarzania';
            document.getElementById('playMusicBtn').disabled = false;
            document.getElementById('stopMusicBtn').disabled = false;
        });
        backgroundMusic.audio.addEventListener('error', () => {
            document.getElementById('musicStatus').textContent = 'Brak pliku background-music.mp3 w folderze';
            document.getElementById('playMusicBtn').disabled = true;
            document.getElementById('stopMusicBtn').disabled = true;
        });
    }
}

function toggleBackgroundMusic() {
    if (!backgroundMusic.audio) return;

    if (backgroundMusic.isPlaying) {
        backgroundMusic.audio.pause();
        backgroundMusic.isPlaying = false;
        document.getElementById('playMusicBtn').innerHTML = '▶️ Odtwórz';
    } else {
        backgroundMusic.audio.play().then(() => {
            backgroundMusic.isPlaying = true;
            document.getElementById('playMusicBtn').innerHTML = '⏸️ Pauza';
        }).catch(() => {
            document.getElementById('musicStatus').textContent = 'Nie można odtworzyć muzyki';
        });
    }
}

function stopBackgroundMusic() {
    if (!backgroundMusic.audio) return;

    backgroundMusic.audio.pause();
    backgroundMusic.audio.currentTime = 0;
    backgroundMusic.isPlaying = false;
    document.getElementById('playMusicBtn').innerHTML = '▶️ Odtwórz';
}

// USTAWIENIA
function loadSettingsUI() {
    // Załaduj aktualny motyw
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === gameSettings.theme) {
            option.classList.add('active');
        }
    });

    // Załaduj aktualny rozmiar planszy
    document.querySelectorAll('.board-option').forEach(option => {
        option.classList.remove('active');
        if (parseInt(option.dataset.size) === gameSettings.boardSize) {
            option.classList.add('active');
        }
    });

    // Załaduj głośność
    document.getElementById('volumeSlider').value = gameSettings.volume * 100;

    // Event listenery dla ustawień
    document.querySelectorAll('.theme-option').forEach(option => {
        option.onclick = () => {
            document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
        };
    });

    document.querySelectorAll('.board-option').forEach(option => {
        option.onclick = () => {
            document.querySelectorAll('.board-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
        };
    });
}

function applySettings() {
    // Zapisz motyw
    const selectedTheme = document.querySelector('.theme-option.active');
    if (selectedTheme) {
        gameSettings.theme = selectedTheme.dataset.theme;
    }

    // Zapisz rozmiar planszy
    const selectedBoard = document.querySelector('.board-option.active');
    if (selectedBoard) {
        gameSettings.boardSize = parseInt(selectedBoard.dataset.size);
    }

    // Zapisz głośność
    gameSettings.volume = document.getElementById('volumeSlider').value / 100;

    // Zastosuj ustawienia do gry
    if (window.game) {
        window.game.changeTheme(gameSettings.theme);
        window.game.soundManager.setVolume(gameSettings.volume);

        // Dostosuj głośność muzyki
        if (backgroundMusic.audio) {
            backgroundMusic.audio.volume = gameSettings.volume * 0.3;
        }
    }

    // Zapisz do localStorage
    localStorage.setItem('gameSettings', JSON.stringify(gameSettings));

    hideSettings();
    alert('✅ Ustawienia zostały zapisane i zastosowane!');
}

// SOUND MANAGER
class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = gameSettings.soundEnabled;
        this.volume = gameSettings.volume;
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

    setVolume(volume) {
        this.volume = volume;
        gameSettings.volume = volume;
    }

    playTone(frequency, duration = 0.2, type = 'sine', volumeMultiplier = 1) {
        if (!this.enabled || !this.audioContext) return;

        this.resumeContext();

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        const finalVolume = this.volume * volumeMultiplier;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(finalVolume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Wszystkie dźwięki
    placePiece() { if (this.enabled) this.playTone(440, 0.1, 'square', 0.6); }
    clearLine() {
        if (!this.enabled) return;
        setTimeout(() => this.playTone(523, 0.15, 'sine', 0.8), 0);
        setTimeout(() => this.playTone(659, 0.15, 'sine', 0.8), 100);
        setTimeout(() => this.playTone(784, 0.2, 'sine', 0.8), 200);
    }
    multiClear(count) {
        if (!this.enabled) return;
        const notes = [523, 659, 784, 988, 1175];
        for (let i = 0; i < count && i < notes.length; i++) {
            setTimeout(() => this.playTone(notes[i], 0.3, 'triangle', 0.8), i * 80);
        }
    }
    bombExplosion() { if (this.enabled) this.playTone(150, 0.3, 'sawtooth', 0.8); }
    starEffect() {
        if (!this.enabled) return;
        const notes = [440, 554, 659, 831, 1047];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.4, 'triangle', 0.6), i * 150);
        });
    }
    rainbowEffect() {
        if (!this.enabled) return;
        const notes = [261, 294, 330, 349, 392, 440, 494, 523];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.2, 'sine', 0.5), i * 80);
        });
    }
    selectPiece() { if (this.enabled) this.playTone(800, 0.05, 'square', 0.3); }
    cannotPlace() { if (this.enabled) this.playTone(200, 0.2, 'sawtooth', 0.6); }
    gameOver() {
        if (!this.enabled) return;
        const notes = [523, 466, 415, 392, 349, 311, 277, 247];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.4, 'triangle', 0.6), i * 200);
        });
    }
    newGame() {
        if (!this.enabled) return;
        const notes = [261, 330, 392, 523];
        notes.forEach((note, i) => {
            setTimeout(() => this.playTone(note, 0.3, 'triangle', 0.8), i * 100);
        });
    }
    powerupActivate() { if (this.enabled) this.playTone(1000, 0.1, 'square', 0.6); }
    specialPiecePlace() {
        if (!this.enabled) return;
        this.playTone(659, 0.1, 'triangle', 0.6);
        setTimeout(() => this.playTone(831, 0.1, 'triangle', 0.6), 50);
        setTimeout(() => this.playTone(1047, 0.15, 'triangle', 0.6), 100);
    }
    scoreBonus() { if (this.enabled) this.playTone(831, 0.1, 'sine', 0.5); }

    // Dźwięk kruszenia - POPRAWIONY
    blockCrumble() { if (this.enabled) this.playTone(300, 0.3, 'sawtooth', 0.5); }

    toggle() {
        this.enabled = !this.enabled;
        gameSettings.soundEnabled = this.enabled;
        return this.enabled;
    }
}

// GŁÓWNA KLASA GRY
class BlockBlastUltimate {
    constructor() {
        this.CELL_SIZE = 60;
        this.board = [];
        this.score = 0;
        this.selectedPiece = null;
        this.pieces = [];
        this.currentTheme = gameSettings.theme;
        this.activePowerup = null;
        this.BOARD_SIZE = gameSettings.boardSize;
        this.isGameOver = false;

        this.soundManager = new SoundManager();

        this.powerups = {
            bomb: this.BOARD_SIZE <= 6 ? 5 : this.BOARD_SIZE <= 8 ? 3 : 2,
            star: this.BOARD_SIZE <= 6 ? 4 : this.BOARD_SIZE <= 8 ? 2 : 1,
            destroy: this.BOARD_SIZE <= 6 ? 3 : this.BOARD_SIZE <= 8 ? 1 : 1
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

        this.updateCanvasSize();
        this.initGame();
        this.setupEventListeners();
    }

    // SAVE/LOAD GAME STATE - NAPRAWIONY
    saveGameState() {
        console.log('💾 Zapisywanie stanu gry'); // Debug
        return {
            board: JSON.parse(JSON.stringify(this.board)),
            score: this.score,
            pieces: JSON.parse(JSON.stringify(this.pieces)),
            powerups: JSON.parse(JSON.stringify(this.powerups)),
            selectedPiece: this.selectedPiece,
            BOARD_SIZE: this.BOARD_SIZE,
            currentTheme: this.currentTheme,
            isGameOver: this.isGameOver
        };
    }

    loadGameState(savedState) {
        console.log('📁 Ładowanie stanu gry'); // Debug
        this.board = savedState.board;
        this.score = savedState.score;
        this.pieces = savedState.pieces;
        this.powerups = savedState.powerups;
        this.selectedPiece = savedState.selectedPiece;
        this.BOARD_SIZE = savedState.BOARD_SIZE;
        this.currentTheme = savedState.currentTheme;
        this.isGameOver = savedState.isGameOver || false;

        this.updateCanvasSize();
        this.updateScore();
        this.updatePowerupCounts();
        this.updateDifficultyIndicator();
        this.drawPieces();
        this.updatePieceContainers();
        this.draw();

        // NIE RESETUJ STANU - to był błąd!
        gameState.isPaused = false;
    }

    updateBoardSize(size) {
        this.BOARD_SIZE = size;

        // Dostosuj power-upy do trudności
        this.powerups = {
            bomb: size <= 6 ? 5 : size <= 8 ? 3 : 2,
            star: size <= 6 ? 4 : size <= 8 ? 2 : 1,
            destroy: size <= 6 ? 3 : size <= 8 ? 1 : 1
        };

        this.updateCanvasSize();
        this.updateDifficultyIndicator();
        this.initGame();
    }

    updateCanvasSize() {
        const canvasSize = this.BOARD_SIZE * this.CELL_SIZE;
        this.canvas.width = canvasSize;
        this.canvas.height = canvasSize;
    }

    updateDifficultyIndicator() {
        const indicator = document.getElementById('difficultyIndicator');
        const difficulties = {
            6: 'Łatwy',
            8: 'Normalny',
            10: 'Trudny'
        };

        const diffClass = {
            6: 'difficulty-easy',
            8: 'difficulty-normal',
            10: 'difficulty-hard'
        };

        indicator.textContent = `${this.BOARD_SIZE}×${this.BOARD_SIZE} ${difficulties[this.BOARD_SIZE]}`;
        indicator.className = `difficulty-indicator ${diffClass[this.BOARD_SIZE]}`;
    }

    initGame() {
        console.log('🎮 Inicjalizacja gry'); // Debug
        this.board = Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(0));
        this.score = 0;
        this.activePowerup = null;
        this.highlightPosition = null;
        this.isGameOver = false;

        // Reset power-upów z uwzględnieniem trudności
        this.powerups = {
            bomb: this.BOARD_SIZE <= 6 ? 5 : this.BOARD_SIZE <= 8 ? 3 : 2,
            star: this.BOARD_SIZE <= 6 ? 4 : this.BOARD_SIZE <= 8 ? 2 : 1,
            destroy: this.BOARD_SIZE <= 6 ? 3 : this.BOARD_SIZE <= 8 ? 1 : 1
        };

        this.updateScore();
        this.updatePowerupCounts();
        this.generateNewPieces();
        this.draw();

        document.querySelectorAll('.powerup-btn').forEach(btn => {
            btn.style.background = '#28a745';
        });
        this.canvas.style.cursor = 'default';

        this.soundManager.newGame();
        this.updateDifficultyIndicator();

        // Wyczyść zapisany stan TYLKO przy nowej grze
        gameState.savedGameData = null;
        document.getElementById('resumeBtn').style.display = 'none';
        gameState.hasActiveGame = true;
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
        this.drawPieces();
        this.draw();
    }

    getCurrentColors() {
        return this.themes[this.currentTheme];
    }

    generateNewPieces() {
        this.pieces = [];

        // Różne kształty w zależności od rozmiaru planszy
        let pieceShapes;

        if (this.BOARD_SIZE <= 6) {
            // Mniejsze klocki dla małej planszy
            pieceShapes = [
                [[1]], [[1, 1]], [[1, 1, 1]],
                [[1], [1]], [[1], [1], [1]],
                [[1, 1], [1, 1]],
                [[1, 0], [1, 1]], [[1, 1], [1, 0]],
                [[1, 1, 1], [0, 1, 0]]
            ];
        } else if (this.BOARD_SIZE <= 8) {
            // Średnie klocki dla normalnej planszy
            pieceShapes = [
                [[1]], [[1, 1]], [[1, 1, 1]], [[1, 1, 1, 1]],
                [[1], [1]], [[1], [1], [1]], [[1], [1], [1], [1]],
                [[1, 1], [1, 1]], [[1, 1, 1], [1, 1, 1]],
                [[1, 0], [1, 0], [1, 1]], [[1, 1, 1], [1, 0, 0]],
                [[1, 1], [1, 0], [1, 0]], [[0, 0, 1], [1, 1, 1]],
                [[1, 1, 1], [0, 1, 0]], [[0, 1], [1, 1], [0, 1]],
                [[1, 1, 0], [0, 1, 1]], [[0, 1], [1, 1], [1, 0]],
                [[1, 0, 1], [1, 1, 1]]
            ];
        } else {
            // Większe klocki dla trudnej planszy
            pieceShapes = [
                [[1]], [[1, 1]], [[1, 1, 1]], [[1, 1, 1, 1]], [[1, 1, 1, 1, 1]],
                [[1], [1]], [[1], [1], [1]], [[1], [1], [1], [1]], [[1], [1], [1], [1], [1]],
                [[1, 1], [1, 1]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
                [[1, 0], [1, 0], [1, 1]], [[1, 1, 1], [1, 0, 0]],
                [[1, 1], [1, 0], [1, 0]], [[0, 0, 1], [1, 1, 1]],
                [[1, 1, 1], [0, 1, 0]], [[0, 1], [1, 1], [0, 1]],
                [[1, 1, 0], [0, 1, 1]], [[0, 1], [1, 1], [1, 0]],
                [[1, 0, 1], [1, 1, 1]], [[1, 1, 1, 1], [0, 1, 1, 0]],
                [[1, 0, 0], [1, 1, 0], [0, 1, 1]]
            ];
        }

        const colors = this.getCurrentColors();

        for (let i = 0; i < 3; i++) {
            const shapeIndex = Math.floor(Math.random() * pieceShapes.length);
            const shape = pieceShapes[shapeIndex];
            const color = colors[Math.floor(Math.random() * colors.length)];

            // Szanse na specjalne klocki zależą od trudności
            const specialChance = this.BOARD_SIZE <= 6 ? 0.20 : this.BOARD_SIZE <= 8 ? 0.15 : 0.10;
            const isSpecial = Math.random() < specialChance;
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

            if (this.isGameOverCheck()) {
                this.endGame();
            }
        } else {
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
                    this.soundManager.bombExplosion();
                }, 1000);
                break;

            case 'star':
                setTimeout(() => {
                    this.removeColorBlocks(color);
                    this.createStarEffect();
                    this.soundManager.starEffect();
                }, 1000);
                break;

            case 'rainbow':
                setTimeout(() => {
                    this.rainbowEffect(x, y);
                    this.soundManager.rainbowEffect();
                }, 1000);
                break;
        }
    }

    explodeArea(centerX, centerY, radius) {
        const blocksToDestroy = [];

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const newX = centerX + dx;
                const newY = centerY + dy;

                if (newX >= 0 && newX < this.BOARD_SIZE &&
                    newY >= 0 && newY < this.BOARD_SIZE) {
                    if (this.board[newY][newX] !== 0) {
                        blocksToDestroy.push({
                            x: newX,
                            y: newY,
                            color: this.board[newY][newX]
                        });
                        this.board[newY][newX] = 0;
                        this.score += 25; // PUNKTY ZA ZNISZCZENIE
                    }
                }
            }
        }

        // Efekt kruszenia dla zniszczonych bloków
        blocksToDestroy.forEach((block, index) => {
            setTimeout(() => {
                this.createCrumbleEffect(block.x, block.y, block.color);
            }, index * 50);
        });

        this.updateScore();
        this.draw();
    }

    removeColorBlocks(color) {
        const blocksToDestroy = [];

        for (let y = 0; y < this.BOARD_SIZE; y++) {
            for (let x = 0; x < this.BOARD_SIZE; x++) {
                if (this.board[y][x] === color) {
                    blocksToDestroy.push({ x, y, color });
                    this.board[y][x] = 0;
                }
            }
        }

        // Efekt kruszenia dla wszystkich bloków tego koloru
        blocksToDestroy.forEach((block, index) => {
            setTimeout(() => {
                this.createCrumbleEffect(block.x, block.y, block.color);
            }, index * 30);
        });

        this.score += blocksToDestroy.length * 50; // PUNKTY ZA ZNISZCZENIE
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
        this.score += 100; // PUNKTY ZA EFEKT
        this.updateScore();
        this.draw();
    }

    usePowerup(type) {
        if (this.powerups[type] <= 0) return;

        this.activePowerup = type;
        this.canvas.style.cursor = 'crosshair';

        document.querySelectorAll('.powerup-btn').forEach(btn => btn.style.background = '#28a745');
        document.getElementById(`${type}Btn`).style.background = '#dc3545';

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
                    this.soundManager.bombExplosion();
                }
                break;

            case 'star':
                if (this.powerups.star > 0 && this.board[y][x] !== 0) {
                    this.removeColorBlocks(this.board[y][x]);
                    this.powerups.star--;
                    this.soundManager.starEffect();
                }
                break;

            case 'destroy':
                if (this.powerups.destroy > 0 && this.board[y][x] !== 0) {
                    const color = this.board[y][x];
                    this.board[y][x] = 0;
                    this.createCrumbleEffect(x, y, color);
                    this.score += 30; // PUNKTY ZA ZNISZCZENIE
                    this.powerups.destroy--;
                    this.updateScore();
                    this.draw();
                    this.soundManager.blockCrumble();
                }
                break;
        }

        this.activePowerup = null;
        this.canvas.style.cursor = 'default';
        this.updatePowerupCounts();

        document.querySelectorAll('.powerup-btn').forEach(btn => btn.style.background = '#28a745');
    }

    // EFEKT KRUSZENIA KLOCKÓW - POPRAWIONY
    createCrumbleEffect(x, y, color) {
        const particleContainer = document.getElementById('particles');
        const centerX = x * this.CELL_SIZE + this.CELL_SIZE/2;
        const centerY = y * this.CELL_SIZE + this.CELL_SIZE/2;

        // Utwórz kilka małych kawałków klocka z lepszą animacją
        for (let i = 0; i < 6; i++) {
            const crumb = document.createElement('div');
            crumb.className = 'crumbling-block';
            crumb.style.backgroundColor = color;
            crumb.style.left = centerX + 'px';
            crumb.style.top = centerY + 'px';

            // Losowe kierunki ruchu
            const angle = (i / 6) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const distance = 30 + Math.random() * 50;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;

            // Ustawienia CSS custom properties dla animacji
            crumb.style.setProperty('--dx', dx + 'px');
            crumb.style.setProperty('--dy', dy + 'px');

            particleContainer.appendChild(crumb);

            setTimeout(() => {
                if (crumb.parentNode) {
                    crumb.parentNode.removeChild(crumb);
                }
            }, 1200);
        }

        this.soundManager.blockCrumble();
    }

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

        // USUNIĘTE PUNKTY ZA POSTAWIENIE - punkty tylko za zniszczenie!
        // this.score += baseScore; <- USUNIĘTE
        // this.updateScore(); <- USUNIĘTE
        // this.showScorePopup(baseScore, startX * this.CELL_SIZE, startY * this.CELL_SIZE); <- USUNIĘTE
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
        const clearedCells = [];

        // Sprawdź rzędy - NAPRAWIONA LOGIKA
        const rowsToRemove = [];
        for (let y = 0; y < this.BOARD_SIZE; y++) {
            let fullRow = true;
            for (let x = 0; x < this.BOARD_SIZE; x++) {
                if (this.board[y][x] === 0) {
                    fullRow = false;
                    break;
                }
            }
            if (fullRow) {
                rowsToRemove.push(y);
                linesCleared++;
                this.score += 100; // PUNKTY ZA ZNISZCZENIE LINII

                for (let x = 0; x < this.BOARD_SIZE; x++) {
                    clearedCells.push({
                        x: x * this.CELL_SIZE + this.CELL_SIZE/2,
                        y: y * this.CELL_SIZE + this.CELL_SIZE/2,
                        color: this.board[y][x]
                    });
                }
            }
        }

        // Sprawdź kolumny - NAPRAWIONA LOGIKA
        const colsToRemove = [];
        for (let x = 0; x < this.BOARD_SIZE; x++) {
            let fullCol = true;
            for (let y = 0; y < this.BOARD_SIZE; y++) {
                if (this.board[y][x] === 0) {
                    fullCol = false;
                    break;
                }
            }
            if (fullCol) {
                colsToRemove.push(x);
                linesCleared++;
                this.score += 100; // PUNKTY ZA ZNISZCZENIE LINII

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

        // Dźwięki czyszczenia linii
        if (linesCleared > 0) {
            if (linesCleared === 1) {
                this.soundManager.clearLine();
            } else {
                this.soundManager.multiClear(linesCleared);
            }
        }

        // Efekty cząsteczkowe z kruszeniem
        clearedCells.forEach((cell, index) => {
            setTimeout(() => {
                this.createCrumbleEffect(
                    Math.floor(cell.x / this.CELL_SIZE),
                    Math.floor(cell.y / this.CELL_SIZE),
                    cell.color
                );
            }, index * 30);
        });

        // NAPRAWIONA GRAWITACJA - usuń tylko oznaczone rzędy i kolumny
        rowsToRemove.forEach(row => {
            for (let x = 0; x < this.BOARD_SIZE; x++) {
                this.board[row][x] = 0;
            }
        });

        colsToRemove.forEach(col => {
            for (let y = 0; y < this.BOARD_SIZE; y++) {
                this.board[y][col] = 0;
            }
        });

        if (linesCleared > 1) {
            this.score += linesCleared * 50; // BONUS ZA MULTI-CLEAR

            if (linesCleared >= 3) {
                this.powerups.bomb++;
                this.soundManager.scoreBonus();
            }
            if (linesCleared >= 4) {
                this.powerups.star++;
                this.soundManager.scoreBonus();
            }
        }

        this.updateScore();
        this.updatePowerupCounts();
    }

    allPiecesUsed() {
        return this.pieces.every(piece => piece.used);
    }

    isGameOverCheck() {
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
        this.isGameOver = true;
        gameState.hasActiveGame = false;

        // Zapisz najlepszy wynik
        const currentHighScore = parseInt(localStorage.getItem(`highScore${this.BOARD_SIZE}`) || '0');
        if (this.score > currentHighScore) {
            localStorage.setItem(`highScore${this.BOARD_SIZE}`, this.score.toString());
        }

        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalBoardSize').textContent = `${this.BOARD_SIZE}×${this.BOARD_SIZE}`;
        document.getElementById('gameOver').style.display = 'flex';

        // Wyczyść zapisany stan
        gameState.savedGameData = null;
        document.getElementById('resumeBtn').style.display = 'none';

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

// GLOBALNE FUNKCJE
let game;

function initGame() {
    loadSettings();
    game = new BlockBlastUltimate();
    window.game = game;
}

function usePowerup(type) {
    game.usePowerup(type);
}

// INICJALIZACJA
window.addEventListener('load', () => {
    loadSettings();
    initBackgroundMusic();
    // Pokaż menu główne na start
    showMainMenu();
});