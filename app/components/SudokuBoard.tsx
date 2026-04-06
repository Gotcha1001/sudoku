// "use client";

// import { useState, useEffect, useCallback, useRef } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   generatePuzzle,
//   isBoardComplete,
//   getAffectedIndices,
//   formatTime,
//   BOX_DIMS,
//   DIFFICULTY_SIZE,
//   type Difficulty,
//   type BoardSize,
// } from "@/lib/sudoku";
// import { useSoundManager } from "@/hooks/useSoundManager";
// import { RotateCcw, Lightbulb, PenLine, Eraser } from "lucide-react";
// import confetti from "canvas-confetti";

// const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];
// const MAX_MISTAKES = 3;

// interface SudokuBoardProps {
//   onComplete?: (
//     timeSeconds: number,
//     hintsUsed: number,
//     mistakes: number,
//     difficulty: Difficulty,
//   ) => void;
// }

// export function SudokuBoard({ onComplete }: SudokuBoardProps) {
//   const { play } = useSoundManager();

//   const [difficulty, setDifficulty] = useState<Difficulty>("easy");
//   const [puzzle] = useState(() => generatePuzzle("easy"));
//   const [board, setBoard] = useState(puzzle.board);
//   const [solution, setSolution] = useState(puzzle.solution);
//   const [given, setGiven] = useState(puzzle.given);
//   const [size, setSize] = useState<BoardSize>(puzzle.size);
//   const [notes, setNotes] = useState<Set<number>[]>(() =>
//     Array(puzzle.size * puzzle.size)
//       .fill(null)
//       .map(() => new Set<number>()),
//   );
//   const [selected, setSelected] = useState<number | null>(null);
//   const [noteMode, setNoteMode] = useState(false);
//   const [mistakes, setMistakes] = useState(0);
//   const [hintsUsed, setHintsUsed] = useState(0);
//   const [elapsed, setElapsed] = useState(0);
//   const [started, setStarted] = useState(false);
//   const [finished, setFinished] = useState(false);
//   const [shakingCell, setShakingCell] = useState<number | null>(null);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

//   const startGame = useCallback(
//     (diff: Difficulty) => {
//       const newPuzzle = generatePuzzle(diff);
//       setBoard(newPuzzle.board);
//       setSolution(newPuzzle.solution);
//       setGiven(newPuzzle.given);
//       setSize(newPuzzle.size);
//       setNotes(
//         Array(newPuzzle.size * newPuzzle.size)
//           .fill(null)
//           .map(() => new Set<number>()),
//       );
//       setSelected(null);
//       setNoteMode(false);
//       setMistakes(0);
//       setHintsUsed(0);
//       setElapsed(0);
//       setStarted(false);
//       setFinished(false);
//       clearInterval(timerRef.current!);
//       play("gameStart");
//     },
//     [play],
//   );

//   useEffect(() => {
//     if (started && !finished) {
//       timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
//     }
//     return () => clearInterval(timerRef.current!);
//   }, [started, finished]);

//   const enterNumber = useCallback(
//     (n: number) => {
//       if (selected === null || given[selected] || finished) return;
//       if (!started) setStarted(true);

//       if (noteMode) {
//         if (board[selected]) return;
//         play("buttonClick");
//         setNotes((prev) => {
//           const next = prev.map((s) => new Set(s));
//           if (next[selected].has(n)) next[selected].delete(n);
//           else next[selected].add(n);
//           return next;
//         });
//         return;
//       }

//       const newBoard = [...board];
//       if (newBoard[selected] === n) {
//         newBoard[selected] = 0;
//         setBoard(newBoard);
//         return;
//       }

//       newBoard[selected] = n;
//       const newNotes = notes.map((s) => new Set(s));
//       newNotes[selected].clear();

//       if (n !== solution[selected]) {
//         const newMistakes = mistakes + 1;
//         play("cardDraw");
//         setMistakes(newMistakes);
//         setBoard(newBoard);
//         setNotes(newNotes);
//         setShakingCell(selected);
//         setTimeout(() => setShakingCell(null), 500);
//         if (newMistakes >= MAX_MISTAKES) {
//           setFinished(true);
//           clearInterval(timerRef.current!);
//           play("lose");
//         }
//         return;
//       }

//       const fireConfetti = () => {
//         const count = 200;
//         const defaults = { origin: { y: 0.7 } };

