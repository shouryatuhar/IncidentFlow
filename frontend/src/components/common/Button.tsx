import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-[5px] transition-colors focus:outline-none focus:ring-1 focus:ring-[#5e6ad2] disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'h-7 text-xs px-2 gap-1.5',
    md: 'h-8 text-xs px-2.5 gap-1.5',
    lg: 'h-9 text-sm px-3.5 gap-2',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#ededed] hover:bg-[#ffffff] text-[#08090a] font-medium border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.5)] active:bg-[#dcdcdc]',
    secondary:
      'bg-[#15161a] hover:bg-[#1f2026] text-[#d4d4d8] hover:text-[#ffffff] border border-[#26282f] active:bg-[#252730]',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 text-[#f87171] border border-rose-500/25 active:bg-rose-500/30',
    ghost:
      'bg-transparent hover:bg-[#18191e] text-[#a1a1aa] hover:text-[#f4f4f5]',
    outline:
      'bg-transparent hover:bg-[#15161a] text-[#d4d4d8] hover:text-[#ffffff] border border-[#26282f]',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current shrink-0" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
