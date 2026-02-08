# Categories Game

A real-time multiplayer web game where 1-4 players compete to name items from a category within 60 seconds. More niche answers earn more points!

## 🎮 How to Play

1. **Create or Join**: One player creates a game and shares the room code with others
2. **1-4 Players**: Play solo for practice or compete with up to 3 friends
3. **Start Game**: Host starts when ready (can start with just 1 player)
4. **Type Answers**: Players have 60 seconds to name as many items as they can from the given category
5. **First Come, First Served**: Each answer can only be claimed once per game
6. **See Live Answers**: Watch everyone's submissions appear in real-time
7. **Smart Autocorrect**: Typos are automatically fixed (e.g., "bannana" → "Banana")
8. **Scoring**: 
   - **1 point** - Common answers (e.g., "Apple" for fruits)
   - **2 points** - Moderate answers (e.g., "Mango" for fruits)  
   - **3 points** - Niche answers (e.g., "Kumquat" for fruits)
9. **Results**: After 5 seconds showing the winner, all guesses, and all possible answers, automatically returns to lobby

## 🚀 Quick Start

### Installation

```bash
npm install
cd client
npm install
cd ..
```

### Running the Game

```bash
# Terminal 1 - Start backend server
npm start

# Terminal 2 - Start frontend dev server
cd client
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Development Mode (Backend)

```bash
npm run dev  # Auto-restart on changes
```

## ✨ Key Features

### Gameplay
- **Real-time multiplayer** using WebSockets (Socket.IO)
- **1-4 players** with solo mode support
- **60-second countdown timer** with color-coded urgency (green → orange → red)
- **Intelligent autocorrect** handles typos using Levenshtein distance algorithm
- **Answer uniqueness** - each answer can only be claimed once per game
- **Live answer feed** showing all players' submissions as they happen
- **Win tracking** - persistent win counter throughout the lobby session
- **Auto-return to lobby** - after 5 seconds on results screen
- **All possible answers** displayed at end of each round

### UI/UX
- **Modern React interface** with Framer Motion animations
- **Clean, minimal design** with soft color palette
- **Responsive layout** works on desktop, tablet, and mobile
- **Real-time score updates** 
- **Visual feedback** for valid/invalid answers
- **Player name customization** with in-lobby editing
- **Leave game** functionality with host transfer

### Technical
- **Smart fuzzy matching** prevents "North Dakota" from matching "South Dakota"
- **Room code system** for easy game joining
- **Host migration** when host leaves
- **Disconnect handling** with proper cleanup
- **Efficient animations** with staggered transitions

## 🏗️ Tech Stack

### Backend
- Node.js
- Express
- Socket.IO (WebSocket server)

### Frontend  
- React (Vite)
- Framer Motion (animations)
- Socket.IO Client
- CSS Modules (scoped styling)

### Algorithms
- Levenshtein Distance for fuzzy string matching
- Real-time state synchronization
- Room-based game management

## 📁 Project Structure

```
CategoriesGame/
├── server.js              # Backend game logic & Socket.IO server
├── categories.js          # Category data with answers and point values
├── package.json           # Backend dependencies
├── client/                # React frontend
│   ├── src/
│   │   ├── App.jsx       # Main app component & Socket.IO client
│   │   ├── main.jsx      # React entry point
│   │   ├── index.css     # Global styles
│   │   └── components/
│   │       ├── HomeScreen.jsx         # Create/join game screen
│   │       ├── WaitingRoom.jsx        # Lobby screen
│   │       ├── GameScreen.jsx         # Active gameplay screen
│   │       ├── ResultsScreen.jsx      # Results & all answers screen
│   │       ├── ErrorToast.jsx         # Error notifications
│   │       └── *.module.css           # Component-specific styles
│   ├── vite.config.js    # Vite configuration
│   └── package.json      # Frontend dependencies
└── README.md
```

## 🎯 Game Flow

```
Home Screen
    ↓
Waiting Room (lobby)
    ↓
Game Screen (60 seconds)
    ↓
Results Screen (5 seconds)
    ↓ (automatic)
