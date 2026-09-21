import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiZap, FiSettings, FiLock, FiMail } from 'react-icons/fi';
import Particles from 'react-particles';
import { particlesOptions } from './particlesConfig';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const { error } = useToast();

  const particlesInit = async () => {
    return Promise.resolve();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      error(err?.message || 'Identity verification failed.');
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, navigate]);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#0B0F1A] overflow-hidden px-4">
      {/* BACKGROUND PARTICLES */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0 z-0"
      />

      {/* AMBER BLUR DECORATION */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="p-8 space-y-8 bg-slate-900/40 border border-slate-800 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl">
          
          {/* BRAND HEADER */}
          <div className="text-center">
            <motion.div 
              className="inline-flex p-4 mb-6 bg-amber-500 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)]"
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <FiSettings className="text-slate-950 text-3xl animate-[spin_8s_linear_infinite]" />
            </motion.div>
            
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Central <span className="text-amber-500">Spare</span>
            </h2>
            <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest opacity-60">
              Admin Access Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* EMAIL INPUT */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 ml-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <FiMail /> User Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  required
                  placeholder="admin@central.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 text-white placeholder-slate-600 bg-slate-950/50 border-2 border-slate-800 rounded-2xl focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium"
                />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 ml-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <FiLock /> Security Key
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  required
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 text-white placeholder-slate-600 bg-slate-950/50 border-2 border-slate-800 rounded-2xl focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <motion.button
              type="submit"
              disabled={authLoading}
              className="relative flex items-center justify-center w-full px-4 py-4 font-black text-slate-950 uppercase tracking-widest transition-all duration-300 bg-amber-500 rounded-2xl shadow-[0_10px_20px_rgba(245,158,11,0.2)] hover:bg-amber-400 group overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* SHINE EFFECT */}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-[shine_0.75s_infinite]" />
              
              <div className="relative z-10 flex items-center">
                {authLoading ? (
                   <div className="h-5 w-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <FiZap className="mr-2" />
                    Login 
                  </>
                )}
              </div>
            </motion.button>
          </form>

          {/* FOOTER */}
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
              Hardware & Inventory Management System
            </p>
            <div className="mt-4">
               <a href="#" className="text-xs font-bold text-amber-500/50 hover:text-amber-500 transition-colors">
                Forgot access credentials? Contact Master Admin
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
      `}</style>
    </div>
  );
};

export default SignIn;