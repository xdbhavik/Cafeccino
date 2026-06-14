import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

const signupSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
    confirmPassword: z.string().min(6, { message: 'Please confirm your password.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const SignupForm = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    // 600ms loader simulation for premium feedback
    await new Promise((r) => setTimeout(r, 600));
    if (onSuccess) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-inter text-[#F0EDE8]">
      {/* Full Name Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#9A9590]">Full Name</label>
        <input
          type="text"
          placeholder="Rohan Mehta"
          disabled={isSubmitting}
          {...register('name')}
          className="w-full h-11 bg-[#242424] border border-[#2E2E2E] rounded-md px-3 text-sm text-[#F0EDE8] placeholder-[#9A9590]/60 focus:border-[#F5A623] transition-all outline-none disabled:opacity-50 focus:ring-1 focus:ring-[#F5A623]/20"
        />
        {errors.name && (
          <p className="text-xs text-[#E05C5C] font-medium mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#9A9590]">Email Address</label>
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
        <label className="text-xs font-semibold text-[#9A9590]">Create Password</label>
        <input
          type="password"
          placeholder="Create a password"
          disabled={isSubmitting}
          {...register('password')}
          className="w-full h-11 bg-[#242424] border border-[#2E2E2E] rounded-md px-3 text-sm text-[#F0EDE8] placeholder-[#9A9590]/60 focus:border-[#F5A623] transition-all outline-none disabled:opacity-50 focus:ring-1 focus:ring-[#F5A623]/20"
        />
        {errors.password && (
          <p className="text-xs text-[#E05C5C] font-medium mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#9A9590]">Repeat Password</label>
        <input
          type="password"
          placeholder="Repeat password"
          disabled={isSubmitting}
          {...register('confirmPassword')}
          className="w-full h-11 bg-[#242424] border border-[#2E2E2E] rounded-md px-3 text-sm text-[#F0EDE8] placeholder-[#9A9590]/60 focus:border-[#F5A623] transition-all outline-none disabled:opacity-50 focus:ring-1 focus:ring-[#F5A623]/20"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-[#E05C5C] font-medium mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Create Account Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-[#F5A623] hover:bg-[#e09820] text-[#0F0F0F] rounded-lg text-sm font-sora font-semibold transition-all mt-6 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-accent disabled:opacity-50 select-none"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        Create Account
      </button>
    </form>
  );
};
export default SignupForm;
