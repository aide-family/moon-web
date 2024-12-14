import { ReactNode } from 'react'

export interface SelectFeatureProps {
  options?: { label: string | ReactNode; value: string | number | boolean; disabled?: boolean }[]
  value?: string | number | boolean
  onChange?: (value: string | number | boolean) => void
  disabled?: boolean
}

export default function SelectFeature(props: SelectFeatureProps) {
  const { options = [], value, onChange, disabled } = props

  const handleSelect = (value: string | number | boolean) => {
    onChange?.(value)
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {options.map((option, index) => (
        <div
          key={index}
          onClick={() => {
            if (disabled || option.disabled) return
            handleSelect(option.value)
          }}
          className='flex items-center justify-center p-2 rounded-md cursor-pointer hover:border-purple-700 w-20 h-20'
          style={{
            border: value === option.value ? '2px solid #6c34e6' : '1px solid #d9d9d9',
            opacity: disabled || option.disabled ? 0.5 : 1,
            cursor: disabled || option.disabled ? 'not-allowed' : 'pointer'
          }}
        >
          {option.label}
        </div>
      ))}
    </div>
  )
}
