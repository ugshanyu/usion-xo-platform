'use client';

import { useEffect, useRef } from 'react';
import { initGame } from './game-logic';

export default function XO8x8() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    import('@usions/sdk/browser').then(() => {
      if (typeof window !== 'undefined' && window.Usion) {
        initGame();
      }
    }).catch(() => {
      // SDK load failed — standalone mode
    });
  }, []);

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
    </>
  );
}
