import type { ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useState, useRef } from "react";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  intensity?: number; // Intensité de l'effet 3D (0.5 à 2)
  glowEffect?: boolean; // Effet de lueur au hover
  enable3D?: boolean; // Activer/désactiver l'effet 3D
}

export default function Card3D({ 
  children, 
  className = "", 
  intensity = 1,
  glowEffect = true,
  enable3D = true 
}: Card3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values pour la position de la souris (centrées sur 0)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Transformation linéaire depuis le centre avec intensité personnalisable
  const rotateX = useSpring(
    useTransform(mouseY, [-1, 1], [-15 * intensity, 15 * intensity]), 
    { stiffness: 300, damping: 30 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-1, 1], [15 * intensity, -15 * intensity]), 
    { stiffness: 300, damping: 30 }
  );

  // Effet de scale au hover
  const scale = useSpring(isHovered ? 1.05 : 1, { 
    stiffness: 300, 
    damping: 30 
  });

  // Effet de brillance qui suit la souris (converti pour les coordonnées de position)
  const glowX = useTransform(mouseX, [-1, 1], [0, 100]);
  const glowY = useTransform(mouseY, [-1, 1], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Distance depuis le centre de la carte
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    
    // Normaliser par rapport à la demi-largeur/hauteur pour obtenir une valeur entre -1 et 1
    const normalizedX = deltaX / (rect.width / 2);
    const normalizedY = deltaY / (rect.height / 2);
    
    // Limiter les valeurs entre -1 et 1 pour éviter les effets extrêmes
    const clampedX = Math.max(-1, Math.min(1, normalizedX));
    const clampedY = Math.max(-1, Math.min(1, normalizedY));
    
    mouseX.set(clampedX);
    mouseY.set(clampedY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Animation de retour fluide vers le centre (position 0,0)
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative bg-white rounded-xl shadow-lg p-6 items-center gap-6 ${enable3D ? 'cursor-pointer' : ''} overflow-hidden ${className}`}
      style={enable3D ? {
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d",
        perspective: 1000,
      } : {}}
      whileHover={enable3D ? {
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
        transition: { duration: 0.3 }
      } : {}}
      onMouseMove={enable3D ? handleMouseMove : undefined}
      onMouseEnter={enable3D ? handleMouseEnter : undefined}
      onMouseLeave={enable3D ? handleMouseLeave : undefined}
      transition={enable3D ? {
        type: "spring",
        stiffness: 300,
        damping: 30
      } : {}}
    >
      {/* Effet de lueur qui suit la souris */}
      {enable3D && glowEffect && (
        <motion.div
          className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(59, 130, 246, 0.3) 0%, transparent 70%)`,
          }}
          animate={{
            opacity: isHovered ? 0.2 : 0,
          }}
        />
      )}

      {/* Contenu avec légère élévation 3D */}
      <motion.div
        style={enable3D ? {
          transform: "translateZ(20px)",
        } : {}}
        className="relative z-10"
      >
        {children}
      </motion.div>

      {/* Reflet subtil en bas */}
      {enable3D && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-0"
          animate={{
            opacity: isHovered ? 0.6 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}