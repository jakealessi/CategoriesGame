import styles from './ColorPicker.module.css'

const COLOR_GRID = [
  '#b65f43', '#9f3f3f', '#c2763b', '#9b732f',
  '#6f7f47', '#3f765c', '#3f7376', '#3e718a',
  '#315c86', '#4c5f8d', '#655284', '#83536f',
  '#875d45', '#776b5e', '#5f6868', '#424b51',
]

export default function ColorPicker({ currentColor, onSelectColor }) {
  return (
    <div className={styles.grid}>
      {COLOR_GRID.map((color) => (
        <button
          key={color}
          className={`${styles.swatch} ${currentColor === color ? styles.selected : ''}`}
          style={{ background: color }}
          onClick={() => onSelectColor(color)}
          aria-label={`Choose ${color}`}
          title={color}
        />
      ))}
    </div>
  )
}
