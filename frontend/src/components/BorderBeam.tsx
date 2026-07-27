import { motion } from 'motion/react';

const colorMap: Record<string, string> = {
  'emerald-500': '#10b981',
  'cyan-500': '#06b6d4',
  'blue-500': '#3b82f6',
  'purple-500': '#a855f7',
  'red-500': '#ef4444',
  'amber-500': '#f59e0b',
  'emerald-400': '#34d399',
  'emerald-600': '#059669',
  'white': '#ffffff',
};

interface BorderBeamProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
}

export default function BorderBeam({ children, className = '', color = 'emerald-500' }: BorderBeamProps) {
  const hex = colorMap[color] || '#10b981';

  return (
    <div className={'relative overflow-hidden rounded-lg ' + className}>
      <motion.div
        className="absolute inset-0 rounded-lg"
        style={{
          border: '1.5px solid transparent',
          backgroundClip: 'padding-box',
        }}
      >
        <motion.div
          className="absolute inset-[-1px] rounded-lg"
          style={{
            background: `linear-gradient(to right, transparent, ${hex}, transparent)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
