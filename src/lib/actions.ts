'use server'

import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin, supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}


// Profile actions
export async function getProfile(userId: string): Promise<{ data?: Profile; error?: string }> {
  try {    
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);    
    return { data: profile[0] as Profile };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { error: 'Failed to fetch profile' };
  }
}

export async function updateProfile(userId: string, name: string, avatarUrl?: string) {
  try {
    await db
      .insert(profiles)
      .values({
        id: userId,
        name,
        avatar_url: avatarUrl,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          name,
          avatar_url: avatarUrl,
          updated_at: new Date(),
        },
      });
    revalidatePath('/profile');
    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { error: 'Failed to update profile' };
  }
}

export async function uploadAvatar(file: File, userId: string) {
  try {
    // Server-side file validation
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      return { error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { error: 'Please upload a valid image file (JPEG, PNG, or WebP)' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    // Try admin client first, fallback to regular client
    let uploadClient = supabaseAdmin;
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      uploadClient = supabase;
    }
    
    const { error } = await uploadClient.storage
      .from('avatars')
      .upload(fileName, file);

    if (error) {
      console.error('Supabase upload error:', error);
      return { error: 'Failed to upload avatar to storage' };
    }
    
    const { data: { publicUrl } } = uploadClient.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return { data: publicUrl };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { error: 'Failed to upload avatar' };
  }
}

export async function deleteAvatar(avatarUrl: string) {
  try {
    // Extract filename from URL
    const urlParts = avatarUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    // Try admin client first, fallback to regular client
    let deleteClient = supabaseAdmin;
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      deleteClient = supabase;
    }
    
    const { error } = await deleteClient.storage
      .from('avatars')
      .remove([fileName]);

    if (error) {
      console.error('Supabase delete error:', error);
      return { error: 'Failed to delete avatar from storage' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return { error: 'Failed to delete avatar' };
  }
}