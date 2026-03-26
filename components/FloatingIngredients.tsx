'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

interface Ingredient {
  name: string;
  emoji: string;
  description: string;
  x: string;
  y: string;
  size: number;
  depth: number; // 1 = close, 3 = far
  rotation: number;
}

const ingredients: Ingredient[] = [
  { name: 'Сарнайн дэлбээ', emoji: '🌹', description: 'Чийгшүүлэх & тайвшруулах', x: '10%', y: '20%', size: 72, depth: 1, rotation: -15 },
  { name: 'Зөгийн бал', emoji: '🍯', description: 'Байгалийн чийгшүүлэгч', x: '75%', y: '15%', size: 64, depth: 2, rotation: 12 },
  { name: 'Ногоон цай', emoji: '🍵', description: 'Антиоксидант', x: '55%', y: '65%', size: 68, depth: 1, rotation: -8 },
  { name: 'Гүргэм', emoji: '🌿', description: 'Гүнзгий чийгшүүлэлт', x: '20%', y: '70%', size: 60, depth: 3, rotation: 20 },
  { name: 'Витамин C', emoji: '🍊', description: 'Гэрэлтүүлэх', x: '85%', y: '55%', size: 56, depth: 2, rotation: -25 },
  { name: 'Сувд', emoji: '✨', description: 'Гялалзсан гэрэл', x: '40%', y: '30%', size: 52, depth: 3, rotation: 10 },
  { name: 'Лаванда', emoji: '💜', description: 'Тайвшруулах', x: '65%', y: '40%', size: 58, depth: 1, rotation: -5 },
  { name: 'Женьшень', emoji: '🌱', description: 'Эрчимжүүлэх', x: '30%', y: '50%', size: 62, depth: 2, rotation: 18 },
];

export default function FloatingIngredients() {
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative z-10 py-14 lg:py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FAF9F6 0%, #FCEEF2 30%, #FFF5F7 70%, #FAF9F6 100%)',
      }}
    >
      {/* Background decorative rings */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-[#D4AF37]/10" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full border border-[#E06B8B]/10" />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(224,107,139,0.06) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20 relative z-10 px-4"
      >
        <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-xs font-bold mb-4">
          Байгалийн шилдэг
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#333] mb-4">
          Байгалийн{' '}
          <span className="font-script text-4xl sm:text-5xl md:text-6xl text-[#E06B8B]">Хүчээр</span>
        </h2>
        <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-4" />
        <p className="text-[#666] text-sm sm:text-lg font-light mt-4 sm:mt-6 max-w-md mx-auto">
          Найрлага бүрийг ургамлын баталгаат ашиг тусыг нь анхааралтай сонгосон
        </p>
      </motion.div>

      {/* Floating Ingredients Field */}
      <div className="relative max-w-6xl mx-auto h-[350px] sm:h-[450px] lg:h-[600px] px-4">
        {ingredients.map((ingredient, index) => {
          const depthFactor = 4 - ingredient.depth; // 3, 2, 1
          const parallaxAmount = depthFactor * 30;

          return (
            <FloatingItem
              key={ingredient.name}
              ingredient={ingredient}
              index={index}
              scrollYProgress={scrollYProgress}
              mouseX={smoothMouseX}
              mouseY={smoothMouseY}
              parallaxAmount={parallaxAmount}
              depthFactor={depthFactor}
            />
          );
        })}
      </div>
    </section>
  );
}

function FloatingItem({
  ingredient,
  index,
  scrollYProgress,
  mouseX,
  mouseY,
  parallaxAmount,
  depthFactor,
}: {
  ingredient: Ingredient;
  index: number;
  scrollYProgress: any;
  mouseX: any;
  mouseY: any;
  parallaxAmount: number;
  depthFactor: number;
}) {
  const scrollY = useTransform(scrollYProgress, [0, 1], [parallaxAmount, -parallaxAmount]);
  const mouseOffsetX = useTransform(mouseX, [0, 1], [-depthFactor * 15, depthFactor * 15]);
  const mouseOffsetY = useTransform(mouseY, [0, 1], [-depthFactor * 15, depthFactor * 15]);

  return (
    <motion.div
      className="absolute group"
      style={{
        left: ingredient.x,
        top: ingredient.y,
        y: scrollY,
        x: mouseOffsetX,
        zIndex: depthFactor,
      }}
      initial={{ opacity: 0, scale: 0, rotate: ingredient.rotation }}
      whileInView={{ opacity: 1, scale: 1, rotate: ingredient.rotation }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.12,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
    >
      <motion.div
        className="relative"
        animate={{
          y: [0, -8, 0, 5, 0],
          rotate: [ingredient.rotation, ingredient.rotation + 3, ingredient.rotation - 3, ingredient.rotation],
        }}
        transition={{
          duration: 6 + index * 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow behind */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"
          style={{
            background: depthFactor > 2
              ? 'radial-gradient(circle, rgba(224,107,139,0.4), transparent)'
              : 'radial-gradient(circle, rgba(212,175,55,0.3), transparent)',
            width: ingredient.size * 1.5,
            height: ingredient.size * 1.5,
            left: -ingredient.size * 0.25,
            top: -ingredient.size * 0.25,
          }}
        />

        {/* Main bubble */}
        <motion.div
          whileHover={{ scale: 1.2 }}
          className="relative flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-[#D4AF37]/20 shadow-[0_8px_32px_rgba(224,107,139,0.12)] cursor-default"
          style={{
            width: ingredient.size,
            height: ingredient.size,
            opacity: 0.3 + depthFactor * 0.23,
          }}
        >
          <span style={{ fontSize: ingredient.size * 0.4 }}>
            {ingredient.emoji}
          </span>
        </motion.div>

        {/* Label tooltip */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
          style={{ minWidth: 120 }}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-[#D4AF37]/15 text-center">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#D4AF37] font-bold">
              {ingredient.name}
            </p>
            <p className="text-[9px] text-[#888] mt-0.5 font-medium">
              {ingredient.description}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
