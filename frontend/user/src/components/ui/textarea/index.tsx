"use client";

import React from "react";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => {
    return <textarea ref={ref} className={`block w-full border rounded-md p-2 ${className}`} {...props} />;
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