//         function fire(particleRatio: number, opts: confetti.Options) {
//           confetti({
//             ...defaults,
//             ...opts,
//             particleCount: Math.floor(count * particleRatio),
//           });
//         }

//         fire(0.25, {
//           spread: 26,
//           startVelocity: 55,
//           colors: ["#2563eb", "#60a5fa"],
//         });
//         fire(0.2, { spread: 60, colors: ["#ffffff", "#93c5fd"] });
//         fire(0.35, {
//           spread: 100,
//           decay: 0.91,
//           scalar: 0.8,
//           colors: ["#2563eb", "#1d4ed8"],
//         });
//         fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
//         fire(0.1, {
//           spread: 120,
//           startVelocity: 45,
//           colors: ["#60a5fa", "#ffffff"],
//         });
//       };

//       play("cardDeal");
//       const affected = getAffectedIndices(selected, size);
//       for (const idx of affected) newNotes[idx].delete(n);
//       setBoard(newBoard);
//       setNotes(newNotes);

//       if (isBoardComplete(newBoard, solution)) {
//         setFinished(true);
//         clearInterval(timerRef.current!);
//         play("win");
//         onComplete?.(elapsed + 1, hintsUsed, mistakes, difficulty);
//         fireConfetti();
//       }
//     },
//     [
//       selected,
//       given,
//       finished,
//       started,
//       noteMode,
//       board,
//       notes,
//       solution,
//       size,
//       mistakes,
//       hintsUsed,
//       elapsed,
//       difficulty,
//       onComplete,
//       play,
//     ],
//   );

//   const erase = useCallback(() => {
//     if (selected === null || given[selected] || finished) return;
//     const newBoard = [...board];
//     newBoard[selected] = 0;
//     setBoard(newBoard);
//     const newNotes = notes.map((s) => new Set(s));
//     newNotes[selected].clear();
//     setNotes(newNotes);
//     play("buttonClick");
//   }, [selected, given, finished, board, notes, play]);

//   const hint = useCallback(() => {
//     if (selected === null || given[selected] || finished) return;
//     if (!started) setStarted(true);
//     const newBoard = [...board];
//     newBoard[selected] = solution[selected];
//     const newGiven = [...given];
//     newGiven[selected] = true;
//     const newNotes = notes.map((s) => new Set(s));
//     const affected = getAffectedIndices(selected, size);
//     for (const idx of affected) newNotes[idx].delete(solution[selected]);
//     setBoard(newBoard);
//     setGiven(newGiven);
//     setNotes(newNotes);
//     setHintsUsed((h) => h + 1);
//     play("roomJoin");
//     if (isBoardComplete(newBoard, solution)) {
//       setFinished(true);
//       clearInterval(timerRef.current!);
//       play("win");
//       onComplete?.(elapsed + 1, hintsUsed + 1, mistakes, difficulty);
//     }
//   }, [
//     selected,
//     given,
//     finished,
//     started,
//     board,
//     solution,
//     notes,
//     size,
//     elapsed,
//     hintsUsed,
//     mistakes,
//     difficulty,
//     onComplete,
//     play,
//   ]);

//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => {
//       const num = Number(e.key);
//       if (num >= 1 && num <= size) enterNumber(num);
//       if (e.key === "Backspace" || e.key === "Delete") erase();
//       if (e.key === "n" || e.key === "N") setNoteMode((m) => !m);
//       if (selected === null) return;
//       const r = Math.floor(selected / size);
//       const c = selected % size;
//       if (e.key === "ArrowRight" && c < size - 1) setSelected(selected + 1);
//       if (e.key === "ArrowLeft" && c > 0) setSelected(selected - 1);
//       if (e.key === "ArrowDown" && r < size - 1) setSelected(selected + size);
//       if (e.key === "ArrowUp" && r > 0) setSelected(selected - size);
//     };
//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, [enterNumber, erase, selected, size]);

//   const isWon = finished && mistakes < MAX_MISTAKES;

//   // Count how many of each digit are placed (to grey out full digits in numpad)
//   const digitCounts = Array(size + 1).fill(0);
//   board.forEach((v) => {
//     if (v) digitCounts[v]++;
//   });

//   const affectedBySelected =
//     selected !== null
//       ? new Set(getAffectedIndices(selected, size))
//       : new Set<number>();
//   const selectedValue = selected !== null ? board[selected] : 0;

