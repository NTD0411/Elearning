"use client";

import React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return <input ref={ref} className={`block w-full border rounded-md p-2 ${className}`} {...props} />;
  }
);

Input.displayName = "Input";

export default Input;
