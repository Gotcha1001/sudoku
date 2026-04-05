
// // Pure sudoku generation and validation logic

// export type Difficulty = "easy" | "medium" | "hard" | "expert";

// const REMOVES: Record<Difficulty, number> = {
//   easy: 36,
//   medium: 46,
//   hard: 52,
//   expert: 58,
// };

// function shuffle<T>(arr: T[]): T[] {
//   const a = [...arr];
//   for (let i = a.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [a[i], a[j]] = [a[j], a[i]];
//   }
//   return a;
// }

// function isValid(board: number[], row: number, col: number, n: number): boolean {
//   for (let i = 0; i < 9; i++) {
//     if (board[row * 9 + i] === n) return false;
//     if (board[i * 9 + col] === n) return false;
//   }
//   const br = Math.floor(row / 3) * 3;
//   const bc = Math.floor(col / 3) * 3;
//   for (let i = 0; i < 3; i++) {
//     for (let j = 0; j < 3; j++) {
//       if (board[(br + i) * 9 + bc + j] === n) return false;
//     }
//   }
//   return true;
// }

// function solve(board: number[]): boolean {
//   const empty = board.indexOf(0);
//   if (empty === -1) return true;
//   const r = Math.floor(empty / 9);
//   const c = empty % 9;
//   for (const n of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
//     if (isValid(board, r, c, n)) {
//       board[empty] = n;
//       if (solve(board)) return true;
//       board[empty] = 0;
//     }
//   }
//   return false;
// }

// function countSolutions(board: number[], limit = 2): number {
//   const empty = board.indexOf(0);
//   if (empty === -1) return 1;
//   let count = 0;
//   const r = Math.floor(empty / 9);
//   const c = empty % 9;
//   for (let n = 1; n <= 9; n++) {
//     if (isValid(board, r, c, n)) {
//       board[empty] = n;
//       count += countSolutions(board, limit);
//       board[empty] = 0;
//       if (count >= limit) return count;
//     }
//   }
//   return count;
// }

// export interface SudokuPuzzle {
//   // 81 numbers, 0 = empty
//   board: number[];
//   solution: number[];
//   given: boolean[];
// }

// export function generatePuzzle(difficulty: Difficulty): SudokuPuzzle {
//   // Build full solved board
//   const full = Array(81).fill(0);
//   solve(full);
//   const solution = [...full];
//   const board = [...full];

//   // Remove cells while maintaining unique solution
//   const cells = shuffle([...Array(81).keys()]);
//   let removed = 0;
//   const target = REMOVES[difficulty];

//   for (const idx of cells) {
//     if (removed >= target) break;
//     const old = board[idx];
//     board[idx] = 0;
//     const tmp = [...board];
//     if (countSolutions(tmp) === 1) {
//       removed++;
//     } else {
//       board[idx] = old;
//     }
//   }

//   const given = board.map((v) => v !== 0);
//   return { board, solution, given };
// }

// export function validateCell(
//   board: number[],
//   solution: number[],
//   idx: number,
// ): boolean {
//   return board[idx] === solution[idx];
// }

// export function isBoardComplete(board: number[], solution: number[]): boolean {
//   return board.every((v, i) => v === solution[i]);
// }

// export function getAffectedIndices(idx: number): number[] {
//   const r = Math.floor(idx / 9);
//   const c = idx % 9;
//   const br = Math.floor(r / 3) * 3;
//   const bc = Math.floor(c / 3) * 3;
//   const affected = new Set<number>();
//   for (let i = 0; i < 9; i++) {
//     affected.add(r * 9 + i);
//     affected.add(i * 9 + c);
//   }
//   for (let i = 0; i < 3; i++) {
//     for (let j = 0; j < 3; j++) {
//       affected.add((br + i) * 9 + bc + j);
//     }
//   }
//   return [...affected];
// }

// export function formatTime(seconds: number): string {
//   const m = Math.floor(seconds / 60);
//   const s = seconds % 60;
//   return `${m}:${s.toString().padStart(2, "0")}`;
// }


