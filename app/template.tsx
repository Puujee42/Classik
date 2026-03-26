'use client';

import { motion } from 'framer-motion';
import LiquidTransition from '@/components/ui/LiquidTransition';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LiquidTransition />
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  );
}
