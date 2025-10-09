"use client";

import React from "react";

type DialogProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  className?: string;
};

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  // This is a very small wrapper; the Modal behaviour is controlled by parent via `open`.
  return <div aria-hidden={!open}>{children}</div>;
}

export function DialogContent({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white p-4 rounded shadow ${className}`} role="dialog">
      {children}
    </div>
  );
}

export function DialogHeader({ children }: { children?: React.ReactNode }) {
  return <div className="mb-2">{children}</div>;
}

export function DialogTitle({ children }: { children?: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export default Dialog;
