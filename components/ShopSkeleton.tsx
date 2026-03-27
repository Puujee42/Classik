'use client';
import { motion } from 'framer-motion';

export default function ShopSkeleton() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 px-4 md:px-8 max-w-[1400px] mx-auto">
        {[...Array(8)].map((_, i) => (
          <motion.div 
            key={i} 
            className="flex flex-col gap-3"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          >
            <div className="w-full aspect-[4/5] bg-gray-100 rounded-[20px] shadow-sm" />
            <div className="px-1 flex flex-col gap-2">
                <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
                <div className="h-4 w-1/3 bg-gray-100 rounded-full mt-1" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
