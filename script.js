// Global Variables
let currentUser = null;
let currentGame = 'ke';
let userBalance = 1000;
let bettingHistory = [];
let selectedKENumber = null;
let selected5DNumber = '';
let selectedTRXColor = null;

// Initialize
window.addEventListener('load', () => {
    loadUserData();
    initializeGame();
});

// Load user data from localStorage
function loadUserData() {
    const savedUser = localStorage.getItem('winGoUser');
    const savedBalance = localStorage.getItem('winGoBalance');
    const savedHistory = localStorage.getItem('winGoHistory');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('gameSection').style.display = 'block';
        document.getElementById('userName').textContent = currentUser.username;
    }
    
    if (savedBalance) {
        userBalance = parseFloat(savedBalance);
    }
    
    if (savedHistory) {
        bettingHistory = JSON.parse(savedHistory);
    }
    
    updateBalance();
    displayHistory();
}

// Login / Register
function login() {
    const username = document.getElementById('authUsername').value.trim();
    const email = document.getElementById('authEmail').value.trim();
    
    if (!username || !email) {
        alert('Please enter username and email');
        return;
    }
    
    if (!email.includes('@')) {
        alert('Please enter valid email');
        return;
    }
    
    currentUser = {
        username: username,
        email: email,
        joinDate: new Date().toLocaleString()
    };
    
    localStorage.setItem('winGoUser', JSON.stringify(currentUser));
    localStorage.setItem('winGoBalance', userBalance);
    
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('gameSection').style.display = 'block';
    document.getElementById('userName').textContent = currentUser.username;
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        selectedKENumber = null;
        selected5DNumber = '';
        selectedTRXColor = null;
        
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('gameSection').style.display = 'none';
        document.getElementById('authUsername').value = '';
        document.getElementById('authEmail').value = '';
    }
}

// Initialize Game
function initializeGame() {
    generateKENumbers();
    startTimers();
}

// Generate KE Numbers (0-99)
function generateKENumbers() {
    const grid = document.getElementById('keNumberGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 100; i++) {
        const btn = document.createElement('button');
        btn.className = 'number-btn';
        btn.textContent = String(i).padStart(2, '0');
        btn.onclick = () => selectKENumber(i, btn);
        grid.appendChild(btn);
    }
}

// Select KE Number
function selectKENumber(num, btn) {
    document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedKENumber = num;
}

// Start Game Timers
function startTimers() {
    startTimer('keTimer', 60, () => autoSubmitKE());
    startTimer('5dTimer', 60, () => autoSubmit5D());
    startTimer('trxTimer', 60, () => autoSubmitTRX());
}

function startTimer(elementId, duration, callback) {
    let timeLeft = duration;
    const timerElement = document.getElementById(elementId);
    
    const interval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            if (callback) callback();
            timeLeft = duration;
            setTimeout(() => startTimer(elementId, duration, callback), 2000);
        }
    }, 1000);
}

// Auto Submit Functions
function autoSubmitKE() {
    if (selectedKENumber !== null) {
        placeBetKE(true);
    }
}

function autoSubmit5D() {
    if (selected5DNumber.length === 5) {
        placeBet5D(true);
    }
}

function autoSubmitTRX() {
    if (selectedTRXColor) {
        placeBetTRX(true);
    }
}

// Place Bet KE
function placeBetKE(auto = false) {
    if (selectedKENumber === null) {
        alert('Please select a number');
        return;
    }
    
    const betAmount = parseFloat(document.getElementById('keBetAmount').value);
    
    if (!betAmount || betAmount <= 0) {
        alert('Please enter valid bet amount');
        return;
    }
    
    if (betAmount > userBalance) {
        alert('Insufficient balance');
        return;
    }
    
    // Deduct bet
    userBalance -= betAmount;
    
    // Generate winning number
    const winningNumber = Math.floor(Math.random() * 100);
    
    // Check result
    const isWin = selectedKENumber === winningNumber;
    const winAmount = isWin ? betAmount * 2 : 0;
    
    if (isWin) {
        userBalance += winAmount;
    }
    
    // Update balance
    updateBalance();
    
    // Display result
    displayResult('ke', isWin, winAmount, betAmount, selectedKENumber, winningNumber);
    
    // Save to history
    addToHistory('KE', selectedKENumber, winningNumber, isWin, betAmount, winAmount);
    
    // Reset
    selectedKENumber = null;
    document.getElementById('keBetAmount').value = '10';
    document.querySelectorAll('.number-btn').forEach(b => b.classList.remove('selected'));
}

// Place Bet 5D
function placeBet5D(auto = false) {
    if (selected5DNumber.length !== 5) {
        alert('Please enter 5 digits');
        return;
    }
    
    const betAmount = parseFloat(document.getElementById('5dBetAmount').value);
    
    if (!betAmount || betAmount <= 0) {
        alert('Please enter valid bet amount');
        return;
    }
    
    if (betAmount > userBalance) {
        alert('Insufficient balance');
        return;
    }
    
    // Deduct bet
    userBalance -= betAmount;
    
    // Generate winning number
    const winningNumber = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    
    // Check result
    const isWin = selected5DNumber === winningNumber;
    const winAmount = isWin ? betAmount * 10 : 0;
    
    if (isWin) {
        userBalance += winAmount;
    }
    
    // Update balance
    updateBalance();
    
    // Display result
    displayResult('5d', isWin, winAmount, betAmount, selected5DNumber, winningNumber);
    
    // Save to history
    addToHistory('5D', selected5DNumber, winningNumber, isWin, betAmount, winAmount);
    
    // Reset
    selected5DNumber = '';
    document.getElementById('5dNumber').value = '';
    document.getElementById('digitDisplay').textContent = '00000';
    document.getElementById('5dBetAmount').value = '10';
}