//   // Box dimensions for border logic
//   const [boxR, boxC] = BOX_DIMS[size];

//   // Notes grid columns — √size for 9×9 (3), 2 rows for 6×6, 3 rows for 12×12
//   const noteGridCols = boxC; // notes mini-grid always matches box column count

//   // Numpad: split into rows of 6 max for larger boards
//   const numpadNumbers = Array.from({ length: size }, (_, i) => i + 1);
//   const numpadRows: number[][] = [];
//   const ROW_SIZE = size <= 9 ? size : 6;
//   for (let i = 0; i < numpadNumbers.length; i += ROW_SIZE) {
//     numpadRows.push(numpadNumbers.slice(i, i + ROW_SIZE));
//   }

//   return (
//     <div className="rounded-2xl overflow-hidden backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/30 dark:border-white/10 shadow-2xl p-4">
//       {/* Difficulty + timer row */}
//       <div className="flex gap-2 mb-4 flex-wrap">
//         {DIFFICULTIES.map((d) => (
//           <button
//             key={d}
//             onClick={() => {
//               setDifficulty(d);
//               startGame(d);
//             }}
//             className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-all border
//               ${
//                 difficulty === d
//                   ? "bg-blue-600 text-white border-blue-600"
//                   : "border-gray-300 dark:border-blue-700 text-gray-600 dark:text-blue-300 hover:bg-white/60 dark:hover:bg-blue-900/40"
//               }`}
//           >
//             {d}
//             <span className="ml-1 text-[10px] opacity-60">
//               {DIFFICULTY_SIZE[d]}×{DIFFICULTY_SIZE[d]}
//             </span>
//           </button>
//         ))}
//         <div className="ml-auto font-mono text-sm font-semibold text-gray-600 dark:text-blue-300 self-center tabular-nums">
//           {formatTime(elapsed)}
//         </div>
//       </div>

//       {/* Sudoku grid */}
//       <div className="relative">
//         <div
//           className="grid border-2 border-gray-800 dark:border-blue-300 rounded-lg overflow-hidden"
//           style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
//         >
//           {board.map((val, i) => {
//             const r = Math.floor(i / size);
//             const c = i % size;
//             const isSelected = i === selected;
//             const isAffected = affectedBySelected.has(i) && !isSelected;
//             const isMatchingValue =
//               selectedValue > 0 && val === selectedValue && !isSelected;
//             const isError = !given[i] && val > 0 && val !== solution[i];

//             // Thick borders at box boundaries
//             const thickRight = (c + 1) % boxC === 0 && c !== size - 1;
//             const thickBottom = (r + 1) % boxR === 0 && r !== size - 1;
//             const borderR = thickRight
//               ? "border-r-2 border-r-gray-800 dark:border-r-blue-300"
//               : "border-r border-r-gray-300 dark:border-r-blue-800/50";
//             const borderB = thickBottom
//               ? "border-b-2 border-b-gray-800 dark:border-b-blue-300"
//               : "border-b border-b-gray-300 dark:border-b-blue-800/50";

//             return (
//               <button
//                 key={i}
//                 onClick={() => setSelected(isSelected ? null : i)}
//                 className={`aspect-square flex items-center justify-center relative select-none transition-colors duration-100
//                   ${borderR} ${borderB}
//                   ${
//                     isSelected
//                       ? "bg-blue-400/40 dark:bg-blue-500/40"
//                       : isMatchingValue
//                         ? "bg-blue-200/70 dark:bg-blue-700/40"
//                         : isAffected
//                           ? "bg-gray-100/80 dark:bg-blue-950/60"
//                           : "bg-white/70 dark:bg-slate-800/70"
//                   }`}
//               >
//                 {val > 0 ? (
//                   <motion.span
//                     className={`font-semibold leading-none ...`}
//                     animate={
//                       shakingCell === i
//                         ? {
//                             x: [0, -6, 6, -5, 5, -3, 3, 0],
//                             color: [
//                               "#ef4444",
//                               "#ef4444",
//                               "#ef4444",
//                               "#ef4444",
//                               "#ef4444",
//                               "#ef4444",
//                               "#ef4444",
//                               "inherit",
//                             ],
//                           }
//                         : {}
//                     }
//                     transition={{ duration: 0.45, ease: "easeInOut" }}
//                   >
//                     {val}
//                   </motion.span>
//                 ) : notes[i] && notes[i].size > 0 ? (
//                   <div
//                     className="grid w-full h-full p-[1px]"
//                     style={{
//                       gridTemplateColumns: `repeat(${noteGridCols}, 1fr)`,
//                     }}
//                   >
//                     {Array.from({ length: size }, (_, idx) => idx + 1).map(
//                       (n) => (
//                         <span
//                           key={n}
//                           className={`flex items-center justify-center font-medium leading-none
//                           ${
//                             size === 6
//                               ? "text-[clamp(5px,1.4vw,10px)]"
//                               : size === 9
//                                 ? "text-[clamp(4px,1.1vw,8px)]"
//                                 : "text-[clamp(3px,0.8vw,6px)]"
//                           }
//                           text-gray-400 dark:text-blue-500`}
//                         >
//                           {notes[i].has(n) ? n : ""}
//                         </span>
//                       ),
//                     )}
//                   </div>
//                 ) : null}
//               </button>
//             );
//           })}
//         </div>

