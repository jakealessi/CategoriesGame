import { motion as Motion, AnimatePresence } from 'framer-motion'
import styles from './ErrorToast.module.css'

export default function ErrorToast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <Motion.div
          className={styles.toast}
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.18 }}
        >
          {message}
        </Motion.div>
      )}
    </AnimatePresence>
  )
}
