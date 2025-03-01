class GameComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Define the game state
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.currentPlayer = 'X';
    this.gameActive = false;
    this.playerXScore = 0;
    this.playerOScore = 0;
    this.ties = 0;
    this.moveCounter = 0;
    this.currentRound = 1;
    this.gameMode = 'two-player'; // 'two-player' or 'ai'
    this.aiDifficulty = 'easy'; // 'easy', 'medium', 'hard'
    this.winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // Render the component
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 25px;
          border-radius: 15px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          text-align: center;
          max-width: 400px;
          margin: 0 auto;
        }
        h1 {
          margin-bottom: 10px;
          font-size: 28px;
          color: #2c3e50;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .stats-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          background-color: rgba(255, 255, 255, 0.7);
          padding: 10px;
          border-radius: 8px;
          font-weight: bold;
        }
        .board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-gap: 10px;
          margin: 20px 0;
        }
        .cell {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #2c3e50;
        }
        .cell:hover {
          background-color: #f8f9fa;
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }
        .cell.x {
          color: #e74c3c;
        }
        .cell.o {
          color: #3498db;
        }
        .cell.winning {
          background-color: #d4edda;
          color: #155724;
          animation: pulse 0.5s;
        }
        .button-container {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        button {
          padding: 12px 24px;
          font-size: 16px;
          cursor: pointer;
          border: none;
          border-radius: 8px;
          background-color: #3498db;
          color: white;
          margin: 5px;
          transition: all 0.2s ease;
          font-weight: bold;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        button:hover {
          background-color: #2980b9;
          transform: translateY(-2px);
          box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        }
        button:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        #start-btn {
          background-color: #2ecc71;
        }
        #start-btn:hover {
          background-color: #27ae60;
        }
        .current-turn {
          margin: 15px 0;
          font-size: 20px;
          font-weight: bold;
          color: #2c3e50;
        }
        .player-x {
          color: #e74c3c;
        }
        .player-o {
          color: #3498db;
        }
        #result {
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
          min-height: 27px;
          color: #2c3e50;
        }
        .game-over {
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          padding: 20px;
          margin-top: 20px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .difficulty-selector, .mode-selector {
          margin-bottom: 15px;
        }
        .level-badge {
          background-color: #f39c12;
          color: white;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 14px;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .pulse {
          animation: pulse 0.5s;
        }
        @media (max-width: 480px) {
          .cell {
            font-size: 36px;
          }
        }
      </style>
      <div class="container">
        <h1>Tic Tac Toe</h1>
        
        <div id="game-setup" style="display: block;">
          <div class="mode-selector">
            <p>Game Mode:</p>
            <button id="two-player-btn" class="active">Two Players</button>
            <button id="ai-btn">Play vs AI</button>
          </div>
          
          <div id="ai-difficulty" class="difficulty-selector" style="display: none;">
            <p>AI Difficulty:</p>
            <button id="easy-btn" class="active">Easy</button>
            <button id="medium-btn">Medium</button>
            <button id="hard-btn">Hard</button>
          </div>
          
          <button id="start-btn">Start Game</button>
        </div>
        
        <div id="game-area" style="display: none;">
          <div class="stats-bar">
            <div>X Wins: <span id="player-x-score">0</span></div>
            <div>Round: <span id="round" class="level-badge">1</span></div>
            <div>O Wins: <span id="player-o-score">0</span></div>
          </div>
          
          <div class="current-turn">
            Current Turn: <span id="current-player" class="player-x">X</span>
          </div>
          
          <div class="board" id="board">
            <div class="cell" data-index="0"></div>
            <div class="cell" data-index="1"></div>
            <div class="cell" data-index="2"></div>
            <div class="cell" data-index="3"></div>
            <div class="cell" data-index="4"></div>
            <div class="cell" data-index="5"></div>
            <div class="cell" data-index="6"></div>
            <div class="cell" data-index="7"></div>
            <div class="cell" data-index="8"></div>
          </div>
          
          <div id="result"></div>
          
          <div class="button-container">
            <button id="reset-btn">New Game</button>
            <button id="main-menu-btn">Main Menu</button>
          </div>
        </div>
        
        <div id="game-over" class="game-over" style="display: none;">
          <h2>Game Results</h2>
          <p>Player X wins: <span id="final-x-score">0</span></p>
          <p>Player O wins: <span id="final-o-score">0</span></p>
          <p>Ties: <span id="ties">0</span></p>
          <p>Total rounds played: <span id="rounds-played">0</span></p>
          <button id="play-again-btn">Play Again</button>
        </div>
      </div>
    `;

    // Bind methods to the component
    this.startGame = this.startGame.bind(this);
    this.handleCellClick = this.handleCellClick.bind(this);
    this.resetGame = this.resetGame.bind(this);
    this.handleResult = this.handleResult.bind(this);
    this.makeAIMove = this.makeAIMove.bind(this);
    this.setGameMode = this.setGameMode.bind(this);
    this.setAIDifficulty = this.setAIDifficulty.bind(this);
    this.returnToMainMenu = this.returnToMainMenu.bind(this);
    this.endGameSession = this.endGameSession.bind(this);

    // Add event listeners
    this.shadowRoot.getElementById('start-btn').addEventListener('click', this.startGame);
    this.shadowRoot.getElementById('reset-btn').addEventListener('click', this.resetGame);
    this.shadowRoot.getElementById('main-menu-btn').addEventListener('click', this.returnToMainMenu);
    this.shadowRoot.getElementById('play-again-btn').addEventListener('click', this.startGame);

    // Game mode buttons
    this.shadowRoot.getElementById('two-player-btn').addEventListener('click', () => this.setGameMode('two-player'));
    this.shadowRoot.getElementById('ai-btn').addEventListener('click', () => this.setGameMode('ai'));

    // AI difficulty buttons
    this.shadowRoot.getElementById('easy-btn').addEventListener('click', () => this.setAIDifficulty('easy'));
    this.shadowRoot.getElementById('medium-btn').addEventListener('click', () => this.setAIDifficulty('medium'));
    this.shadowRoot.getElementById('hard-btn').addEventListener('click', () => this.setAIDifficulty('hard'));

    // Add click event to each cell
    const cells = this.shadowRoot.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.addEventListener('click', () => this.handleCellClick(cell));
    });
  }

  setGameMode(mode) {
    this.gameMode = mode;

    // Update button states
    this.shadowRoot.getElementById('two-player-btn').classList.remove('active');
    this.shadowRoot.getElementById('ai-btn').classList.remove('active');
    this.shadowRoot.getElementById(`${mode}-btn`).classList.add('active');

    // Show/hide AI difficulty selector
    const aiDifficultySection = this.shadowRoot.getElementById('ai-difficulty');
    aiDifficultySection.style.display = mode === 'ai' ? 'block' : 'none';
  }

  setAIDifficulty(level) {
    this.aiDifficulty = level;

    // Reset active state for all buttons
    ['easy-btn', 'medium-btn', 'hard-btn'].forEach(id => {
      this.shadowRoot.getElementById(id).classList.remove('active');
    });

    // Set active state for selected button
    this.shadowRoot.getElementById(`${level}-btn`).classList.add('active');
  }

  startGame() {
    // Reset the board
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.currentPlayer = 'X';
    this.gameActive = true;
    this.moveCounter = 0;

    // Reset player X score and O score if coming from game over screen
    if (this.shadowRoot.getElementById('game-over').style.display === 'block') {
      this.playerXScore = 0;
      this.playerOScore = 0;
      this.ties = 0;
      this.currentRound = 1;
    }

    // Update UI
    const currentPlayerSpan = this.shadowRoot.getElementById('current-player');
    currentPlayerSpan.textContent = this.currentPlayer;
    currentPlayerSpan.className = 'player-x';

    this.shadowRoot.getElementById('player-x-score').textContent = this.playerXScore;
    this.shadowRoot.getElementById('player-o-score').textContent = this.playerOScore;
    this.shadowRoot.getElementById('round').textContent = this.currentRound;
    this.shadowRoot.getElementById('result').textContent = '';

    // Clear all cells
    const cells = this.shadowRoot.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.textContent = '';
      cell.className = 'cell';
    });

    // Show game area, hide setup and game over
    this.shadowRoot.getElementById('game-setup').style.display = 'none';
    this.shadowRoot.getElementById('game-area').style.display = 'block';
    this.shadowRoot.getElementById('game-over').style.display = 'none';

    // If playing against AI and AI goes first (O), make a move
    if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
      setTimeout(() => this.makeAIMove(), 500);
    }
  }

  handleCellClick(cell) {
    if (!this.gameActive) return;

    const index = cell.getAttribute('data-index');

    // Check if cell is already filled
    if (this.board[index] !== '') return;

    // Make the move
    this.board[index] = this.currentPlayer;
    cell.textContent = this.currentPlayer;
    cell.classList.add(this.currentPlayer.toLowerCase());
    this.moveCounter++;

    // Check for win or draw
    if (this.checkWin()) {
      this.handleResult('win');
      return;
    }

    if (this.moveCounter === 9) {
      this.handleResult('draw');
      return;
    }

    // Switch player
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    const currentPlayerSpan = this.shadowRoot.getElementById('current-player');
    currentPlayerSpan.textContent = this.currentPlayer;
    currentPlayerSpan.className = this.currentPlayer === 'X' ? 'player-x' : 'player-o';

    // If playing against AI, make AI move
    if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
      setTimeout(() => this.makeAIMove(), 500);
    }
  }

  makeAIMove() {
    if (!this.gameActive) return;

    let index;

    switch (this.aiDifficulty) {
      case 'easy':
        // Random move
        index = this.getRandomEmptyCell();
        break;
      case 'medium':
        // 50% chance of optimal move, 50% chance of random move
        if (Math.random() < 0.5) {
          index = this.getBestMove();
        } else {
          index = this.getRandomEmptyCell();
        }
        break;
      case 'hard':
        // Optimal move using minimax
        index = this.getBestMove();
        break;
    }

    // Make the move
    const cell = this.shadowRoot.querySelector(`.cell[data-index="${index}"]`);
    this.board[index] = this.currentPlayer;
    cell.textContent = this.currentPlayer;
    cell.classList.add(this.currentPlayer.toLowerCase());
    this.moveCounter++;

    // Check for win or draw
    if (this.checkWin()) {
      this.handleResult('win');
      return;
    }

    if (this.moveCounter === 9) {
      this.handleResult('draw');
      return;
    }

    // Switch player
    this.currentPlayer = 'X';
    const currentPlayerSpan = this.shadowRoot.getElementById('current-player');
    currentPlayerSpan.textContent = this.currentPlayer;
    currentPlayerSpan.className = 'player-x';
  }

  getRandomEmptyCell() {
    const emptyCells = this.board
      .map((cell, index) => cell === '' ? index : -1)
      .filter(index => index !== -1);

    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  getBestMove() {
    // Implementation of minimax algorithm for optimal move
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < 9; i++) {
      // Check if cell is empty
      if (this.board[i] === '') {
        // Try this move
        this.board[i] = 'O';
        // Get score from minimax
        const score = this.minimax(this.board, 0, false);
        // Undo the move
        this.board[i] = '';

        // Update best score
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  }

  minimax(board, depth, isMaximizing) {
    // Check terminal states
    const result = this.checkGameState(board);
    if (result !== null) {
      if (result === 'O') return 10 - depth; // AI wins
      if (result === 'X') return depth - 10; // Human wins
      if (result === 'draw') return 0; // Draw
    }

    if (isMaximizing) {
      // AI's turn (O) - maximize score
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'O';
          const score = this.minimax(board, depth + 1, false);
          board[i] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      // Human's turn (X) - minimize score
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
          board[i] = 'X';
          const score = this.minimax(board, depth + 1, true);
          board[i] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  checkGameState(board) {
    // Check for win
    for (const combo of this.winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a]; // 'X' or 'O'
      }
    }

    // Check for empty cells
    const emptyCells = board.filter(cell => cell === '');
    if (emptyCells.length === 0) {
      return 'draw';
    }

    // Game still in progress
    return null;
  }

  checkWin() {
    for (const combo of this.winningCombinations) {
      const [a, b, c] = combo;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        // Highlight winning cells
        const cells = this.shadowRoot.querySelectorAll('.cell');
        cells[a].classList.add('winning');
        cells[b].classList.add('winning');
        cells[c].classList.add('winning');
        return true;
      }
    }
    return false;
  }

  handleResult(result) {
    this.gameActive = false;
    const resultElement = this.shadowRoot.getElementById('result');

    if (result === 'win') {
      resultElement.textContent = `Player ${this.currentPlayer} wins!`;

      // Update scores
      if (this.currentPlayer === 'X') {
        this.playerXScore++;
        this.shadowRoot.getElementById('player-x-score').textContent = this.playerXScore;
      } else {
        this.playerOScore++;
        this.shadowRoot.getElementById('player-o-score').textContent = this.playerOScore;
      }
    } else {
      resultElement.textContent = "It's a draw!";
      this.ties++;
    }

    this.currentRound++;

    // After 5 rounds, end the game session
    if (this.currentRound > 5) {
      setTimeout(() => this.endGameSession(), 1500);
    }
  }

  resetGame() {
    // Start a new round with current scores
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.currentPlayer = 'X';
    this.gameActive = true;
    this.moveCounter = 0;

    // Update UI
    const currentPlayerSpan = this.shadowRoot.getElementById('current-player');
    currentPlayerSpan.textContent = this.currentPlayer;
    currentPlayerSpan.className = 'player-x';

    this.shadowRoot.getElementById('round').textContent = this.currentRound;
    this.shadowRoot.getElementById('result').textContent = '';

    // Clear all cells
    const cells = this.shadowRoot.querySelectorAll('.cell');
    cells.forEach(cell => {
      cell.textContent = '';
      cell.className = 'cell';
    });

    // If playing against AI and AI goes first (O), make a move
    if (this.gameMode === 'ai' && this.currentPlayer === 'O') {
      setTimeout(() => this.makeAIMove(), 500);
    }
  }

  returnToMainMenu() {
    // Show setup, hide game area and game over
    this.shadowRoot.getElementById('game-setup').style.display = 'block';
    this.shadowRoot.getElementById('game-area').style.display = 'none';
    this.shadowRoot.getElementById('game-over').style.display = 'none';

    // Reset scores
    this.playerXScore = 0;
    this.playerOScore = 0;
    this.ties = 0;
    this.currentRound = 1;
  }

  endGameSession() {
    // Update game over screen
    this.shadowRoot.getElementById('final-x-score').textContent = this.playerXScore;
    this.shadowRoot.getElementById('final-o-score').textContent = this.playerOScore;
    this.shadowRoot.getElementById('ties').textContent = this.ties;
    this.shadowRoot.getElementById('rounds-played').textContent = this.currentRound - 1;

    // Show game over screen
    this.shadowRoot.getElementById('game-area').style.display = 'none';
    this.shadowRoot.getElementById('game-over').style.display = 'block';
  }
}

// Define the custom element
customElements.define('game-component', GameComponent);
