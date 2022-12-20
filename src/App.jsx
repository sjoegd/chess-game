import React, { useState } from 'react';

import ChessAI from './AI/ChessAI.js'

import clone from './helpers/clone.js';
import useWindowSize from './helpers/useWindowSize';

import { Chess, SQUARES} from 'chess.js';

import Chat from './components/Chat.jsx';
import ChessGame from './components/ChessGame.jsx';

// Chessjs for game engine
// Chessboard for graphic
// - To make chessboard 'responsive' boardWidth prop can be changed

// Todo's:
// check is everything is implemented for a player vs bot environment (think so)
// reposition of functions
// add more features
// add UI
// add time and draw on time (and win on time)
// add promotion question?
// implement chat
// fix en passant graphics

let game = new Chess('');
// .turn() for current side to move
// .undo() for undo

function App() {
  const [position, setPosition] = useState(game.fen());
  const [validMovesShown, setValidMovesShown] = useState({});
  const [dangerPositionsShown, setDangerPositionsShown] = useState({});
  const [gameFrozen, setGameFrozen] = useState(true);
  const [playerColour, setPlayerColour] = useState('w');
  const [gameMessages, setGameMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState(createTestMessage(0));
  const windowSize = useWindowSize();

  function addGameMessage(message) {
    let gameMessagesCopy = [...gameMessages];
    let gameMessage = { id: gameMessages.length, m_string: message };
    gameMessagesCopy.push(gameMessage);
    setGameMessages(gameMessagesCopy);
  }

  function addChatMessage(message) {
    let chatMessagesCopy = [...chatMessages];
    chatMessagesCopy.push(message);
    setChatMessages(chatMessagesCopy);
  }

  function resignGame() {
    if (gameFrozen) {
      return;
    }

    setGameFrozen(true);
    addGameMessage('You resigned!');
  }

  function startFreshGame() {
    game.reset();
    setPosition(game.fen());
    setValidMovesShown({});
    setDangerPositionsShown({});
    setGameFrozen(false);
    setGameMessages([]);
  }

  function getKingPosition() {
    for (let char of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
      for (let number of [1, 2, 3, 4, 5, 6, 7, 8]) {
        let { type, color } = game.get(`${char}${number}`);
        if (color == game.turn() && type == 'k') {
          return `${char}${number}`;
        }
      }
    }
  }

  function checkGameStatus() {
    if(gameFrozen) {
      return;
    }

    if (game.isCheck()) {
      addGameMessage(game.turn() == playerColour ? 'You were checked!' : 'You checked the enemy.');
      setDangerPositionsShown({ [getKingPosition()]: { boxSizing: 'border-box', border: 'solid 0.15rem red' } });
    }

    let checkMate = game.isCheckmate();
    let stalemate = game.isStalemate();
    let insufficientMaterial = game.isInsufficientMaterial();
    let treefoldRepition = game.isThreefoldRepetition();
    let draw = game.isDraw();
    let gameOver = game.isGameOver();

    if (checkMate) {
      addGameMessage(game.turn() == playerColour ? 'You lost...' : 'You won!');
    }

    if (treefoldRepition) {
      addGameMessage('The current board position has occured three or more times...');
    }

    if (stalemate) {
      addGameMessage(game.turn() == playerColour ? 'You were stalemated' : 'You stalemated the enemy');
    }

    if (insufficientMaterial) {
      addGameMessage('There is insufficient material to continue...');
    }

    if (draw) {
      addGameMessage('The game ended in a draw');
    }

    if (gameOver) {
      setGameFrozen(true);
    }
  }

  function makeAMove(move) {
    if(gameFrozen) {
      return false;
    }

    const gameCopy = new Chess(game.fen());
    const result = game.move(move);

    if (result) {
      setDangerPositionsShown([]);
      setPosition(game.fen());
      checkGameStatus();
    } else {
      game = gameCopy;
    }

    return result;
  }

  // piece is a pawn and location is 8
  function isPromotion(move, piece) {
    if (!piece) {
      return false;
    }
    return piece[1] == 'P' && move.to[1] == '8';
  }

  function makeAIMove() {
    if(gameFrozen) {
      return;
    }

    let pre = new Date()
    let [score, move] = ChessAI(game, 4, game.turn())
    let post = new Date()
    console.log(`Time: ${post-pre}`)
    console.log(score, move)
    makeAMove(move)
  }

  function makeRandomMove() {
    if(gameFrozen) {
      return;
    }

    const moves = game.moves();
    const randomIndex = Math.floor(Math.random() * moves.length);
    makeAMove(moves[randomIndex]);
  }

  // only reacts to player
  function onDrop(sourceSquare, targetSquare, piece) {
    if (game.turn() != playerColour || gameFrozen) {
      return;
    }

    const move = { from: sourceSquare, to: targetSquare };

    if (isPromotion(move, piece)) {
      move['promotion'] = 'q'; // should be a choice
      // promotion can be: n b r q (knight bishop rook queen)
    }

    const result = makeAMove(move);

    // if move didn't fail
    if (result) {
      setTimeout(makeAIMove, 500);
    }
  }

  function allowedToDrag({ piece, sourceSquare }) {
    const colour = piece[0];
    return playerColour == colour && playerColour == game.turn();
  }

  function showDragPieceValidMoves(piece, sourceSquare) {
    const validMoves = getValidMovesLocations(piece, sourceSquare);
    const newValidMovesShown = { [sourceSquare]: getCorrectMoveGraphics({}, true) };

    for (const move of validMoves) {
      newValidMovesShown[move.to] = getCorrectMoveGraphics(move);
    }

    setValidMovesShown(newValidMovesShown);
  }

  function getValidMovesLocations(piece, sourceSquare) {
    const validMoves = game.moves({ piece, square: sourceSquare, verbose: true });
    return validMoves;
  }

  // currently only shows:
  // black border for none capture
  // red border for capture
  function getCorrectMoveGraphics(move, isSource) {
    // color w, b
    // from and to in algebraic notation
    // piece (p n b r q k)
    // captured (p n b r q k)
    // promotion (p n b r q k)
    // flags ->
    //  n, a none capture
    //  b, a pawn push of two squares
    //  e, an en passant capture
    //  c, a standard capture
    //  p, a promotion
    //  k, kingside casteling
    //  q, queenside catling

    let styling = { boxSizing: 'border-box' };

    if (isSource) {
      styling['border'] = '0.15rem solid green';
      return styling;
    }

    if (move.captured) {
      styling['border'] = '0.15rem solid red';
    } else {
      styling['border'] = '0.15rem solid black';
    }

    return styling;
  }

  function removeDragPieceValidMoves() {
    setValidMovesShown({});
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="flex space-x-10 max-h-[80vmin]">
        <ChessGame
          id={new Date()}
          position={position}
          boardWidth={0.75 * Math.min(windowSize.height, windowSize.width)}
          onDrop={(sq, tq, piece) => onDrop(sq, tq, piece)}
          allowedToDrag={args => allowedToDrag(args)}
          showDragPieceValidMoves={(p, sq) => showDragPieceValidMoves(p, sq)}
          removeDragPieceValidMoves={() => removeDragPieceValidMoves()}
          validMovesShown={validMovesShown}
          dangerPositionsShown={dangerPositionsShown}
          startFreshGame={() => startFreshGame()}
          resignGame={() => resignGame()}
          gameFrozen={gameFrozen}
        />
        <Chat gameMessages={gameMessages} chatMessages={chatMessages} />
      </div>
    </div>
  );
}

export default App;

// TESTING

function createTestMessage(count) {
  let messages = [];
  for (let i = 1; i <= count; i++) {
    messages.push({ id: i, time: '12:02:34', name: 'Sjoegd', m_string: `Test ${i}` });
  }
  return messages;
}

