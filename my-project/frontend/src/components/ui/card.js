import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}
