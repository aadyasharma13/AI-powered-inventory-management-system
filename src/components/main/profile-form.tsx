'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateProfile, uploadAvatar, deleteAvatar } from '@/lib/actions';
import { updatePassword } from '@/lib/auth-client';
import { Profile } from '@/db/schema';
import { User, Upload, X, Loader2, Lock, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

interface ProfileFormProps {
  userId: string;
  initialData?: Profile;
  userEmail: string;
}

export function ProfileForm({ userId, initialData, userEmail }: ProfileFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError('Name is required');
      setIsLoading(false);
      return;
    }

    const result = await updateProfile(userId, name, avatarUrl);
    
    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess('Profile updated successfully!');
    }
    
    setIsLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }

    // File validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await uploadAvatar(file, userId);
      
      if (result?.error) {
        setError(result.error);
      } else if (result?.data) {
        setAvatarUrl(result.data);
        setSuccess('Avatar uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) {
      setAvatarUrl('');
      setSuccess('Avatar removed');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteAvatar(avatarUrl);
      
      if (result?.error) {
        setError(result.error);
      } else {
        setAvatarUrl('');
        setSuccess('Avatar removed successfully');
      }
    } catch (error) {
      console.error('Remove avatar error:', error);
      setError('Failed to remove avatar. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setError(null);
    setSuccess(null);

    if (!currentPassword.trim()) {
      setError('Current password is required');
      setIsChangingPassword(false);
      return;
    }

    if (!newPassword.trim()) {
      setError('New password is required');
      setIsChangingPassword(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      setIsChangingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsChangingPassword(false);
      return;
    }

    try {
      const result = await updatePassword(newPassword);
      
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess('Password changed successfully! You will be logged out for security. Please log in again with your new password.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
        
        // Start countdown for logout
        setLogoutCountdown(3);
        const countdownInterval = setInterval(() => {
          setLogoutCountdown((prev) => {
            if (prev && prev > 1) {
              return prev - 1;
            } else {
              clearInterval(countdownInterval);
              // Log out the user after password change for security
              window.location.href = '/login';
              return null;
            }
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Password change error:', error);
      setError('Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change Success Banner */}
      {success && success.includes('logged out') && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-800">Password Changed Successfully!</h3>
              <p className="text-green-700 mt-1">
                Your password has been updated. For security reasons, you will be automatically logged out in{' '}
                <span className="font-bold text-green-800">{logoutCountdown || 3}</span> seconds.
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Please log in again with your new password</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={userEmail}
            disabled
            className="bg-muted"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Email cannot be changed
          </p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Full Name
          </label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Avatar
          </label>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <>
                  <Image 
                    src={avatarUrl} 
                    alt="Avatar" 
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <User className="w-8 h-8 text-muted-foreground" />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
                disabled={isUploading || isLoading}
              />
              <Button 
                type="button" 
                variant="outline" 
                disabled={isUploading || isLoading}
                className="flex items-center gap-2"
                onClick={() => {
                  document.getElementById('avatar-upload')?.click();
                }}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploading ? 'Uploading...' : 'Upload Avatar'}
              </Button>
              {avatarUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading || isLoading}
                  className="text-destructive hover:text-destructive"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </Button>
              )}

            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Upload a profile picture (JPEG, PNG, or WebP, max 5MB)
          </p>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md border border-green-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium">Success!</p>
                <p className="mt-1">{success}</p>
                {success.includes('logged out') && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs">
                    <p className="font-medium">Security Notice:</p>
                    <p>For your security, you will be automatically logged out in {logoutCountdown || 3} seconds. Please log in again with your new password.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <Button type="submit" disabled={isLoading || isUploading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </form>

      {/* Password Change Section */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Change Password</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center gap-2"
          >
            {showPasswordForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showPasswordForm ? 'Hide' : 'Change Password'}
          </Button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                Current Password
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  disabled={isChangingPassword}
                  className="pl-10 pr-10"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={isChangingPassword}
                  className="pl-10 pr-10"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={isChangingPassword}
                  className="pl-10 pr-10"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isChangingPassword} 
              className="w-full flex items-center justify-center gap-2"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Change Password
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
} 