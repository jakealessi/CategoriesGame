#!/bin/bash

echo "🎯 Starting Categories Game..."
echo ""

# Start backend server
echo "📡 Starting backend server on port 3000..."
npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start React frontend
echo "⚛️  Starting React frontend on port 5173..."
cd client && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Game is starting!"
echo ""
echo "🌐 Open your browser to: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