//         {/* Win / loss overlay */}
//         <AnimatePresence>
//           {finished && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="absolute inset-0 rounded-lg flex items-center justify-center"
//               style={{ background: "rgba(0,0,0,0.55)" }}
//             >
//               <motion.div
//                 initial={{ scale: 0.7, y: 20 }}
//                 animate={{ scale: 1, y: 0 }}
//                 transition={{ type: "spring", stiffness: 300, damping: 22 }}
//                 className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center shadow-2xl mx-4"
//               >
//                 <div className="text-5xl mb-3">{isWon ? "🎉" : "💔"}</div>
//                 <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
//                   {isWon ? "Puzzle Solved!" : "Game Over"}
//                 </h2>
//                 <p className="text-gray-500 dark:text-blue-300 text-sm mb-1">
//                   {isWon ? `Time: ${formatTime(elapsed)}` : "Too many mistakes"}
//                 </p>
//                 {isWon && (
//                   <p className="text-gray-400 dark:text-blue-400 text-xs mb-4">
//                     {hintsUsed > 0
//                       ? `${hintsUsed} hint${hintsUsed > 1 ? "s" : ""} used`
//                       : "No hints used!"}{" "}
//                     · {mistakes} mistake{mistakes !== 1 ? "s" : ""}
//                   </p>
//                 )}
//                 <button
//                   onClick={() => startGame(difficulty)}
//                   className="mt-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
//                 >
//                   New Puzzle
//                 </button>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Numpad — single row for 6/9, two rows of 6 for 12 */}
//       <div className="flex flex-col gap-1.5 mt-3">
//         {numpadRows.map((row, rowIdx) => (
//           <div
//             key={rowIdx}
//             className="grid gap-1.5"
//             style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}
//           >
//             {row.map((n) => (
//               <button
//                 key={n}
//                 onClick={() => enterNumber(n)}
//                 disabled={digitCounts[n] >= size}
//                 className={`aspect-square rounded-xl font-semibold border transition-all
//                   ${size === 12 ? "text-xs" : "text-base"}
//                   ${
//                     digitCounts[n] >= size
//                       ? "opacity-20 cursor-not-allowed border-gray-200 dark:border-blue-900"
//                       : "border-gray-300 dark:border-blue-700 text-gray-700 dark:text-blue-200 hover:bg-blue-50/80 dark:hover:bg-blue-900/40 active:scale-95 bg-white/60 dark:bg-slate-800/60"
//                   }`}
//               >
//                 {n}
//               </button>
//             ))}
//           </div>
//         ))}
//       </div>

