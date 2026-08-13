import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ImageUploader } from '@/components/admin/ImageUploader';

const profileSchema = z.object({
  name: z.string().min(2, 'পূর্ণ নাম আবশ্যক'),
  phone: z.string().optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', '']).optional(),
});
type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'বর্তমান পাসওয়ার্ড আবশ্যক'),
  newPassword: z.string().min(6, 'কমপক্ষে ৬ অক্ষর দিন'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'পাসওয়ার্ড দুটি মিলছে না', path: ['confirmPassword'] });
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();

  const {
    register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', phone: '', dateOfBirth: '', gender: '' },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
      gender: user.gender || '',
    });
  }, [user, reset]);

  // Warn before an accidental tab-close/refresh while profile edits are unsaved.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const {
    register: registerPw, handleSubmit: handleSubmitPw, reset: resetPw, formState: { errors: pwErrors, isSubmitting: pwSubmitting },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        name: data.name,
        phone: data.phone || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,
        gender: data.gender || null,
      });
      showToast('প্রোফাইল সফলভাবে আপডেট হয়েছে', 'success');
    } catch {
      showToast('আপডেট করা যায়নি, আবার চেষ্টা করুন', 'error');
    }
  };

  const onAvatarChange = async (url: string) => {
    try {
      await updateProfile({ avatarUrl: url || null });
      showToast(url ? 'প্রোফাইল ছবি আপডেট হয়েছে' : 'প্রোফাইল ছবি সরানো হয়েছে', 'success');
    } catch {
      showToast('ছবি সংরক্ষণ করা যায়নি', 'error');
    }
  };

  const onChangePassword = async (data: PasswordFormData) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      showToast('পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে', 'success');
      resetPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast(message || 'বর্তমান পাসওয়ার্ড সঠিক নয়', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="card-surface p-6">
        <h3 className="text-lg font-bold mb-5">প্রোফাইল ছবি</h3>
        <div className="flex items-center gap-5">
          <ImageUploader value={user.avatar} onChange={onAvatarChange} aspect="aspect-square" rounded="rounded-full" size="max-w-[96px]" />
          <div className="text-sm text-text-secondary">
            <p className="flex items-center gap-1.5 font-medium text-text-primary"><UserIcon size={14} /> {user.name}</p>
            <p className="mt-1">JPG, PNG — ছবিতে ক্লিক করে আপলোড অথবা মুছে ফেলুন।</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSaveProfile)} className="card-surface p-6">
        <h3 className="text-lg font-bold mb-5">ব্যক্তিগত তথ্য</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">পূর্ণ নাম</span>
            <input {...register('name')} className="input-field" />
            {errors.name && <span className="text-xs text-error mt-1 block">{errors.name.message}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">ইমেইল</span>
            <input value={user.email} readOnly disabled className="input-field bg-gray-100 cursor-not-allowed text-text-secondary" />
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">মোবাইল নম্বর</span>
            <input {...register('phone')} placeholder="01XXXXXXXXX" className="input-field" />
            {errors.phone && <span className="text-xs text-error mt-1 block">{errors.phone.message}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">জন্ম তারিখ</span>
            <input {...register('dateOfBirth')} type="date" className="input-field" />
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">লিঙ্গ</span>
            <select {...register('gender')} className="input-field">
              <option value="">নির্বাচন করুন</option>
              <option value="MALE">পুরুষ</option>
              <option value="FEMALE">নারী</option>
              <option value="OTHER">অন্যান্য</option>
            </select>
          </label>
        </div>
        <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary mt-6 disabled:opacity-60">
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'পরিবর্তন সংরক্ষণ করুন'}
        </button>
      </form>

      <form onSubmit={handleSubmitPw(onChangePassword)} className="card-surface p-6">
        <h3 className="text-lg font-bold mb-5">পাসওয়ার্ড পরিবর্তন করুন</h3>
        <div className="grid sm:grid-cols-3 gap-5">
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">বর্তমান পাসওয়ার্ড</span>
            <input {...registerPw('currentPassword')} type="password" className="input-field" placeholder="••••••••" />
            {pwErrors.currentPassword && <span className="text-xs text-error mt-1 block">{pwErrors.currentPassword.message}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">নতুন পাসওয়ার্ড</span>
            <input {...registerPw('newPassword')} type="password" className="input-field" placeholder="••••••••" />
            {pwErrors.newPassword && <span className="text-xs text-error mt-1 block">{pwErrors.newPassword.message}</span>}
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1.5 block">নতুন পাসওয়ার্ড নিশ্চিত করুন</span>
            <input {...registerPw('confirmPassword')} type="password" className="input-field" placeholder="••••••••" />
            {pwErrors.confirmPassword && <span className="text-xs text-error mt-1 block">{pwErrors.confirmPassword.message}</span>}
          </label>
        </div>
        <button type="submit" disabled={pwSubmitting} className="btn-outline mt-6 disabled:opacity-60">
          {pwSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'পাসওয়ার্ড আপডেট করুন'}
        </button>
      </form>
    </div>
  );
}
