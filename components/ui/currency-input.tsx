"use client";

import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  name: string;
  defaultValue?: number | string;
  onValueChange?: (value: number) => void;
}

function formatDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return parseInt(digits).toLocaleString("id-ID");
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ name, defaultValue, onValueChange, className, ...props }, ref) => {
    const [display, setDisplay] = useState(() =>
      defaultValue ? formatDisplay(String(defaultValue)) : ""
    );
    const rawValue = display.replace(/\D/g, "") || "0";

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const formatted = formatDisplay(e.target.value);
      setDisplay(formatted);
      const num = parseInt(formatted.replace(/\D/g, "") || "0");
      onValueChange?.(num);
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          Rp
        </span>
        <input
          {...props}
          ref={ref}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        />
        {/* Hidden input untuk FormData */}
        <input type="hidden" name={name} value={rawValue} />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
