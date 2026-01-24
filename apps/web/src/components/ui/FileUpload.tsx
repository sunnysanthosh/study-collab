'use client';

import { useState, useRef } from 'react';
import { Button } from './Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
  variant?: 'button' | 'icon';
  children?: React.ReactNode;
}

export function FileUpload({
  onFileSelect,
  accept = '*/*',
  maxSize = 10,
  disabled = false,
  variant = 'button',
  children,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    onFileSelect(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'hsl(var(--foreground))',
            fontSize: '1.2rem',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: '0.5rem',
            borderRadius: 'var(--radius-md)',
            transition: 'background 0.2s',
            opacity: disabled ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.background = 'hsl(var(--muted))';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
          title="Upload file"
        >
          📎
        </button>
        {error && (
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--destructive))', marginLeft: '0.5rem' }}>
            {error}
          </span>
        )}
      </>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <Button
        type="button"
        onClick={handleClick}
        disabled={disabled || isUploading}
        variant="outline"
      >
        {isUploading ? 'Uploading...' : children || 'Upload File'}
      </Button>
      {error && (
        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--destructive))', marginTop: '0.5rem' }}>
          {error}
        </div>
      )}
    </div>
  );
}

