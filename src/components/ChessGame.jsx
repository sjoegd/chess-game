import React from 'react';

import { Chessboard } from 'react-chessboard';

export default function ChessGame(props) {
  let {position, boardWidth, onDrop, allowedToDrag, showDragPieceValidMoves, removeDragPieceValidMoves, validMovesShown, dangerPositionsShown, startFreshGame, resignGame, startBotMatch, gameFrozen, botLevel, setBotLevel, automaticBotGames, startBotTournament, isBlackBot, isWhiteBot} = props;
  return (
    <div className="flex flex-col justify-center items-center select-none">
      <div className="w-fit">
        <Chessboard
          position={position}
          boardWidth={boardWidth}
          onPieceDrop={onDrop}
          isDraggablePiece={allowedToDrag}
          onPieceDragBegin={showDragPieceValidMoves}
          onPieceDragEnd={removeDragPieceValidMoves}
          customSquareStyles={{ ...validMovesShown, ...dangerPositionsShown }}
          customBoardStyle={{ borderRadius: '5px', boxShadow: `0 0.25rem 0.75rem ${gameFrozen ? "rgba(115, 216, 239, 0.75)" : "rgba(0, 0, 0, 0.5)"}`}}
        />
      </div>
      <div className="mt-2 flex w-full justify-center space-x-2 items-center">
        <button onClick={startFreshGame} className="border-2 border-black p-1 rounded-md w-[6rem]">
          New Game
        </button>
        <button onClick={resignGame} className='border-2 border-black p-1 rounded-md w-[6rem]'>
          Resign
        </button>
        <button onClick={startBotMatch} className='border-2 border-black p-1 rounded-md w-[6rem]'>
          AI Match
        </button>
        <button onClick={startBotTournament} className='border-2 border-black p-1 rounded-md w-[8rem]'>
          AI Tournament
        </button>
        <div>{`Bot level: ${botLevel}`}</div>
        <div>{automaticBotGames ? `Bot tournament` : `No bot tournament`}</div>
        <div>{gameFrozen ? 'Game is frozen' : 'Game is playable'}</div>
      </div>
    </div>
  );
}
