import React from "react";
import { cn } from "../../lib/utils";

export function RainbowButton({ children, className, ...props }) {
  return (
    <button
      className={cn(
        "group relative inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 text-[13px] font-bold uppercase tracking-[0.06em] text-white transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 overflow-hidden animate-rainbow",
        "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