//       {/* Controls row */}
//       <div className="flex items-center gap-2 mt-3">
//         <button
//           onClick={erase}
//           className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-blue-700 text-gray-600 dark:text-blue-300 hover:bg-white/60 dark:hover:bg-blue-900/30 bg-white/40 dark:bg-slate-800/40 transition-all"
//         >
//           <Eraser size={14} /> Erase
//         </button>
//         <button
//           onClick={() => {
//             setNoteMode((m) => !m);
//             play("buttonClick");
//           }}
//           className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-all
//             ${
//               noteMode
//                 ? "bg-blue-500/20 border-blue-400 text-blue-700 dark:text-blue-300"
//                 : "border-gray-300 dark:border-blue-700 text-gray-600 dark:text-blue-300 hover:bg-white/60 dark:hover:bg-blue-900/30 bg-white/40 dark:bg-slate-800/40"
//             }`}
//         >
//           <PenLine size={14} /> Notes
//         </button>
//         <button
//           onClick={hint}
//           className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-blue-700 text-gray-600 dark:text-blue-300 hover:bg-white/60 dark:hover:bg-blue-900/30 bg-white/40 dark:bg-slate-800/40 transition-all"
//         >
//           <Lightbulb size={14} /> Hint
//         </button>
//         <button
//           onClick={() => startGame(difficulty)}
//           className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-blue-700 text-gray-600 dark:text-blue-300 hover:bg-white/60 dark:hover:bg-blue-900/30 bg-white/40 dark:bg-slate-800/40 transition-all ml-auto"
//         >
//           <RotateCcw size={14} /> New
//         </button>
//         {/* Mistake dots */}
//         <div className="flex items-center gap-1">
//           {[0, 1, 2].map((i) => (
//             <span
//               key={i}
//               className={`w-2.5 h-2.5 rounded-full ${
//                 i < mistakes ? "bg-red-500" : "bg-gray-300 dark:bg-blue-900"
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  generatePuzzle,
  isBoardComplete,
  getAffectedIndices,
  formatTime,
  BOX_DIMS,
  DIFFICULTY_SIZE,
  type Difficulty,
  type BoardSize,
} from "@/lib/sudoku";
import { useSoundManager } from "@/hooks/useSoundManager";
import { RotateCcw, Lightbulb, PenLine, Eraser, Undo2 } from "lucide-react";
import confetti from "canvas-confetti";

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard", "expert"];
const MAX_MISTAKES = 3;

interface SudokuBoardProps {
  onComplete?: (
    timeSeconds: number,
    hintsUsed: number,
    mistakes: number,
    difficulty: Difficulty,
  ) => void;
}