// Pure sudoku generation and validation logic

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type BoardSize = 6 | 9 | 12;

// Board size per difficulty
export const DIFFICULTY_SIZE: Record<Difficulty, BoardSize> = {
  easy:   6,
  medium: 9,
  hard:   9,
  expert: 12,
};

// Box dimensions [rows, cols] per board size
export const BOX_DIMS: Record<BoardSize, [number, number]> = {
  6:  [2, 3],
  9:  [3, 3],
  12: [3, 4],
};

// Cells to remove per difficulty
const REMOVES: Record<Difficulty, number> = {
  easy:   18,   // 6×6 = 36 cells, remove 18
  medium: 46,   // 9×9 = 81 cells, remove 46
  hard:   52,
  expert: 72,   // 12×12 = 144 cells, remove 72
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(
  board: number[],
  row: number,
  col: number,
  n: number,
  size: BoardSize,
): boolean {
  const [boxR, boxC] = BOX_DIMS[size];
  for (let i = 0; i < size; i++) {
    if (board[row * size + i] === n) return false;
    if (board[i * size + col] === n) return false;
  }
  const br = Math.floor(row / boxR) * boxR;
  const bc = Math.floor(col / boxC) * boxC;
  for (let i = 0; i < boxR; i++) {
    for (let j = 0; j < boxC; j++) {
      if (board[(br + i) * size + bc + j] === n) return false;
    }
  }
  return true;
}

function solve(board: number[], size: BoardSize): boolean {
  const empty = board.indexOf(0);
  if (empty === -1) return true;
  const r = Math.floor(empty / size);
  const c = empty % size;
  for (const n of shuffle(Array.from({ length: size }, (_, i) => i + 1))) {
    if (isValid(board, r, c, n, size)) {
      board[empty] = n;
      if (solve(board, size)) return true;
      board[empty] = 0;
    }
  }
  return false;
}

function countSolutions(board: number[], size: BoardSize, limit = 2): number {
  const empty = board.indexOf(0);
  if (empty === -1) return 1;
  let count = 0;
  const r = Math.floor(empty / size);
  const c = empty % size;
  for (let n = 1; n <= size; n++) {
    if (isValid(board, r, c, n, size)) {
      board[empty] = n;
      count += countSolutions(board, size, limit);
      board[empty] = 0;
      if (count >= limit) return count;
    }
  }
  return count;
}

export interface SudokuPuzzle {
  board: number[];
  solution: number[];
  given: boolean[];
  size: BoardSize;
}

export function generatePuzzle(difficulty: Difficulty): SudokuPuzzle {
  const size = DIFFICULTY_SIZE[difficulty];
  const total = size * size;
  const full = Array(total).fill(0);
  solve(full, size);
  const solution = [...full];
  const board = [...full];

  const cells = shuffle([...Array(total).keys()]);
  let removed = 0;
  const target = REMOVES[difficulty];

  for (const idx of cells) {
    if (removed >= target) break;
    const old = board[idx];
    board[idx] = 0;
    const tmp = [...board];
    if (countSolutions(tmp, size) === 1) {
      removed++;
    } else {
      board[idx] = old;
    }
  }

  const given = board.map((v) => v !== 0);
  return { board, solution, given, size };
}

export function isBoardComplete(board: number[], solution: number[]): boolean {
  return board.every((v, i) => v === solution[i]);
}

export function getAffectedIndices(idx: number, size: BoardSize): number[] {
  const [boxR, boxC] = BOX_DIMS[size];
  const r = Math.floor(idx / size);
  const c = idx % size;
  const br = Math.floor(r / boxR) * boxR;
  const bc = Math.floor(c / boxC) * boxC;
  const affected = new Set<number>();
  for (let i = 0; i < size; i++) {
    affected.add(r * size + i);
    affected.add(i * size + c);
  }
  for (let i = 0; i < boxR; i++) {
    for (let j = 0; j < boxC; j++) {
      affected.add((br + i) * size + bc + j);
    }
  }
  return [...affected];
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}