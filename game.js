// Game State
let gameState = {
    players: [],
    currentPlayer: 0,
    round: 1,
    totalRounds: 13,
    gameMode: 'classic',
    phase: 'bidding', // bidding, playing, results
    bids: [],
    tricks: [],
    hands: [],
    currentTrick: [],
    leadSuit: null,
    spadesBroken: false,
    scores: [],
    soundEnabled: true,
    darkMode: false,
    deck: [],
    playedCards: [],
};

const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const suitOrder = { '♠': 0, '♣': 1, '♦': 2, '♥': 3 };

// Initialize Setup
function initSetup() {
    const numPlayersSelect = document.getElementById('numPlayers');
    numPlayersSelect.addEventListener('change', updatePlayerNames);
    updatePlayerNames();
    loadSettings();
}

function updatePlayerNames() {
    const numPlayers = parseInt(document.getElementById('numPlayers').value);
    const container = document.getElementById('playerNamesContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < numPlayers; i++) {
        const div = document.createElement('div');
        div.className = 'player-name-input';
        div.innerHTML = `
            <span>Player ${i + 1}:</span>
            <input type="text" class="player-input" value="Player ${i + 1}" placeholder="Enter name">
        `;
        container.appendChild(div);
    }
}

function saveSettings() {
    const settings = {
        soundEnabled: document.getElementById('soundToggle').checked,
        darkMode: document.getElementById('darkMode').checked,
    };
    localStorage.setItem('spadesSettings', JSON.stringify(settings));
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('spadesSettings')) || { soundEnabled: true, darkMode: false };
    document.getElementById('soundToggle').checked = settings.soundEnabled;
    document.getElementById('darkMode').checked = settings.darkMode;
    
    gameState.soundEnabled = settings.soundEnabled;
    gameState.darkMode = settings.darkMode;
    
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    }
}

// Settings Listeners
document.addEventListener('DOMContentLoaded', () => {
    initSetup();
    
    document.getElementById('soundToggle').addEventListener('change', (e) => {
        gameState.soundEnabled = e.target.checked;
        saveSettings();
    });
    
    document.getElementById('darkMode').addEventListener('change', (e) => {
        gameState.darkMode = e.target.checked;
        saveSettings();
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });
});

// Start Game
function startGame() {
    const numPlayers = parseInt(document.getElementById('numPlayers').value);
    const gameMode = document.getElementById('gameMode').value;
    const playerInputs = document.querySelectorAll('.player-input');
    
    gameState.players = Array.from(playerInputs).map(input => ({
        name: input.value.trim() || input.placeholder,
        id: Math.random(),
        score: 0,
        roundScore: 0,
    }));
    
    gameState.gameMode = gameMode;
    gameState.totalRounds = gameMode === 'classic' ? 13 : gameMode === 'short' ? 6 : 20;
    gameState.scores = gameState.players.map(() => 0);
    gameState.bids = [];
    gameState.round = 1;
    gameState.currentPlayer = 0;
    gameState.phase = 'bidding';
    
    switchScreen('setupScreen', 'gameScreen');
    initRound();
}

// Initialize Round
function initRound() {
    gameState.phase = 'bidding';
    gameState.bids = Array(gameState.players.length).fill(null);
    gameState.tricks = [];
    gameState.playedCards = [];
    gameState.leadSuit = null;
    gameState.currentTrick = [];
    gameState.currentPlayer = (gameState.currentPlayer + gameState.players.length) % gameState.players.length;
    
    dealCards();
    renderBiddingPhase();
    updateScoreboard();
}

// Deal Cards
function dealCards() {
    gameState.deck = [];
    
    for (let suit of suits) {
        for (let rank of ranks) {
            gameState.deck.push({ suit, rank, id: `${rank}${suit}` });
        }
    }
    
    gameState.deck.sort(() => Math.random() - 0.5);
    
    const cardsPerPlayer = 13; // Always 13 cards per player
    gameState.hands = Array(gameState.players.length).fill(null).map(() => []);
    
    for (let i = 0; i < gameState.deck.length; i++) {
        const playerIndex = i % gameState.players.length;
        gameState.hands[playerIndex].push(gameState.deck[i]);
    }
    
    // Sort hands
    gameState.hands.forEach(hand => {
        hand.sort((a, b) => suitOrder[a.suit] - suitOrder[b.suit] || ranks.indexOf(a.rank) - ranks.indexOf(b.rank));
    });
}