export function SudokuBoard({ onComplete }: SudokuBoardProps) {
  const { play } = useSoundManager();

  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [puzzle] = useState(() => generatePuzzle("easy"));
  const [board, setBoard] = useState(puzzle.board);
  const [solution, setSolution] = useState(puzzle.solution);
  const [given, setGiven] = useState(puzzle.given);
  const [size, setSize] = useState<BoardSize>(puzzle.size);
  const [notes, setNotes] = useState<Set<number>[]>(() =>
    Array(puzzle.size * puzzle.size)
      .fill(null)
      .map(() => new Set<number>()),
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [shakingCell, setShakingCell] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyRef = useRef<
    Array<{
      board: number[];
      notes: Set<number>[];
      mistakes: number;
      cellIndex: number;
    }>
  >([]);

  // ====================== CONFETTI FIX ======================
  const fireConfetti = useCallback(() => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ["#2563eb", "#60a5fa"],
    });
    fire(0.2, { spread: 60, colors: ["#ffffff", "#93c5fd"] });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ["#2563eb", "#1d4ed8"],
    });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ["#60a5fa", "#ffffff"],
    });
  }, []);

  // Ref ensures we always call the latest confetti function
  const fireConfettiRef = useRef<() => void>(fireConfetti);

  useEffect(() => {
    fireConfettiRef.current = fireConfetti;
  }, [fireConfetti]);

  // Trigger confetti when the puzzle is won
  useEffect(() => {
    if (finished && mistakes < MAX_MISTAKES) {
      // Small delay so the win overlay renders first
      const timeout = setTimeout(() => {
        fireConfettiRef.current();
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [finished, mistakes]);
  // =========================================================

  const startGame = useCallback(
    (diff: Difficulty) => {
      const newPuzzle = generatePuzzle(diff);
      setBoard(newPuzzle.board);
      setSolution(newPuzzle.solution);
      setGiven(newPuzzle.given);
      setSize(newPuzzle.size);
      setNotes(
        Array(newPuzzle.size * newPuzzle.size)
          .fill(null)
          .map(() => new Set<number>()),
      );
      setSelected(null);
      setNoteMode(false);
      setMistakes(0);
      setHintsUsed(0);
      setElapsed(0);
      setStarted(false);
      setFinished(false);
      clearInterval(timerRef.current!);
      historyRef.current = [];
      play("gameStart");
    },
    [play],
  );

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timerRef.current!);
  }, [started, finished]);

  const enterNumber = useCallback(
    (n: number) => {
      if (selected === null || given[selected] || finished) return;
      if (!started) setStarted(true);

      if (noteMode) {
        if (board[selected]) return;
        play("buttonClick");
        setNotes((prev) => {
          const next = prev.map((s) => new Set(s));
          if (next[selected].has(n)) next[selected].delete(n);
          else next[selected].add(n);
          return next;
        });
        return;
      }

      const newBoard = [...board];
      if (newBoard[selected] === n) {
        newBoard[selected] = 0;
        setBoard(newBoard);
        return;
      }

      // Save to history before making the move
      historyRef.current.push({
        board: [...board],
        notes: notes.map((s) => new Set(s)),
        mistakes,
        cellIndex: selected,
      });
      if (historyRef.current.length > 50) historyRef.current.shift();

      newBoard[selected] = n;
      const newNotes = notes.map((s) => new Set(s));
      newNotes[selected].clear();

      if (n !== solution[selected]) {
        const newMistakes = mistakes + 1;
        play("cardDraw");
        setMistakes(newMistakes);
        setBoard(newBoard);
        setNotes(newNotes);
        setShakingCell(selected);
        setTimeout(() => setShakingCell(null), 500);

        if (newMistakes >= MAX_MISTAKES) {
          setFinished(true);
          clearInterval(timerRef.current!);
          play("lose");
        }
        return;
      }

      play("cardDeal");
      const affected = getAffectedIndices(selected, size);
      for (const idx of affected) newNotes[idx].delete(n);

      setBoard(newBoard);
      setNotes(newNotes);

      if (isBoardComplete(newBoard, solution)) {
        setFinished(true);
        clearInterval(timerRef.current!);
        play("win");
        onComplete?.(elapsed + 1, hintsUsed, mistakes, difficulty);
        // Confetti is now handled by useEffect
      }
    },
    [
      selected,
      given,
      finished,
      started,
      noteMode,
      board,
      notes,
      solution,
      size,
      mistakes,
      hintsUsed,
      elapsed,
      difficulty,
      onComplete,
      play,
    ],
  );

  const erase = useCallback(() => {
    if (selected === null || given[selected] || finished) return;
    const newBoard = [...board];
    newBoard[selected] = 0;
    setBoard(newBoard);
    const newNotes = notes.map((s) => new Set(s));
    newNotes[selected].clear();
    setNotes(newNotes);
    play("buttonClick");
  }, [selected, given, finished, board, notes, play]);

  const undo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    setBoard(prev.board);
    setNotes(prev.notes);
    setMistakes(prev.mistakes);
    setSelected(prev.cellIndex);
    play("buttonClick");
  }, [play]);

  const hint = useCallback(() => {
    if (selected === null || given[selected] || finished) return;
    if (!started) setStarted(true);

    const newBoard = [...board];
    newBoard[selected] = solution[selected];
    const newGiven = [...given];
    newGiven[selected] = true;
    const newNotes = notes.map((s) => new Set(s));
    const affected = getAffectedIndices(selected, size);
    for (const idx of affected) newNotes[idx].delete(solution[selected]);

    setBoard(newBoard);
    setGiven(newGiven);
    setNotes(newNotes);
    setHintsUsed((h) => h + 1);
    play("roomJoin");

    if (isBoardComplete(newBoard, solution)) {
      setFinished(true);
      clearInterval(timerRef.current!);
      play("win");
      onComplete?.(elapsed + 1, hintsUsed + 1, mistakes, difficulty);
      // Confetti handled by useEffect
    }
  }, [
    selected,
    given,
    finished,
    started,
    board,
    solution,
    notes,
    size,
    elapsed,
    hintsUsed,
    mistakes,
    difficulty,
    onComplete,
    play,
  ]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      const num = Number(e.key);
      if (num >= 1 && num <= size) enterNumber(num);
      if (e.key === "Backspace" || e.key === "Delete") erase();
      if (e.key === "n" || e.key === "N") setNoteMode((m) => !m);

      if (selected === null) return;
      const r = Math.floor(selected / size);
      const c = selected % size;
      if (e.key === "ArrowRight" && c < size - 1) setSelected(selected + 1);
      if (e.key === "ArrowLeft" && c > 0) setSelected(selected - 1);
      if (e.key === "ArrowDown" && r < size - 1) setSelected(selected + size);
      if (e.key === "ArrowUp" && r > 0) setSelected(selected - size);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enterNumber, erase, undo, selected, size]);

  const isWon = finished && mistakes < MAX_MISTAKES;

  // Count how many of each digit are placed
  const digitCounts = Array(size + 1).fill(0);
  board.forEach((v) => {
    if (v) digitCounts[v]++;
  });

  const affectedBySelected =
    selected !== null
      ? new Set(getAffectedIndices(selected, size))
      : new Set<number>();

  const selectedValue = selected !== null ? board[selected] : 0;

  const [boxR, boxC] = BOX_DIMS[size];
  const noteGridCols = boxC;

  const numpadNumbers = Array.from({ length: size }, (_, i) => i + 1);
  const numpadRows: number[][] = [];
  const ROW_SIZE = size <= 9 ? size : 6;
  for (let i = 0; i < numpadNumbers.length; i += ROW_SIZE) {
    numpadRows.push(numpadNumbers.slice(i, i + ROW_SIZE));
  }

  return (
    <div className="rounded-2xl overflow-hidden backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-white/30 dark:border-white/10 shadow-2xl p-4">
      {/* Difficulty + timer row */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => {
              setDifficulty(d);
              startGame(d);
            }}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium capitalize transition-all border
              ${
                difficulty === d
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 dark:border-blue-700 text-gray-600 dark:text-blue-300 hover:bg-white/60 dark:hover:bg-blue-900/40"
              }`}
          >
            {d}
            <span className="ml-1 text-[10px] opacity-60">
              {DIFFICULTY_SIZE[d]}×{DIFFICULTY_SIZE[d]}
            </span>
          </button>
        ))}
        <div className="ml-auto font-mono text-sm font-semibold text-gray-600 dark:text-blue-300 self-center tabular-nums">
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Sudoku grid */}
      <div className="relative">
        <div
          className="grid border-2 border-gray-800 dark:border-blue-300 rounded-lg overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
        >
          {board.map((val, i) => {
            const r = Math.floor(i / size);
            const c = i % size;
            const isSelected = i === selected;
            const isAffected = affectedBySelected.has(i) && !isSelected;
            const isMatchingValue =
              selectedValue > 0 && val === selectedValue && !isSelected;
            const isError = !given[i] && val > 0 && val !== solution[i];

            const thickRight = (c + 1) % boxC === 0 && c !== size - 1;
            const thickBottom = (r + 1) % boxR === 0 && r !== size - 1;
            const borderR = thickRight
              ? "border-r-2 border-r-gray-800 dark:border-r-blue-300"
              : "border-r border-r-gray-300 dark:border-r-blue-800/50";
            const borderB = thickBottom
              ? "border-b-2 border-b-gray-800 dark:border-b-blue-300"
              : "border-b border-b-gray-300 dark:border-b-blue-800/50";

            return (
              <button
                key={i}
                onClick={() => setSelected(isSelected ? null : i)}
                className={`aspect-square flex items-center justify-center relative select-none transition-colors duration-100
                  ${borderR} ${borderB}
                  ${
                    isSelected
                      ? "bg-blue-400/40 dark:bg-blue-500/40"
                      : isMatchingValue
                        ? "bg-blue-200/70 dark:bg-blue-700/40"
                        : isAffected
                          ? "bg-gray-100/80 dark:bg-blue-950/60"
                          : "bg-white/70 dark:bg-slate-800/70"
                  }`}
              >
                {val > 0 ? (
                  <motion.span
                    className={`font-semibold leading-none
                      ${
                        size === 6
                          ? "text-[clamp(12px,3.5vw,22px)]"
                          : size === 9
                            ? "text-[clamp(10px,2.5vw,18px)]"
                            : "text-[clamp(7px,1.6vw,13px)]"
                      }
                      ${
                        given[i]
                          ? "text-gray-800 dark:text-white"
                          : isError
                            ? "text-red-500 dark:text-red-400"
                            : "text-blue-600 dark:text-blue-300"
                      }`}
                    animate={
                      shakingCell === i
                        ? {
                            x: [0, -6, 6, -5, 5, -3, 3, 0],
                            color: [
                              "#ef4444",
                              "#ef4444",
                              "#ef4444",
                              "#ef4444",
                              "#ef4444",
                              "#ef4444",
                              "#ef4444",
                              "inherit",
                            ],
                          }
                        : {}
                    }
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                  >
                    {val}
                  </motion.span>
                ) : notes[i] && notes[i].size > 0 ? (
                  <div
                    className="grid w-full h-full p-[1px]"
                    style={{
                      gridTemplateColumns: `repeat(${noteGridCols}, 1fr)`,
                    }}
                  >
                    {Array.from({ length: size }, (_, idx) => idx + 1).map(
                      (n) => (
                        <span
                          key={n}
                          className={`flex items-center justify-center font-medium leading-none
                            ${
                              size === 6
                                ? "text-[clamp(5px,1.4vw,10px)]"
                                : size === 9
                                  ? "text-[clamp(4px,1.1vw,8px)]"
                                  : "text-[clamp(3px,0.8vw,6px)]"
                            }
                            text-gray-400 dark:text-blue-500`}
                        >
                          {notes[i].has(n) ? n : ""}
                        </span>
                      ),
                    )}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Win / loss overlay */}
        <AnimatePresence>
          {finished && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.55)" }}
            >
              <motion.div
                initial={{ scale: 0.7, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center shadow-2xl mx-4"
              >
                <div className="text-5xl mb-3">{isWon ? "🎉" : "💔"}</div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                  {isWon ? "Puzzle Solved!" : "Game Over"}
                </h2>
                <p className="text-gray-500 dark:text-blue-300 text-sm mb-1">
                  {isWon ? `Time: ${formatTime(elapsed)}` : "Too many mistakes"}
                </p>
                {isWon && (
                  <p className="text-gray-400 dark:text-blue-400 text-xs mb-4">
                    {hintsUsed > 0
                      ? `${hintsUsed} hint${hintsUsed > 1 ? "s" : ""} used`
                      : "No hints used!"}{" "}
                    · {mistakes} mistake{mistakes !== 1 ? "s" : ""}
                  </p>
                )}
                <button
                  onClick={() => startGame(difficulty)}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
                >
                  New Puzzle
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Numpad */}
      <div className="flex flex-col gap-1.5 mt-3">
        {numpadRows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}
          >
            {row.map((n) => (
              <button
                key={n}
                onClick={() => enterNumber(n)}
                disabled={digitCounts[n] >= size}
                className={`aspect-square rounded-xl font-semibold border transition-all
                  ${size === 12 ? "text-xs" : "text-base"}
                  ${
                    digitCounts[n] >= size
                      ? "opacity-20 cursor-not-allowed border-gray-200 dark:border-blue-900"
                      : "border-gray-300 dark:border-blue-700 text-gray-700 dark:text-blue-200 hover:bg-blue-50/80 dark:hover:bg-blue-900/40 active:scale-95 bg-white/60 dark:bg-slate-800/60"
                  }`}
              >
                {n}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={erase}
          className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-blue-700 text-gray-600 dark:text-blue-300 hover:bg-white/60 dark:hover:bg-blue-900/30 bg-white/40 dark:bg-slate-800/40 transition-all"
        >
          <Eraser size={14} /> Erase
        </button>
        <button
          onClick={undo}
          className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-blue-700 text-gray-600 dark:text-blue-300 hover:bg-white/60 dark:hover:bg-blue-900/30 bg-white/40 dark:bg-slate-800/40 transition-all"
        >
          <Undo2 size={14} /> Undo
        </button>
        <button
          onClick={() => {
            setNoteMode((m) => !m);
            play("buttonClick");
          }}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-all
            ${
              noteMode
                ? "bg-blue-500/20 border-blue-400 text-blue-700 dark:text-blue-300"
                : "border-gray-300 dark:border-blue-700 text-gray-600 dark:text-blue-300 hover:bg-white/60 dark:hover:bg-blue-900/30 bg-white/40 dark:bg-slate-800/40"
            }`}
        >
          <PenLine size={14} /> Notes
        </button>
        <button
          onClick={hint}
          className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-blue-700 text-gray-600 dark:text-blue-300 hover:bg-white/60 dark:hover:bg-blue-900/30 bg-white/40 dark:bg-slate-800/40 transition-all"
        >
          <Lightbulb size={14} /> Hint
        </button>
        <button
          onClick={() => startGame(difficulty)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-blue-700 text-gray-600 dark:text-blue-300 hover:bg-white/60 dark:hover:bg-blue-900/30 bg-white/40 dark:bg-slate-800/40 transition-all ml-auto"
        >
          <RotateCcw size={14} /> New
        </button>

        {/* Mistake dots */}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${
                i < mistakes ? "bg-red-500" : "bg-gray-300 dark:bg-blue-900"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
