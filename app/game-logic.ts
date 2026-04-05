declare global {
  interface Window {
    Usion: any;
  }
}

const COLS = 8;
const ROWS = 8;
const WIN_LENGTH = 5;
const TOTAL_CELLS = COLS * ROWS;

const DIRECTIONS = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal down-right
  [1, -1],  // diagonal down-left
];

function checkWinAt(board: string[], row: number, col: number, symbol: string): number[] | null {
  for (const [dr, dc] of DIRECTIONS) {
    const cells: number[] = [];
    for (let k = 0; k < WIN_LENGTH; k++) {
      const r = row + dr * k;
      const c = col + dc * k;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break;
      const idx = r * COLS + c;
      if (board[idx] !== symbol) break;
      cells.push(idx);
    }
    if (cells.length === WIN_LENGTH) return cells;
  }
  return null;
}

function findWinner(board: string[]): { symbol: string; cells: number[] } | null {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      const sym = board[idx];
      if (!sym) continue;
      const win = checkWinAt(board, r, c, sym);
      if (win) return { symbol: sym, cells: win };
    }
  }
  return null;
}

export function initGame() {
  const Usion = window.Usion;
  if (!Usion) return;

  // Build board cells
  const boardEl = document.getElementById('gameBoard')!;
  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = String(i);
    boardEl.appendChild(cell);
  }

  const state = {
    roomId: null as string | null,
    playerId: null as string | null,
    playerSymbol: null as string | null,
    playerIds: [] as string[],
    players: [] as any[],
    board: new Array(TOTAL_CELLS).fill(''),
    currentTurn: null as string | null,
    status: 'connecting',
    isMyTurn: false,
    gameOver: false,
    winner: null as string | null,
    winningCells: [] as number[],
    isProcessing: false,
  };

  const elements = {
    waitingOverlay: document.getElementById('waitingOverlay')!,
    gameOverOverlay: document.getElementById('gameOverOverlay')!,
    gameOverEmoji: document.getElementById('gameOverEmoji')!,
    gameOverTitle: document.getElementById('gameOverTitle')!,
    gameOverSubtitle: document.getElementById('gameOverSubtitle')!,
    rematchBtn: document.getElementById('rematchBtn') as HTMLButtonElement,
    exitBtn: document.getElementById('exitBtn') as HTMLButtonElement,
    connectionStatus: document.getElementById('connectionStatus')!,
    connectionText: document.getElementById('connectionText')!,
    gameStatus: document.getElementById('gameStatus')!,
    player1: document.getElementById('player1')!,
    player1Name: document.getElementById('player1Name')!,
    player2: document.getElementById('player2')!,
    player2Name: document.getElementById('player2Name')!,
    gameBoard: document.getElementById('gameBoard')!,
    cells: document.querySelectorAll('.cell'),
    errorBanner: document.getElementById('errorBanner')!,
  };

  function showError(message: string, duration?: number | null) {
    elements.errorBanner.textContent = message;
    elements.errorBanner.classList.remove('hidden');
    if (duration) {
      setTimeout(() => elements.errorBanner.classList.add('hidden'), duration);
    }
  }

  function hideError() {
    elements.errorBanner.classList.add('hidden');
  }

  function updateConnectionStatus(status: string) {
    elements.connectionStatus.className = 'connection-status ' + status;
    switch (status) {
      case 'connected': elements.connectionText.textContent = 'Connected'; break;
      case 'disconnected': elements.connectionText.textContent = 'Disconnected'; break;
      case 'connecting': elements.connectionText.textContent = 'Connecting...'; break;
    }
  }

  function updatePlayerInfo() {
    if (state.playerIds.length > 0) {
      const p1Id = state.playerIds[0];
      const p1 = state.players.find((p: any) => p.id === p1Id);
      const p1Name = p1 ? p1.name : (p1Id === state.playerId ? 'You' : 'Player 1');
      elements.player1Name.textContent = p1Id === state.playerId ? 'You' : p1Name;
      elements.player1.classList.toggle('you', p1Id === state.playerId);
    }
    if (state.playerIds.length > 1) {
      const p2Id = state.playerIds[1];
      const p2 = state.players.find((p: any) => p.id === p2Id);
      const p2Name = p2 ? p2.name : (p2Id === state.playerId ? 'You' : 'Player 2');
      elements.player2Name.textContent = p2Id === state.playerId ? 'You' : p2Name;
      elements.player2.classList.toggle('you', p2Id === state.playerId);
    } else {
      elements.player2Name.textContent = 'Waiting...';
      elements.player2.classList.remove('you');
    }
  }

  function updateBoard() {
    const winSet = new Set(state.winningCells);
    elements.cells.forEach((cell, index) => {
      const value = state.board[index];
      cell.textContent = value;
      cell.className = 'cell';
      if (value === 'X') cell.classList.add('x', 'occupied');
      else if (value === 'O') cell.classList.add('o', 'occupied');
      if (!state.isMyTurn || state.gameOver || state.isProcessing) {
        cell.classList.add('disabled');
      }
      if (winSet.has(index)) cell.classList.add('winning');
    });
  }

  function updateGameStatus() {
    state.isMyTurn = state.currentTurn === state.playerId && !state.gameOver && state.status === 'playing' && !state.isProcessing;
    const statusEl = elements.gameStatus;
    statusEl.className = 'game-status';

    const p1Active = state.currentTurn === state.playerIds[0] && !state.gameOver;
    const p2Active = state.currentTurn === state.playerIds[1] && !state.gameOver;
    elements.player1.classList.toggle('active', p1Active);
    elements.player2.classList.toggle('active', p2Active);

    if (state.status === 'waiting') {
      statusEl.textContent = 'Waiting for opponent...';
    } else if (state.gameOver) {
      statusEl.textContent = '';
    } else if (state.isProcessing) {
      statusEl.textContent = 'Processing...';
    } else if (state.isMyTurn) {
      statusEl.textContent = 'Your turn (' + state.playerSymbol + ')';
      statusEl.classList.add('your-turn');
    } else {
      statusEl.textContent = "Opponent's turn";
      statusEl.classList.add('opponent-turn');
    }

    updateBoard();
  }

  function showGameOver(data: any) {
    const isWinner = state.winner === state.playerId;
    const isDraw = data.is_draw;

    elements.rematchBtn.textContent = 'Rematch';
    elements.rematchBtn.disabled = false;

    if (isDraw) {
      elements.gameOverEmoji.textContent = '\u{1F91D}';
      elements.gameOverTitle.textContent = "It's a Draw!";
      elements.gameOverSubtitle.textContent = 'Great game! Try again?';
      elements.gameStatus.textContent = "It's a draw!";
      elements.gameStatus.className = 'game-status draw';
    } else if (isWinner) {
      elements.gameOverEmoji.textContent = '\u{1F389}';
      elements.gameOverTitle.textContent = 'You Won!';
      elements.gameOverSubtitle.textContent = 'Congratulations!';
      elements.gameStatus.textContent = 'You won!';
      elements.gameStatus.className = 'game-status winner';
    } else {
      elements.gameOverEmoji.textContent = '\u{1F614}';
      elements.gameOverTitle.textContent = 'You Lost';
      elements.gameOverSubtitle.textContent = data.reason === 'forfeit' ? 'Opponent forfeited' : 'Better luck next time!';
      elements.gameStatus.textContent = 'You lost';
      elements.gameStatus.className = 'game-status loser';
    }

    elements.gameOverOverlay.classList.remove('hidden');
  }

  // Transition from waiting → playing when conditions are met
  function tryStartGame() {
    if (state.gameOver) return;
    if (state.playerIds.length < 2) return;

    // Start the game
    state.status = 'playing';
    if (!state.currentTurn) {
      state.currentTurn = state.playerIds[0]; // Host goes first
    }
    if (!state.playerSymbol) {
      state.playerSymbol = state.playerIds[0] === state.playerId ? 'X' : 'O';
    }

    elements.waitingOverlay.classList.add('hidden');
    updatePlayerInfo();
    updateGameStatus();
  }

  // --- SDK initialization ---
  function connectToGame() {
    if (!state.roomId) {
      updateConnectionStatus('disconnected');
      showError('Cannot start game: missing room ID', 5000);
      return;
    }

    updateConnectionStatus('connecting');

    Usion.game.connect().then(() => {
      updateConnectionStatus('connected');
      hideError();
      return Usion.game.join(state.roomId);
    }).then((joinData: any) => {
      Usion.log('Joined room: ' + JSON.stringify(joinData));

      if (joinData.game_state) {
        state.board = joinData.game_state.board || state.board;
      }
      if (joinData.players) {
        state.players = joinData.players;
        state.playerIds = joinData.players.map((p: any) => p.id);
      }
      if (joinData.player_ids) {
        state.playerIds = joinData.player_ids;
      }
      if (state.playerIds.length > 0 && !state.playerSymbol) {
        state.playerSymbol = state.playerIds[0] === state.playerId ? 'X' : 'O';
      }

      state.currentTurn = joinData.current_turn;
      state.status = joinData.status || 'waiting';

      if (joinData.game_over || joinData.status === 'finished') {
        state.gameOver = true;
        state.winner = joinData.winner || joinData.winner_id;
        const winResult = findWinner(state.board);
        if (winResult) state.winningCells = winResult.cells;
      }

      updatePlayerInfo();
      updateBoard();
      updateGameStatus();

      // If both players already matched, start the game
      if (state.playerIds.length >= 2 || state.status === 'playing') {
        tryStartGame();
      }

      if (state.gameOver) {
        showGameOver({ winner_ids: state.winner ? [state.winner] : [], is_draw: joinData.is_draw });
      }
    }).catch((err: any) => {
      updateConnectionStatus('disconnected');
      showError('Failed to connect: ' + err.message, 5000);
    });
  }

  Usion.init((config: any) => {
    Usion.log('Game initialized with SDK v2.0');
    state.playerId = Usion.user.getId();
    state.roomId = config.roomId;
    state.playerIds = config.playerIds || [];
    state.players = config.players || [];

    if (state.playerIds.length > 0) {
      state.playerSymbol = state.playerIds[0] === state.playerId ? 'X' : 'O';
    }

    updatePlayerInfo();
    connectToGame();
  });

  // --- Event handlers ---
  Usion.game.onPlayerJoined((data: any) => {
    if (data.player_ids) {
      state.playerIds = data.player_ids;
    } else if (data.player && !state.playerIds.includes(data.player.id)) {
      state.playerIds.push(data.player.id);
      state.players.push(data.player);
    }

    if (state.playerIds.length > 0 && !state.playerSymbol) {
      state.playerSymbol = state.playerIds[0] === state.playerId ? 'X' : 'O';
    }
    if (data.current_turn) state.currentTurn = data.current_turn;
    if (data.status) state.status = data.status;

    updatePlayerInfo();
    tryStartGame();
  });

  Usion.game.onStateUpdate((data: any) => {
    state.isProcessing = false;
    hideError();

    if (data.game_state) {
      state.board = data.game_state.board || state.board;
    }
    if (data.player_ids) state.playerIds = data.player_ids;
    state.currentTurn = data.current_turn;
    if (data.status) state.status = data.status;

    // Start game if conditions are met
    tryStartGame();

    const winResult = findWinner(state.board);
    if (winResult) state.winningCells = winResult.cells;

    if (data.game_over || data.status === 'finished') {
      state.gameOver = true;
      state.winner = data.winner || data.winner_id;
      showGameOver({ winner_ids: state.winner ? [state.winner] : [], is_draw: data.is_draw });
    }

    updateBoard();
    updateGameStatus();
  });

  Usion.game.onGameFinished((data: any) => {
    state.isProcessing = false;
    state.gameOver = true;
    state.status = 'finished';
    state.winner = data.winner_ids && data.winner_ids.length > 0 ? data.winner_ids[0] : null;

    if (data.final_state) {
      state.board = data.final_state.board || state.board;
    }
    const winResult = findWinner(state.board);
    if (winResult) state.winningCells = winResult.cells;

    updateBoard();
    showGameOver(data);
  });

  Usion.game.onGameRestarted((data: any) => {
    state.gameOver = false;
    state.winner = null;
    state.winningCells = [];
    state.status = 'playing';
    state.isProcessing = false;
    state.board = data.game_state ? data.game_state.board : new Array(TOTAL_CELLS).fill('');
    state.currentTurn = data.current_turn;

    elements.gameOverOverlay.classList.add('hidden');
    updateBoard();
    updateGameStatus();
  });

  Usion.game.onPlayerLeft((data: any) => {
    const hasMovesBeenMade = state.board.some((cell: string) => cell !== '');
    if (!state.gameOver && state.status === 'playing' && hasMovesBeenMade) {
      state.gameOver = true;
      state.winner = state.playerId;
      showGameOver({ winner_ids: [state.playerId], reason: 'forfeit' });
    } else if (!state.gameOver && !hasMovesBeenMade) {
      // Player left before game started — go back to waiting
      state.status = 'waiting';
      if (data.player_id) {
        state.playerIds = state.playerIds.filter((id: string) => id !== data.player_id);
      }
      elements.waitingOverlay.classList.remove('hidden');
      updatePlayerInfo();
      updateGameStatus();
    }
  });

  Usion.game.onError((data: any) => {
    state.isProcessing = false;
    showError(data.message || 'An error occurred', 3000);
    if (data.code === 'INVALID_MOVE' || data.code === 'NOT_YOUR_TURN' || data.code === 'RATE_LIMITED') {
      Usion.game.requestSync();
    }
  });

  Usion.game.onDisconnect(() => {
    updateConnectionStatus('disconnected');
    showError('Connection lost. Reconnecting...', null);
  });

  Usion.game.onReconnect(() => {
    updateConnectionStatus('connected');
    hideError();
  });

  // --- Cell click handler ---
  elements.cells.forEach((cell) => {
    cell.addEventListener('click', () => {
      if (state.gameOver || !state.isMyTurn || state.isProcessing) return;

      const index = parseInt((cell as HTMLElement).dataset.index!);
      if (state.board[index] !== '') return;

      state.isProcessing = true;
      state.board[index] = state.playerSymbol!;
      state.isMyTurn = false;
      updateBoard();
      updateGameStatus();

      Usion.game.action('move', { index }).then(() => {
        state.isProcessing = false;
      }).catch((err: any) => {
        state.isProcessing = false;
        state.board[index] = '';
        state.isMyTurn = true;
        updateBoard();
        updateGameStatus();
        showError(err.message, 3000);
      });
    });
  });

  // --- Rematch / Exit ---
  elements.rematchBtn.addEventListener('click', () => {
    Usion.game.requestRematch();
    elements.rematchBtn.textContent = 'Starting...';
    elements.rematchBtn.disabled = true;
    setTimeout(() => {
      elements.rematchBtn.textContent = 'Rematch';
      elements.rematchBtn.disabled = false;
    }, 5000);
  });

  elements.exitBtn.addEventListener('click', () => {
    Usion.game.leave();
    Usion.game.disconnect();
    Usion.exit();
  });
}
