import React, { useEffect, useState, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2, UserCheck, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCustomers } from '../../context/CustomersContext';

const customerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Must be a valid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
});

export const CustomerFormDialog = ({ open, onOpenChange, customer = null, onSuccess }) => {
  const { addCustomer, updateCustomer, lookupByPhone } = useCustomers();
  const [phoneLookupResult, setPhoneLookupResult] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const phoneValue = watch('phone');

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      });
      setPhoneLookupResult(null);
    } else {
      reset({ name: '', email: '', phone: '' });
      setPhoneLookupResult(null);
    }
  }, [customer, reset, open]);

  // Debounced phone lookup
  useEffect(() => {
    if (customer) return; // skip when editing
    if (!phoneValue || phoneValue.length < 10) {
      setPhoneLookupResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLookingUp(true);
      try {
        const found = await lookupByPhone(phoneValue.trim());
        setPhoneLookupResult(found);
      } catch {
        setPhoneLookupResult(null);
      } finally {
        setLookingUp(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [phoneValue, customer, lookupByPhone]);

  const handleSelectExisting = () => {
    if (phoneLookupResult && onSuccess) {
      onSuccess(phoneLookupResult);
    }
    onOpenChange(false);
  };

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 450));
    if (customer) {
      const updated = await updateCustomer(customer.id, data);
      if (onSuccess) onSuccess(updated || { id: customer.id, ...data });
    } else {
      const newCust = await addCustomer(data);
      if (onSuccess) onSuccess(newCust);
    }
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-[55] transition-opacity" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-6 shadow-elevated z-[60] focus:outline-none animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-bold font-sora text-[#F0EDE8]">
              {customer ? 'Edit Customer' : 'Add New Customer'}
            </Dialog.Title>
            <Dialog.Close className="text-[#9A9590] hover:text-[#F0EDE8] transition-colors p-1.5 hover:bg-[#242424] rounded-lg">
              <X size={18} />
            </Dialog.Close>
          </div>

          {/* Phone Match Banner */}
          {!customer && phoneLookupResult && (
            <div className="mb-4 p-3.5 bg-[#1a3d2b] border border-[#4CAF7D]/30 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-8 w-8 rounded-full bg-[#4CAF7D]/15 border border-[#4CAF7D]/25 flex items-center justify-center">
                  <UserCheck size={14} className="text-[#4CAF7D]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#4CAF7D] font-semibold">Returning Customer Found!</p>
                  <p className="text-sm text-[#F0EDE8] font-medium truncate">{phoneLookupResult.name}</p>
                  <p className="text-[10px] text-[#9A9590] font-mono">{phoneLookupResult.phone} · {phoneLookupResult.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSelectExisting}
                className="w-full h-9 bg-[#4CAF7D] hover:bg-[#3d9e6e] text-[#0F0F0F] rounded-lg text-xs font-sora font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <UserCheck size={14} />
                Use Existing Customer
              </button>
            </div>
          )}

          {lookingUp && !customer && (
            <div className="mb-3 flex items-center gap-2 text-xs text-[#9A9590]">
              <Loader2 size={12} className="animate-spin" />
              <span>Checking phone number...</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-inter">
            {/* Phone Field — FIRST so lookup triggers before filling other fields */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9A9590] flex items-center gap-1.5">
                <Phone size={12} />
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                disabled={isSubmitting}
                {...register('phone')}
                className="w-full h-10 bg-[#242424] border border-[#2E2E2E] rounded-lg px-3 text-sm text-[#F0EDE8] placeholder-[#9A9590] focus:border-[#F5A623] transition-all outline-none disabled:opacity-50 focus:ring-1 focus:ring-[#F5A623]/20 font-mono"
              />
              {errors.phone && (
                <p className="text-xs text-[#E05C5C] font-medium mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9A9590]">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rohan Mehta"
                disabled={isSubmitting}
                {...register('name')}
                className="w-full h-10 bg-[#242424] border border-[#2E2E2E] rounded-lg px-3 text-sm text-[#F0EDE8] placeholder-[#9A9590] focus:border-[#F5A623] transition-all outline-none disabled:opacity-50 focus:ring-1 focus:ring-[#F5A623]/20"
              />
              {errors.name && (
                <p className="text-xs text-[#E05C5C] font-medium mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9A9590]">Email Address</label>
              <input
                type="email"
                placeholder="e.g. rohan@email.com"
                disabled={isSubmitting}
                {...register('email')}
                className="w-full h-10 bg-[#242424] border border-[#2E2E2E] rounded-lg px-3 text-sm text-[#F0EDE8] placeholder-[#9A9590] focus:border-[#F5A623] transition-all outline-none disabled:opacity-50 focus:ring-1 focus:ring-[#F5A623]/20"
              />
              {errors.email && (
                <p className="text-xs text-[#E05C5C] font-medium mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[#2E2E2E] mt-6">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#242424] border border-[#2E2E2E] rounded-lg text-sm text-[#9A9590] hover:bg-[#2E2E2E] transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#F5A623] hover:bg-[#e09820] text-[#0F0F0F] rounded-lg text-sm font-semibold transition-all font-sora flex items-center gap-1.5 shadow-sm hover:shadow-accent disabled:opacity-50 select-none"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                {customer ? 'Save Changes' : 'Create Customer'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
export default CustomerFormDialog;
