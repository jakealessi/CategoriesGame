import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { categories } from './categories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// API: get category list (for dropdown)
app.get('/api/categories', (req, res) => {
  res.json({ categories: Object.keys(categories) });
});

// Serve static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'client', 'dist', 'index.html'));
  });
} else {
  app.use(express.static('public'));
}

// Game state
const games = new Map();

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRandomCategory(lastCategory) {
  const categoryNames = Object.keys(categories);
  if (categoryNames.length <= 1) return categoryNames[0];
  let pick;
  do {
    pick = categoryNames[Math.floor(Math.random() * categoryNames.length)];
  } while (pick === lastCategory);
  return pick;
}

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // substitution
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1      // insertion
        );
      }
    }
  }
  return dp[m][n];
}

// Fuzzy match function - allows small typos
function fuzzyMatch(input, target) {
  const normalizedInput = input.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();
  
  // Exact match
  if (normalizedInput === normalizedTarget) {
    return true;
  }
  
  // For multi-word answers, be more strict
  const inputWords = normalizedInput.split(/\s+/);
  const targetWords = normalizedTarget.split(/\s+/);
  
  // If word counts differ by more than 1, don't match
  if (Math.abs(inputWords.length - targetWords.length) > 1) {
    return false;
  }
  
  // For multi-word answers, check that at least one significant word matches exactly
  if (targetWords.length > 1) {
    const significantWords = targetWords.filter(word => word.length > 3);
    if (significantWords.length > 0) {
      const hasExactWordMatch = significantWords.some(word => 
        inputWords.includes(word)
      );
      if (!hasExactWordMatch) {
        return false; // No significant word matched exactly
      }
    }
  }
  
  // Calculate allowed distance based on word length
  // Be more strict - only allow typos, not different words
  const maxDistance = Math.max(1, Math.floor(normalizedTarget.length / 8));
  const distance = levenshteinDistance(normalizedInput, normalizedTarget);
  
  return distance <= maxDistance;
}

// Partial name match - checks if all input words appear in the target
// e.g. "George Bush" matches "George H.W. Bush" and "George W. Bush"
function partialNameMatch(input, target) {
  const inputWords = input.toLowerCase().trim().split(/\s+/);
  const targetWords = target.toLowerCase().trim().split(/\s+/);
  
  // Input must have at least 2 words, target must have more words than input
  if (inputWords.length < 2 || targetWords.length <= inputWords.length) return false;
  
  // Every input word must appear in target (exact or fuzzy on individual words)
  return inputWords.every(inputWord => 
    targetWords.some(targetWord => {
      if (inputWord === targetWord) return true;
      // Allow small typo on longer words
      if (inputWord.length > 3 && targetWord.length > 3) {
        return levenshteinDistance(inputWord, targetWord) <= 1;
      }
      return false;
    })
  );
}

