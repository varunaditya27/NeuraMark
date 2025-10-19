"use client";

import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export default function GlassmorphicCard({
  children,
  className,
  hover = false,
  gradient = false,
}: GlassmorphicCardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "relative rounded-2xl backdrop-blur-xl border",
        gradient
          ? "bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-teal-500/10 border-indigo-500/20"
          : "bg-white/5 border-white/10",
        "shadow-2xl",
        className
      )}
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
