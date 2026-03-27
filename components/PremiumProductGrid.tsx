'use client';

import { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import PremiumProductCard from './PremiumProductCard';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  sections?: string[];
  image?: string | null;
  images?: string[];
  category: string;
  stockStatus?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  discount?: number;
  inventory?: number;
  rating?: number;
  featured?: boolean;
}

interface PremiumProductGridProps {
  products: Product[];
  featuredProducts?: Product[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

function PremiumProductGrid({ products, featuredProducts }: PremiumProductGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 px-4 md:px-8"
    >
      {products.map((product) => (
        <PremiumProductCard
          key={product.id}
          product={product}
          isFeatured={product.featured || false}
        />
      ))}
    </motion.div>
  );
}

export default memo(PremiumProductGrid);
