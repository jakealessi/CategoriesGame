import { motion as Motion } from 'framer-motion'
import { useState } from 'react'
import GameHeader from './GameHeader'
import styles from './HomeScreen.module.css'

export default function HomeScreen({ onCreateGame, onJoinGame }) {
  const [roomCode, setRoomCode] = useState('')

  const handleJoin = () => {
    if (roomCode.length === 6) {
      onJoinGame(roomCode.toUpperCase())
    }
  }

  return (
    <div className={styles.container}>
      <GameHeader />
      <Motion.main
        className={styles.main}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <section className={styles.playPanel} aria-label="Start or join a game">
          <h1 className={styles.title}>Play</h1>

          <div className={styles.createSection}>
            <button className={styles.primaryButton} onClick={onCreateGame}>
              Create game
            </button>
          </div>

          <div className={styles.joinSection}>
            <label className={styles.joinLabel} htmlFor="room-code">Room code</label>
            <div className={styles.joinRow}>
              <input
                id="room-code"
                type="text"
                className={styles.input}
                placeholder="ABCDEF"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                maxLength={6}
                autoComplete="off"
              />
              <button className={styles.secondaryButton} onClick={handleJoin} disabled={roomCode.length !== 6}>
                Join room
              </button>
            </div>
          </div>
        </section>
      </Motion.main>
    </div>
  )
}
