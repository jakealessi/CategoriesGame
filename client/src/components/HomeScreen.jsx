import { motion } from 'framer-motion'
import { useState } from 'react'
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
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <motion.div
          className={styles.titleBlock}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.subtitle}>Name it fast. Score big.</p>
        </motion.div>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <motion.button
            className={styles.primaryButton}
            onClick={onCreateGame}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Game
          </motion.button>

          <div className={styles.divider}>
            <span>or join</span>
          </div>

          <div className={styles.joinSection}>
            <input
              type="text"
              className={styles.input}
              placeholder="ROOM CODE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              maxLength={6}
            />
            <motion.button
              className={styles.secondaryButton}
              onClick={handleJoin}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Join
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
