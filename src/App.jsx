import React from 'react';

import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

const chess = new Chess();

// Chessjs for game engine
// Chessboard for graphic
// - To make chessboard 'responsive' boardWidth prop can be changed

function App() {
  return (
    <div className='h-screen flex justify-center items-center'>
      <div className="border-black border-4 w-fit">
        <Chessboard position={chess.fen()} boardWidth={800} />
      </div>
    </div>
  );
}

export default App;