// Render Bidding Phase
function renderBiddingPhase() {
    document.getElementById('biddingPhase').classList.remove('hidden');
    document.getElementById('playingPhase').classList.add('hidden');
    document.getElementById('roundResults').classList.add('hidden');
    
    renderBids();
    renderBiddingPrompt();
}

function renderBids() {
    const container = document.getElementById('bidsContainer');
    container.innerHTML = '';
    
    gameState.bids.forEach((bid, index) => {
        const div = document.createElement('div');
        div.className = 'bid-item';
        if (index === gameState.currentPlayer && bid === null) div.classList.add('current');
        
        div.innerHTML = `
            <div class="player-name">${gameState.players[index].name}</div>
            <div class="bid-value">${bid !== null ? bid : '-'}</div>
        `;
        container.appendChild(div);
    });
}

function renderBiddingPrompt() {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const prompt = document.getElementById('biddingPrompt');
    prompt.textContent = `${currentPlayer.name}, place your bid (0-13):`;
}

function placeBid(amount) {
    gameState.bids[gameState.currentPlayer] = amount;
    
    // Check if all players have bid
    if (gameState.bids.every(bid => bid !== null)) {
        startPlayingPhase();
    } else {
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
        renderBids();
        renderBiddingPrompt();
    }
}

// Playing Phase
function startPlayingPhase() {
    gameState.phase = 'playing';
    gameState.currentPlayer = 0;
    gameState.tricks = Array(gameState.players.length).fill(0);
    
    document.getElementById('biddingPhase').classList.add('hidden');
    document.getElementById('playingPhase').classList.remove('hidden');
    renderPlayingPhase();
}

function renderPlayingPhase() {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const action = document.getElementById('currentPlayerAction');
    action.innerHTML = `<p>${currentPlayer.name}'s Turn</p>`;
    
    renderTrick();
    renderPlayerHand();
}

function renderTrick() {
    const container = document.getElementById('trickCards');
    container.innerHTML = '';
    
    gameState.currentTrick.forEach(trick => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `${trick.card.rank}${trick.card.suit}`;
        container.appendChild(div);
    });
}

function renderPlayerHand() {
    const container = document.getElementById('playerHand');
    container.innerHTML = '';
    
    const hand = gameState.hands[gameState.currentPlayer];
    
    hand.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = 'card playable';
        div.innerHTML = `${card.rank}${card.suit}`;
        div.onclick = () => playCard(index);
        container.appendChild(div);
    });
}

function playCard(cardIndex) {
    const card = gameState.hands[gameState.currentPlayer][cardIndex];
    
    // Validate play
    if (!isValidPlay(card)) {
        alert('Invalid play! Follow suit if possible.');
        return;
    }
    
    gameState.currentTrick.push({
        player: gameState.currentPlayer,
        card: card,
    });
    
    gameState.hands[gameState.currentPlayer].splice(cardIndex, 1);
    
    if (gameState.currentTrick.length === gameState.players.length) {
        // Trick complete
        const winner = determineTrickWinner();
        gameState.tricks[winner]++;
        renderTrick();
        setTimeout(() => {
            gameState.currentPlayer = winner;
            gameState.currentTrick = [];
            gameState.leadSuit = null;
            
            if (gameState.hands[0].length === 0) {
                // Round complete
                completeRound();
            } else {
                renderPlayingPhase();
            }
        }, 1000);
    } else {
        if (!gameState.leadSuit && card.suit === '♠') {
            gameState.spadesBroken = true;
        }
        if (!gameState.leadSuit) {
            gameState.leadSuit = card.suit;
        }
        gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
        renderPlayingPhase();
    }
}

function isValidPlay(card) {
    const hand = gameState.hands[gameState.currentPlayer];
    
    // First trick or leading trick
    if (gameState.currentTrick.length === 0) {
        // Can't lead with spades unless broken
        if (card.suit === '♠' && !gameState.spadesBroken && hand.some(c => c.suit !== '♠')) {
            return false;
        }
        return true;
    }
    
    // Following trick
    const leadSuit = gameState.leadSuit;
    if (card.suit === leadSuit) {
        return true;
    }
    
    // Must follow suit if possible
    return !hand.some(c => c.suit === leadSuit);
}

