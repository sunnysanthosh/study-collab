'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {label && (
          <label htmlFor={props.id} style={{ fontSize: '0.9rem', fontWeight: 500 }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={className}
          style={{
            padding: '0.75rem',
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

Input.displayName = 'Input';

