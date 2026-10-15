interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const delayClass = delay === 0.15 ? 'delay-150' : delay === 0.3 ? 'delay-300' : '';

  return (
    <div className={`animate-fade-in ${delayClass} ${className}`}>
      {children}
    </div>
  );
}
