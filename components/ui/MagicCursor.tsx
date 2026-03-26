'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

export default function MagicCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 500, damping: 28 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 28 });

  const [cursorVariant, setCursorVariant] = useState<'default' | 'product' | 'button' | 'link'>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const trailRefs = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    // Only show on desktop
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 1024px)').matches || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
      trailRefs.current = [
        { x: e.clientX, y: e.clientY },
        ...trailRefs.current.slice(0, 4),
      ];
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Detect hover targets
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const card = target.closest('[data-cursor="product"]') || target.closest('.card-classik');
      const btn = target.closest('button') || target.closest('[data-cursor="button"]') || target.closest('.btn-rose');
      const link = target.closest('a');

      if (card) setCursorVariant('product');
      else if (btn) setCursorVariant('button');
      else if (link) setCursorVariant('link');
      else setCursorVariant('default');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isMobile, cursorX, cursorY]);

  if (isMobile) return null;

  const variants = {
    default: {
      width: 20,
      height: 20,
      backgroundColor: 'rgba(224, 107, 139, 0.4)',
      border: '2px solid rgba(212, 175, 55, 0.5)',
      scale: 1,
    },
    product: {
      width: 60,
      height: 60,
      backgroundColor: 'rgba(224, 107, 139, 0.08)',
      border: '2px solid rgba(224, 107, 139, 0.6)',
      scale: 1,
    },
    button: {
      width: 50,
      height: 50,
      backgroundColor: 'rgba(212, 175, 55, 0.12)',
      border: '2px solid rgba(212, 175, 55, 0.7)',
      scale: 1.1,
    },
    link: {
      width: 36,
      height: 36,
      backgroundColor: 'rgba(224, 107, 139, 0.1)',
      border: '2px solid rgba(224, 107, 139, 0.4)',
      scale: 1,
    },
  };

  return (
    <>
      {/* Hide default cursor globally */}
      <style jsx global>{`
        @media (min-width: 1025px) and (pointer: fine) {
          * { cursor: none !important; }
        }
      `}</style>

      {/* Trail particles */}
      {[0.6, 0.4, 0.2].map((opacity, i) => (
        <motion.div
          key={`trail-${i}`}
          className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full"
          style={{
            x: springX,
            y: springY,
            translateX: '-50%',
            translateY: '-50%',
            width: 8 - i * 2,
            height: 8 - i * 2,
            background: `rgba(224, 107, 139, ${opacity})`,
            filter: `blur(${i + 1}px)`,
            transition: `all ${0.15 + i * 0.08}s ease`,
          }}
        />
      ))}

      {/* Main cursor */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full mix-blend-normal"
            style={{
              x: springX,
              y: springY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              ...variants[cursorVariant],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 28,
              mass: 0.5,
            }}
          >
            {/* Inner glow dot */}
            <motion.div
              className="absolute inset-0 m-auto rounded-full"
              style={{
                width: 4,
                height: 4,
                background: 'rgba(224, 107, 139, 0.9)',
                boxShadow: '0 0 12px rgba(224, 107, 139, 0.6)',
              }}
              animate={{
                scale: cursorVariant === 'default' ? [1, 1.5, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Product hover: magnify shimmer ring */}
            {cursorVariant === 'product' && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent, rgba(212,175,55,0.3), transparent, rgba(224,107,139,0.3), transparent)',
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />
            )}

            {/* Button hover: pulse ring */}
            {cursorVariant === 'button' && (
              <motion.div
                className="absolute inset-[-4px] rounded-full border-2 border-[#D4AF37]/40"
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
