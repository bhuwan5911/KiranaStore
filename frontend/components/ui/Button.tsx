import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  // --- BADLAV: flex, items-center, aur justify-center add kiya gaya hai ---
  const baseClasses = 'flex items-center justify-center font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-soft';
  
  const variantClasses = {
    primary: 'bg-brand-black text-white hover:bg-black focus:ring-brand-black',
    secondary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost: 'bg-transparent text-primary hover:bg-primary/10 focus:ring-primary shadow-none',
  };

  const sizeClasses = {
    sm: 'py-2 px-5 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};