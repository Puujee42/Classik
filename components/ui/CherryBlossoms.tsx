'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Generates random falling soft pink "petals" / orbs
export default function CherryBlossoms() {
  const [elements, setElements] = useState<{ id: number; size: number; left: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate 20 floating elements
    const arr = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      size: Math.random() * 15 + 8, // 8px to 23px
      left: Math.random() * 100, // 0 to 100vw
      duration: Math.random() * 10 + 10, // 10s to 20s fall speed
      delay: Math.random() * -20, // Start at different times
    }));
    setElements(arr);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute rounded-full"
          style={{
            left: `${el.left}%`,
            width: el.size,
            height: el.size,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,192,203,0.8) 0%, rgba(224,107,139,0.3) 100%)',
            boxShadow: '0 0 10px rgba(224,107,139,0.4)',
            filter: 'blur(1px)',
          }}
          initial={{ y: -50, opacity: 0, rotate: 0 }}
          animate={{
            y: ['-5vh', '105vh'],
            x: [0, Math.random() * 50 - 25, Math.random() * -50 + 25],
            opacity: [0, 0.8, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
