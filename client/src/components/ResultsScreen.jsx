import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import styles from './ResultsScreen.module.css'

const POINT_COLORS = { 1: 'var(--green)', 2: 'var(--orange)', 3: 'var(--magenta)' }

export default function ResultsScreen({ results }) {
  if (!results) return null

  const { winner, results: playerResults, allPossibleAnswers } = results

  // Collect all answers that were found by any player
  const foundAnswers = useMemo(() => {
    const found = new Set()
    playerResults.forEach(player => {
      player.answers.forEach(a => found.add(a.toLowerCase()))
    })
    return found
  }, [playerResults])

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Auto-return countdown bar */}
        <div className={styles.countdownTrack}>
          <motion.div
            className={styles.countdownFill}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 12, ease: 'linear' }}
          />
        </div>

        <motion.h2
          className={styles.winnerText}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {winner === 'Tie!' ? "Tie Game!" : `${winner} Wins!`}
        </motion.h2>

        <motion.div
          className={styles.results}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {playerResults.map((player, index) => (
            <motion.div
              key={index}
              className={`${styles.resultItem} ${index === 0 ? styles.first : ''}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.08 }}
            >
              <div className={styles.resultHeader}>
                <div className={styles.rank} style={{ background: player.color || '#999' }}>
                  {index + 1}
                </div>
                <div className={styles.playerInfo}>
                  <span className={styles.playerName} style={{ color: player.color || '#999' }}>{player.name}</span>
                  {player.wins > 0 && (
                    <span className={styles.winsCount}>
                      {player.wins} {player.wins === 1 ? 'win' : 'wins'}
                    </span>
                  )}
                </div>
                <motion.div
                  className={styles.finalScore}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.08, type: 'spring', stiffness: 200 }}
                >
                  {player.score}
                </motion.div>
              </div>
              {player.answers.length > 0 && (
                <div className={styles.answers}>
                  {player.answers.map((answer, i) => (
                    <span key={i} className={styles.answerTag}>{answer}</span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {allPossibleAnswers && allPossibleAnswers.length > 0 && (
          <motion.div
            className={styles.allAnswersSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className={styles.allAnswersTitle}>All Possible Answers</h3>
            <div className={styles.allAnswersGrid}>
              {allPossibleAnswers.map((item, index) => {
                const wasFound = foundAnswers.has(item.answer.toLowerCase())
                return (
                  <div
                    key={index}
                    className={`${styles.possibleAnswer} ${styles[`points${item.points}`]} ${wasFound ? styles.found : ''}`}
                  >
                    <span className={styles.possibleAnswerText}>{item.answer}</span>
                    <span className={styles.answerPoints} style={{ color: POINT_COLORS[item.points] || 'var(--text-secondary)' }}>{item.points}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
