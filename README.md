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

## Deploy to Render (free)

1. Push your code to GitHub.
2. Go to [render.com](https://render.com) and sign up (free).
3. Click **New** > **Web Service**.
4. Connect your GitHub repo and select the `CategoriesGame` repository.
5. Configure:
   - **Name**: categories-game (or any name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `NODE_ENV=production node server.js`
   - **Instance Type**: Free
6. Click **Create Web Service**.
7. Wait for the build to finish (2-3 minutes). Your game will be live at `https://your-app-name.onrender.com`.

**Note**: On the free tier, the service spins down after 15 minutes of inactivity. The first request after that may take 30-60 seconds to wake up.
