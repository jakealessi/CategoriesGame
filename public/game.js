const socket = io();

// Game state
let currentRoom = null;
let playerNumber = null;
let allAnswers = []; // Track all players' answers

// Screen elements
const screens = {
    home: document.getElementById('home-screen'),
    waiting: document.getElementById('waiting-screen'),
    game: document.getElementById('game-screen'),
    results: document.getElementById('results-screen')
};

// UI Elements
const createGameBtn = document.getElementById('create-game-btn');
const joinGameBtn = document.getElementById('join-game-btn');
const roomCodeInput = document.getElementById('room-code-input');
const roomCodeDisplay = document.getElementById('room-code');
const copyCodeBtn = document.getElementById('copy-code-btn');
const startGameBtn = document.getElementById('start-game-btn');
const leaveGameBtn = document.getElementById('leave-game-btn');
const playerList = document.getElementById('player-list');
const playerNameInput = document.getElementById('player-name-input');
const updateNameBtn = document.getElementById('update-name-btn');

const timerDisplay = document.getElementById('timer');
const categoryDisplay = document.getElementById('category');
const answerInput = document.getElementById('answer-input');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const feedback = document.getElementById('feedback');
const allAnswersListDisplay = document.getElementById('all-answers-list');
const scoresContainer = document.getElementById('scores-container');

const winnerAnnouncement = document.getElementById('winner-announcement');
const finalScoresDisplay = document.getElementById('final-scores');
const playAgainBtn = document.getElementById('play-again-btn');

const errorMessage = document.getElementById('error-message');

// Helper Functions
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 3000);
}

function showFeedback(message, isValid) {
    feedback.textContent = message;
    feedback.className = 'feedback show ' + (isValid ? 'valid' : 'invalid');
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 2000);
}

// Event Listeners
createGameBtn.addEventListener('click', () => {
    socket.emit('create-game');
});

joinGameBtn.addEventListener('click', () => {
    const code = roomCodeInput.value.trim().toUpperCase();
    if (code.length === 6) {
        socket.emit('join-game', code);
    } else {
        showError('Please enter a valid 6-character room code');
    }
});

roomCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinGameBtn.click();
    }
    // Convert to uppercase as user types
    roomCodeInput.value = roomCodeInput.value.toUpperCase();
});

copyCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(currentRoom);
    copyCodeBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyCodeBtn.textContent = 'Copy Code';
    }, 2000);
});

startGameBtn.addEventListener('click', () => {
    socket.emit('start-game', currentRoom);
});

leaveGameBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to leave the game?')) {
        socket.emit('leave-game', currentRoom);
        currentRoom = null;
        playerNumber = null;
        showScreen('home');
    }
});

updateNameBtn.addEventListener('click', () => {
    updatePlayerName();
});

playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        updatePlayerName();
    }
});

function updatePlayerName() {
    const newName = playerNameInput.value.trim();
    if (newName && newName.length > 0) {
        socket.emit('update-name', {
            roomCode: currentRoom,
            newName: newName
        });
    } else {
        showError('Please enter a valid name');
    }
}

submitAnswerBtn.addEventListener('click', () => {
    submitAnswer();
});

answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitAnswer();
    }
});

playAgainBtn.addEventListener('click', () => {
    showScreen('waiting');
    allAnswers = [];
    allAnswersListDisplay.innerHTML = '';
    feedback.textContent = '';
    answerInput.value = '';
});

function submitAnswer() {
    const answer = answerInput.value.trim();
    if (answer) {
        socket.emit('submit-answer', {
            roomCode: currentRoom,
            answer: answer
        });
        answerInput.value = '';
    }
}

// Socket Event Handlers
socket.on('game-created', (data) => {
    currentRoom = data.roomCode;
    playerNumber = data.playerNumber;
    roomCodeDisplay.textContent = currentRoom;
    showScreen('waiting');
    playerList.innerHTML = '<div class="player-item">You (Player 1) - Ready to start!</div>';
    playerNameInput.value = 'Player 1';
    // Show start button for player 1 (can start solo)
    startGameBtn.style.display = 'block';
});

