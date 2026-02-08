import { motion, AnimatePresence } from 'framer-motion'
import styles from './ErrorToast.module.css'

export default function ErrorToast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className={styles.toast}
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
