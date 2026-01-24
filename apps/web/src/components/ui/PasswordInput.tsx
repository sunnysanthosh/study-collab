'use client';

import { useState, InputHTMLAttributes, forwardRef } from 'react';

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, helperText, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {label && (
          <label htmlFor={props.id} style={{ fontSize: '0.9rem', fontWeight: 500 }}>
            {label}
          </label>
        )}
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            style={{
              width: '100%',
              padding: '0.75rem 3rem 0.75rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${error ? 'hsl(var(--destructive))' : 'hsl(var(--input))'}`,
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'hsl(var(--foreground))',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            {...props}
            onFocus={(e) => {
              props.onFocus?.(e);
              e.currentTarget.style.borderColor = error ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
              e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? 'hsl(var(--destructive) / 0.1)' : 'hsl(var(--primary) / 0.1)'}`;
            }}
            onBlur={(e) => {
              props.onBlur?.(e);
              e.currentTarget.style.borderColor = error ? 'hsl(var(--destructive))' : 'hsl(var(--input))';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--muted-foreground))',
              cursor: 'pointer',
              padding: '0.25rem',
              fontSize: '1.2rem',
            }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {(error || helperText) && (
          <span
            style={{
              fontSize: '0.85rem',
              color: error ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))',
            }}
          >
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

