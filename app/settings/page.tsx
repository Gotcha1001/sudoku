"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, ImageOff } from "lucide-react";
import { BACKGROUNDS, useBackground } from "@/app/context/BackgroundContext";
import { useState } from "react";

export default function SettingsPage() {
  const { selected, setBackground } = useBackground();
  const [previewId, setPreviewId] = useState<string | null>(null);

  const activeId = previewId ?? selected.id;
  const activeBg = BACKGROUNDS.find((b) => b.id === activeId) ?? BACKGROUNDS[0];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-blue-300">
          Personalise your game board experience
        </p>
      </div>

      {/* Background section */}
      <div className="p-6 rounded-2xl border border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-950/40 shadow-sm mb-6">
        <h2 className="text-base font-semibold text-black dark:text-white mb-1">
          Game Board Background
        </h2>
        <p className="text-sm text-gray-500 dark:text-blue-400 mb-5">
          Hover to preview · click to select · saved automatically
        </p>

        {/* Live preview strip */}
        <div
          className="relative w-full h-36 rounded-xl overflow-hidden mb-6 border border-gray-200 dark:border-blue-800"
          style={
            activeBg.src
              ? undefined
              : {
                  background:
                    "radial-gradient(ellipse at 50% 40%, #1a4a2e 0%, #0f2d1c 45%, #091a10 100%)",
                }
          }
        >
          {activeBg.src && (
            <img
              src={activeBg.src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {activeBg.overlay && (
            <div className="absolute inset-0" style={{ background: activeBg.overlay }} />
          )}

          {/* Preview label */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-semibold z-10">
            {activeBg.label}
          </div>

          {/* Mini sudoku grid preview */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none z-10">
            <div className="grid grid-cols-3 gap-[2px]">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-sm bg-white/30 border border-white/20 flex items-center justify-center"
                >
                  <span className="text-white text-xs font-bold">
                    {[5, 3, "", "", 7, "", 6, 1, 4][i] || ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Grid of options */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {BACKGROUNDS.map((bg) => {
            const isSelected = selected.id === bg.id;
            return (
              <motion.button
                key={bg.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onMouseEnter={() => setPreviewId(bg.id)}
                onMouseLeave={() => setPreviewId(null)}
                onClick={() => setBackground(bg.id)}
                className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all focus:outline-none"
                style={{
                  borderColor: isSelected ? "#2563eb" : "transparent",
                  boxShadow: isSelected
                    ? "0 0 0 1px #2563eb, 0 0 16px rgba(37,99,235,0.4)"
                    : "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {/* Thumbnail or CSS fallback */}
                {bg.thumbnail ? (
                  <img
                    src={bg.thumbnail}
                    alt={bg.label}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse at 38% 32%, #1a4a2e 0%, #0f2d1c 50%, #091a10 100%)",
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-50"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
                        backgroundSize: "100px 100px",
                      }}
                    />
                  </div>
                )}

                {/* Overlay tint */}
                {bg.overlay && (
                  <div className="absolute inset-0" style={{ background: bg.overlay }} />
                )}

                {/* No thumbnail placeholder */}
                {!bg.thumbnail && bg.id !== "felt" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageOff size={16} className="text-white/30" />
                  </div>
                )}

                {/* Label */}
                <div className="absolute bottom-0 inset-x-0 px-1.5 py-1 bg-black/50 backdrop-blur-sm">
                  <p className="text-white text-[9px] font-semibold text-center truncate">
                    {bg.label}
                  </p>
                </div>

                {/* Selected checkmark — blue for Sudoku */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center"
                    >
                      <Check size={11} className="text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Hint */}
      <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-blue-800/60 text-sm text-gray-400 dark:text-blue-500">
        <p className="font-semibold mb-1 text-gray-500 dark:text-blue-400">
          Adding custom backgrounds
        </p>
        <p>
          Drop image files into{" "}
          <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-blue-900/40 text-xs font-mono">
            /public/backgrounds/
          </code>{" "}
          and register them in{" "}
          <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-blue-900/40 text-xs font-mono">
            BackgroundContext.tsx
          </code>
          . Recommended: 1920×1080 JPG for{" "}
          <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-blue-900/40 text-xs font-mono">
            src
          </code>
          , 400×225 JPG for{" "}
          <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-blue-900/40 text-xs font-mono">
            thumbnail
          </code>
          .
        </p>
      </div>
    </div>
  );
}



// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import { useTheme } from "next-themes";
// import { Check } from "lucide-react";

// type ColorScheme = "blue" | "indigo" | "teal" | "rose" | "amber";

// const COLOR_SCHEMES: { id: ColorScheme; label: string; primary: string; bg: string }[] = [
//   { id: "blue", label: "Ocean Blue", primary: "#2563eb", bg: "#eff6ff" },
//   { id: "indigo", label: "Deep Indigo", primary: "#4f46e5", bg: "#eef2ff" },
//   { id: "teal", label: "Teal Calm", primary: "#0d9488", bg: "#f0fdfa" },
//   { id: "rose", label: "Rose Garden", primary: "#e11d48", bg: "#fff1f2" },
//   { id: "amber", label: "Amber Warm", primary: "#d97706", bg: "#fffbeb" },
// ];

// const HIGHLIGHT_OPTIONS = [
//   { id: "row-col-box", label: "Row, Column & Box" },
//   { id: "row-col", label: "Row & Column only" },
//   { id: "none", label: "No highlighting" },
// ];

// export default function SettingsPage() {
//   const { theme, setTheme } = useTheme();
//   const [colorScheme, setColorScheme] = useState<ColorScheme>("blue");
//   const [highlight, setHighlight] = useState("row-col-box");
//   const [showTimer, setShowTimer] = useState(true);
//   const [autoNote, setAutoNote] = useState(false);

//   // Persist to localStorage
//   const save = (key: string, val: string | boolean) => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem(`sudoku-${key}`, String(val));
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-black dark:text-white">Settings</h1>
//         <p className="text-gray-500 dark:text-blue-300">Personalise your Sudoku experience</p>
//       </div>

//       {/* Appearance */}
//       <div className="p-6 rounded-2xl border border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-950/40 shadow-sm mb-4">
//         <h2 className="text-base font-semibold text-black dark:text-white mb-1">Appearance</h2>
//         <p className="text-sm text-gray-500 dark:text-blue-400 mb-5">Theme and colour preferences</p>

//         {/* Theme toggle */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <p className="text-sm font-medium text-black dark:text-white">Dark Mode</p>
//             <p className="text-xs text-gray-500 dark:text-blue-400">Switch between light and dark</p>
//           </div>
//           <div className="flex gap-2">
//             {(["light", "dark", "system"] as const).map((t) => (
//               <button
//                 key={t}
//                 onClick={() => setTheme(t)}
//                 className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border
//                   ${theme === t
//                     ? "bg-blue-600 text-white border-blue-600"
//                     : "border-gray-200 dark:border-blue-800 text-gray-600 dark:text-blue-300 hover:bg-gray-50 dark:hover:bg-blue-900/30"
//                   }`}
//               >
//                 {t}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Colour scheme */}
//         <div>
//           <p className="text-sm font-medium text-black dark:text-white mb-3">Accent Colour</p>
//           <div className="flex gap-3 flex-wrap">
//             {COLOR_SCHEMES.map((cs) => (
//               <motion.button
//                 key={cs.id}
//                 whileHover={{ scale: 1.08 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => { setColorScheme(cs.id); save("color", cs.id); }}
//                 className="relative w-12 h-12 rounded-xl border-2 transition-all focus:outline-none flex items-center justify-center"
//                 style={{
//                   backgroundColor: cs.bg,
//                   borderColor: colorScheme === cs.id ? cs.primary : "transparent",
//                   boxShadow: colorScheme === cs.id ? `0 0 0 1px ${cs.primary}` : "0 2px 8px rgba(0,0,0,0.1)",
//                 }}
//                 title={cs.label}
//               >
//                 <div className="w-6 h-6 rounded-full" style={{ backgroundColor: cs.primary }} />
//                 {colorScheme === cs.id && (
//                   <motion.div
//                     initial={{ opacity: 0, scale: 0.5 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
//                     style={{ backgroundColor: cs.primary }}
//                   >
//                     <Check size={10} className="text-white" />
//                   </motion.div>
//                 )}
//               </motion.button>
//             ))}
//           </div>
//           <p className="text-xs text-gray-400 dark:text-blue-500 mt-2">
//             {COLOR_SCHEMES.find((c) => c.id === colorScheme)?.label}
//           </p>
//         </div>
//       </div>

//       {/* Gameplay */}
//       <div className="p-6 rounded-2xl border border-gray-200 dark:border-blue-800 bg-white dark:bg-blue-950/40 shadow-sm mb-4">
//         <h2 className="text-base font-semibold text-black dark:text-white mb-1">Gameplay</h2>
//         <p className="text-sm text-gray-500 dark:text-blue-400 mb-5">Adjust how the game plays</p>

//         {/* Highlight mode */}
//         <div className="mb-6">
//           <p className="text-sm font-medium text-black dark:text-white mb-3">Cell Highlighting</p>
//           <div className="space-y-2">
//             {HIGHLIGHT_OPTIONS.map((opt) => (
//               <button
//                 key={opt.id}
//                 onClick={() => { setHighlight(opt.id); save("highlight", opt.id); }}
//                 className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all
//                   ${highlight === opt.id
//                     ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
//                     : "border-gray-200 dark:border-blue-800 text-gray-600 dark:text-blue-300 hover:bg-gray-50 dark:hover:bg-blue-900/20"
//                   }`}
//               >
//                 {opt.label}
//                 {highlight === opt.id && <Check size={14} className="text-blue-500" />}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Toggles */}
//         <div className="space-y-4">
//           {[
//             { key: "timer", label: "Show Timer", desc: "Display elapsed time while solving", value: showTimer, set: setShowTimer },
//             { key: "autonote", label: "Auto-clear Notes", desc: "Automatically remove pencil marks when a number is placed", value: autoNote, set: setAutoNote },
//           ].map(({ key, label, desc, value, set }) => (
//             <div key={key} className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-black dark:text-white">{label}</p>
//                 <p className="text-xs text-gray-500 dark:text-blue-400">{desc}</p>
//               </div>
//               <button
//                 onClick={() => { set(!value); save(key, !value); }}
//                 className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-blue-600" : "bg-gray-200 dark:bg-blue-900"}`}
//               >
//                 <motion.span
//                   animate={{ x: value ? 20 : 2 }}
//                   transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                   className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
//                 />
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Hint */}
//       <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-blue-800/60 text-sm text-gray-400 dark:text-blue-500">
//         <p className="font-semibold mb-1 text-gray-500 dark:text-blue-400">Settings are local</p>
//         <p>
//           These preferences are saved in your browser. They will persist between sessions on this
//           device but won&apos;t sync across devices.
//         </p>
//       </div>
//     </div>
//   );
// }