socket.on('game-joined', (data) => {
    currentRoom = data.roomCode;
    playerNumber = data.playerNumber;
    roomCodeDisplay.textContent = currentRoom;
    playerNameInput.value = `Player ${playerNumber}`;
    showScreen('waiting');
});

socket.on('players-ready', (data) => {
    playerList.innerHTML = data.players.map((player, index) => 
        `<div class="player-item">${player.name}${index + 1 === playerNumber ? ' (You)' : ''}</div>`
    ).join('');
    
    // Show start button only for player 1
    if (playerNumber === 1) {
        startGameBtn.style.display = 'block';
    }
});

socket.on('name-updated', (data) => {
    if (data.success) {
        showFeedback('Name updated!', true);
    }
});

socket.on('player-left', (data) => {
    showError(`${data.playerName} left the game`);
});

socket.on('you-are-host', () => {
    playerNumber = 1;
    startGameBtn.style.display = 'block';
    showFeedback('You are now the host!', true);
});

socket.on('game-started', (data) => {
    showScreen('game');
    categoryDisplay.textContent = data.category;
    timerDisplay.textContent = data.timeLeft;
    allAnswers = [];
    allAnswersListDisplay.innerHTML = '';
    feedback.textContent = '';
    answerInput.value = '';
    answerInput.focus();
    
    // Initialize scores
    updateScores(data.players);
    
    // Enable timer color change
    updateTimerColor(data.timeLeft);
});

socket.on('time-update', (data) => {
    timerDisplay.textContent = data.timeLeft;
    updateTimerColor(data.timeLeft);
});

function updateTimerColor(timeLeft) {
    if (timeLeft <= 10) {
        timerDisplay.style.color = '#e53e3e';
    } else if (timeLeft <= 30) {
        timerDisplay.style.color = '#ed8936';
    } else {
        timerDisplay.style.color = '#48bb78';
    }
}

function updateScores(players) {
    scoresContainer.innerHTML = players.map(player => `
        <div class="score-item">
            <span class="player-name">${player.name}</span>
            <span class="player-score">${player.score}</span>
        </div>
    `).join('');
}

function updateAllAnswers() {
    // Sort by timestamp (most recent first)
    const sortedAnswers = [...allAnswers].reverse();
    
    allAnswersListDisplay.innerHTML = sortedAnswers.map(item => `
        <div class="answer-tag ${item.isMe ? 'my-answer' : ''}">
            <span class="player-badge">${item.playerName}</span>
            ${item.answer}
            <span class="points">+${item.points}</span>
        </div>
    `).join('');
}

socket.on('score-update', (data) => {
    updateScores(data.players);
});

socket.on('player-answered', (data) => {
    // Add answer to the list
    allAnswers.push({
        playerName: data.playerName,
        answer: data.answer,
        points: data.points,
        isMe: false // Will be set to true for the player's own answers in answer-result
    });
    updateAllAnswers();
});

socket.on('answer-result', (data) => {
    if (data.valid) {
        showFeedback(data.message, true);
        // Mark the most recent answer as mine
        if (allAnswers.length > 0) {
            allAnswers[allAnswers.length - 1].isMe = true;
            updateAllAnswers();
        }
    } else {
        showFeedback(data.message, false);
    }
});

socket.on('game-ended', (data) => {
    showScreen('results');
    
    if (data.winner === 'Tie!') {
        winnerAnnouncement.textContent = "🤝 It's a Tie!";
    } else {
        winnerAnnouncement.textContent = `🏆 ${data.winner} Wins!`;
    }
    
    finalScoresDisplay.innerHTML = data.results.map(player => `
        <div class="final-score-item">
            <div class="final-score-header">
                <span class="final-player-name">${player.name}</span>
                <span class="final-player-score">${player.score}</span>
            </div>
            <div class="final-answers">
                ${player.answers.map(answer => 
                    `<div class="answer-tag">${answer}</div>`
                ).join('')}
            </div>
        </div>
    `).join('');
});

socket.on('player-disconnected', () => {
    showError('Other player disconnected');
    setTimeout(() => {
        showScreen('home');
        currentRoom = null;
        playerNumber = null;
    }, 2000);
});

socket.on('error', (data) => {
    showError(data.message);
});