Waiting Room (ready for next round)
```

## 📝 Adding Categories

Edit `categories.js`:

```javascript
export const categories = {
  "Your Category Name": [
    { answer: "Common Answer", points: 1 },
    { answer: "Moderate Answer", points: 2 },
    { answer: "Niche Answer", points: 3 }
  ]
}
```

### Included Categories
- Types of Fruit (20 answers)
- Countries in Europe (20 answers)
- Animals (20 answers)
- Sports (18 answers)
- US States (50 answers)
- Pizza Toppings (16 answers)

## 🧠 How Autocorrect Works

The game uses **Levenshtein Distance** to calculate similarity between typed answers and valid answers.

### Algorithm
```javascript
// Calculates minimum edits needed to transform one string into another
levenshteinDistance("bannana", "banana") // = 1 edit
```

### Rules
1. **Exact matches** always work
2. **Multi-word answers** require at least one significant word (>3 letters) to match exactly
3. **Distance threshold**: Only allows ~1 character error per 8 characters
4. **Prevents false matches**: "North Dakota" won't match "South Dakota"

### Examples That Work ✅
- "bannana" → "Banana"
- "straberry" → "Strawberry"  
- "nrth dakota" → "North Dakota"
- "north dakoa" → "North Dakota"
- "Californa" → "California"

### Examples That Don't Work ❌
- "north dakota" → "South Dakota" (different word)
- "dakota" → "North Dakota" (missing required word)
- "apple" → "Pineapple" (too different)

## 🏆 Win Tracking

- Each player has a persistent **win counter** in their current lobby
- Winners get **+1 win** after each round (ties count for everyone)
- Win counts are displayed on the results screen
- Wins **reset when you leave the lobby**
- Wins **persist across rounds** in the same lobby

## 🎨 Color Palette

The UI uses a soft, professional color scheme:
- Background: Light gray gradient
- Primary: Soft blue (#5b8fd8)
- Success: Soft green (#52c993)
- Warning: Soft orange (#e67e22)
- Error: Soft red (#e74c3c)
- Text: Dark gray (#2c3e50)

## ⚡ Performance Features

- **Staggered animations** for smooth transitions
- **Optimized re-renders** with React
- **Efficient WebSocket** communication
- **Debounced input** handling
- **Lazy animation delays** for better UX

## 🐛 Bug Fixes & Improvements

### Recent Fixes
- ✅ **Solo mode bug**: Fixed "already taken" error when playing alone
- ✅ **Fuzzy matching**: Improved to prevent similar answers from matching (North vs South Dakota)
- ✅ **Auto-return**: Removed manual "Play Again" button for seamless flow
- ✅ **All answers display**: Shows every possible answer after each round
- ✅ **Win persistence**: Win counts properly tracked across rounds
- ✅ **Responsive CSS**: Fixed glitches when window is resized/split
- ✅ **UI cleanup**: Removed unnecessary text and emojis for cleaner look

## 🎲 Game Mechanics

### Answer Validation
1. Player types answer and submits
2. Server normalizes input (lowercase, trim)
3. Server runs fuzzy match against valid answers
4. If match found, checks if already used
5. If available, awards points and broadcasts to all players
6. Real-time feedback shown to player

### Timing
- **60 seconds** for gameplay
- **5 seconds** for results screen
- **Automatic transition** back to lobby

### Scoring System
- Points are **predefined** in `categories.js`
- No algorithmic calculation
- Based on subjective "nicheness" of answers
- Consistent across all games

## 🔧 Configuration

### Change Auto-Return Timer

In `server.js`, find the `endGame()` function:

```javascript
setTimeout(() => {
  // ...
}, 5000);  // Change to desired milliseconds (e.g., 7000 = 7 seconds)
```

### Change Game Duration

In `server.js`, find the `start-game` handler:

```javascript
game.timeLeft = 60;  // Change to desired seconds
```

### Customize Ports

**Backend** (`server.js`):
```javascript
const PORT = process.env.PORT || 3000;
```

**Frontend** (`client/vite.config.js`):
```javascript
server: {
  port: 5173,  // Change frontend port
  proxy: {
    '/socket.io': {
      target: 'http://localhost:3000',  // Update if backend port changes
      ws: true
    }
  }
}
```

## 🌐 Socket.IO Events

### Client → Server
- `create-game` - Create new game room
- `join-game` - Join existing room
- `start-game` - Begin countdown
- `submit-answer` - Submit an answer
- `update-name` - Change player name
- `leave-game` - Exit lobby

### Server → Client
- `game-created` - Room created successfully
- `game-joined` - Joined room successfully
- `players-ready` - Player list updated
- `game-started` - Game began, receive category
- `time-update` - Countdown tick
- `player-answered` - Another player submitted answer
- `answer-result` - Your answer was validated
- `score-update` - Scores changed
- `game-ended` - Round over, results available
- `return-to-lobby` - Auto-return after 5 seconds
- `player-left` - Someone left the game
- `you-are-host` - You're now the host
- `player-disconnected` - Disconnect detected
- `error` - Error message

## 📱 Responsive Design

The game is fully responsive with breakpoints at:
- **1024px** - Tablet landscape
- **768px** - Tablet portrait / split screen
- **480px** - Mobile devices

Features:
- Fluid typography using `clamp()`
- Flexible grid layouts
- Touch-friendly button sizes
- Scrollable answer lists
- Adaptive spacing and padding

## 🎭 Animations

Powered by **Framer Motion**:
- Page transitions (fade, scale, slide)
- Staggered list animations
- Button hover effects (scale, glow)
- Score counter animations (spring physics)
- Smooth enter/exit animations
- Real-time answer feed animations

## 🚨 Error Handling

- Invalid room codes
- Full lobbies (max 4 players)
- Duplicate answers
- Invalid answers
- Player disconnections
- Host leaving (auto-migration)
- Network errors

All errors display as non-intrusive toast notifications.

## 🤝 Multiplayer Features

- **Real-time synchronization** of all game state
- **Room-based isolation** - games don't interfere
- **Host privileges** - only host can start game
- **Automatic host transfer** when host leaves
- **Live player list** updates
- **Answer broadcasting** to all players instantly
- **Synchronized timer** across all clients

## 💡 Tips for Players

- **Go for niche answers** - 3-point answers are worth 3x as much!
- **Type fast** - answers are first-come, first-served
- **Don't worry about typos** - autocorrect has your back
- **Watch the feed** - avoid typing answers others have submitted
- **Learn from "All Answers"** - study the full list after each round
- **Play strategically** - in multi-round lobbies, remember what worked

## 📊 Future Enhancement Ideas

- Player profiles/accounts
- Global leaderboards
- Custom categories (user-created)
- Timed rounds (best of 3, 5, etc.)
- Difficulty levels
- Hint system
- Chat functionality
- Sound effects and music
- Achievement badges
- Mobile app version
- Tournament mode

## 📄 License

This project is open source and available for personal and educational use.

## 🙋 Contributing

Feel free to fork, modify, and improve! This is a learning project demonstrating real-time multiplayer game development with modern web technologies.

---

**Built with ❤️ using React, Node.js, and Socket.IO**
