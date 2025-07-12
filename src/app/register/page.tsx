'use client'

import { RegisterClient } from '@/components/main/register-client';
import { Navigation } from '@/components/navigation';

export default function RegisterPage() {
  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <RegisterClient />
      </main>
    </>
  );
} 