// Place Bet TRX
function placeBetTRX(auto = false) {
    if (!selectedTRXColor) {
        alert('Please select a color');
        return;
    }
    
    const betAmount = parseFloat(document.getElementById('trxBetAmount').value);
    
    if (!betAmount || betAmount <= 0) {
        alert('Please enter valid bet amount');
        return;
    }
    
    if (betAmount > userBalance) {
        alert('Insufficient balance');
        return;
    }
    
    // Deduct bet
    userBalance -= betAmount;
    
    // Generate winning color
    const colors = ['red', 'blue', 'green'];
    const winningColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Check result
    const isWin = selectedTRXColor === winningColor;
    const winAmount = isWin ? betAmount * 2 : 0;
    
    if (isWin) {
        userBalance += winAmount;
    }
    
    // Update balance
    updateBalance();
    
    // Display result
    displayResult('trx', isWin, winAmount, betAmount, selectedTRXColor, winningColor);
    
    // Save to history
    addToHistory('TRX', selectedTRXColor, winningColor, isWin, betAmount, winAmount);
    
    // Reset
    selectedTRXColor = null;
    document.getElementById('trxBetAmount').value = '10';
    document.getElementById('selectedColor').textContent = 'Select a color';
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
}

// Display Result
function displayResult(game, isWin, winAmount, betAmount, playerPick, winningPick) {
    const resultElement = document.getElementById(game + 'Result');
    resultElement.className = 'result-section show ' + (isWin ? 'win' : 'lose');
    
    let resultHTML = `
        <div class="result-text">${isWin ? '🎉 YOU WON!' : '❌ YOU LOST'}</div>
        <div class="result-amount">
            Your Pick: ${playerPick} | Winning: ${winningPick}
        </div>
        <div class="result-amount">
            Bet: $${betAmount} | ${isWin ? 'Won: $' + winAmount : 'Lost'}
        </div>
    `;
    
    resultElement.innerHTML = resultHTML;
    
    setTimeout(() => {
        resultElement.classList.remove('show');
    }, 4000);
}

// Update Balance Display
function updateBalance() {
    document.getElementById('balance').textContent = userBalance.toFixed(2);
    localStorage.setItem('winGoBalance', userBalance);
}

// Add to History
function addToHistory(game, playerPick, winningPick, isWin, betAmount, winAmount) {
    const historyItem = {
        game: game,
        playerPick: playerPick,
        winningPick: winningPick,
        isWin: isWin,
        betAmount: betAmount,
        winAmount: winAmount,
        timestamp: new Date().toLocaleTimeString()
    };
    
    bettingHistory.unshift(historyItem);
    if (bettingHistory.length > 50) bettingHistory.pop();
    
    localStorage.setItem('winGoHistory', JSON.stringify(bettingHistory));
    displayHistory();
}

// Display History
function displayHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    if (bettingHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: #999;">No bets yet</p>';
        return;
    }
    
    bettingHistory.forEach(item => {
        const historyDiv = document.createElement('div');
        historyDiv.className = 'history-item ' + (item.isWin ? 'win' : 'lose');
        
        historyDiv.innerHTML = `
            <div class="history-info">
                <div class="history-game">🎮 ${item.game}</div>
                <div class="history-details">
                    You: ${item.playerPick} | Win: ${item.winningPick} | ${item.timestamp}
                </div>
            </div>
            <div class="history-amount ${item.isWin ? 'win' : 'lose'}">
                ${item.isWin ? '+$' + item.winAmount.toFixed(2) : '-$' + item.betAmount.toFixed(2)}
            </div>
        `;
        
        historyList.appendChild(historyDiv);
    });
}

// Select Game
function selectGame(game) {
    currentGame = game;
    
    // Update button states
    document.querySelectorAll('.game-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update game containers
    document.querySelectorAll('.game-container').forEach(container => {
        container.classList.remove('active');
    });
    
    const gameMap = {
        'ke': 'keGame',
        '5d': '5dGame',
        'trx': 'trxGame'
    };
    
    document.getElementById(gameMap[game]).classList.add('active');
}

// 5D Number Input Handler
document.addEventListener('DOMContentLoaded', () => {
    const input5d = document.getElementById('5dNumber');
    if (input5d) {
        input5d.addEventListener('input', (e) => {
            const value = e.target.value;
            selected5DNumber = value;
            
            const display = document.getElementById('digitDisplay');
            if (display) {
                display.textContent = value.padEnd(5, '0');
            }
        });
    }
});

// Select Color (TRX)
function selectColor(color) {
    selectedTRXColor = color;
    
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    
    const colorEmoji = {
        'red': '🔴 Red Selected',
        'blue': '🔵 Blue Selected',
        'green': '🟢 Green Selected'
    };
    
    document.getElementById('selectedColor').textContent = colorEmoji[color];
}