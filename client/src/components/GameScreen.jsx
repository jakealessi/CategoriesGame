import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import GameHeader from './GameHeader'
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
      <GameHeader />
      <Motion.main
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className={styles.timerBarTrack}>
          <Motion.div
            className={styles.timerBarFill}
            style={{ background: getTimerColor() }}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.4, ease: 'linear' }}
          />
        </div>

        <section className={styles.roundHeader}>
          <div className={styles.categoryContainer}>
            <h1 className={styles.category}>{category}</h1>
          </div>
          <div className={`${styles.timerContainer} ${timeLeft <= 10 ? styles.timerUrgent : ''}`}>
            <div className={styles.timer} style={{ color: getTimerColor() }}>
              {timeLeft}
            </div>
            <div className={styles.timerLabel}>seconds</div>
          </div>
        </section>

        <section className={styles.scoreboard} aria-label="Current scores">
          <div className={styles.scoreboardHeader}>
            <span>Scoreboard</span>
            <span>Points</span>
          </div>
          <div className={styles.scores}>
            {players.map((player, index) => (
              <div key={index} className={styles.scoreItem}>
                <span className={styles.playerMarker} style={{ background: player.color || '#79756f' }} />
                <span className={styles.playerName}>{player.name}</span>
                <Motion.span
                  className={styles.score}
                  key={player.score}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {player.score}
                </Motion.span>
              </div>
            ))}
          </div>
        </section>

        <form
          className={styles.answerForm}
          onSubmit={handleSubmit}
        >
          <label className={styles.inputLabel} htmlFor="answer">Your answer</label>
          <div className={styles.answerRow}>
            <input
              id="answer"
              ref={inputRef}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type an answer"
              className={styles.input}
              autoComplete="off"
            />
            <button type="submit" className={styles.submitButton}>Submit</button>
          </div>
        </form>

        <AnimatePresence>
          {feedback && (
            <Motion.div
              className={`${styles.feedback} ${feedback.valid ? styles.valid : styles.invalid}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {feedback.message}
            </Motion.div>
          )}
        </AnimatePresence>

        <section
          className={styles.answersContainer}
        >
          <div className={styles.feedHeader}>
            <h2>Claimed answers</h2>
            <span>{allAnswers.length}</span>
          </div>
          <div className={styles.answersList} ref={listRef}>
            {allAnswers.length === 0 && (
              <div className={styles.emptyFeed}>No answers yet.</div>
            )}
            <AnimatePresence>
              {allAnswers.slice().reverse().map((item, index) => (
                <Motion.div
                  key={allAnswers.length - index}
                  className={`${styles.answerItem} ${item.isMe ? styles.myAnswer : ''}`}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={styles.answerMarker} style={{ background: item.playerColor || '#79756f' }} />
                  <span className={styles.playerBadge}>{item.playerName}</span>
                  <span className={styles.answerText}>{item.answer}</span>
                  <span className={styles.points} style={{ color: POINT_COLORS[item.points] || POINT_COLORS[1] }}>+{item.points}</span>
                </Motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </Motion.main>
    </div>
  )
}
