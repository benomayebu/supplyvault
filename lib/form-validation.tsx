"use client";

import { ReactNode } from "react";
import { clsx } from "clsx";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  helpText,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1">{children}</div>
      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2",
        error
          ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/20"
          : "border-gray-300 focus:border-secondary-teal focus:ring-secondary-teal/20",
        className
      )}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={clsx(
        "block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2",
        error
          ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/20"
          : "border-gray-300 focus:border-secondary-teal focus:ring-secondary-teal/20",
        className
      )}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, className, children, ...props }: SelectProps) {
  return (
    <select
      className={clsx(
        "block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2",
        error
          ? "border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500/20"
          : "border-gray-300 focus:border-secondary-teal focus:ring-secondary-teal/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
