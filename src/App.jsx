import React, { useEffect, useState } from 'react';

import {getAnalysis, getCustomEngineMove} from './AI/ChessAnalysis.js'

import clone from './helpers/clone.js';
import useWindowSize from './helpers/useWindowSize';

import { Chess, SQUARES} from 'chess.js';

import Chat from './components/Chat.jsx';
import ChessGame from './components/ChessGame.jsx';

// Chessjs for game engine
// Chessboard for graphic
// - To make chessboard 'responsive' boardWidth prop can be changed

// Todo's:
// train a bot with reinforcement learning
// make it possible to select two different bots (select on top and bottom)
// make the folders nice, optimize coding and cleanness
// put this online 

let game = new Chess();

function App() {
  const [position, setPosition] = useState(game.fen());
  const [validMovesShown, setValidMovesShown] = useState({});
  const [dangerPositionsShown, setDangerPositionsShown] = useState({});
  const [gameFrozen, setGameFrozen] = useState(false);
  const [playerColour, setPlayerColour] = useState('w');
  const windowSize = useWindowSize();

  const [gameMessages, setGameMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState(createTestMessage(0));

  const [isBlackBot, setIsBlackBot] = useState(true)
  const [isWhiteBot, setIsWhiteBot] = useState(false)

  const [botLevel, setBotLevel] = useState(3);
  const [blackBotLevel, setBlackBotLevel] = useState(botLevel)
  const [whiteBotLevel, setWhiteBotLevel] = useState(botLevel)
  const [automaticBotGames, setAutomaticBotGames] = useState(false)

  // ----- BOTS -----
  // bot handler
  useEffect(() => {
    if(gameFrozen || game.isGameOver()) {
      if(automaticBotGames) {
        startBotMatch()
      } 
      return;
    }

    if(game.turn() == 'w' && isWhiteBot) {
      setTimeout(() => makeBotMove(whiteBotLevel), 250)
    }
    if(game.turn() == 'b' && isBlackBot) {
      setTimeout(() => makeBotMove(blackBotLevel), 250)
    }
  }, [position, gameFrozen])

  const functionPerLevel = {
    1: makeRandomMove,
    2: makeCustomEngineMove,
    3: makeStockFishMove
  }

  const namePerLevel = {
    1: "Randomizer",
    2: "Custome Engine",
    3: "Big fish"
  }

  function startBotMatch() {
    createFreshGame()
    setIsWhiteBot(true)
    setIsBlackBot(true)
    makeBotMove(whiteBotLevel)
  }

  function startBotTournament() {
    setAutomaticBotGames(true)
    startBotMatch()
  }

  function stopBotTournament() {
    setAutomaticBotGames(false)
    setIsWhiteBot(false)
    setGameFrozen(true)
  }

  function makeBotMove(level = 1) {
    functionPerLevel[level]()
  }

  // Level 1, random moves
  function makeRandomMove() {
    const moves = game.moves();
    const randomIndex = Math.floor(Math.random() * moves.length);

    makeAMove(moves[randomIndex]);
  }

  // Level 2, custom depth 4
  function makeCustomEngineMove() {
    getCustomEngineMove(game.fen(), 4, game.turn()).then(move => {
      makeAMove(move)
    })
  }

  // Level 3, depth 18 stockfish
  function makeStockFishMove() {
    getAnalysis(game.fen(), 18).then((response) => {
      let moves = response.moves

      console.log(response)

      let {score, uci} = moves[0] ?? {uci: []}

      for (let uciMove of (uci)) {
        let move = {from: uciMove.slice(0,2), to: uciMove.slice(2,4)} 
        if (isPromotion(move, game.turn() + game.get(move.from).type, game.turn())) {
          move['promotion'] = 'q'; 
        }
        if(makeAMove(move)) {
          return;
        }
      }

      // shouldve returned
      if(botLevel == 3) {
        console.log("No move")
        addGameMessage("Stockfish gave no moves, ending match")
        setGameFrozen(true)
      }
    })
  }

  // ----- GAME MANAGEMENT -----

  function createFreshGame() {
    game.reset();
    setPosition(game.fen());
    setValidMovesShown({});
    setDangerPositionsShown({});
    setGameFrozen(false);
    setGameMessages([]);
  }

  function resignGame() {
    if (gameFrozen) {
      return;
    }

    setGameFrozen(true);
    addGameMessage('You resigned!');
  }

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

  // ----- END GAME MANAGEMENT -----
  // ----- MOVEMENT/PLAYER MANAGEMENT -----

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

  function onDrop(sourceSquare, targetSquare, piece) {
    if (game.turn() != playerColour || gameFrozen) {
      return;
    }

    const move = { from: sourceSquare, to: targetSquare };

    if (isPromotion(move, piece, playerColour)) {
      move['promotion'] = 'q'; // should be a choice
      // promotion can be: n b r q (knight bishop rook queen)
    }

    const result = makeAMove(move);

    // // if move didn't fail
    // if (result) {
    //   setTimeout(() => makeBotMove(botLevel, false))
    // }
  }

  // piece is a pawn and location is 8
  function isPromotion(move, piece, color = playerColour) {
    if (!piece) {
      return false;
    }

    if(color = 'w') {
      return piece.toLowerCase()[1] == 'p' && move.to[1] == '8';
    } else {
      return piece.toLowerCase()[1] == 'p' && move.to[1] == '1'
    }
  }

  // only reacts to player
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

  function checkGameStatus() {
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

    if (gameOver || draw || stalemate || treefoldRepition || insufficientMaterial) {
      setGameFrozen(true);
      if(automaticBotGames) {
        startBotMatch()
      } 
    }
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
          startFreshGame={() => createFreshGame()}
          resignGame={() => resignGame()}
          gameFrozen={gameFrozen}
          botLevel={botLevel}
          setBotLevel={(level) => {setBotLevel(level); setWhiteBotLevel(level); setBlackBotLevel(level)}}
          possibleBotLevels={[{value: 1, name: namePerLevel[1]}, {value: 2, name: namePerLevel[2]}, {value: 3, name: namePerLevel[3]}]}
          toggleBotTournament={() => {
            if(automaticBotGames) {
              stopBotTournament()
            } else {
              startBotTournament()
            }
          }}
          botTournament={automaticBotGames}
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

