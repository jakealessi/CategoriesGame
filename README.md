# Categories Game

A multiplayer web game where 1-4 players name items from a category within 60 seconds. Niche answers score more points.

## How to Play

1. Create or join a game with a room code
2. Start when ready (works with 1 player)
3. Type answers from the given category. First to submit an answer claims it
4. 1 point = common, 2 = moderate, 3 = niche
5. After 60 seconds, results show and you return to the lobby automatically

## Running the Game

```bash
npm install
cd client && npm install && cd ..

# Terminal 1
npm start

# Terminal 2
cd client
npm run dev
```

Open http://localhost:5173

## Tech Stack

- Backend: Node.js, Express, Socket.IO
- Frontend: React (Vite), CSS Modules
- Fuzzy matching for typos via Levenshtein distance

## Project Structure

- `server.js` - Game logic and Socket.IO
- `categories.js` - Category data (answers and point values)
- `client/` - React app (HomeScreen, WaitingRoom, GameScreen, ResultsScreen)
