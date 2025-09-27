interface InlineSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function InlineSpinner({ size = 'md', className = '' }: InlineSpinnerProps) {
  const sizes: Record<typeof size, string> = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-2',
  } as const;

  return (
    <span
      aria-label="Carregando"
      role="status"
      className={`inline-flex items-center justify-center ${className}`}
    >
      <span className={`animate-spin rounded-full border-primary border-t-transparent ${sizes[size]}`} />
    </span>
  );
}

