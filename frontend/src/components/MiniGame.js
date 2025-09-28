import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Star, X } from 'lucide-react';
import { addXP, getGamificationStatsFromState, addTokens } from '../utils/gamification';

const MiniGame = () => {
  const [avatar, setAvatar] = useState({
    seed: "Explorer", // default avatar identity
    hair: null,
    clothing: null,
    accessories: null,
  });

  const [playing, setPlaying] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gamificationStats, setGamificationStats] = useState(getGamificationStatsFromState());
  
  // Game refs
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const gameStateRef = useRef({
    dino: { x: 50, y: 170, width: 20, height: 20, velocityY: 0, isJumping: false },
    obstacles: [],
    gameSpeed: 4,
    lastObstacleTime: 0,
    isGameRunning: false
  });

  // ✅ Compose a valid DiceBear v7 URL with the adventurer sprite
  const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${avatar.seed}${
    avatar.hair ? `&hair=${avatar.hair}` : ""
  }${avatar.clothing ? `&clothing=${avatar.clothing}` : ""}${
    avatar.accessories ? `&accessories=${avatar.accessories}` : ""
  }`;

  // ✅ Shop items with valid adventurer trait names
  const shopItems = [
    { id: 'hair', label: 'Curly Hair', cost: 50, type: 'hair', value: 'short01' },
    { id: 'clothing', label: 'Cool Shirt', cost: 75, type: 'clothing', value: 'shirt02' },
    { id: 'accessories', label: 'Glasses', cost: 40, type: 'accessories', value: 'roundGlasses' },
  ];

  // 🎮 Start the Dino game
  const playGame = () => {
    setGameOpen(true);
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
  };

  // Game functions
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    gameStateRef.current.isGameRunning = true;
    gameStateRef.current.dino = { x: 50, y: 170, width: 20, height: 20, velocityY: 0, isJumping: false };
    gameStateRef.current.obstacles = [];
    gameStateRef.current.gameSpeed = 4;
    gameStateRef.current.lastObstacleTime = 0;
    gameLoop();
  };

  const jump = () => {
    if (!gameStateRef.current.dino.isJumping && gameStateRef.current.isGameRunning) {
      gameStateRef.current.dino.velocityY = -18;
      gameStateRef.current.dino.isJumping = true;
    }
  };

  const gameLoop = () => {
    if (!gameStateRef.current.isGameRunning) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, 190, canvas.width, 10);
    
    // Update dino
    const dino = gameStateRef.current.dino;
    dino.y += dino.velocityY;
    dino.velocityY += 1.8; // stronger gravity
    
    // Ground collision
    if (dino.y >= 170) {
      dino.y = 170;
      dino.velocityY = 0;
      dino.isJumping = false;
    }
    
    // Draw dino (simple rectangle for now)
    ctx.fillStyle = '#535353';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    
    // Add obstacles
    const now = Date.now();
    if (now - gameStateRef.current.lastObstacleTime > 2000) {
      gameStateRef.current.obstacles.push({
        x: canvas.width,
        y: 180,
        width: 20,
        height: 10
      });
      gameStateRef.current.lastObstacleTime = now;
    }
    
    // Update and draw obstacles
    gameStateRef.current.obstacles = gameStateRef.current.obstacles.filter(obstacle => {
      obstacle.x -= gameStateRef.current.gameSpeed;
      
      // Draw obstacle
      ctx.fillStyle = '#535353';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Collision detection
      if (dino.x < obstacle.x + obstacle.width &&
          dino.x + dino.width > obstacle.x &&
          dino.y < obstacle.y + obstacle.height &&
          dino.y + dino.height > obstacle.y) {
        handleGameOver();
        return false;
      }
      
      return obstacle.x > -obstacle.width;
    });
    
    // Update score
    setScore(prev => prev + 1);
    
    // Increase speed
    if (score % 100 === 0) {
      gameStateRef.current.gameSpeed += 0.1;
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const handleGameOver = () => {
    gameStateRef.current.isGameRunning = false;
    setGameOver(true);
    if (score > highScore) {
      setHighScore(score);
    }
    // Award tokens based on score
    const earnedTokens = Math.floor(score / 100) * 10;
    addTokens(earnedTokens);
    setGamificationStats(getGamificationStatsFromState());
  };

  const closeGame = () => {
    setGameOpen(false);
    setGameStarted(false);
    setGameOver(false);
    gameStateRef.current.isGameRunning = false;
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameOpen && gameStarted && !gameOver) {
          jump();
        } else if (gameOpen && !gameStarted) {
          startGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameOpen, gameStarted, gameOver]);

  // 🛍️ Handle shop purchases
  const handlePurchase = (item) => {
    if (gamificationStats.tokens >= item.cost) {
      setAvatar(prev => ({
        ...prev,
        [item.type]: item.value,
      }));
      // Update tokens in centralized state
      addTokens(-item.cost);
      setGamificationStats(getGamificationStatsFromState());
    } else {
      alert("Not enough tokens!");
    }
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-8 h-8 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-800">Mini Game: Avatar Quest</h2>
        </div>
      </div>

      {/* Avatar Display */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-32 h-32 rounded-full cursor-pointer border-4 border-gray-200"
        />
        <p className="mt-2 text-gray-600">
          Tokens: {gamificationStats.tokens} <Star className="w-5 h-5 inline text-yellow-500" />
        </p>

        {/* Debug: show current URL for development */}
        <p className="text-xs text-gray-400 break-all mt-2">{avatarUrl}</p>
      </div>

      {/* Shop */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Shop Upgrades</h3>
        <div className="grid grid-cols-3 gap-2">
          {shopItems.map(item => (
            <button
              key={item.id}
              onClick={() => handlePurchase(item)}
              className={`p-3 rounded-xl ${
                avatar[item.type] === item.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label} ({item.cost}⭐)
            </button>
          ))}
        </div>
      </div>

      {/* Play Button */}
      <button
        onClick={playGame}
        className="w-full py-4 rounded-2xl font-bold text-white bg-purple-500 hover:bg-purple-600"
      >
        Play Minigame
      </button>

      {/* Game Popup */}
      <AnimatePresence>
        {gameOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Minigame</h3>
                <button
                  onClick={closeGame}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Game Canvas */}
              <div className="mb-4">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="border border-gray-300 rounded-lg bg-white"
                />
              </div>

              {/* Game Info */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">Score: {score}</p>
                  <p className="text-sm text-gray-600">High Score: {highScore}</p>
                </div>
                <div className="text-sm text-gray-600">
                  Press SPACE or ↑ to jump
                </div>
              </div>

              {/* Game Controls */}
              {!gameStarted && !gameOver && (
                <button
                  onClick={startGame}
                  className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600"
                >
                  Start Game
                </button>
              )}

              {gameOver && (
                <div className="text-center">
                  <p className="text-lg font-bold text-red-600 mb-2">Game Over!</p>
                  <p className="text-sm text-gray-600 mb-4">
                    You earned {Math.floor(score / 100) * 10} tokens!
                  </p>
                  <button
                    onClick={startGame}
                    className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MiniGame;
