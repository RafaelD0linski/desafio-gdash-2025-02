import * as React from "react";

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ children }: DialogProps) {
  return <>{children}</>;
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-lg w-full">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-2">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}
