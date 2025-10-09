"use client";

import React from "react";

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = "", ...rest }) => {
  return (
    <label className={`text-sm font-medium ${className}`} {...rest}>
      {children}
    </label>
  );
};

export default Label;
