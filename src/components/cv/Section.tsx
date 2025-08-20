"use client";
import { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  className?: string;
};

export default function Section({ title, children, className }: Props) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-4 ${className ?? ""}`}>
      <div className="text-xs uppercase tracking-wide text-white/70 mb-3">
        {title}
      </div>
      <div className="space-y-2 text-sm text-white/90">
        {children}
      </div>
    </div>
  );
}


