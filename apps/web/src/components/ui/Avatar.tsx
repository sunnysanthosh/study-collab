'use client';

import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function Avatar({
  src,
  fallback,
  size = 36,
  className,
}: {
  src?: string | null;
  fallback: string;
  size?: number;
  className?: string;
}) {
  const isUrl = src && (src.startsWith('http') || src.startsWith('/'));
  const imageSrc = isUrl && src!.startsWith('/') ? `${API_URL}${src}` : src;

  if (isUrl && imageSrc) {
    return (
      <Image
        src={imageSrc}
        alt=""
        width={size}
        height={size}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
        unoptimized={imageSrc.startsWith(API_URL)}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'hsl(var(--primary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.45,
        fontWeight: 'bold',
        color: 'white',
        flexShrink: 0,
      }}
    >
      {fallback}
    </div>
  );
}
