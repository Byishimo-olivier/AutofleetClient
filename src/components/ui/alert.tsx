import React from 'react';

interface AlertProps {
  variant?: 'default' | 'destructive';
  className?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'default', className = '', children }) => {
  const variantClasses = {
    default: 'border-gray-200 bg-white text-gray-950',
    destructive: 'border-red-200 bg-red-50 text-red-900'
  };
  
  const classes = `relative w-full rounded-lg border p-4 ${variantClasses[variant]} ${className}`;
  return <div className={classes}>{children}</div>;
};

export const AlertDescription: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className = '', 
  children 
}) => {
  const classes = `text-sm ${className}`;
  return <div className={classes}>{children}</div>;
};

