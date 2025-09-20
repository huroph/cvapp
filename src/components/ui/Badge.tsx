import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Badge({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = "" 
}: BadgeProps) {
  
  const baseClasses = "inline-flex items-center font-medium rounded-full transition-all duration-200";
  
  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };
  
  const variantClasses = {
    primary: "bg-indigo-100 text-indigo-800 border border-indigo-200 hover:bg-indigo-200",
    secondary: "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200",
    success: "bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200",
    warning: "bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200",
    danger: "bg-red-100 text-red-800 border border-red-200 hover:bg-red-200",
    gradient: "bg-blue-500/40 text-blue-700 border-0"
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}