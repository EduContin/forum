"use client";

import React from "react";
import { motion } from "framer-motion";

const MountainBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Farthest mountain (more spiky) */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        style={{
          height: "25%",
          background: "#b3cde0",
          clipPath:
            "polygon(0% 20%, 5% 35%, 10% 45%, 15% 30%, 20% 50%, 25% 25%, 30% 40%, 35% 20%, 40% 45%, 45% 30%, 50% 55%, 55% 25%, 60% 40%, 65% 15%, 70% 45%, 75% 30%, 80% 45%, 85% 30%, 90% 50%, 95% 45%, 100% 20%, 100% 100%, 0% 100%)",
        }}
      />
      {/* Second farthest mountain */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        style={{
          height: "30%",
          background: "#6497b1",
          clipPath:
            "polygon(0% 50%, 7% 40%, 14% 55%, 21% 35%, 28% 60%, 35% 45%, 42% 65%, 49% 40%, 56% 70%, 63% 50%, 70% 75%, 77% 55%, 84% 70%, 91% 45%, 100% 55%, 100% 100%, 0% 100%)",
        }}
      />
      {/* Middle mountain */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.3, ease: "easeOut" }}
        style={{
          height: "25%",
          background: "#005b96",
          clipPath:
            "polygon(0% 60%, 8% 50%, 16% 65%, 24% 45%, 32% 70%, 40% 55%, 48% 75%, 56% 50%, 64% 80%, 72% 60%, 80% 85%, 88% 65%, 96% 55%, 100% 70%, 100% 100%, 0% 100%)",
        }}
      />
      {/* Nearest mountain */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{
          height: "17.5%",
          background: "#03396c",
          clipPath:
            "polygon(0% 70%, 10% 60%, 20% 75%, 30% 55%, 40% 80%, 50% 65%, 60% 85%, 70% 70%, 80% 90%, 90% 75%, 100% 80%, 100% 100%, 0% 100%)",
        }}
      />
    </div>
  );
};

export default MountainBackground;
