import { Chess, SQUARES } from 'chess.js';

// TODO: Optimize negamax futher

const inBoardX = {
  a: true,
  b: true,
  c: true,
  d: true,
  e: true,
  f: true,
  g: true,
  h: true,
};

const inBoardY = {
  1: true,
  2: true,
  3: true,
  4: true,
  5: true,
  6: true,
  7: true,
  8: true,
};

const pieceValues = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

const pawn_square_table = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0
]

const knight_square_table = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
]

const bishop_square_table = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
]

const rook_square_table = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
]

const queen_square_table = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
  -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
]

const king_square_table = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
]

const square_table_per_piece = {
  p: pawn_square_table,
  n: knight_square_table,
  b: bishop_square_table,
  r: rook_square_table,
  q: queen_square_table,
  k: king_square_table
}

const w_x_hash_position = {
  'a': 0, 
  'b': 1,
  'c': 2, 
  'd': 3, 
  'e': 4, 
  'f': 5, 
  'g': 6, 
  'h': 7
}

const b_x_hash_position = {
  'a': 7, 
  'b': 6,
  'c': 5, 
  'd': 4, 
  'e': 3, 
  'f': 2, 
  'g': 1, 
  'h': 0
}

const y_hash_position = {
  0: 7,
  1: 6,
  2: 5,
  3: 4,
  4: 3,
  5: 2,
  6: 1,
  7: 0
}

function getTablePosition(square, color) {
  if(color == 'w') {
    let x_pos = w_x_hash_position[square[0]]
    let y_pos = y_hash_position[+square[1] - 1]

    let val = (y_pos * 8) + x_pos
    return val;
  } else {
    // mirror for black
    let x_pos = b_x_hash_position[square[0]]
    let y_pos = +square[1] - 1 

    let val = (y_pos * 8) + x_pos
    return val
  }
}

// https://www.chessprogramming.org/Evaluation

function materialPositionScore(engine, p_color) {
  let whiteScore = 0;
  let blackScore = 0;

  for (let square of SQUARES) {
    let piece = engine.get(square);

    if (!piece) {
      continue;
    }

    if (piece.color == 'w') {
      whiteScore += pieceValues[piece.type];
      whiteScore += square_table_per_piece[piece.type][getTablePosition(square, 'w')]
    } else {
      blackScore += pieceValues[piece.type];
      blackScore += square_table_per_piece[piece.type][getTablePosition(square, 'b')]
    }
  }

  return p_color == 'w' ? whiteScore - blackScore : blackScore - whiteScore;
}

function getTargetLocationMove(move) {
  let x;
  let y;

  for (let char of move) {
    if (inBoardX[char]) {
      x = char;
    }
    if (inBoardY[char]) {
      y = char;
    }
  }

  return x + y;
}

function sortMoves(moves, engine) {
  return moves.sort((a, b) => getScore(a, engine) - getScore(b, engine));
}

function getScore(move, engine) {
  const targetLoc = getTargetLocationMove(move);
  const target = engine.get(targetLoc);
  if (target) {
    return pieceValues[target.piece];
  }
  return 0;
}

function negaMax(engine, evaluator, alpha, beta, depth, color, transpos_table, count, max_count) {

  count.count += 1

  if(depth <= 0 || count.count > max_count) {
    let eval_val = evaluator(engine, color)
    let return_val = [count, eval_val, undefined]
    return return_val;
  }

  if(engine.isGameOver()) {
    let eval_val = engine.turn() == color ? -Infinity : Infinity
    let return_val = [count, eval_val, undefined]
    return return_val;
  }

  let moves = sortMoves(engine.moves(), engine)
  let best_move = moves[0]; 
  let best_score = -Infinity

  for(let move of moves) {
    engine.move(move)
    let [_, score, m] = negaMax(engine, evaluator, -beta, -alpha, depth - 1, color == 'w' ? 'b' : 'w', transpos_table, count, max_count)
    score = -score
    engine.undo()

    alpha = Math.max(alpha, score)

    if(score > best_score) {
      best_score = score
      best_move = move
    }

    if(alpha >= beta) {
      break;
    }
  }

  let return_val = [count, best_score, best_move]
  return return_val
}

export default function getCustomEngineMove(chess, depth, color) {
  return negaMax(chess, materialPositionScore, -Infinity, Infinity, depth, color, {}, {count: 1}, depth*50000)
}


