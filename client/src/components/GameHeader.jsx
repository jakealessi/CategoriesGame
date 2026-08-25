import styles from './GameHeader.module.css'

export default function GameHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand} aria-label="Categories">
          <span className={styles.mark}>C</span>
          <span className={styles.wordmark}>Categories</span>
        </div>
      </div>
    </header>
  )
}
