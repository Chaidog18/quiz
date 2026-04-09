import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

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

const QUESTIONS: Question[] = [
  {
    id: "1",
    category: "Science",
    question: "What is the chemical symbol for Gold?",
    options: ["Gd", "Au", "Ag", "Fe"],
    correctAnswer: "Au",
  },
  {
    id: "2",
    category: "Geography",
    question: "Which is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctAnswer: "Pacific",
  },
  {
    id: "3",
    category: "History",
    question: "Who was the first President of the United States?",
    options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"],
    correctAnswer: "George Washington",
  },
  {
    id: "4",
    category: "Technology",
    question: "What does 'URL' stand for?",
    options: ["Universal Resource Locator", "Uniform Resource Locator", "Unified Resource Link", "Universal Radio Link"],
    correctAnswer: "Uniform Resource Locator",
  },
  {
    id: "5",
    category: "Pop Culture",
    question: "Which movie won the first Academy Award for Best Picture?",
    options: ["Wings", "Sunrise", "The Jazz Singer", "Metropolis"],
    correctAnswer: "Wings",
  },
  {
    id: "6",
    category: "Science",
    question: "What is the hardest natural substance on Earth?",
    options: ["Gold", "Iron", "Diamond", "Quartz"],
    correctAnswer: "Diamond",
  },
  {
    id: "7",
    category: "Geography",
    question: "What is the capital of Japan?",
    options: ["Kyoto", "Osaka", "Tokyo", "Nagoya"],
    correctAnswer: "Tokyo",
  },
  {
    id: "8",
    category: "History",
    question: "In which year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: "1945",
  }
];

async function startServer() {
  try {
    const app = express();
    const httpServer = createServer(app);

    // Request logging
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url}`);
      next();
    });

    // Health check
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok" });
    });

    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });

  const rooms: Map<string, {
    gameState: "LOBBY" | "STARTING" | "ROUND" | "EVALUATION" | "GAME_OVER";
    players: Map<string, Player>;
    currentQuestionIndex: number;
    timer: number;
  }> = new Map();

  const getRoom = (roomId: string) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        gameState: "LOBBY",
        players: new Map(),
        currentQuestionIndex: 0,
        timer: 0,
      });
    }
    return rooms.get(roomId)!;
  };

  const broadcastState = (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;

    io.to(roomId).emit("game:state", {
      gameState: room.gameState,
      players: Array.from(room.players.values()),
      currentQuestion: room.gameState === "ROUND" || room.gameState === "EVALUATION" ? QUESTIONS[room.currentQuestionIndex] : null,
      timer: room.timer,
      winner: room.gameState === "GAME_OVER" ? getWinner(roomId) : null,
    });
  };

  const getWinner = (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return null;
    const alivePlayers = Array.from(room.players.values()).filter(p => p.isAlive);
    if (alivePlayers.length === 1) return alivePlayers[0];
    if (alivePlayers.length === 0) {
      return Array.from(room.players.values()).sort((a, b) => b.score - a.score)[0];
    }
    return null;
  };

  const startRound = (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.gameState = "ROUND";
    room.timer = 15;
    room.players.forEach(p => p.lastAnswer = null);
    broadcastState(roomId);
  };

  const evaluateRound = (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.gameState = "EVALUATION";
    room.timer = 5;
    const correct = QUESTIONS[room.currentQuestionIndex].correctAnswer;
    
    room.players.forEach(p => {
      if (p.isAlive) {
        if (p.lastAnswer !== correct) {
          p.health -= 1;
          if (p.health <= 0) {
            p.isAlive = false;
          }
        } else {
          p.score += 10;
        }
      }
    });

    broadcastState(roomId);
  };

  const nextStep = (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) return;

    if (room.gameState === "STARTING") {
      room.currentQuestionIndex = Math.floor(Math.random() * QUESTIONS.length);
      startRound(roomId);
    } else if (room.gameState === "ROUND") {
      evaluateRound(roomId);
    } else if (room.gameState === "EVALUATION") {
      const alivePlayers = Array.from(room.players.values()).filter(p => p.isAlive);
      if (alivePlayers.length <= 1) {
        room.gameState = "GAME_OVER";
        room.timer = 10;
      } else {
        let nextIndex = Math.floor(Math.random() * QUESTIONS.length);
        while (nextIndex === room.currentQuestionIndex && QUESTIONS.length > 1) {
          nextIndex = Math.floor(Math.random() * QUESTIONS.length);
        }
        room.currentQuestionIndex = nextIndex;
        startRound(roomId);
      }
    } else if (room.gameState === "GAME_OVER") {
      room.gameState = "LOBBY";
      room.players.forEach(p => {
        p.health = 3;
        p.isAlive = true;
        p.isReady = false;
        p.score = 0;
      });
    }
    broadcastState(roomId);
  };

  setInterval(() => {
    rooms.forEach((room, roomId) => {
      if (room.timer > 0) {
        room.timer -= 1;
        if (room.timer === 0) {
          nextStep(roomId);
        } else {
          broadcastState(roomId);
        }
      }
    });
  }, 1000);

  io.on("connection", (socket) => {
    let currentRoomId: string | null = null;

    socket.on("player:join", ({ name, roomId }: { name: string, roomId: string }) => {
      const roomCode = roomId.trim().toUpperCase() || "DEFAULT";
      currentRoomId = roomCode;
      socket.join(roomCode);

      const room = getRoom(roomCode);
      const player: Player = {
        id: socket.id,
        name: name || `Player ${socket.id.slice(0, 4)}`,
        health: 3,
        isAlive: true,
        isReady: false,
        lastAnswer: null,
        score: 0,
      };
      room.players.set(socket.id, player);
      broadcastState(roomCode);
    });

    socket.on("player:ready", () => {
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      if (room) {
        const player = room.players.get(socket.id);
        if (player) {
          player.isReady = true;
          broadcastState(currentRoomId);

          const allReady = Array.from(room.players.values()).every(p => p.isReady);
          if (allReady && room.players.size >= 1 && room.gameState === "LOBBY") {
            room.gameState = "STARTING";
            room.timer = 5;
            broadcastState(currentRoomId);
          }
        }
      }
    });

    socket.on("player:answer", (answer: string) => {
      if (!currentRoomId) return;
      const room = rooms.get(currentRoomId);
      if (room && room.gameState === "ROUND") {
        const player = room.players.get(socket.id);
        if (player && player.isAlive) {
          player.lastAnswer = answer;
          broadcastState(currentRoomId);

          const alivePlayers = Array.from(room.players.values()).filter(p => p.isAlive);
          const allAnswered = alivePlayers.every(p => p.lastAnswer !== null);
          if (allAnswered) {
            room.timer = 1;
          }
        }
      }
    });

    socket.on("disconnect", () => {
      if (currentRoomId) {
        const room = rooms.get(currentRoomId);
        if (room) {
          room.players.delete(socket.id);
          if (room.players.size === 0) {
            rooms.delete(currentRoomId);
          } else {
            broadcastState(currentRoomId);
          }
        }
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Explicit SPA fallback for development
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const template = await fs.promises.readFile(path.resolve(__dirname, "index.html"), "utf-8");
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  } catch (error) {
    console.error("Critical error starting server:", error);
  }
}

startServer();
