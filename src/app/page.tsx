import { HomeClient } from '@/components/main/home-client';
import { Navigation } from '@/components/navigation';

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <HomeClient />
      </main>
    </>
  );
} 