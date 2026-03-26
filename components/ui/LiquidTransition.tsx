'use client';

import { motion } from 'framer-motion';

export default function LiquidTransition() {
  return (
    <>
      {/* Slide in overlay */}
      <motion.div
        className="fixed inset-0 z-[9990] pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 0.8, duration: 0.01 }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <motion.path
            fill="#E06B8B"
            initial={{
              d: 'M 0 100 V 100 Q 50 100 100 100 V 100 Z',
            }}
            animate={{
              d: [
                'M 0 100 V 0 Q 50 0 100 0 V 100 Z',
                'M 0 100 V 50 Q 50 100 100 50 V 100 Z',
                'M 0 100 V 100 Q 50 100 100 100 V 100 Z',
              ],
            }}
            transition={{
              duration: 0.8,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </motion.div>

      {/* Gold accent line */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[9991] origin-left"
        style={{
          background: 'linear-gradient(90deg, #D4AF37, #E06B8B, #D4AF37)',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: [0, 1, 0] }}
        transition={{
          duration: 0.8,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
        }}
      />
    </>
  );
}
