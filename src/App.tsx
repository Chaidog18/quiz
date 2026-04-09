import React, { useState, useEffect, useCallback, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Trophy, Heart, Timer, CheckCircle2, XCircle, Play, ShieldAlert } from "lucide-react";
import socket from "./socket";

interface Player {
  id: string;
  name: string;
  health: number;
  isAlive: boolean;
  isReady: boolean;
  lastAnswer: string | null;
  score: number;
}

interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface GameState {
  gameState: "LOBBY" | "STARTING" | "GENERATING" | "ROUND" | "EVALUATION" | "GAME_OVER";
  players: Player[];
  currentQuestion: Question | null;
  timer: number;
  winner: Player | null;
}

interface EmoteEvent {
  id: string;
  playerId: string;
  emote: string;
}

export default function App() {
  const [game, setGame] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [emotes, setEmotes] = useState<EmoteEvent[]>([]);

  useEffect(() => {
    socket.on("game:state", (state: GameState) => {
      setGame(state);
    });

    socket.on("player:emote", ({ playerId, emote }: { playerId: string, emote: string }) => {
      const id = Math.random().toString(36).substring(7);
      setEmotes(prev => [...prev, { id, playerId, emote }]);
      setTimeout(() => {
        setEmotes(prev => prev.filter(e => e.id !== id));
      }, 2000);
    });

    return () => {
      socket.off("game:state");
      socket.off("player:emote");
    };
  }, []);

  const handleJoin = (e: FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomId.trim()) {
      socket.emit("player:join", { name: playerName, roomId: roomId.toUpperCase() });
      setIsJoined(true);
    }
  };

  const handleReady = () => {
    socket.emit("player:ready");
  };

  const handleAnswer = (answer: string) => {
    if (game?.gameState === "ROUND" && !selectedAnswer && currentPlayer?.isAlive) {
      setSelectedAnswer(answer);
      socket.emit("player:answer", answer);
    }
  };

  const handleEmote = (emote: string) => {
    socket.emit("player:emote", emote);
  };

  // Reset selected answer when moving to a new round
  useEffect(() => {
    if (game?.gameState === "ROUND") {
      setSelectedAnswer(null);
    }
  }, [game?.currentQuestion?.id, game?.gameState]);

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-orange-500/10 rounded-full border border-orange-500/20">
              <ShieldAlert className="w-12 h-12 text-orange-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-2 text-white">ShatterQuiz</h1>
          <p className="text-neutral-400 text-center mb-8">Survival trivia. Don't let your tile break.</p>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Lobby ID</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room code (e.g. GAME1)..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all uppercase font-mono"
                maxLength={10}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter username..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                maxLength={15}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20"
            >
              Join Game
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!game) return <div className="min-h-screen flex items-center justify-center text-neutral-400">Connecting to server...</div>;

  const currentPlayer = game.players.find(p => p.id === socket.id);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-neutral-900/50 backdrop-blur-md border-b border-neutral-800 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-orange-500" />
          <span className="font-bold text-lg tracking-tight">SHATTERQUIZ</span>
          <span className="ml-4 px-2 py-0.5 bg-neutral-800 rounded text-xs font-mono text-neutral-400 border border-neutral-700">
            ROOM: {roomId}
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-neutral-400">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{game.players.length} Players</span>
          </div>
          {game.gameState !== "LOBBY" && (
            <div className="flex items-center gap-2 text-orange-500">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-mono font-bold">{game.timer}s</span>
            </div>
          )}
        </div>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto h-full min-h-screen flex flex-col">
        {game.gameState === "LOBBY" && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Waiting for Players</h2>
            <p className="text-neutral-400 mb-8">The game will start once everyone is ready.</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full mb-12">
              {game.players.map((p) => (
                <div 
                  key={p.id} 
                  className={`p-4 rounded-xl border transition-all ${
                    p.isReady 
                      ? "bg-green-500/10 border-green-500/30 text-green-500" 
                      : "bg-neutral-900 border-neutral-800 text-neutral-400"
                  }`}
                >
                  <div className="font-bold truncate">{p.name}</div>
                  <div className="text-xs uppercase tracking-widest mt-1">
                    {p.isReady ? "Ready" : "Waiting"}
                  </div>
                </div>
              ))}
            </div>

            {!currentPlayer?.isReady && (
              <button
                onClick={handleReady}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-all shadow-xl shadow-green-500/20"
              >
                <Play className="w-6 h-6 fill-current" />
                I'm Ready
              </button>
            )}
          </div>
        )}

        {game.gameState === "STARTING" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={game.timer}
              className="text-9xl font-black text-orange-500"
            >
              {game.timer}
            </motion.div>
            <p className="text-2xl font-bold mt-8 text-neutral-400 uppercase tracking-[0.2em]">Get Ready!</p>
          </div>
        )}

        {game.gameState === "GENERATING" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <ShieldAlert className="w-16 h-16 text-orange-500" />
            </motion.div>
            <h2 className="text-3xl font-bold mt-6">Generating Next Question...</h2>
            <p className="text-neutral-400 mt-2">AI is thinking of a challenge...</p>
          </div>
        )}

        {(game.gameState === "ROUND" || game.gameState === "EVALUATION") && game.currentQuestion && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Question Section */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="mb-4 flex items-center gap-3">
                <span className="px-3 py-1 bg-neutral-800 rounded-full text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  {game.currentQuestion.category}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">
                {game.currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {game.currentQuestion.options.map((option) => {
                  const isCorrect = option === game.currentQuestion?.correctAnswer;
                  const isSelected = selectedAnswer === option;
                  const isEvaluation = game.gameState === "EVALUATION";
                  
                  let buttonClass = "p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ";
                  
                  if (isEvaluation) {
                    if (isCorrect) buttonClass += "bg-green-500/20 border-green-500 text-green-400 ";
                    else if (isSelected) buttonClass += "bg-red-500/20 border-red-500 text-red-400 ";
                    else buttonClass += "bg-neutral-900 border-neutral-800 opacity-50 ";
                  } else {
                    if (isSelected) buttonClass += "bg-orange-500/20 border-orange-500 text-orange-400 ";
                    else buttonClass += "bg-neutral-900 border-neutral-800 hover:border-neutral-600 text-neutral-300 ";
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={isEvaluation || selectedAnswer !== null || !currentPlayer?.isAlive}
                      className={buttonClass}
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <span className="font-bold text-lg">{option}</span>
                        {isEvaluation && isCorrect && <CheckCircle2 className="w-6 h-6" />}
                        {isEvaluation && isSelected && !isCorrect && <XCircle className="w-6 h-6" />}
                      </div>
                      {!isEvaluation && !isSelected && (
                        <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Emote Bar for Spectators */}
              {currentPlayer && !currentPlayer.isAlive && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-neutral-900/50 border border-neutral-800 rounded-2xl text-center"
                >
                  <h3 className="text-neutral-400 font-bold mb-4 uppercase tracking-widest text-sm">Spectator Mode</h3>
                  <div className="flex justify-center gap-4">
                    {['💀', '👻', '😭', '🍿', '👏', '🔥'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleEmote(emoji)}
                        className="text-3xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Players Grid Section */}
            <div className="lg:col-span-5">
              <div className="bg-neutral-900/30 border border-neutral-800 rounded-3xl p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-neutral-400 uppercase tracking-widest text-sm">Survivors</h3>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-neutral-700" />
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {game.players.map((p) => (
                      <PlayerTile 
                        key={p.id} 
                        player={p} 
                        isCurrent={p.id === socket.id}
                        isEvaluation={game.gameState === "EVALUATION"}
                        correctAnswer={game.currentQuestion?.correctAnswer}
                        activeEmotes={emotes.filter(e => e.playerId === p.id)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}

        {game.gameState === "GAME_OVER" && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-8"
            >
              <div className="inline-block p-6 bg-yellow-500/10 rounded-full border border-yellow-500/20 mb-6">
                <Trophy className="w-20 h-20 text-yellow-500" />
              </div>
              <h2 className="text-5xl font-black mb-2">GAME OVER</h2>
              <p className="text-neutral-400 text-xl">The dust has settled.</p>
            </motion.div>

            {game.winner && (
              <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl mb-12 w-full">
                <div className="text-sm text-neutral-500 uppercase tracking-widest mb-2 font-bold">Winner</div>
                <div className="text-4xl font-bold text-white mb-4">{game.winner.name}</div>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="text-xs text-neutral-500 uppercase mb-1">Score</div>
                    <div className="text-2xl font-mono font-bold text-orange-500">{game.winner.score}</div>
                  </div>
                  <div className="w-px h-8 bg-neutral-800" />
                  <div className="text-center">
                    <div className="text-xs text-neutral-500 uppercase mb-1">Health</div>
                    <div className="text-2xl font-mono font-bold text-red-500">{game.winner.health}/3</div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-neutral-500 font-medium">
              Returning to lobby in <span className="text-white font-bold">{game.timer}s</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PlayerTile({ player, isCurrent, isEvaluation, correctAnswer, activeEmotes }: { 
  player: Player; 
  isCurrent: boolean;
  isEvaluation: boolean;
  correctAnswer?: string;
  activeEmotes: EmoteEvent[];
  key?: React.Key;
}) {
  const isWrong = isEvaluation && player.lastAnswer !== correctAnswer;
  const isCorrect = isEvaluation && player.lastAnswer === correctAnswer;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: player.isAlive ? 1 : 0.3, 
        scale: player.isAlive ? 1 : 0.9,
        x: isWrong ? [0, -5, 5, -5, 5, 0] : 0
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative p-3 rounded-xl border aspect-square flex flex-col items-center justify-center gap-2 overflow-hidden ${
        player.isAlive 
          ? isCurrent ? "bg-orange-500/10 border-orange-500/50" : "bg-neutral-800 border-neutral-700"
          : "bg-neutral-900 border-neutral-800 grayscale"
      }`}
    >
      <AnimatePresence>
        {activeEmotes.map(e => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -40, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute z-50 pointer-events-none text-3xl drop-shadow-lg"
          >
            {e.emote}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Damage Cracks */}
      {player.health < 3 && player.isAlive && (
        <div className={`absolute inset-0 crack-overlay opacity-${(3 - player.health) * 30}`} />
      )}

      {/* Health Indicator */}
      <div className="flex gap-1 mb-1">
        {[...Array(3)].map((_, i) => (
          <Heart 
            key={i} 
            className={`w-3 h-3 ${i < player.health ? "text-red-500 fill-current" : "text-neutral-700"}`} 
          />
        ))}
      </div>

      <div className="text-sm font-bold truncate w-full text-center">
        {player.name}
        {isCurrent && <span className="ml-1 text-[10px] text-orange-500">(You)</span>}
      </div>

      <div className="text-[10px] font-mono text-neutral-500 uppercase">
        {player.score} pts
      </div>

      {/* Status Overlay */}
      {!player.isAlive && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <span className="text-[10px] font-black text-red-500 rotate-[-15deg] border-2 border-red-500 px-1">SHATTERED</span>
        </div>
      )}

      {/* Answer Feedback */}
      {isEvaluation && player.isAlive && (
        <div className={`absolute top-1 right-1`}>
          {isCorrect ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
      )}
    </motion.div>
  );
}