function determineTrickWinner() {
    let winner = 0;
    let winningCard = gameState.currentTrick[0].card;
    
    for (let i = 1; i < gameState.currentTrick.length; i++) {
        const card = gameState.currentTrick[i].card;
        
        // Spade wins
        if (card.suit === '♠' && winningCard.suit !== '♠') {
            winner = gameState.currentTrick[i].player;
            winningCard = card;
        } else if (card.suit === winningCard.suit && ranks.indexOf(card.rank) > ranks.indexOf(winningCard.rank)) {
            winner = gameState.currentTrick[i].player;
            winningCard = card;
        }
    }
    
    return winner;
}

// Complete Round
function completeRound() {
    gameState.phase = 'results';
    
    // Calculate scores
    for (let i = 0; i < gameState.players.length; i++) {
        const bid = gameState.bids[i];
        const tricks = gameState.tricks[i];
        let roundScore = 0;
        
        if (tricks >= bid) {
            roundScore = bid * 10 + (tricks - bid);
        } else {
            roundScore = -(bid * 10);
        }
        
        gameState.scores[i] += roundScore;
        gameState.players[i].roundScore = roundScore;
    }
    
    renderResults();
}

function renderResults() {
    document.getElementById('biddingPhase').classList.add('hidden');
    document.getElementById('playingPhase').classList.add('hidden');
    document.getElementById('roundResults').classList.remove('hidden');
    
    const container = document.getElementById('roundResultsContent');
    container.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="bid-tricks">Bid: ${gameState.bids[index]} | Tricks: ${gameState.tricks[index]}</div>
            <div class="round-score">${player.roundScore > 0 ? '+' : ''}${player.roundScore}</div>
        `;
        container.appendChild(div);
    });
}

function nextRound() {
    if (gameState.round < gameState.totalRounds) {
        gameState.round++;
        initRound();
    } else {
        showGameOver();
    }
}

// Game Over
function showGameOver() {
    switchScreen('gameScreen', 'gameOverScreen');
    
    const scoresContainer = document.getElementById('finalScores');
    scoresContainer.innerHTML = '';
    
    const sorted = gameState.players
        .map((player, index) => ({ ...player, score: gameState.scores[index] }))
        .sort((a, b) => b.score - a.score);
    
    sorted.forEach(player => {
        const div = document.createElement('div');
        div.className = 'final-score-item';
        div.innerHTML = `
            <div>${player.name}</div>
            <div class="score">${player.score}</div>
        `;
        scoresContainer.appendChild(div);
    });
    
    const winner = sorted[0];
    document.getElementById('winner').textContent = `🎉 ${winner.name} Wins! 🎉`;
}

// Scoreboard
function updateScoreboard() {
    const container = document.getElementById('scoreboardContainer');
    container.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const div = document.createElement('div');
        div.className = 'score-card';
        div.innerHTML = `
            <h4>${player.name}</h4>
            <div class="total">${gameState.scores[index]}</div>
            <div class="round-score">Round: ${gameState.bids[index] !== undefined ? gameState.bids[index] : '-'}</div>
        `;
        container.appendChild(div);
    });
    
    document.getElementById('currentRound').textContent = gameState.round;
    document.getElementById('totalRounds').textContent = gameState.totalRounds;
}

// Screen Management
function switchScreen(from, to) {
    document.getElementById(from).classList.remove('active');
    document.getElementById(to).classList.add('active');
}

function pauseGame() {
    document.getElementById('pauseMenu').classList.remove('hidden');
}

function resumeGame() {
    document.getElementById('pauseMenu').classList.add('hidden');
}

function showMenu() {
    document.getElementById('mainMenu').classList.remove('hidden');
}

function closeMenu() {
    document.getElementById('mainMenu').classList.add('hidden');
}

function returnToSetup() {
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('mainMenu').classList.add('hidden');
    
    // Reset game state
    gameState = {
        players: [],
        currentPlayer: 0,
        round: 1,
        totalRounds: 13,
        gameMode: 'classic',
        phase: 'bidding',
        bids: [],
        tricks: [],
        hands: [],
        currentTrick: [],
        leadSuit: null,
        spadesBroken: false,
        scores: [],
        soundEnabled: true,
        darkMode: false,
        deck: [],
        playedCards: [],
    };
    
    switchScreen('gameScreen', 'setupScreen');
}

// Utility
function playSound(type) {
    if (!gameState.soundEnabled) return;
    // Sound implementation would go here
    console.log('Sound:', type);
}

// Initialize on load
window.addEventListener('load', () => {
    initSetup();
});