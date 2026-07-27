import type { ButtonHTMLAttributes } from 'react';

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function ShimmerButton({ children, className = '', ...props }: ShimmerButtonProps) {
  return (
    <button
      className={
        'relative overflow-hidden rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white ' +
        'hover:bg-emerald-500 active:scale-[0.98] transition-all duration-150 ' +
        'before:absolute before:inset-0 before:-translate-x-full ' +
        'before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent ' +
        'hover:before:translate-x-full before:transition-transform before:duration-700 ' +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
