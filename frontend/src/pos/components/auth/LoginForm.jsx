import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    // 600ms loading spinner for premium feel
    await new Promise((r) => setTimeout(r, 600));
    const success = login(data.email, data.password);
    if (success) {
      navigate('/pos/');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-inter text-[#F0EDE8]">
      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#9A9590]">Email</label>
        <input
          type="email"
          placeholder="rohan@odoo-cafe.com"
          disabled={isSubmitting}
          {...register('email')}
          className="w-full h-11 bg-[#242424] border border-[#2E2E2E] rounded-md px-3 text-sm text-[#F0EDE8] placeholder-[#9A9590]/60 focus:border-[#F5A623] transition-all outline-none disabled:opacity-50 focus:ring-1 focus:ring-[#F5A623]/20"
        />
        {errors.email && (
          <p className="text-xs text-[#E05C5C] font-medium mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#9A9590]">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          disabled={isSubmitting}
          {...register('password')}
          className="w-full h-11 bg-[#242424] border border-[#2E2E2E] rounded-md px-3 text-sm text-[#F0EDE8] placeholder-[#9A9590]/60 focus:border-[#F5A623] transition-all outline-none disabled:opacity-50 focus:ring-1 focus:ring-[#F5A623]/20"
        />
        {errors.password && (
          <p className="text-xs text-[#E05C5C] font-medium mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-[#F5A623] hover:bg-[#e09820] text-[#0F0F0F] rounded-lg text-sm font-sora font-semibold transition-all mt-6 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-accent disabled:opacity-50 select-none"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        Sign In
      </button>
    </form>
  );
};
export default LoginForm;
