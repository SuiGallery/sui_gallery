import React from 'react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Button({ onClick, disabled, isLoading, children,className }: ButtonProps) {
  return (
    <button 
      className={`rounded-xl px-5 py-3 transition-all duration-300 h-16 flex justify-center w-full ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 cursor-pointer'
      } ${className}`}

      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <p className="uppercase font-bold text-white self-center">Loading...</p>
      ) : children}
    </button>
  );
}