import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import { Coffee, X } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';

export const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showToast, setShowToast] = useState(false);

  const handleSignupSuccess = () => {
    setActiveTab('login');
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen w-screen flex bg-[#0F0F0F] text-[#F0EDE8] overflow-hidden"
    >
      {/* Left Panel */}
      <div className="hidden md:flex md:w-[40%] bg-[#1A1A1A] border-r border-[#2E2E2E] flex-col justify-between p-12 select-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5A623]/[0.02] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F5A623]/[0.01] rounded-full blur-3xl pointer-events-none" />
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Coffee size={24} className="text-[#F5A623]" />
          <span className="font-sora font-bold text-lg text-[#F0EDE8]">Odoo Cafe POS</span>
        </div>

        {/* Hero Decorative Text */}
        <div className="my-auto space-y-6">
          <h1 className="font-sora font-bold text-[44px] text-[#F5A623] leading-tight -rotate-2 origin-left transform tracking-tight">
            Odoo Cafe
          </h1>
          <p className="font-inter text-base text-[#9A9590] max-w-xs leading-relaxed">
            Every order, handled with precision.
          </p>
          
          <div className="flex flex-wrap gap-2.5 pt-4">
            <span className="px-3 py-1.5 bg-[#242424] border border-[#2E2E2E] rounded-full text-xs font-inter font-medium text-[#9A9590]">
              10 Tables
            </span>
            <span className="px-3 py-1.5 bg-[#242424] border border-[#2E2E2E] rounded-full text-xs font-inter font-medium text-[#9A9590]">
              Real-time Kitchen
            </span>
            <span className="px-3 py-1.5 bg-[#242424] border border-[#2E2E2E] rounded-full text-xs font-inter font-medium text-[#9A9590]">
              Smart Receipts
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-[#9A9590]/50 font-inter">
          © 2026 Odoo Cafe POS. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[60%] flex flex-col justify-center items-center p-6 relative">
        {/* Mobile Radial Gradient */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#F5A623]/[0.04] rounded-full blur-3xl pointer-events-none md:hidden" />
        
        {/* Signup Success Notification Banner */}
        {showToast && (
          <div className="absolute top-6 max-w-sm w-full bg-[#4CAF7D] text-[#0F0F0F] rounded-lg px-4 py-3 shadow-elevated flex items-center justify-between text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300 z-50">
            <span>Account created! Please sign in.</span>
            <button onClick={() => setShowToast(false)} className="text-[#0F0F0F] opacity-75 hover:opacity-100">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Auth Card */}
        <div className="w-full max-w-md bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-8 shadow-elevated z-10 flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8 select-none">
            <Coffee size={32} className="text-[#F5A623]" />
            <span className="font-sora font-bold text-xl text-[#F0EDE8]">Odoo Cafe POS</span>
          </div>

          {/* Radix Tabs Switcher */}
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full">
            <Tabs.List className="flex gap-1 p-1 bg-[#242424] rounded-xl border border-[#2E2E2E] mb-6">
              <Tabs.Trigger
                value="login"
                className="flex-1 py-2 rounded-lg text-sm font-sora font-semibold transition-all outline-none text-[#9A9590] data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#0F0F0F] focus-visible:ring-1 focus-visible:ring-[#F5A623]/30"
              >
                Sign In
              </Tabs.Trigger>
              <Tabs.Trigger
                value="signup"
                className="flex-1 py-2 rounded-lg text-sm font-sora font-semibold transition-all outline-none text-[#9A9590] data-[state=active]:bg-[#F5A623] data-[state=active]:text-[#0F0F0F] focus-visible:ring-1 focus-visible:ring-[#F5A623]/30"
              >
                Sign Up
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="login" className="outline-none">
              <LoginForm />
            </Tabs.Content>

            <Tabs.Content value="signup" className="outline-none">
              <SignupForm onSuccess={handleSignupSuccess} />
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </motion.div>
  );
};
export default LoginPage;
