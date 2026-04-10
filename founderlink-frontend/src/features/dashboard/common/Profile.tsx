import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Upload, User, Mail, Shield, Trash2 } from 'lucide-react';
import Layout from '../../../layouts/Layout';
import useAuth from '../../../shared/hooks/useAuth';
import { getMyProfile, updateProfile } from '../../users/api/userApi';
import { extractApiData } from '../../../shared/utils/api';
import { getAvatarSrc, getStoredAvatar, removeStoredAvatar, saveStoredAvatar } from '../../../shared/utils/avatar';

interface ProfileFormData {
  name?: string;
  bio?: string;
  skills?: string;
  experience?: string;
  portfolioLinks?: string;
}

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

const Profile = () => {
  const { user, userId } = useAuth();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ProfileFormData>();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      getMyProfile(userId)
        .then((res) => reset(extractApiData<ProfileFormData>(res, {})))
        .catch(() => {});

      setAvatarPreview(getStoredAvatar(userId));
    }
  }, [userId, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!userId) return;

    try {
      await updateProfile(userId, { ...data, email: user?.email });
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (!dataUrl) {
        toast.error('Failed to read image');
        return;
      }

      saveStoredAvatar(userId, dataUrl);
      setAvatarPreview(dataUrl);
      window.dispatchEvent(new CustomEvent('profile-avatar-updated', { detail: { userId, avatar: dataUrl } }));
      toast.success('Profile photo updated');
    };
    reader.onerror = () => toast.error('Failed to read image');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleAvatarRemove = () => {
    if (!userId) return;
    removeStoredAvatar(userId);
    setAvatarPreview(null);
    window.dispatchEvent(new CustomEvent('profile-avatar-updated', { detail: { userId, avatar: null } }));
    toast.success('Profile photo removed');
  };

  const roleLabel = user?.role?.replace('ROLE_', '') || 'User';
  const avatarSrc = useMemo(
    () => avatarPreview || getAvatarSrc(userId, user?.name || user?.email, user?.email?.[0]?.toUpperCase() || 'U'),
    [avatarPreview, userId, user?.name, user?.email]
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User size={22} className="text-accent-light" /> My Profile
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage your public profile information</p>
        </div>

        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6 pb-6 border-b border-dark-500">
            <div className="relative">
              <img
                src={avatarSrc}
                alt="Profile avatar"
                className="w-20 h-20 rounded-3xl object-cover border border-accent/30 shadow-lg shadow-accent/10 bg-dark-700"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Mail size={14} className="text-gray-500" />
                <p className="text-gray-200 font-medium">{user?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-gray-500" />
                <span className="badge-blue">{roleLabel}</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">Upload a JPG, PNG, or WEBP profile image up to 2MB.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                <Upload size={16} />
                Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
              {avatarPreview && (
                <button type="button" onClick={handleAvatarRemove} className="btn-secondary inline-flex items-center gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10">
                  <Trash2 size={16} />
                  Remove
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input className="input-field" placeholder="Your full name" {...register('name')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
              <textarea
                rows={3}
                className="input-field"
                placeholder="Tell us about yourself..."
                {...register('bio')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Skills</label>
              <input
                className="input-field"
                placeholder="e.g. React, Java, Product Management"
                {...register('skills')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Experience</label>
              <textarea
                rows={2}
                className="input-field"
                placeholder="Your professional experience..."
                {...register('experience')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Portfolio / Links</label>
              <input
                className="input-field"
                placeholder="https://github.com/yourname"
                {...register('portfolioLinks')}
              />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
