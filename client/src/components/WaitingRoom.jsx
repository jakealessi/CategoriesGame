import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import ColorPicker from './ColorPicker'
import styles from './WaitingRoom.module.css'

export default function WaitingRoom({ roomCode, players, playerNumber, onStartGame, onLeaveGame, onUpdateName, onUpdateColor, lastWinner }) {
  const [name, setName] = useState('')
  const [showCopied, setShowCopied] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const nameInitialized = useRef(false)
  const colorPickerRef = useRef(null)

  // Sync name from server data when players load (handles mount + remount)
  useEffect(() => {
    if (!nameInitialized.current && players.length > 0 && playerNumber) {
      const myPlayer = players[playerNumber - 1]
      if (myPlayer) {
        setName(myPlayer.name)
        nameInitialized.current = true
      }
    }
  }, [players, playerNumber])

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const handleUpdateName = () => {
    if (name.trim()) {
      onUpdateName(name.trim())
    }
  }

  const handleLeave = () => {
    if (window.confirm('Leave game?')) {
      onLeaveGame()
    }
  }

  const handleColorSelect = (color) => {
    onUpdateColor(color)
    setShowColorPicker(false)
  }

  // Close color picker on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setShowColorPicker(false)
      }
    }
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showColorPicker])

  const myColor = players[playerNumber - 1]?.color || '#e74c3c'

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <motion.div
          className={styles.roomCodeSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.roomCodeLabel}>Room Code</div>
          <div className={styles.roomCodeDisplay}>
            <span className={styles.roomCode}>{roomCode}</span>
            <motion.button
              className={styles.copyButton}
              onClick={copyCode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showCopied ? '✓' : '⎘'}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className={styles.nameSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.nameRow}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
              onBlur={handleUpdateName}
              maxLength={20}
              className={styles.input}
              placeholder="Your name"
            />
            <motion.button
              className={styles.updateButton}
              onClick={handleUpdateName}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✓
            </motion.button>
            <div className={styles.colorPickerWrapper} ref={colorPickerRef}>
              <motion.button
                className={styles.colorSwatch}
                style={{ background: myColor }}
                onClick={() => setShowColorPicker(!showColorPicker)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    className={styles.colorDropdown}
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ColorPicker
                      currentColor={myColor}
                      onSelectColor={handleColorSelect}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={styles.playersSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.playersSectionHeader}>
            <span className={styles.playersLabel}>Players</span>
            <span className={styles.playersCount}>{players.length}/4</span>
          </div>
          <div className={styles.playersList}>
            <AnimatePresence>
              {players.map((player, index) => {
                const isLastWinner = lastWinner && lastWinner.includes(player.name)
                return (
                  <motion.div
                    key={index}
                    className={`${styles.playerItem} ${isLastWinner ? styles.winnerGlow : ''}`}
                    style={isLastWinner ? { '--glow-color': player.color || '#e74c3c' } : undefined}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <span className={styles.playerAvatar} style={{ background: player.color || '#e74c3c' }}>{player.name.charAt(0).toUpperCase()}</span>
                    <span className={styles.playerName}>
                      {player.name}
                      {index + 1 === playerNumber && <span className={styles.youBadge}>you</span>}
                    </span>
                    {player.wins > 0 && (
                      <span className={styles.winTally}>{player.wins}W</span>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {players.length < 4 && (
              <div className={styles.emptySlot}>
                <span className={styles.emptyAvatar}>+</span>
                <span className={styles.emptyText}>Waiting for players...</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {playerNumber === 1 && (
            <motion.button
              className={styles.startButton}
              onClick={onStartGame}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Start Game
            </motion.button>
          )}
          <motion.button
            className={styles.leaveButton}
            onClick={handleLeave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Leave
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
