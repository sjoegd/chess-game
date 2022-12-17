import React, {useState} from 'react';

import clone from './helpers/clone.js'

import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

// Chessjs for game engine
// Chessboard for graphic
// - To make chessboard 'responsive' boardWidth prop can be changed


// Todo's:
// add promotion question?
// check is everything is implemented for a player vs bot environment
// add more features 
// add UI
// add game restarts
// make boardWitdh dynamic in terms of screen width/heigth (vmin)

let game = new Chess()

function App() {
  const [position, setPosition] = useState(game.fen())
  const [validMovesShown, setValidMovesShown] = useState({})

  
  function makeAMove(move) {
    const result = game.move(move)
    setPosition(game.fen())
    return result;
  }

  // piece is a pawn and location is 8 
  function isPromotion(move, piece) {
    if(!piece) {
      return false;
    }
    return (piece[1] == "P" && move.to[1] == '8') 
  }

  function makeRandomMove() {
    const moves = game.moves()
    const randomIndex = Math.floor(Math.random() * moves.length)
    makeAMove(moves[randomIndex])
  }

  // only react if white, should be currentPlayer colour?
  function onDrop(sourceSquare, targetSquare, piece) {
    if(game.turn() == "w") {
      const move = {from: sourceSquare, to: targetSquare}

      if(isPromotion(move, piece)) {
        move['promotion'] = 'q' // should be a choice
        // promotion can be: n b r q (knight bishop rook queen)
      }

      const result = makeAMove(move)
      
      if(result) {
        setTimeout(makeRandomMove, 500)
      }
    }
  }

  // all whites are draggable, should be currentPlayer colour?
  function allowedToDrag({piece, sourceSquare}) {
    const colour = piece[0]

    return colour == "w"
  }

  function showDragPieceValidMoves(piece, sourceSquare) {
    const validMoves = getValidMovesLocations(piece, sourceSquare)
    const newValidMovesShown = {[sourceSquare]: getCorrectMoveGraphics({}, true)};

    for(const move of validMoves) {
      newValidMovesShown[move.to] = getCorrectMoveGraphics(move)
    }

    setValidMovesShown(newValidMovesShown);
  }

  function getValidMovesLocations(piece, sourceSquare) {
    const validMoves = game.moves({piece, square: sourceSquare, verbose: true})
    return validMoves;
  }

  // currently only shows:
  // black for none capture
  // red for capture
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

    let styling = {boxSizing: "border-box"}

    if(isSource) {
      styling['border'] = "2px solid green"
      return styling
    }

    if(move.captured) {
      styling['border'] = "2px solid red"
    } else {
      styling['border'] = "2px solid black"
    }

    return styling
  }

  function removeDragPieceValidMoves() {
    setValidMovesShown({})
  }


  return (
    <div className='h-screen flex justify-center items-center'>
      <div className="border-black border-2 w-fit">
        <Chessboard position={position} boardWidth={800} onPieceDrop={onDrop} isDraggablePiece={allowedToDrag} onPieceDragBegin={showDragPieceValidMoves} onPieceDragEnd={removeDragPieceValidMoves} customSquareStyles={{...validMovesShown}}/>
      </div>
    </div>
  );
}

export default App;

