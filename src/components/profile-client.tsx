'use client'

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ProfileForm } from '@/components/profile-form';
import { getProfile } from '@/lib/actions';
import { Profile } from '@/db/schema';

export function ProfileClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      const result = await getProfile(user.id);
      
      if (result?.data) {
        setProfile(result.data);
      } else if (result?.error) {
        setProfileError(result.error);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfileError('Failed to load profile');
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  // Load profile when user is authenticated
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show profile if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information and avatar.
        </p>
      </div>

      {profileLoading ? (
        <div className="text-center py-8">
          <p>Loading profile...</p>
        </div>
      ) : profileError ? (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-medium">Error loading profile</p>
            <p className="text-red-500 text-sm mt-1">{profileError}</p>
            <button 
              onClick={loadProfile}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <ProfileForm 
          userId={user.id} 
          initialData={profile || undefined}
          userEmail={user.email || ''}
        />
      )}
    </div>
  );
} 