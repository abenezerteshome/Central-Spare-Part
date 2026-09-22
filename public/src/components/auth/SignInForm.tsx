import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion"; // Add this for the 'hot' feel
import { 
  FiArrowLeft, 
  FiEye, 
  FiEyeOff, 
  FiMail, 
  FiLock, 
  FiSettings, 
  FiZap 
} from "react-icons/fi";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/?$/, "/");

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Identity Verified. Engine Started! 🏎️");
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        // Navigation and prefetching
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Invalid credentials ❌");
      }
    } catch (error) {
      toast.error("Network error. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F1A] px-4 relative overflow-hidden">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg z-10"
      >
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-amber-500 transition-colors group"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back</span>
        </button>

        <div className="bg-slate-900/40 backdrop-blur-2xl p-8 sm:p-12 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
          
          {/* HEADER */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="bg-amber-500 p-4 rounded-2xl mb-6 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
              <FiSettings className="text-slate-900 text-3xl animate-spin-slow" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
              CENTRAL <span className="text-amber-500">SPARE</span>
            </h2>
            <p className="text-slate-400 font-medium">Internal Administration Portal</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                <FiMail /> Account Email
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@central.com"
                  className="w-full px-6 py-4 bg-slate-950/50 border-2 border-slate-800 rounded-2xl text-white outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <FiLock /> Security Key
                </label>
                <a href="#" className="text-[10px] font-black uppercase text-amber-500 hover:text-amber-400">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 bg-slate-950/50 border-2 border-slate-800 rounded-2xl text-white outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              disabled={loading}
              className="group relative w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-[0_10px_20px_rgba(245,158,11,0.2)] transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden"
            >
              <div className="flex items-center justify-center gap-3 relative z-10">
                {loading ? (
                  <div className="h-5 w-5 border-3 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <>
                    <FiZap />
                    <span className="uppercase tracking-widest">Authorize Login</span>
                  </>
                )}
              </div>
              {/* Button Shine Effect */}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shine" />
            </button>
          </form>

          {/* FOOTER */}
          <div className="mt-10 pt-8 border-t border-slate-800 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Authorized Personnel Only • <span className="text-slate-400">System v2.4</span>
            </p>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
        .animate-shine {
          animation: shine 0.75s;
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}