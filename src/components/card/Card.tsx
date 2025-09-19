import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <section className={`bg-white rounded-xl shadow p-6  items-center gap-6 ${className}`}>
      {children}
    </section>
  );
}
