import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import ColorPicker from './ColorPicker'
import GameHeader from './GameHeader'
import styles from './WaitingRoom.module.css'

export default function WaitingRoom({ roomCode, players, playerNumber, categoryList, onStartGame, onLeaveGame, onUpdateName, onUpdateColor, lastWinner }) {
  const [name, setName] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('Random')
  const [showCopied, setShowCopied] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const colorPickerRef = useRef(null)

  const myPlayer = players[playerNumber - 1]
  const displayName = name ?? myPlayer?.name ?? ''

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const handleUpdateName = () => {
    if (displayName.trim()) {
      onUpdateName(displayName.trim())
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

  const myColor = myPlayer?.color || '#b65f43'

  return (
    <div className={styles.container}>
      <GameHeader />
      <Motion.main
        className={styles.main}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <div className={styles.pageHeading}>
          <div>
            <h1>Lobby</h1>
          </div>
          <button className={styles.leaveButton} onClick={handleLeave}>Leave room</button>
        </div>

        <div className={styles.lobbyGrid}>
          <section className={styles.roomPanel}>
            <div className={styles.sectionHeader}>
              <h2>Room code</h2>
            </div>
            <div className={styles.roomCodeDisplay}>
              <span className={styles.roomCode}>{roomCode}</span>
              <button className={styles.copyButton} onClick={copyCode}>
                {showCopied ? 'Copied' : 'Copy code'}
              </button>
            </div>
            <div className={styles.identitySection}>
              <label className={styles.fieldLabel} htmlFor="player-name">Your display name</label>
              <div className={styles.nameRow}>
                <input
                  id="player-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                  onBlur={handleUpdateName}
                  maxLength={20}
                  className={styles.input}
                  placeholder="Your name"
                />
                <button className={styles.updateButton} onClick={handleUpdateName}>Save</button>
                <div className={styles.colorPickerWrapper} ref={colorPickerRef}>
                  <button
                    className={styles.colorButton}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    aria-label="Change player color"
                    aria-expanded={showColorPicker}
                  >
                    <span className={styles.colorSwatch} style={{ background: myColor }} />
                    Color
                  </button>
                  <AnimatePresence>
                    {showColorPicker && (
                      <Motion.div
                        className={styles.colorDropdown}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.12 }}
                      >
                        <ColorPicker currentColor={myColor} onSelectColor={handleColorSelect} />
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.playersSection}>
            <div className={styles.sectionHeader}>
              <h2>Players</h2>
              <span>{players.length} of 4</span>
            </div>
            <div className={styles.playersList}>
              <AnimatePresence>
                {players.map((player, index) => {
                  const isLastWinner = lastWinner && lastWinner.includes(player.name)
                  return (
                    <Motion.div
                      key={index}
                      className={`${styles.playerItem} ${isLastWinner ? styles.lastWinner : ''}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <span className={styles.playerMarker} style={{ background: player.color || '#b65f43' }} />
                      <span className={styles.playerName}>{player.name}</span>
                      {index + 1 === playerNumber && <span className={styles.youBadge}>You</span>}
                      {isLastWinner && <span className={styles.winnerBadge}>Last winner</span>}
                      {player.wins > 0 && <span className={styles.winTally}>{player.wins}W</span>}
                    </Motion.div>
                  )
                })}
              </AnimatePresence>
              {players.length < 4 && (
                <div className={styles.emptySlot}>
                  <span className={styles.emptyMarker}>{players.length + 1}</span>
                  <span>Waiting for another player</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className={styles.controls}>
          {playerNumber === 1 ? (
            <>
              <div className={styles.categorySection}>
                <label className={styles.fieldLabel} htmlFor="category-select">Round category</label>
                <select
                  id="category-select"
                  className={styles.categorySelect}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="Random">Choose for me</option>
                  {categoryList.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button className={styles.startButton} onClick={() => onStartGame(selectedCategory)}>
                Start round
              </button>
            </>
          ) : (
            <p className={styles.waitingMessage}>Waiting for host</p>
          )}
        </section>
      </Motion.main>
    </div>
  )
}
