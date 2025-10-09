"use client";

import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = "", variant = "default", ...rest }, ref) => {
    const base = "inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium";
    const vstyles =
      variant === "outline"
        ? "border border-gray-300 bg-transparent"
        : "bg-primary text-white";
    return (
      <button ref={ref} className={`${base} ${vstyles} ${className}`} {...rest}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
