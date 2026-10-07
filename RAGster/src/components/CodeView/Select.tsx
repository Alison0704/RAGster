import styles from './Select.module.css'

type SelectProps<T extends string> = {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  className?: string
}

/** The toolbar's dropdown style: mono caps text with an accent chevron. */
function Select<T extends string>({ label, value, options, onChange, className }: SelectProps<T>) {
  return (
    <select
      className={className ? `${styles.select} ${className}` : styles.select}
      aria-label={label}
      title={options.find((option) => option.value === value)?.label}
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  )
}

export default Select
