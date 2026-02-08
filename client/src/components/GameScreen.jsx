import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import styles from './GameScreen.module.css'

const POINT_COLORS = { 1: 'var(--green)', 2: 'var(--orange)', 3: 'var(--magenta)' }

export default function GameScreen({ category, timeLeft, players, allAnswers, onSubmitAnswer, feedback }) {
  const [answer, setAnswer] = useState('')
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [allAnswers])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (answer.trim()) {
      onSubmitAnswer(answer.trim())
      setAnswer('')
    }
  }

  const timerPercent = (timeLeft / 60) * 100
  const getTimerColor = () => {
    if (timeLeft <= 10) return 'var(--red)'
    if (timeLeft <= 30) return 'var(--orange)'
    return 'var(--green)'
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Timer bar */}
        <div className={styles.timerBarTrack}>
          <motion.div
            className={styles.timerBarFill}
            style={{ background: getTimerColor() }}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.4, ease: 'linear' }}
          />
        </div>

        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className={styles.timerContainer}
            animate={{ scale: timeLeft <= 10 ? [1, 1.08, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
          >
            <div className={styles.timer} style={{ color: getTimerColor() }}>
              {timeLeft}
            </div>
            <div className={styles.timerLabel}>sec</div>
          </motion.div>

          <div className={styles.categoryContainer}>
            <h2 className={styles.category}>{category}</h2>
          </div>

          <div className={styles.scores}>
            {players.map((player, index) => (
              <div key={index} className={styles.scoreItem} style={{ borderLeft: `3px solid ${player.color || '#999'}` }}>
                <span className={styles.playerName}>{player.name}</span>
                <motion.span
                  className={styles.score}
                  style={{ color: player.color || '#999' }}
                  key={player.score}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {player.score}
                </motion.span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Answer Input */}
        <motion.form
          className={styles.answerForm}
          onSubmit={handleSubmit}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type answer..."
            className={styles.input}
            autoComplete="off"
          />
          <motion.button
            type="submit"
            className={styles.submitButton}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Submit
          </motion.button>
        </motion.form>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              className={`${styles.feedback} ${feedback.valid ? styles.valid : styles.invalid}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* All Answers Feed */}
        <motion.div
          className={styles.answersContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className={styles.answersList} ref={listRef}>
            {allAnswers.length === 0 && (
              <div className={styles.emptyFeed}>Answers will appear here</div>
            )}
            <AnimatePresence>
              {allAnswers.slice().reverse().map((item, index) => (
                <motion.div
                  key={allAnswers.length - index}
                  className={`${styles.answerItem} ${item.isMe ? styles.myAnswer : ''}`}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span
                    className={styles.playerBadge}
                    style={{ background: item.playerColor || '#999' }}
                  >
                    {item.playerName}
                  </span>
                  <span className={styles.answerText}>{item.answer}</span>
                  <span className={styles.points} style={{ background: POINT_COLORS[item.points] || POINT_COLORS[1] }}>+{item.points}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
