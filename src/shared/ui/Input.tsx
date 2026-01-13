//
//  Input.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright 2026 Victor Sanchez. All rights reserved.
//

import { forwardRef } from 'react'
import styles from './Input.module.css'

type InputProps = {
  label?: string
  error?: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  className?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = 'text', placeholder, required, disabled, value, onChange, onBlur, className }, ref) => {
    return (
      <div className={`${styles.inputContainer} ${className || ''}`}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={styles.input}
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
