import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Github } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login/signup
    console.log(isLogin ? 'Logging in...' : 'Signing up...', { email, password, name });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2B2F33]/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F5F7F9] transition-colors text-[#6B7280]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#2B2F33] poppins-bold mb-2">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-[#6B7280]">
                  {isLogin 
                    ? 'Log in to access your saved places and reviews.' 
                    : 'Join BELIVE to discover and share the best of Iraq.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm"
                    required
                  />
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#F5F7F9] border border-[#E5E7EB] focus:border-[#2CA6A4] rounded-2xl focus:outline-none transition-all text-sm"
                    required
                  />
                </div>

                {isLogin && (
                  <div className="flex justify-end">
                    <button type="button" className="text-xs font-bold text-[#2CA6A4] hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#2CA6A4] hover:bg-[#1e7a78] text-white font-bold rounded-2xl shadow-lg shadow-[#2CA6A4]/20 transition-all flex items-center justify-center gap-2 group"
                >
                  {isLogin ? 'Log In' : 'Sign Up'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Or continue with</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-3 border border-[#E5E7EB] rounded-2xl hover:bg-[#F5F7F9] transition-all text-sm font-bold text-[#2B2F33]">
                  <span className="text-lg">G</span> Google
                </button>
                <button className="flex items-center justify-center gap-2 py-3 border border-[#E5E7EB] rounded-2xl hover:bg-[#F5F7F9] transition-all text-sm font-bold text-[#2B2F33]">
                  <Github className="w-4 h-4" /> GitHub
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-[#6B7280]">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="font-bold text-[#2CA6A4] hover:underline"
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
