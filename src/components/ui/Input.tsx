import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ className, label, id, ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-serif text-main-200 ml-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={twMerge(
          "bg-main-900/50 border border-main-400 rounded-lg px-3 py-2 text-white placeholder-main-400 focus:outline-none focus:border-main-400 focus:ring-1 focus:ring-main-400 transition-all font-sans",
          className
        )}
        {...props}
      />
    </div>
  );
};

