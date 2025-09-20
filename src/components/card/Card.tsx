import type { ReactNode } from "react";
import Card3D from "./Card3D";

interface CardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glowEffect?: boolean;
  enable3D?: boolean;
}

export default function Card({ 
  children, 
  className = "",
  intensity = 0.8,
  glowEffect = true,
  enable3D = true
}: CardProps) {
  return (
    <Card3D 
      className={className} 
      intensity={intensity}
      glowEffect={glowEffect}
      enable3D={enable3D}
    >
      {children}
    </Card3D>
  );
}
