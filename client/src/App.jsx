import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import HomeScreen from './components/HomeScreen'
import WaitingRoom from './components/WaitingRoom'
import GameScreen from './components/GameScreen'
import ResultsScreen from './components/ResultsScreen'
import ErrorToast from './components/ErrorToast'
import './index.css'

const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
})

function App() {
  const [screen, setScreen] = useState('home')
  const [currentRoom, setCurrentRoom] = useState(null)
  const [playerNumber, setPlayerNumber] = useState(null)
  const [players, setPlayers] = useState([])
  const [category, setCategory] = useState('')
  const [timeLeft, setTimeLeft] = useState(60)
  const [allAnswers, setAllAnswers] = useState([])
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [lastWinner, setLastWinner] = useState(null)

  useEffect(() => {
    socket.on('game-created', (data) => {
      setCurrentRoom(data.roomCode)
      setPlayerNumber(data.playerNumber)
      setLastWinner(null)
      setScreen('waiting')
    })

    socket.on('game-joined', (data) => {
      setCurrentRoom(data.roomCode)
      setPlayerNumber(data.playerNumber)
      setLastWinner(null)
      setScreen('waiting')
    })

    socket.on('players-ready', (data) => {
      setPlayers(data.players)
    })

    socket.on('game-started', (data) => {
      setCategory(data.category)
      setTimeLeft(data.timeLeft)
      setPlayers(data.players)
      setAllAnswers([])
      setScreen('game')
    })

    socket.on('time-update', (data) => {
      setTimeLeft(data.timeLeft)
    })

    socket.on('score-update', (data) => {
      setPlayers(data.players)
    })

    socket.on('player-answered', (data) => {
      setAllAnswers(prev => [...prev, {
        playerName: data.playerName,
        answer: data.answer,
        points: data.points,
        playerColor: data.playerColor,
        isMe: false
      }])
    })

    socket.on('answer-result', (data) => {
      if (data.valid) {
        setFeedback({ message: data.message, valid: true })
        setAllAnswers(prev => {
          const newAnswers = [...prev]
          if (newAnswers.length > 0) {
            newAnswers[newAnswers.length - 1].isMe = true
          }
          return newAnswers
        })
      } else {
        setFeedback({ message: data.message, valid: false })
      }
      setTimeout(() => setFeedback(null), 2000)
    })

    socket.on('game-ended', (data) => {
      setResults(data)
      setScreen('results')
    })

    socket.on('return-to-lobby', (data) => {
      setPlayers(data.players)
      setAllAnswers([])
      setLastWinner(data.lastWinner || null)
      setScreen('waiting')
    })

    socket.on('name-updated', () => {
      setFeedback({ message: 'Name updated!', valid: true })
      setTimeout(() => setFeedback(null), 2000)
    })

    socket.on('player-left', (data) => {
      setError(`${data.playerName} left the game`)
      setTimeout(() => setError(null), 3000)
    })

    socket.on('you-are-host', () => {
      setPlayerNumber(1)
      setFeedback({ message: 'You are now the host!', valid: true })
      setTimeout(() => setFeedback(null), 2000)
    })

    socket.on('error', (data) => {
      setError(data.message)
      setTimeout(() => setError(null), 3000)
    })

    return () => {
      socket.off('game-created')
      socket.off('game-joined')
      socket.off('players-ready')
      socket.off('game-started')
      socket.off('time-update')
      socket.off('score-update')
      socket.off('player-answered')
      socket.off('answer-result')
      socket.off('game-ended')
      socket.off('return-to-lobby')
      socket.off('name-updated')
      socket.off('player-left')
      socket.off('you-are-host')
      socket.off('error')
    }
  }, [])

  const createGame = () => {
    socket.emit('create-game')
  }

  const joinGame = (roomCode) => {
    socket.emit('join-game', roomCode)
  }

  const startGame = () => {
    socket.emit('start-game', currentRoom)
  }

  const leaveGame = () => {
    socket.emit('leave-game', currentRoom)
    setCurrentRoom(null)
    setPlayerNumber(null)
    setScreen('home')
  }

  const updateName = (newName) => {
    socket.emit('update-name', { roomCode: currentRoom, newName })
  }

  const updateColor = (color) => {
    socket.emit('update-color', { roomCode: currentRoom, color })
  }

  const submitAnswer = (answer) => {
    socket.emit('submit-answer', { roomCode: currentRoom, answer })
  }

  return (
    <>
      {screen === 'home' && <HomeScreen onCreateGame={createGame} onJoinGame={joinGame} />}
      {screen === 'waiting' && (
        <WaitingRoom
          roomCode={currentRoom}
          players={players}
          playerNumber={playerNumber}
          onStartGame={startGame}
          onLeaveGame={leaveGame}
          onUpdateName={updateName}
          onUpdateColor={updateColor}
          lastWinner={lastWinner}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          category={category}
          timeLeft={timeLeft}
          players={players}
          allAnswers={allAnswers}
          onSubmitAnswer={submitAnswer}
          feedback={feedback}
        />
      )}
      {screen === 'results' && (
        <ResultsScreen results={results} />
      )}
      {error && <ErrorToast message={error} />}
    </>
  )
}

export default App
