'use client'

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ProfileForm } from '@/components/main/profile-form';
import { getProfile } from '@/lib/actions';
import { Profile } from '@/db/schema';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        setProfile(result.data as unknown as Profile);
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
    <div className="max-w-2xl mx-auto p-8 md:p-0">

      {/* Back icon button */}
      <div className='mt-8'>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </Link>
      </div>


      <div className="my-8">
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
          <div className="p-4 rounded-lg border" style={{
            backgroundColor: 'var(--color-destructive-foreground)',
            borderColor: 'var(--color-destructive)'
          }}>
            <p className="font-medium" style={{ color: 'var(--color-destructive)' }}>Error loading profile</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-destructive)' }}>{profileError}</p>
            <button
              onClick={loadProfile}
              className="mt-3 px-4 py-2 rounded-md transition-colors"
              style={{
                backgroundColor: 'var(--color-destructive)',
                color: 'var(--color-destructive-foreground)'
              }}
            >
              Retry
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