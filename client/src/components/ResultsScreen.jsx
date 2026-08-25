import { motion as Motion } from 'framer-motion'
import GameHeader from './GameHeader'
import styles from './ResultsScreen.module.css'

const POINT_COLORS = { 1: 'var(--green)', 2: 'var(--orange)', 3: 'var(--magenta)' }

export default function ResultsScreen({ results }) {
  if (!results) return null

  const { winner, results: playerResults, allPossibleAnswers } = results

  // Collect all answers that were found by any player
  const foundAnswers = new Set()
  playerResults.forEach(player => {
    player.answers.forEach(a => foundAnswers.add(a.toLowerCase()))
  })

  return (
    <div className={styles.container}>
      <GameHeader />
      <Motion.main
        className={styles.card}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <div className={styles.countdownTrack}>
          <Motion.div
            className={styles.countdownFill}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 12, ease: 'linear' }}
          />
        </div>

        <header className={styles.resultHero}>
          <h1 className={styles.winnerText}>
            {winner === 'Tie!' ? 'A tie at the top.' : `${winner} takes the round.`}
          </h1>
        </header>

        <Motion.div
          className={styles.results}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {playerResults.map((player, index) => (
            <Motion.div
              key={index}
              className={`${styles.resultItem} ${index === 0 ? styles.first : ''}`}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.08 }}
            >
              <div className={styles.resultHeader}>
                <div className={styles.rank}>{String(index + 1).padStart(2, '0')}</div>
                <span className={styles.playerMarker} style={{ background: player.color || '#79756f' }} />
                <div className={styles.playerInfo}>
                  <span className={styles.playerName}>{player.name}</span>
                  {player.wins > 0 && (
                    <span className={styles.winsCount}>
                      {player.wins} {player.wins === 1 ? 'win' : 'wins'}
                    </span>
                  )}
                </div>
                <Motion.div
                  className={styles.finalScore}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + index * 0.06 }}
                >
                  {player.score}
                  <span> pts</span>
                </Motion.div>
              </div>
              {player.answers.length > 0 && (
                <div className={styles.answers}>
                  {player.answers.map((answer, i) => (
                    <span key={i} className={styles.answerTag}>{answer}</span>
                  ))}
                </div>
              )}
            </Motion.div>
          ))}
        </Motion.div>

        {allPossibleAnswers && allPossibleAnswers.length > 0 && (
          <Motion.div
            className={styles.allAnswersSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles.allAnswersHeader}>
              <h2 className={styles.allAnswersTitle}>Answers</h2>
              <span>{foundAnswers.size} found</span>
            </div>
            <div className={styles.allAnswersGrid}>
              {allPossibleAnswers.map((item, index) => {
                const wasFound = foundAnswers.has(item.answer.toLowerCase())
                return (
                  <div
                    key={index}
                    className={`${styles.possibleAnswer} ${styles[`points${item.points}`]} ${wasFound ? styles.found : ''}`}
                  >
                    <span className={styles.possibleAnswerText}>{item.answer}</span>
                    <span className={styles.foundStatus}>{wasFound ? 'Found' : 'Missed'}</span>
                    <span className={styles.answerPoints} style={{ color: POINT_COLORS[item.points] || 'var(--muted)' }}>{item.points} pt</span>
                  </div>
                )
              })}
            </div>
          </Motion.div>
        )}
      </Motion.main>
    </div>
  )
}
