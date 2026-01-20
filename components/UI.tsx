import React from 'react';
import { Tier } from '../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', fullWidth = false, className = '', ...props 
}) => {
  const baseStyles = "font-display font-bold uppercase tracking-wide rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-700 shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[2px_2px_0px_0px_#1E293B] hover:translate-x-[2px] hover:translate-y-[2px]",
    secondary: "bg-secondary text-slate-900 hover:bg-yellow-300 shadow-[4px_4px_0px_0px_#1E293B] hover:shadow-[2px_2px_0px_0px_#1E293B] hover:translate-x-[2px] hover:translate-y-[2px]",
    outline: "border-2 border-slate-900 text-slate-900 hover:bg-slate-100",
    ghost: "text-slate-600 hover:text-primary hover:bg-blue-50",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Badge: React.FC<{ tier: Tier | string; className?: string }> = ({ tier, className = '' }) => {
  const styles = {
    BYTE: "bg-blue-100 text-blue-800 border border-blue-200",
    MICROCRED: "bg-pink-100 text-pink-800 border border-pink-200",
    SHORT: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    default: "bg-gray-100 text-gray-800"
  };

  const style = styles[tier as keyof typeof styles] || styles.default;

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${style} ${className}`}>
      {tier}
    </span>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export const ProgressBar: React.FC<{ progress: number; className?: string }> = ({ progress, className = '' }) => {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div 
        className="bg-primary h-2.5 rounded-full transition-all duration-500" 
        style={{ width: `${Math.max(5, progress)}%` }}
      ></div>
    </div>
  );
};

export const ProgressRing: React.FC<{ progress: number; size?: number; stroke?: number }> = ({ 
  progress, size = 60, stroke = 4 
}) => {
  const radius = size / 2 - stroke * 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          stroke="#e2e8f0"
          strokeWidth={stroke}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          stroke="#2563EB"
          strokeWidth={stroke}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-xs font-bold text-slate-700">{progress}%</span>
    </div>
  );
};

export const Toast: React.FC<{ message: string; type?: 'success' | 'error'; onClose: () => void }> = ({ message, type = 'success', onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white font-bold z-50 animate-bounce ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      {message}
    </div>
  );
};