const DEFAULT_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12'];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-game', () => {
    const roomCode = generateRoomCode();
    const game = {
      roomCode,
      players: [{ id: socket.id, name: 'Player 1', score: 0, answers: [], wins: 0, color: DEFAULT_COLORS[0] }],
      status: 'waiting',
      category: null,
      timeLeft: 60,
      timer: null,
      usedAnswers: [], // Track globally used answers
      lastCategory: null,
      lastWinner: null
    };
    
    games.set(roomCode, game);
    socket.join(roomCode);
    socket.emit('game-created', { roomCode, playerNumber: 1 });
    
    // Send initial player list so the creator sees themselves
    socket.emit('players-ready', {
      players: game.players.map(p => ({ name: p.name, score: p.score, color: p.color, wins: p.wins }))
    });
    console.log('Game created:', roomCode);
  });

  socket.on('join-game', (roomCode) => {
    const game = games.get(roomCode);
    
    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }
    
    if (game.status !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }
    
    if (game.players.length >= 4) {
      socket.emit('error', { message: 'Game is full (max 4 players)' });
      return;
    }
    
    const playerNumber = game.players.length + 1;
    game.players.push({ id: socket.id, name: `Player ${playerNumber}`, score: 0, answers: [], wins: 0, color: DEFAULT_COLORS[playerNumber - 1] || DEFAULT_COLORS[0] });
    socket.join(roomCode);
    socket.emit('game-joined', { roomCode, playerNumber });
    
    // Notify all players
    io.to(roomCode).emit('players-ready', {
      players: game.players.map(p => ({ name: p.name, score: p.score, color: p.color, wins: p.wins }))
    });
    
    console.log('Player joined game:', roomCode);
  });

  socket.on('start-game', ({ roomCode, selectedCategory }) => {
    const game = games.get(roomCode);
    
    if (!game || game.players.length < 1) {
      socket.emit('error', { message: 'Need at least 1 player to start' });
      return;
    }
    
    if (game.status !== 'waiting') {
      return;
    }
    
    // Use selected category if valid, otherwise random
    const useCategory = selectedCategory && selectedCategory !== 'Random' && categories[selectedCategory]
      ? selectedCategory
      : getRandomCategory(game.lastCategory);
    
    // Start the game
    game.status = 'playing';
    game.category = useCategory;
    game.lastCategory = game.category;
    game.timeLeft = 60;
    game.usedAnswers = []; // Reset used answers
    
    // Reset player answers and scores
    game.players.forEach(p => {
      p.answers = [];
      p.score = 0;
    });
    
    io.to(roomCode).emit('game-started', {
      category: game.category,
      timeLeft: game.timeLeft,
      players: game.players.map(p => ({ name: p.name, score: p.score, color: p.color, wins: p.wins }))
    });
    
    // Start countdown timer
    game.timer = setInterval(() => {
      game.timeLeft--;
      io.to(roomCode).emit('time-update', { timeLeft: game.timeLeft });
      
      if (game.timeLeft <= 0) {
        clearInterval(game.timer);
        endGame(game);
      }
    }, 1000);
    
    console.log('Game started:', roomCode, 'Category:', game.category);
  });

  socket.on('update-name', ({ roomCode, newName }) => {
    const game = games.get(roomCode);
    
    if (!game) {
      return;
    }
    
    const player = game.players.find(p => p.id === socket.id);
    if (player) {
      player.name = newName.substring(0, 20); // Limit name length
      
      socket.emit('name-updated', { success: true });
      
      // Notify all players of updated list
      io.to(roomCode).emit('players-ready', {
        players: game.players.map(p => ({ name: p.name, score: p.score, color: p.color, wins: p.wins }))
      });
      
      console.log('Player updated name:', newName);
    }
  });

  socket.on('update-color', ({ roomCode, color }) => {
    const game = games.get(roomCode);
    if (!game) return;
    
    const player = game.players.find(p => p.id === socket.id);
    if (player) {
      player.color = color;
      
      io.to(roomCode).emit('players-ready', {
        players: game.players.map(p => ({ name: p.name, score: p.score, color: p.color, wins: p.wins }))
      });
    }
  });

  socket.on('leave-game', (roomCode) => {
    const game = games.get(roomCode);
    
    if (!game) {
      return;
    }
    
    const playerIndex = game.players.findIndex(p => p.id === socket.id);
    if (playerIndex !== -1) {
      const playerName = game.players[playerIndex].name;
      game.players.splice(playerIndex, 1);
      
      socket.leave(roomCode);
      
      // Notify remaining players
      if (game.players.length > 0) {
        io.to(roomCode).emit('player-left', { playerName });
        io.to(roomCode).emit('players-ready', {
          players: game.players.map(p => ({ name: p.name, score: p.score, color: p.color, wins: p.wins }))
        });
        
        // If player 1 left, make the next player the new host
        if (playerIndex === 0 && game.players.length > 0) {
          // Find the new player 1's socket
          const newHost = game.players[0];
          io.to(newHost.id).emit('you-are-host');
        }
      } else {
        // No players left, delete the game
        if (game.timer) {
          clearInterval(game.timer);
        }
        games.delete(roomCode);
        console.log('Game deleted (no players):', roomCode);
      }
      
      console.log('Player left game:', roomCode, playerName);
    }
  });

  socket.on('submit-answer', ({ roomCode, answer }) => {
    const game = games.get(roomCode);
    
    if (!game || game.status !== 'playing') {
      return;
    }
    
    const player = game.players.find(p => p.id === socket.id);
    if (!player) {
      return;
    }
    
    // Normalize answer for comparison
    const normalizedAnswer = answer.toLowerCase().trim();
    
    // Check if answer is valid for this category (with fuzzy matching)
    const categoryData = categories[game.category];
    
    // Collect ALL matching entries, then pick the first unused one
    let allMatches = categoryData.filter(item => 
      fuzzyMatch(normalizedAnswer, item.answer) ||
      (item.aliases && item.aliases.some(alias => fuzzyMatch(normalizedAnswer, alias)))
    );
    
    // If no fuzzy match, try partial name match (e.g. "George Bush" -> "George W. Bush")
    if (allMatches.length === 0) {
      allMatches = categoryData.filter(item => 
        partialNameMatch(normalizedAnswer, item.answer)
      );
    }
    
    // If still no match, try last-name-only match (only if unique)
    if (allMatches.length === 0) {
      const lastNameMatches = categoryData.filter(item => {
        const words = item.answer.toLowerCase().trim().split(/\s+/);
        if (words.length < 2) return false;
        const lastName = words[words.length - 1];
        return fuzzyMatch(normalizedAnswer, lastName);
      });
      if (lastNameMatches.length === 1) {
        allMatches = lastNameMatches;
      }
    }
    
    // Pick the first unused match
    const validAnswer = allMatches.find(item => 
      !game.usedAnswers.includes(item.answer.toLowerCase())
    );
    
    if (validAnswer) {
      // Use normalized version of the correct answer for tracking
      const correctAnswerNormalized = validAnswer.answer.toLowerCase();
      
      // If all matches were used, tell the player
      // (this case is handled by validAnswer being undefined above, falling to the else)
      
      // Mark answer as used globally (using the correct form)
      game.usedAnswers.push(correctAnswerNormalized);
      player.answers.push(validAnswer.answer); // Store proper case
      player.score += validAnswer.points;
      
      // Show if autocorrect was used
      const wasAutocorrected = normalizedAnswer !== correctAnswerNormalized;
      const message = wasAutocorrected 
        ? `${validAnswer.answer} +${validAnswer.points}`
        : `+${validAnswer.points}`;
      
      // Broadcast answer to ALL players first (so it's in the feed before result)
      io.to(roomCode).emit('player-answered', {
        playerName: player.name,
        answer: validAnswer.answer,
        points: validAnswer.points,
        playerColor: player.color
      });
      
      // Then tell the submitter their result (marks the answer as theirs)
      socket.emit('answer-result', {
        answer: validAnswer.answer,
        valid: true,
        points: validAnswer.points,
        message: message,
        autocorrected: wasAutocorrected
      });
      
      // Broadcast score update to all players
      io.to(roomCode).emit('score-update', {
        players: game.players.map(p => ({ 
          name: p.name, 
          score: p.score,
          color: p.color,
          wins: p.wins
        }))
      });
    } else if (allMatches.length > 0) {
      // Had matches but all were already used
      socket.emit('answer-result', {
        answer,
        valid: false,
        points: 0,
        message: 'Already taken!'
      });
    } else {
      socket.emit('answer-result', {
        answer,
        valid: false,
        points: 0,
        message: 'Not valid'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and clean up games
    for (const [roomCode, game] of games.entries()) {
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex !== -1) {
        // Don't remove players during finished state - the auto-return
        // timeout handles the transition. Socket.IO can briefly reconnect
        // during that window, which would wrongly delete the game.
        if (game.status === 'finished') {
          break;
        }
        
        const playerName = game.players[playerIndex].name;
        game.players.splice(playerIndex, 1);
        
        if (game.players.length === 0) {
          // No players left - clean up entirely
          if (game.timer) {
            clearInterval(game.timer);
          }
          games.delete(roomCode);
          console.log('Game deleted (no players):', roomCode);
        } else {
          // Still have players - notify them
          io.to(roomCode).emit('player-left', { playerName });
          io.to(roomCode).emit('players-ready', {
            players: game.players.map(p => ({ name: p.name, score: p.score, color: p.color, wins: p.wins }))
          });
          
          // Transfer host if player 1 left
          if (playerIndex === 0) {
            io.to(game.players[0].id).emit('you-are-host');
          }
        }
        
        break; // Player can only be in one game
      }
    }
  });
});

