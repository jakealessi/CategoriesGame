import { motion } from 'framer-motion'
import styles from './ColorPicker.module.css'

const COLOR_GRID = [
  // Row 1: Reds & Warm
  '#e74c3c', '#c0392b', '#e91e63', '#ff5722',
  '#ff9800', '#f39c12', '#ffeb3b', '#cddc39',
  // Row 2: Greens & Teals
  '#8bc34a', '#4caf50', '#2ecc71', '#009688',
  '#00bcd4', '#00acc1', '#26c6da', '#4dd0e1',
  // Row 3: Blues & Purples
  '#03a9f4', '#3498db', '#2196f3', '#3f51b5',
  '#673ab7', '#9b59b6', '#9c27b0', '#e040fb',
  // Row 4: Neutrals & Misc
  '#795548', '#8d6e63', '#607d8b', '#78909c',
  '#9e9e9e', '#455a64', '#37474f', '#212121',
]

export default function ColorPicker({ currentColor, onSelectColor }) {
  return (
    <div className={styles.grid}>
      {COLOR_GRID.map((color) => (
        <motion.button
          key={color}
          className={`${styles.swatch} ${currentColor === color ? styles.selected : ''}`}
          style={{ background: color }}
          onClick={() => onSelectColor(color)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        />
      ))}
    </div>
  )
}
