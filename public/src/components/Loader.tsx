import { motion } from 'framer-motion';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-slate-950/90 backdrop-blur-xl">
      <div className="relative flex flex-col items-center">
        
        {/* Outer Rotating Gear Container */}
        <div className="relative h-32 w-32 flex items-center justify-center">
          
          {/* Main Gear SVG */}
          <motion.svg
            viewBox="0 0 100 100"
            className="h-full w-full text-amber-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <path
              fill="currentColor"
              d="M94.5,41.5l-8.7-1.4c-0.7-2.5-1.7-5-3.1-7.2l5.4-7c0.9-1.2,0.8-2.8-0.2-3.8l-5.7-5.7c-1-1-2.6-1.1-3.8-0.2l-7,5.4c-2.2-1.4-4.7-2.4-7.2-3.1L62.7,10c-0.2-1.5-1.4-2.5-2.9-2.5h-8.1c-1.5,0-2.7,1.1-2.9,2.5l-1.4,8.7c-2.5,0.7-5,1.7-7.2,3.1l-7-5.4c-1.2-0.9-2.8-0.8-3.8,0.2l-5.7,5.7c-1,1-1.1,2.6-0.2,3.8l5.4,7c-1.4,2.2-2.4,4.7-3.1,7.2L10,51.8c-1.5,0.2-2.5,1.4-2.5,2.9v8.1c0,1.5,1.1,2.7,2.5,2.9l8.7,1.4c0.7,2.5,1.7,5,3.1,7.2l-5.4,7c-0.9,1.2-0.8,2.8,0.2,3.8l5.7,5.7c1,1,2.6,1.1,3.8,0.2l7-5.4c2.2,1.4,4.7,2.4,7.2,3.1l1.4,8.7c0.2,1.5,1.4,2.5,2.9,2.5h8.1c1.5,0,2.7-1.1,2.9-2.5l1.4-8.7c2.5-0.7,5-1.7,7.2-3.1l7,5.4c1.2,0.9,2.8,0.8,3.8-0.2l5.7-5.7c1-1,1.1-2.6,0.2-3.8l-5.4-7c1.4-2.2,2.4-4.7,3.1-7.2l8.7-1.4c1.5-0.2,2.5-1.4,2.5-2.9v-8.1C97,42.9,95.9,41.7,94.5,41.5z M53.6,71c-9.4,0-17-7.6-17-17s7.6-17,17-17s17,7.6,17,17S63,71,53.6,71z"
            />
          </motion.svg>

          {/* Smaller Counter-Rotating Inner Gear */}
          <motion.svg
            viewBox="0 0 100 100"
            className="absolute h-12 w-12 text-slate-400"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
             <path
              fill="currentColor"
              d="M94.5,41.5l-8.7-1.4c-0.7-2.5-1.7-5-3.1-7.2l5.4-7c0.9-1.2,0.8-2.8-0.2-3.8l-5.7-5.7c-1-1-2.6-1.1-3.8-0.2l-7,5.4c-2.2-1.4-4.7-2.4-7.2-3.1L62.7,10c-0.2-1.5-1.4-2.5-2.9-2.5h-8.1c-1.5,0-2.7,1.1-2.9,2.5l-1.4,8.7c-2.5,0.7-5,1.7-7.2,3.1l-7-5.4c-1.2-0.9-2.8-0.8-3.8,0.2l-5.7,5.7c-1,1-1.1,2.6-0.2,3.8l5.4,7c-1.4,2.2-2.4,4.7-3.1,7.2L10,51.8c-1.5,0.2-2.5,1.4-2.5,2.9v8.1c0,1.5,1.1,2.7,2.5,2.9l8.7,1.4c0.7,2.5,1.7,5,3.1,7.2l-5.4,7c-0.9,1.2-0.8,2.8,0.2,3.8l5.7,5.7c1,1,2.6,1.1,3.8,0.2l7-5.4c2.2,1.4,4.7,2.4,7.2,3.1l1.4,8.7c0.2,1.5,1.4,2.5,2.9,2.5h8.1c1.5,0,2.7-1.1,2.9-2.5l1.4-8.7c2.5-0.7,5-1.7,7.2-3.1l7,5.4c1.2,0.9,2.8,0.8,3.8-0.2l5.7-5.7c1-1,1.1-2.6,0.2-3.8l-5.4-7c1.4-2.2,2.4-4.7,3.1-7.2l8.7-1.4c1.5-0.2,2.5-1.4,2.5-2.9v-8.1C97,42.9,95.9,41.7,94.5,41.5z"
            />
          </motion.svg>

          {/* Central Pulsing Hub */}
          <motion.div
            className="absolute h-4 w-4 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)]"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Brand Typography */}
        <div className="mt-8 space-y-1">
          <motion.h2 
            className="text-2xl font-black tracking-tighter text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            CENTRAL
          </motion.h2>
          <motion.div 
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="h-[1px] w-4 bg-amber-500" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-500">
              Spare Part
            </span>
            <div className="h-[1px] w-4 bg-amber-500" />
          </motion.div>
        </div>

        {/* Loading Progress Bar */}
        <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default Loader;