"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/* ---------------- Card ---------------- */

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("card", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  icon,
  action,
}: {
  title: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-5">
      <div className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
        {icon && <span className="text-accent">{icon}</span>}
        {title}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Button ---------------- */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "soft" | "outline" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-soft)] transition-all active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none";
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10",
  };
  const variants = {
    primary:
      "bg-accent text-accent-fg shadow-sm hover:brightness-110 hover:shadow-md",
    soft: "bg-accent-soft text-accent hover:brightness-110",
    ghost: "text-muted hover:text-text hover:bg-surface-2",
    outline: "border border-line text-text hover:bg-surface-2",
    danger: "bg-grade-f/15 text-grade-f hover:bg-grade-f/25",
  };
  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ---------------- Badge ---------------- */

export function Badge({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      style={
        color
          ? { background: `color-mix(in srgb, ${color} 18%, transparent)`, color }
          : { background: "var(--surface-3)", color: "var(--muted)" }
      }
    >
      {children}
    </span>
  );
}

/* ---------------- Toggle ---------------- */

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5"
      aria-pressed={checked}
    >
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-surface-3",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5",
          )}
        />
      </span>
      {label && <span className="text-sm text-muted">{label}</span>}
    </button>
  );
}

/* ---------------- Segmented ---------------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-[var(--radius-soft)] bg-surface-2 p-1 text-sm",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "relative rounded-[calc(var(--radius-soft)-3px)] px-3 py-1.5 font-medium transition-colors",
            value === o.value ? "text-accent-fg" : "text-muted hover:text-text",
          )}
        >
          {value === o.value && (
            <motion.span
              layoutId="seg-active"
              className="absolute inset-0 -z-0 rounded-[calc(var(--radius-soft)-3px)] bg-accent"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative z-10">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- Inputs ---------------- */

export function Input({ className, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[var(--radius-soft)] border border-line bg-surface-2 px-3.5 text-sm text-text outline-none transition-colors placeholder:text-faint focus:border-accent",
        className,
      )}
      {...rest}
    />
  );
}

export function Textarea({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[var(--radius-soft)] border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-faint focus:border-accent",
        className,
      )}
      {...rest}
    />
  );
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 rounded-[var(--radius-soft)] border border-line bg-surface-2 px-3 text-sm text-text outline-none focus:border-accent",
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

/* ---------------- Grade ring ---------------- */

export function GradeRing({
  value,
  size = 120,
  stroke = 10,
  color = "var(--accent)",
  label,
  sublabel,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  color?: string;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - (pct / 100) * c;

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-tight">
        <div>
          {label != null && (
            <div className="text-2xl font-bold tracking-tight">{label}</div>
          )}
          {sublabel != null && (
            <div className="text-[0.7rem] text-muted">{sublabel}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Dialog ---------------- */

export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="card relative z-10 w-full max-w-lg overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
}

/* ---------------- misc ---------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton h-4 w-full", className)} />;
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {icon && (
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-accent">
          {icon}
        </div>
      )}
      <div>
        <p className="font-semibold">{title}</p>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}