function endGame(game) {
  game.status = 'finished';
  
  // Calculate results
  const results = game.players.map(p => ({
    name: p.name,
    score: p.score,
    answers: p.answers,
    wins: p.wins
  })).sort((a, b) => b.score - a.score);
  
  // Determine winner(s) and increment their win count
  const highScore = results[0].score;
  const winners = results.filter(p => p.score === highScore);
  
  // Increment wins for all winners (including ties) - match by id for safety
  const highScorePlayerIds = game.players
    .filter(p => p.score === highScore)
    .map(p => p.id);
  
  game.players.forEach(p => {
    if (highScorePlayerIds.includes(p.id)) {
      p.wins++;
    }
  });
  
  // Update results with new win counts
  const updatedResults = game.players.map(p => ({
    name: p.name,
    score: p.score,
    answers: p.answers,
    wins: p.wins,
    color: p.color
  })).sort((a, b) => b.score - a.score);
  
  const winnerText = winners.length > 1 ? 'Tie!' : winners[0].name;
  
  // Store last winner name(s) for the lobby glow effect
  game.lastWinner = winners.map(w => w.name);
  
  // Get all possible answers for the category
  const categoryData = categories[game.category];
  const allPossibleAnswers = categoryData.map(item => ({
    answer: item.answer,
    points: item.points
  }));
  
  io.to(game.roomCode).emit('game-ended', {
    results: updatedResults,
    winner: winnerText,
    allPossibleAnswers: allPossibleAnswers
  });
  
  console.log('Game ended:', game.roomCode, 'Winner:', winnerText);
  
  // Reset game state for replay (but keep wins!)
  setTimeout(async () => {
    if (games.has(game.roomCode)) {
      // Get the actual sockets still in this room
      const room = io.sockets.adapter.rooms.get(game.roomCode);
      const connectedIds = room ? [...room] : [];
      
      // Remove players who are no longer connected
      game.players = game.players.filter(p => connectedIds.includes(p.id));
      
      if (game.players.length === 0) {
        games.delete(game.roomCode);
        console.log('Game deleted after results (no connected players):', game.roomCode);
        return;
      }
      
      game.status = 'waiting';
      game.category = null;
      game.timeLeft = 60;
      game.usedAnswers = [];
      game.players.forEach(p => {
        p.score = 0;
        p.answers = [];
        // Don't reset wins!
      });
      
      // Notify players to return to waiting room
      io.to(game.roomCode).emit('return-to-lobby', {
        players: game.players.map(p => ({ name: p.name, score: p.score, color: p.color, wins: p.wins })),
        lastWinner: game.lastWinner
      });
    }
  }, 12000);
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
