'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function XO8x8() {
  useEffect(() => {}, []);

  return (
    <>
      <style jsx global>{`
        .game-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: var(--usion-space-4);
          background: var(--usion-background);
        }

        .game-header {
          text-align: center;
          margin-bottom: var(--usion-space-4);
        }

        .game-title {
          font-size: var(--usion-text-2xl);
          font-weight: var(--usion-font-bold);
          margin-bottom: var(--usion-space-1);
        }

        .game-subtitle {
          font-size: var(--usion-text-xs);
          color: var(--usion-text-muted);
          margin-bottom: var(--usion-space-2);
        }

        .game-status {
          font-size: var(--usion-text-base);
          color: var(--usion-text-secondary);
          min-height: 24px;
        }

        .game-status.your-turn {
          color: var(--usion-success);
          font-weight: var(--usion-font-semibold);
        }

        .game-status.opponent-turn {
          color: var(--usion-text-muted);
        }

        .game-status.winner {
          color: var(--usion-success);
          font-weight: var(--usion-font-bold);
        }

        .game-status.loser {
          color: var(--usion-error);
          font-weight: var(--usion-font-semibold);
        }

        .game-status.draw {
          color: var(--usion-warning);
          font-weight: var(--usion-font-semibold);
        }

        /* 8x8 Board */
        .game-board {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 3px;
          width: min(90vw, 400px);
          height: min(90vw, 400px);
          background: var(--usion-gray-200);
          padding: 3px;
          border-radius: var(--usion-radius-lg);
          margin-bottom: var(--usion-space-4);
        }

        .cell {
          background: var(--usion-background);
          border-radius: var(--usion-radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: var(--usion-font-bold);
          cursor: pointer;
          transition: all var(--usion-transition-fast);
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          aspect-ratio: 1;
        }

        .cell:hover:not(.occupied):not(.disabled) {
          background: var(--usion-gray-50);
        }

        .cell:active:not(.occupied):not(.disabled) {
          transform: scale(0.92);
        }

        .cell.occupied {
          cursor: not-allowed;
        }

        .cell.disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .cell.x {
          color: #ef4444;
        }

        .cell.o {
          color: #3b82f6;
        }

        .cell.winning {
          background: #fef3c7;
          animation: pulse 0.5s ease-in-out;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        /* Players Info */
        .players-info {
          display: flex;
          justify-content: space-between;
          width: min(90vw, 400px);
          margin-bottom: var(--usion-space-4);
        }

        .player {
          display: flex;
          align-items: center;
          gap: var(--usion-space-2);
          padding: var(--usion-space-2) var(--usion-space-3);
          border-radius: var(--usion-radius-md);
          background: var(--usion-surface);
        }

        .player.active {
          background: var(--usion-gray-200);
          border: 2px solid var(--usion-primary);
        }

        .player.you {
          border: 2px solid transparent;
        }

        .player.you.active {
          border-color: var(--usion-success);
        }

        .player-symbol {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--usion-font-bold);
          font-size: 14px;
        }

        .player-symbol.x {
          background: #fecaca;
          color: #ef4444;
        }

        .player-symbol.o {
          background: #bfdbfe;
          color: #3b82f6;
        }

        .player-name {
          font-size: var(--usion-text-sm);
          font-weight: var(--usion-font-medium);
          max-width: 80px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Waiting State */
        .waiting-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .waiting-overlay.hidden {
          display: none;
        }

        .waiting-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid var(--usion-gray-200);
          border-top-color: var(--usion-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: var(--usion-space-4);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .waiting-text {
          font-size: var(--usion-text-lg);
          font-weight: var(--usion-font-medium);
          color: var(--usion-text);
          margin-bottom: var(--usion-space-2);
        }

        .waiting-subtext {
          font-size: var(--usion-text-sm);
          color: var(--usion-text-secondary);
        }

        /* Game Over */
        .game-over-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .game-over-overlay.hidden {
          display: none;
        }

        .game-over-card {
          background: var(--usion-background);
          border-radius: var(--usion-radius-xl);
          padding: var(--usion-space-8);
          text-align: center;
          max-width: 300px;
          width: 90%;
        }

        .game-over-emoji {
          font-size: 64px;
          margin-bottom: var(--usion-space-4);
        }

        .game-over-title {
          font-size: var(--usion-text-2xl);
          font-weight: var(--usion-font-bold);
          margin-bottom: var(--usion-space-2);
        }

        .game-over-subtitle {
          font-size: var(--usion-text-base);
          color: var(--usion-text-secondary);
          margin-bottom: var(--usion-space-6);
        }

        .game-actions {
          display: flex;
          flex-direction: column;
          gap: var(--usion-space-3);
        }

        /* Connection Status */
        .connection-status {
          position: fixed;
          top: var(--usion-space-4);
          right: var(--usion-space-4);
          padding: var(--usion-space-2) var(--usion-space-3);
          border-radius: var(--usion-radius-full);
          font-size: var(--usion-text-xs);
          font-weight: var(--usion-font-medium);
          display: flex;
          align-items: center;
          gap: var(--usion-space-2);
          z-index: 200;
        }

        .connection-status.connected {
          background: #dcfce7;
          color: #16a34a;
        }

        .connection-status.disconnected {
          background: #fecaca;
          color: #dc2626;
        }

        .connection-status.connecting {
          background: #fef3c7;
          color: #d97706;
        }

        .connection-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }

        /* Error Banner */
        .error-banner {
          position: fixed;
          top: 60px;
          left: 50%;
          transform: translateX(-50%);
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: var(--usion-space-3) var(--usion-space-4);
          border-radius: var(--usion-radius-md);
          font-size: var(--usion-text-sm);
          z-index: 150;
          max-width: 90%;
          text-align: center;
        }

        .error-banner.hidden {
          display: none;
        }
      `}</style>

      {/* Waiting Overlay */}
      <div id="waitingOverlay" className="waiting-overlay">
        <div className="waiting-spinner"></div>
        <div className="waiting-text">Waiting for opponent...</div>
        <div className="waiting-subtext">Share this game with a friend</div>
      </div>

      {/* Game Over Overlay */}
      <div id="gameOverOverlay" className="game-over-overlay hidden">
        <div className="game-over-card">
          <div id="gameOverEmoji" className="game-over-emoji"></div>
          <div id="gameOverTitle" className="game-over-title"></div>
          <div id="gameOverSubtitle" className="game-over-subtitle"></div>
          <div className="game-actions">
            <button id="rematchBtn" className="usion-btn">Rematch</button>
            <button id="exitBtn" className="usion-btn usion-btn-secondary">Exit</button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      <div id="errorBanner" className="error-banner hidden"></div>

      {/* Connection Status */}
      <div id="connectionStatus" className="connection-status connecting">
        <span className="connection-dot"></span>
        <span id="connectionText">Connecting...</span>
      </div>

      {/* Main Game */}
      <div className="game-container">
        <div className="game-header">
          <div className="game-title">XO 8×8</div>
          <div className="game-subtitle">Get 5 in a row to win</div>
          <div id="gameStatus" className="game-status">Connecting...</div>
        </div>

        <div className="players-info">
          <div id="player1" className="player">
            <div className="player-symbol x">X</div>
            <div id="player1Name" className="player-name">Player 1</div>
          </div>
          <div id="player2" className="player">
            <div className="player-symbol o">O</div>
            <div id="player2Name" className="player-name">Waiting...</div>
          </div>
        </div>

        <div id="gameBoard" className="game-board"></div>
      </div>

      <Script src="/usion-sdk.js" strategy="beforeInteractive" />
      <Script id="game-logic" strategy="afterInteractive">{`
        var COLS = 8;
        var ROWS = 8;
        var WIN_LENGTH = 5;
        var TOTAL_CELLS = COLS * ROWS;

        // Build board cells
        var boardEl = document.getElementById('gameBoard');
        for (var i = 0; i < TOTAL_CELLS; i++) {
          var cell = document.createElement('div');
          cell.className = 'cell';
          cell.dataset.index = String(i);
          boardEl.appendChild(cell);
        }

        var state = {
          roomId: null,
          playerId: null,
          playerSymbol: null,
          playerIds: [],
          players: [],
          board: new Array(TOTAL_CELLS).fill(''),
          currentTurn: null,
          status: 'connecting',
          isMyTurn: false,
          gameOver: false,
          winner: null,
          winningCells: [],
          isProcessing: false
        };

        var elements = {
          waitingOverlay: document.getElementById('waitingOverlay'),
          gameOverOverlay: document.getElementById('gameOverOverlay'),
          gameOverEmoji: document.getElementById('gameOverEmoji'),
          gameOverTitle: document.getElementById('gameOverTitle'),
          gameOverSubtitle: document.getElementById('gameOverSubtitle'),
          rematchBtn: document.getElementById('rematchBtn'),
          exitBtn: document.getElementById('exitBtn'),
          connectionStatus: document.getElementById('connectionStatus'),
          connectionText: document.getElementById('connectionText'),
          gameStatus: document.getElementById('gameStatus'),
          player1: document.getElementById('player1'),
          player1Name: document.getElementById('player1Name'),
          player2: document.getElementById('player2'),
          player2Name: document.getElementById('player2Name'),
          gameBoard: document.getElementById('gameBoard'),
          cells: document.querySelectorAll('.cell'),
          errorBanner: document.getElementById('errorBanner')
        };

        // --- Win detection for 5-in-a-row on 8x8 ---
        var DIRECTIONS = [
          [0, 1],   // horizontal
          [1, 0],   // vertical
          [1, 1],   // diagonal down-right
          [1, -1]   // diagonal down-left
        ];

        function checkWinAt(board, row, col, symbol) {
          for (var d = 0; d < DIRECTIONS.length; d++) {
            var dr = DIRECTIONS[d][0];
            var dc = DIRECTIONS[d][1];
            var cells = [];
            for (var k = 0; k < WIN_LENGTH; k++) {
              var r = row + dr * k;
              var c = col + dc * k;
              if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break;
              var idx = r * COLS + c;
              if (board[idx] !== symbol) break;
              cells.push(idx);
            }
            if (cells.length === WIN_LENGTH) return cells;
          }
          return null;
        }

        function findWinner(board) {
          for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
              var idx = r * COLS + c;
              var sym = board[idx];
              if (!sym) continue;
              var win = checkWinAt(board, r, c, sym);
              if (win) return { symbol: sym, cells: win };
            }
          }
          return null;
        }

        function isBoardFull(board) {
          for (var i = 0; i < board.length; i++) {
            if (!board[i]) return false;
          }
          return true;
        }

        // --- UI helpers ---
        function showError(message, duration) {
          elements.errorBanner.textContent = message;
          elements.errorBanner.classList.remove('hidden');
          if (duration) {
            setTimeout(function() {
              elements.errorBanner.classList.add('hidden');
            }, duration);
          }
        }

        function hideError() {
          elements.errorBanner.classList.add('hidden');
        }

        function updateConnectionStatus(status) {
          elements.connectionStatus.className = 'connection-status ' + status;
          switch(status) {
            case 'connected': elements.connectionText.textContent = 'Connected'; break;
            case 'disconnected': elements.connectionText.textContent = 'Disconnected'; break;
            case 'connecting': elements.connectionText.textContent = 'Connecting...'; break;
          }
        }

        function updatePlayerInfo() {
          if (state.playerIds.length > 0) {
            var p1Id = state.playerIds[0];
            var p1 = state.players.find(function(p) { return p.id === p1Id; });
            var p1Name = p1 ? p1.name : (p1Id === state.playerId ? 'You' : 'Player 1');
            elements.player1Name.textContent = p1Id === state.playerId ? 'You' : p1Name;
            elements.player1.classList.toggle('you', p1Id === state.playerId);
          }
          if (state.playerIds.length > 1) {
            var p2Id = state.playerIds[1];
            var p2 = state.players.find(function(p) { return p.id === p2Id; });
            var p2Name = p2 ? p2.name : (p2Id === state.playerId ? 'You' : 'Player 2');
            elements.player2Name.textContent = p2Id === state.playerId ? 'You' : p2Name;
            elements.player2.classList.toggle('you', p2Id === state.playerId);
          } else {
            elements.player2Name.textContent = 'Waiting...';
            elements.player2.classList.remove('you');
          }
        }

        function updateBoard() {
          var winSet = {};
          for (var w = 0; w < state.winningCells.length; w++) {
            winSet[state.winningCells[w]] = true;
          }
          elements.cells.forEach(function(cell, index) {
            var value = state.board[index];
            cell.textContent = value;
            cell.className = 'cell';
            if (value === 'X') cell.classList.add('x', 'occupied');
            else if (value === 'O') cell.classList.add('o', 'occupied');
            if (!state.isMyTurn || state.gameOver || state.isProcessing) {
              cell.classList.add('disabled');
            }
            if (winSet[index]) cell.classList.add('winning');
          });
        }

        function updateGameStatus() {
          state.isMyTurn = state.currentTurn === state.playerId && !state.gameOver && state.status === 'playing' && !state.isProcessing;
          var statusEl = elements.gameStatus;
          statusEl.className = 'game-status';

          var p1Active = state.currentTurn === state.playerIds[0] && !state.gameOver;
          var p2Active = state.currentTurn === state.playerIds[1] && !state.gameOver;
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

        function showGameOver(data) {
          var isWinner = state.winner === state.playerId;
          var isDraw = data.is_draw;

          elements.rematchBtn.textContent = 'Rematch';
          elements.rematchBtn.disabled = false;

          if (isDraw) {
            elements.gameOverEmoji.textContent = '\\u{1F91D}';
            elements.gameOverTitle.textContent = "It's a Draw!";
            elements.gameOverSubtitle.textContent = 'Great game! Try again?';
            elements.gameStatus.textContent = "It's a draw!";
            elements.gameStatus.className = 'game-status draw';
          } else if (isWinner) {
            elements.gameOverEmoji.textContent = '\\u{1F389}';
            elements.gameOverTitle.textContent = 'You Won!';
            elements.gameOverSubtitle.textContent = 'Congratulations!';
            elements.gameStatus.textContent = 'You won!';
            elements.gameStatus.className = 'game-status winner';
          } else {
            elements.gameOverEmoji.textContent = '\\u{1F614}';
            elements.gameOverTitle.textContent = 'You Lost';
            elements.gameOverSubtitle.textContent = data.reason === 'forfeit' ? 'Opponent forfeited' : 'Better luck next time!';
            elements.gameStatus.textContent = 'You lost';
            elements.gameStatus.className = 'game-status loser';
          }

          elements.gameOverOverlay.classList.remove('hidden');
        }

        // --- SDK initialization ---
        Usion.init(function(config) {
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

        function connectToGame() {
          if (!state.roomId) {
            updateConnectionStatus('disconnected');
            showError('Cannot start game: missing room ID', 5000);
            return;
          }

          updateConnectionStatus('connecting');

          Usion.game.connect().then(function() {
            updateConnectionStatus('connected');
            hideError();
            return Usion.game.join(state.roomId);
          }).then(function(joinData) {
            Usion.log('Joined room: ' + JSON.stringify(joinData));

            if (joinData.game_state) {
              state.board = joinData.game_state.board || state.board;
            }
            if (joinData.players) {
              state.players = joinData.players;
              state.playerIds = joinData.players.map(function(p) { return p.id; });
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
              var winResult = findWinner(state.board);
              if (winResult) state.winningCells = winResult.cells;
            }

            updatePlayerInfo();
            updateBoard();
            updateGameStatus();

            if (state.status === 'playing' && state.playerIds.length >= 2) {
              elements.waitingOverlay.classList.add('hidden');
            }

            if (state.gameOver) {
              showGameOver({ winner_ids: state.winner ? [state.winner] : [], is_draw: joinData.is_draw });
            }
          }).catch(function(err) {
            updateConnectionStatus('disconnected');
            showError('Failed to connect: ' + err.message, 5000);
          });
        }

        // --- Event handlers ---
        Usion.game.onPlayerJoined(function(data) {
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

          if (state.playerIds.length >= 2) {
            elements.waitingOverlay.classList.add('hidden');
            if (state.status === 'waiting') state.status = 'playing';
            updateGameStatus();
          }
        });

        Usion.game.onStateUpdate(function(data) {
          state.isProcessing = false;
          hideError();

          if (data.game_state) {
            state.board = data.game_state.board || state.board;
          }
          state.currentTurn = data.current_turn;
          if (data.status) state.status = data.status;

          // Check for win locally
          var winResult = findWinner(state.board);
          if (winResult) state.winningCells = winResult.cells;

          if (data.game_over || data.status === 'finished') {
            state.gameOver = true;
            state.winner = data.winner || data.winner_id;
            showGameOver({ winner_ids: state.winner ? [state.winner] : [], is_draw: data.is_draw });
          }

          updateBoard();
          updateGameStatus();
        });

        Usion.game.onGameFinished(function(data) {
          state.isProcessing = false;
          state.gameOver = true;
          state.status = 'finished';
          state.winner = data.winner_ids && data.winner_ids.length > 0 ? data.winner_ids[0] : null;

          if (data.final_state) {
            state.board = data.final_state.board || state.board;
          }
          var winResult = findWinner(state.board);
          if (winResult) state.winningCells = winResult.cells;

          updateBoard();
          showGameOver(data);
        });

        Usion.game.onGameRestarted(function(data) {
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

        Usion.game.onPlayerLeft(function(data) {
          if (!state.gameOver && state.status === 'playing') {
            state.gameOver = true;
            state.winner = state.playerId;
            showGameOver({ winner_ids: [state.playerId], reason: 'forfeit' });
          }
        });

        Usion.game.onError(function(data) {
          state.isProcessing = false;
          showError(data.message || 'An error occurred', 3000);
          if (data.code === 'INVALID_MOVE' || data.code === 'NOT_YOUR_TURN' || data.code === 'RATE_LIMITED') {
            Usion.game.requestSync();
          }
        });

        Usion.game.onDisconnect(function(reason) {
          updateConnectionStatus('disconnected');
          showError('Connection lost. Reconnecting...', null);
        });

        Usion.game.onReconnect(function(attemptNumber) {
          updateConnectionStatus('connected');
          hideError();
        });

        // --- Cell click handler ---
        elements.cells.forEach(function(cell) {
          cell.addEventListener('click', function() {
            if (state.gameOver || !state.isMyTurn || state.isProcessing) return;

            var index = parseInt(cell.dataset.index);
            if (state.board[index] !== '') return;

            state.isProcessing = true;
            state.board[index] = state.playerSymbol;
            state.isMyTurn = false;
            updateBoard();
            updateGameStatus();

            Usion.game.action('move', { index: index }).then(function(response) {
              state.isProcessing = false;
            }).catch(function(err) {
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
        elements.rematchBtn.addEventListener('click', function() {
          Usion.game.requestRematch();
          elements.rematchBtn.textContent = 'Starting...';
          elements.rematchBtn.disabled = true;
          setTimeout(function() {
            elements.rematchBtn.textContent = 'Rematch';
            elements.rematchBtn.disabled = false;
          }, 5000);
        });

        elements.exitBtn.addEventListener('click', function() {
          Usion.game.leave();
          Usion.game.disconnect();
          Usion.exit();
        });
      `}</Script>
    </>
  );
}
