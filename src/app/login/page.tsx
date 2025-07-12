'use client'

import { LoginClient } from '@/components/main/login-client';
import { Navigation } from '@/components/navigation';

export default function LoginPage() {
  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <LoginClient />
      </main>
    </>
  );
} 